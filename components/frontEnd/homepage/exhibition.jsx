"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

/* ── constants ── */
const GOLD = "#e8c84a";
const TEAL = "#4ac8e8";
const PARTICLE_COLORS = [GOLD, TEAL, "#ffffff", "#d4a017"];

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

/* ─────────────────────────────────────────
   DiagonalBeams
   Fix: wrap SVG in a sized div with overflow:hidden
   so the beams fill 100% of the parent on any
   screen width. The SVG uses width/height 100%
   instead of fixed px values.
───────────────────────────────────────── */
function DiagonalBeams() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden", // clips beam overhang on narrow screens
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
        preserveAspectRatio="xMidYMid slice" // slice = beams always fill the container
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="beam1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={GOLD} stopOpacity={0} />
            <stop offset="50%" stopColor={GOLD} stopOpacity={0.14} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="beam2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={TEAL} stopOpacity={0} />
            <stop offset="50%" stopColor={TEAL} stopOpacity={0.14} />
            <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* gold left beams — polygons start well left of 0 so they
            always cover the edge even on wide phones */}
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

        {/* teal right beams — polygons start well right of 800 */}
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

function UAEEmblem() {
  const controls = useAnimation();
  useEffect(() => {
    controls.start({ pathLength: 1, opacity: 1 });
  }, [controls]);

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <motion.circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke={GOLD}
        strokeWidth={1}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.6, ease: "easeInOut" }}
      />
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="#12192e"
        stroke={GOLD}
        strokeWidth={0.5}
      />
      <rect x="18" y="32" width="64" height="9" rx={1} fill="#00732f" />
      <rect
        x="18"
        y="41"
        width="64"
        height="9"
        rx={1}
        fill="#fff"
        opacity={0.9}
      />
      <rect
        x="18"
        y="50"
        width="64"
        height="9"
        rx={1}
        fill="#000"
        opacity={0.85}
      />
      <rect x="18" y="32" width="14" height="27" rx={1} fill="#EF3340" />
      <text
        x="50"
        y="76"
        textAnchor="middle"
        fontSize={9}
        fill={GOLD}
        fontFamily="sans-serif"
      >
        ★ UAE ★
      </text>
    </svg>
  );
}

function ThamaneEmblem() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <motion.circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke={TEAL}
        strokeWidth={1}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.9, ease: "easeInOut" }}
      />
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="#0d1e2e"
        stroke={TEAL}
        strokeWidth={0.5}
      />
      <polygon
        points="50,18 68,30 68,58 50,72 32,58 32,30"
        fill="none"
        stroke={TEAL}
        strokeWidth={1.5}
      />
      <polygon
        points="50,24 63,33 63,55 50,66 37,55 37,33"
        fill="#1a3a4a"
        stroke={TEAL}
        strokeWidth={0.5}
      />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontSize={20}
        fill={TEAL}
        fontFamily="'Bebas Neue', sans-serif"
        fontWeight={700}
      >
        XI
      </text>
      <text
        x="50"
        y="76"
        textAnchor="middle"
        fontSize={8}
        fill={TEAL}
        fontFamily="sans-serif"
        opacity={0.8}
      >
        THAMANE
      </text>
    </svg>
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
          animate={{ y: [-480], rotate: [0, 720], opacity: [0.6, 0] }}
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

/* ── main component ── */
export default function ExhibitionMatch() {
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
        style={{ background: "#0a0e1a", fontFamily: "'Rajdhani', sans-serif" }}
      >
        {/* background layers */}
        <DiagonalBeams />
        <FloatingParticles />

        {/* content */}
        <motion.div
          className="relative flex flex-col items-center px-4 sm:px-6 pb-10 pt-8"
          style={{ zIndex: 10 }}
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
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
              Field Hockey · Exhibition Match
            </span>
            <motion.div
              className="flex-1 h-px origin-center"
              style={{
                background: `linear-gradient(90deg, transparent, ${GOLD} 60%, transparent)`,
              }}
              variants={lineGrow}
            />
          </motion.div>

          {/* badge */}
          <motion.div
            variants={fadeUp}
            className="mb-5"
            style={{
              background: "linear-gradient(135deg, #d4a017, #f5c842, #d4a017)",
              backgroundSize: "200% 200%",
              padding: "3px 18px",
              borderRadius: 2,
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 11,
              letterSpacing: 3,
              color: "#0a0e1a",
              animation: "shimmer 3s ease infinite",
            }}
          >
            Special Event
          </motion.div>

          {/* matchup */}
          <motion.div
            className="w-full max-w-2xl flex items-center justify-between gap-2 sm:gap-4"
            variants={fadeUp}
          >
            {/* UAE */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <UAEEmblem />
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(16px, 4vw, 28px)",
                  letterSpacing: 2,
                  color: GOLD,
                  lineHeight: 1,
                  textAlign: "center",
                }}
              >
                Team UAE
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <motion.div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(36px, 8vw, 52px)",
                  color: "#fff",
                  lineHeight: 1,
                }}
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                VS
              </motion.div>
            </div>

            {/* Thamane XI */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <ThamaneEmblem />
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(16px, 4vw, 28px)",
                  letterSpacing: 2,
                  color: TEAL,
                  lineHeight: 1,
                  textAlign: "center",
                }}
              >
                Thamane XI
              </div>
            </div>
          </motion.div>

          {/* meta strip */}
          <motion.div
            className="w-full max-w-2xl flex justify-center gap-4 sm:gap-8 mt-7"
            variants={fadeUp}
          >
            {[
              { label: "Format", value: "Exhibition" },
              { label: "Sport", value: "Field Hockey" },
              { label: "Type", value: "Special Match" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1"
              >
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: 2,
                    color: "#666",
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 16,
                    letterSpacing: 1,
                    color: "#ccc",
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </motion.div>

          {/* score bar */}
          <div className="w-full max-w-2xl mt-5 flex flex-col gap-1.5">
            <div className="w-full h-1.5 rounded-full overflow-hidden flex">
              <motion.div
                className="flex-1 h-full origin-left"
                style={{
                  background: `linear-gradient(90deg, ${GOLD}, #f5a623)`,
                }}
                variants={barFill}
                initial="hidden"
                animate={inView ? "show" : "hidden"}
              />
              <div className="w-0.5 h-full bg-white shrink-0" />
              <motion.div
                className="flex-1 h-full origin-right"
                style={{
                  background: `linear-gradient(90deg, #1a9fbf, ${TEAL})`,
                }}
                variants={barFill}
                initial="hidden"
                animate={inView ? "show" : "hidden"}
              />
            </div>
            <div className="flex justify-between">
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: GOLD,
                  fontFamily: "'Bebas Neue', sans-serif",
                }}
              >
                Team UAE
              </span>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: TEAL,
                  fontFamily: "'Bebas Neue', sans-serif",
                }}
              >
                Thamane XI
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
