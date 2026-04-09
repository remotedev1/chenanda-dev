const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
require("dotenv").config();

// ─── Configuration ────────────────────────────────────────────────────────────
const CONFIG = {
  dev: process.env.NODE_ENV !== "production",
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
  }

  setMatchData(matchId, data) {
    this.matchCache.set(matchId, data);
  }

  getMatchData(matchId) {
    return this.matchCache.get(matchId) ?? null;
  }
}

// ─── Socket Handlers ──────────────────────────────────────────────────────────
const setupSocketHandlers = (io, state) => {
  io.on("connection", (socket) => {
    // On connect, send all cached match data to the newly connected client
    state.matchCache.forEach((data, matchId) => {
      socket.emit("matchData", { matchId, data });
    });

    socket.on("requestLiveMatches", async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/tournaments/live`,
          {
            method: "GET",
            headers: {
              "Cache-Control": "no-store",
            },
          },
        );

        const { data } = await response.json();

        console.log(data);
        const matches = Array.isArray(data) ? data : [];
        // Send all live matches to this specific client
        socket.emit("initialLiveMatches", { data: matches });
        console.log(
          `Sent ${matches.length} live matches to client ${socket.id}`,
        );
      } catch (err) {
        console.error("Failed to fetch live matches:", err);
        socket.emit("initialLiveMatches", { data: [] });
      }
    });

    socket.on("matchStarted", ({ matchId, data }) => {
      if (!matchId) return;

      if (data) {
        state.setMatchData(matchId, data);
      }

      // Send matchData to ALL clients (including sender)
      io.emit("matchData", { matchId, data, fromSocketId: socket.id });
    });

    socket.on("matchEnded", ({ matchId, data }) => {
      if (!matchId) return;

      if (data) {
        state.setMatchData(matchId, data);
      }

      // Broadcast matchEnded to ALL clients except sender
      socket.broadcast.emit("matchEnded", {
        matchId,
        data,
        fromSocketId: socket.id,
      });

      // Send final match data to ALL clients
      io.emit("matchData", { matchId, data });

      // Clear cache after a delay
      setTimeout(() => {
        state.matchCache.delete(matchId);
      }, 9000);
    });

    socket.on("gameData", (payload) => {
      try {
        const { matchId, ...data } = payload;
        if (!matchId) return;
        state.setMatchData(matchId, data);

        // Broadcast to ALL clients except sender
        socket.broadcast.emit("matchData", {
          matchId,
          data,
          fromSocketId: socket.id,
        });

        // Echo back to sender so it can filter by fromSocketId if needed
        socket.emit("matchData", { matchId, data, fromSocketId: socket.id });
      } catch (err) {
        socket.emit("serverError", { message: "Failed to process game data" });
      }
    });

    socket.on("gameAdded", ({ matchId, data }) => {
      if (!matchId) return;

      if (data) {
        state.setMatchData(matchId, data);
      }

      // Emit to ALL clients
      io.emit("gameAdded", {
        matchId,
        data,
        fromSocketId: socket.id,
      });
    });

    socket.on("ping", () => socket.emit("pong"));

    socket.on("error", (err) => {
      console.error(
        `[${new Date().toISOString()}] Socket error ${socket.id}:`,
        err,
      );
    });
  });
};

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await app.prepare();

    const server = createServer((req, res) => {
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
