"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

/* ── constants ── */
const GOLD = "#b8860b";
const GOLD_LIGHT = "#f0c040";
const TEAL = "#0e7fa8";
const TEAL_LIGHT = "#4ac8e8";
const PARTICLE_COLORS = [GOLD_LIGHT, TEAL_LIGHT, "#ccc", "#e0a800"];

function randomParticles(count = 22) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    bottom: Math.random() * 30,
    size: Math.random() * 3 + 1,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 6,
  }));
}

function DiagonalBeams() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        viewBox="0 0 800 520"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="beam1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={GOLD_LIGHT} stopOpacity={0} />
            <stop offset="50%" stopColor={GOLD_LIGHT} stopOpacity={0.18} />
            <stop offset="100%" stopColor={GOLD_LIGHT} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="beam2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={TEAL_LIGHT} stopOpacity={0} />
            <stop offset="50%" stopColor={TEAL_LIGHT} stopOpacity={0.18} />
            <stop offset="100%" stopColor={TEAL_LIGHT} stopOpacity={0} />
          </linearGradient>
        </defs>
        <motion.polygon
          points="-120,0 320,0 160,520 -120,520"
          fill="url(#beam1)"
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.polygon
          points="-120,0 220,0 60,520 -120,520"
          fill="url(#beam1)"
          opacity={0.5}
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.polygon
          points="920,0 480,0 640,520 920,520"
          fill="url(#beam2)"
          animate={{ x: [0, -30, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.polygon
          points="920,0 580,0 740,520 920,520"
          fill="url(#beam2)"
          opacity={0.5}
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

function FloatingParticles() {
  const particles = useRef(randomParticles(22));
  return (
    <>
      {particles.current.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: `${p.bottom}%`,
            backgroundColor: p.color,
            zIndex: 3,
          }}
          animate={{ y: [-480], rotate: [0, 720], opacity: [0.35, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}

/* ── Live Notification Badge ── */
function LiveBadge() {
  return (
    <motion.div
      className="flex items-center gap-2.5 mb-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 12,
          height: 12,
        }}
      >
        <motion.span
          style={{
            position: "absolute",
            borderRadius: "50%",
            width: 24,
            height: 24,
            background: "rgba(200,30,30,0.2)",
          }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
        <span
          style={{
            position: "relative",
            borderRadius: "50%",
            width: 10,
            height: 10,
            background: "#e02020",
            display: "inline-block",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(200,30,30,0.08)",
          border: "1px solid rgba(200,30,30,0.22)",
          borderRadius: 20,
          padding: "5px 14px 5px 10px",
        }}
      >
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 15,
            letterSpacing: 3,
            color: "#cc2222",
          }}
        >
          LIVE NOW
        </span>
      </div>
    </motion.div>
  );
}

/* ── YouTube Live Button ── */
function YouTubeLiveButton() {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 mt-7"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
    >
      <motion.a
        href="https://www.youtube.com/live/ivFLOzTNOz8"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          background: "#ff0000",
          border: "none",
          borderRadius: 6,
          padding: "12px 28px",
          textDecoration: "none",
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(255,0,0,0.2)",
        }}
        whileHover={{ scale: 1.04, boxShadow: "0 6px 24px rgba(255,0,0,0.35)" }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 17,
              letterSpacing: 2,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            Watch Live on YouTube
          </span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.8)",
              letterSpacing: 1,
            }}
          >
            youtube.com · Live Stream
          </span>
        </div>
        <div
          style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}
        >
          <motion.span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "#fff",
            }}
            animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          />
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "#fff",
            }}
          />
        </div>
      </motion.a>
    </motion.div>
  );
}

/* ── main component ── */
export default function YoutubeLive() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const lineGrow = {
    hidden: { scaleX: 0, opacity: 0 },
    show: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 1.2, ease: "easeOut" },
    },
  };

  const barFill = {
    hidden: { scaleX: 0 },
    show: {
      scaleX: 1,
      transition: { duration: 1.5, delay: 1.2, ease: "easeOut" },
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap');
        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div
        ref={ref}
        className="relative w-full overflow-hidden py-16"
        style={{
          background:
            "linear-gradient(160deg, #f9f6ee 0%, #eef6fb 50%, #f0f8ff 100%)",
          fontFamily: "'Rajdhani', sans-serif",
          borderRadius: 16,
          border: "1px solid #e2ddd0",
          boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
        }}
      >
        {/* background layers */}
        <DiagonalBeams />
        <FloatingParticles />

        {/* subtle grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage:
              "linear-gradient(rgba(180,160,100,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,100,0.07) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* content */}
        <motion.div
          className="relative flex flex-col items-center px-4 sm:px-6 pb-10 pt-8"
          style={{ zIndex: 10 }}
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {/* LIVE badge */}
          <LiveBadge />

          {/* top banner */}
          <motion.div
            className="w-full flex items-center justify-center gap-2 sm:gap-3 mb-1.5"
            variants={fadeUp}
          >
            <motion.div
              className="flex-1 h-px origin-center"
              style={{
                background: `linear-gradient(90deg, transparent, ${GOLD} 60%, transparent)`,
              }}
              variants={lineGrow}
            />
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 11,
                letterSpacing: 4,
                color: GOLD,
                whiteSpace: "nowrap",
              }}
            >
              Field Hockey Live Stream
            </span>
            <motion.div
              className="flex-1 h-px origin-center"
              style={{
                background: `linear-gradient(90deg, transparent, ${GOLD} 60%, transparent)`,
              }}
              variants={lineGrow}
            />
          </motion.div>

          {/* YouTube Live Button */}
          {/* Replace href with your actual YouTube live stream URL */}
          <YouTubeLiveButton href="https://www.youtube.com/live/lPMnAmaU2Mo?si=1n61ApERVhOc5qGM" />
        </motion.div>
      </div>
    </>
  );
}
