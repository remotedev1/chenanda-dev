const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
require("dotenv").config();

// ─── Configuration ────────────────────────────────────────────────────────────
const CONFIG = {
  dev: process.env.APP_ENV !== "production",
  port: parseInt(process.env.PORT, 10) || 3000,
  socketPath: "/socket.io",
  pingTimeout: 60000,
  pingInterval: 25000,
};

// ─── Next.js ──────────────────────────────────────────────────────────────────
const app = next({ dev: CONFIG.dev, quiet: false });
const handle = app.getRequestHandler();

// ─── Server State ─────────────────────────────────────────────────────────────
class ServerState {
  constructor() {
    this.matchCache = new Map();
    this.clients = new Map();
  }

  addClient(socketId) {
    this.clients.set(socketId, {
      id: socketId,
      connectedAt: Date.now(),
      rooms: new Set(),
    });
  }

  addRoom(socketId, matchId) {
    const client = this.clients.get(socketId);
    if (client) client.rooms.add(matchId);
  }

  removeRoom(socketId, matchId) {
    const client = this.clients.get(socketId);
    if (client) client.rooms.delete(matchId);
  }

  getRooms(socketId) {
    return this.clients.get(socketId)?.rooms ?? new Set();
  }

  removeClient(socketId) {
    this.clients.delete(socketId);
  }

  setMatchData(matchId, data) {
    this.matchCache.set(matchId, data);
  }

  getMatchData(matchId) {
    return this.matchCache.get(matchId) ?? null;
  }

  getRoomCount(io, matchId) {
    const room = io.sockets.adapter.rooms.get(matchId);
    return room ? room.size : 0;
  }
}

// ─── Socket Handlers ──────────────────────────────────────────────────────────
const setupSocketHandlers = (io, state) => {
  io.on("connection", (socket) => {
    const ts = () => `[${new Date().toISOString()}]`;
    console.log(`${ts()} ✅  Connected   ${socket.id}`);
    state.addClient(socket.id);

    socket.on("joinMatch", (matchId) => {
      if (!matchId) return;
      if (state.getRooms(socket.id).has(matchId)) return;

      socket.join(matchId);
      state.addRoom(socket.id, matchId);
      console.log(`${ts()} 👁  ${socket.id} joined room "${matchId}"`);

      const cached = state.getMatchData(matchId);
      if (cached) {
        socket.emit("matchData", { matchId, data: cached });
      }

      const count = state.getRoomCount(io, matchId);
      io.to(matchId).emit("watcherCount", { matchId, count });
    });

    // In your socket server setup
    socket.on("matchStarted", (data) => {
      console.log("[server] matchStarted →", data.matchId);
      // Forward to ALL other connected clients
      socket.broadcast.emit("matchStarted", data);
    });

    socket.on("leaveMatch", (matchId) => {
      if (!matchId) return;
      socket.leave(matchId);
      state.removeRoom(socket.id, matchId);
      const count = state.getRoomCount(io, matchId);
      io.to(matchId).emit("watcherCount", { matchId, count });
    });

    socket.on("gameData", (payload) => {
      try {
        const { matchId, ...data } = payload;
        if (!matchId) return;
        state.setMatchData(matchId, data);
        io.to(matchId).emit("matchData", { matchId, data });
        // console.log(`${ts()} 📡  gameData → room "${matchId}" (${state.getRoomCount(io, matchId)} watchers)`);
      } catch (err) {
        console.error(`${ts()} ❌  Error processing gameData:`, err);
        socket.emit("serverError", { message: "Failed to process game data" });
      }
    });

    socket.on("ping", () => socket.emit("pong"));

    socket.on("disconnect", (reason) => {
      console.log(`${ts()} ❌  Disconnected ${socket.id} (${reason})`);
      const rooms = new Set(state.getRooms(socket.id));
      state.removeClient(socket.id);
      if (rooms.size > 0) {
        setImmediate(() => {
          rooms.forEach((matchId) => {
            const count = state.getRoomCount(io, matchId);
            io.to(matchId).emit("watcherCount", { matchId, count });
          });
        });
      }
    });

    socket.on("error", (err) => {
      console.error(`${ts()} ❗  Socket error ${socket.id}:`, err);
    });
  });
};

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await app.prepare();

    const server = createServer((req, res) => {
      // Allow cross-origin requests from any LAN device in dev mode.
      // In production set NEXT_CLIENT_ORIGIN to your domain.
      if (CONFIG.dev) {
        const origin = req.headers.origin || "*";
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        if (req.method === "OPTIONS") {
          res.writeHead(204);
          res.end();
          return;
        }
      }
      handle(req, res, parse(req.url, true));
    });

    const io = new Server(server, {
      path: CONFIG.socketPath,
      cors: {
        // FIX 1: accept any origin in dev, specific domain in production
        // FIX 2: credentials removed — incompatible with origin: true
        origin: process.env.NEXT_CLIENT_ORIGIN || true,
        methods: ["GET", "POST"],
      },
      pingTimeout: CONFIG.pingTimeout,
      pingInterval: CONFIG.pingInterval,
      transports: ["polling", "websocket"],
      allowEIO3: true,
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
      },
    });

    const state = new ServerState();
    setupSocketHandlers(io, state);

    await new Promise((resolve, reject) =>
      server.listen(CONFIG.port, (err) => (err ? reject(err) : resolve())),
    );

    console.log(`
╔════════════════════════════════════════╗
║  Server started successfully!          ║
║  - HTTP:    http://localhost:${CONFIG.port.toString().padEnd(11)}║
║  - Socket:  ${CONFIG.socketPath.padEnd(27)}║
║  - Mode:    ${(CONFIG.dev ? "development" : "production").padEnd(27)}║
╚════════════════════════════════════════╝
    `);

    const shutdown = (sig) => {
      console.log(`\n${sig} — shutting down…`);
      io.close(() => console.log("Socket.IO closed"));
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
      setTimeout(() => {
        console.error("Forced exit");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("uncaughtException", (e) => {
      console.error("UncaughtException:", e);
      shutdown("UNCAUGHT");
    });
    process.on("unhandledRejection", (r) => {
      console.error("UnhandledRejection:", r);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
