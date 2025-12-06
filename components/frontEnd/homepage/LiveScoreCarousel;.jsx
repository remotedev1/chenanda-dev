"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { Flame, Zap, ChevronLeft, ChevronRight } from "lucide-react";

// Memoized Hockey Ball SVG Component
const HockeyBall = React.memo(
  ({ className = "w-8 h-8", shouldAnimate = true }) => (
    <motion.svg
      className={className}
      viewBox="0 0 100 100"
      animate={shouldAnimate ? { rotate: 300 } : {}}
      transition={
        shouldAnimate ? { duration: 6, repeat: Infinity, ease: "linear" } : {}
      }
      role="img"
      aria-label="Abstract hockey-themed ornament"
    >
      <defs>
        {/* Base ambient gradient */}
        <radialGradient id="ambient" cx="30%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#0ea5a4" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.02" />
        </radialGradient>

        {/* Layer gradient for blobs */}
        <linearGradient id="blobGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>

        {/* Soft inner glow */}
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Fine mesh grid pattern */}
        <pattern id="mesh" width="6" height="6" patternUnits="userSpaceOnUse">
          <path
            d="M0 0 L6 0 M0 3 L6 3"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.3"
          />
        </pattern>

        {/* Subtle noise using turbulence (kept low for perf) */}
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            baseFrequency="0.8"
            numOctaves="1"
            stitchTiles="stitch"
            result="t"
          />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="t" mode="overlay" />
        </filter>
      </defs>

      {/* ambient backdrop */}
      <rect x="0" y="0" width="100" height="100" fill="url(#ambient)" />

      {/* large translucent rounded shape */}
      <path
        d="M10 60 C18 20, 60 10, 80 30 C92 42, 88 72, 60 82 C34 92, 6 82, 10 60 Z"
        fill="url(#blobGrad)"
        opacity="0.85"
        filter="url(#softGlow)"
        transform="translate(0,0) scale(0.98)"
      />

      {/* secondary cool blob for contrast */}
      <path
        d="M20 30 C28 10, 60 8, 74 22 C86 34, 78 58, 52 66 C30 74, 14 64, 20 30 Z"
        fill="#06b6d4"
        opacity="0.6"
        transform="rotate(-18 50 50) translate(0,0) scale(0.95)"
      />

      {/* abstract ribbon stroke */}
      <path
        d="M8 85 C28 70, 42 55, 58 50 C74 45, 88 42, 92 22"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* clipped mesh overlay (gives subtle texture only inside center area) */}
      <g opacity="0.22" clipPath={`url(#clipCenter)`}>
        <rect x="10" y="10" width="80" height="80" fill="url(#mesh)" />
      </g>

      {/* create clipPath in-place (JSX-safe) */}
      <defs>
        <clipPath id="clipCenter">
          <circle cx="50" cy="50" r="36" />
        </clipPath>
      </defs>

      {/* accent circles (dot-group, like abstract dimples) */}
      <g transform="translate(8, -2)" opacity="0.95">
        <circle cx="36" cy="38" r="3.6" fill="#fff" opacity="0.12" />
        <circle cx="46" cy="28" r="2.2" fill="#fff" opacity="0.10" />
        <circle cx="58" cy="44" r="1.8" fill="#fff" opacity="0.08" />
        <circle cx="70" cy="34" r="2.6" fill="#fff" opacity="0.10" />
      </g>

      {/* slight vignette ring for depth */}
      <ellipse
        cx="50"
        cy="52"
        rx="42"
        ry="40"
        fill="none"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1.2"
      />

      {/* optional tiny hockey hint — a paired small stick silhouette (very abstract) */}
      <g
        transform="translate(62,64) rotate(22)"
        opacity="0.85"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.2"
      >
        <path d="M0 0 L8 -2 C10 -1, 12 2, 14 4" />
        <rect
          x="13"
          y="3.2"
          width="3.5"
          height="1.2"
          rx="0.6"
          fill="rgba(255,255,255,0.08)"
        />
      </g>
    </motion.svg>
  )
);

HockeyBall.displayName = "HockeyBall";

// Animated Score Component with optimized animations
const AnimatedScore = React.memo(({ score, color }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current) {
      const controls = animate(count, score, { duration: 1, ease: "easeOut" });
      hasAnimated.current = true;
      return controls.stop;
    } else {
      count.set(score);
    }
  }, [score, count]);

  return (
    <motion.span
      className="text-6xl font-black drop-shadow-lg"
      style={{ color }}
    >
      {rounded}
    </motion.span>
  );
});

AnimatedScore.displayName = "AnimatedScore";

// Individual Score Card Component - Optimized
const ScoreCard = React.memo(
  ({ match, index, isActive, isPaused, onHoverChange }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleHoverStart = useCallback(() => {
      setIsHovered(true);
      onHoverChange(true);
    }, [onHoverChange]);

    const handleHoverEnd = useCallback(() => {
      setIsHovered(false);
      onHoverChange(false);
    }, [onHoverChange]);

    return (
      <motion.div
        className="relative min-w-[420px] snap-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: isActive ? 1 : 0.7,
          scale: isActive ? 1 : 0.95,
        }}
        transition={{ duration: 0.3 }}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
      >
        {/* Glow Effect - Only render when hovered */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-3xl blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            style={{
              background: `linear-gradient(135deg, ${match.color1}, ${match.color2})`,
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Card Content */}
        <motion.div
          className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 border-2 border-cyan-500/40 shadow-2xl overflow-hidden"
          whileHover={{
            borderColor: "rgba(6, 182, 212, 0.8)",
            y: -8,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Static Field Lines Background */}
          <div className="football-field-contrast w-full h-[400px]"></div>

          {/* Live Indicator & Time */}
          <div className="relative flex items-center mb-8">
            <motion.div
              className="relative px-5 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full border-2 border-white/30 shadow-lg"
              animate={!isPaused ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-white text-sm font-black flex items-center gap-2">
                <Zap className="w-4 h-4 z-10" />
                LIVE
              </span>
            </motion.div>
          </div>

          {/* Team 1 */}
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center gap-5 flex-1">
              {/* Team Logo */}
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl border-3 border-white/30 shadow-xl flex items-center justify-center font-black text-2xl text-white"
                  style={{ backgroundColor: match.color1 }}
                >
                  {match.team1.substring(0, 2).toUpperCase()}
                </div>
                <div
                  className="absolute inset-0 rounded-2xl -z-10"
                  style={{
                    backgroundColor: match.color1,
                    filter: "blur(15px)",
                    opacity: 0.5,
                  }}
                />
              </div>

              {/* Team Name */}
              <div>
                <h3 className="font-black text-2xl text-white mb-1">
                  {match.team1}
                </h3>
              </div>
            </div>

            {/* Score */}
            <AnimatedScore score={match.score1} color="#FBBF24" />
          </div>

          {/* VS Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 rounded-full text-white font-black text-sm shadow-lg">
              VS
            </div>
          </div>

          {/* Team 2 */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-5 flex-1">
              {/* Team Logo */}
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl border-3 border-white/30 shadow-xl flex items-center justify-center font-black text-2xl text-white"
                  style={{ backgroundColor: match.color2 }}
                >
                  {match.team2.substring(0, 2).toUpperCase()}
                </div>
                <div
                  className="absolute inset-0 rounded-2xl -z-10"
                  style={{
                    backgroundColor: match.color2,
                    filter: "blur(15px)",
                    opacity: 0.5,
                  }}
                />
              </div>

              {/* Team Name */}
              <div>
                <h3 className="font-black text-2xl text-white mb-1">
                  {match.team2}
                </h3>
              </div>
            </div>

            {/* Score */}
            <AnimatedScore score={match.score2} color="#FBBF24" />
          </div>

          {/* Match Status Footer */}
          <div className="mt-6 pt-6 border-t border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-bold">{match.period}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                Powered by
              </span>
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient
                        id={`sponsorGrad-${index}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill={`url(#sponsorGrad-${index})`}
                    />
                    <path
                      d="M30,50 L50,30 L70,50 L50,70 Z"
                      fill="white"
                      opacity="0.9"
                    />
                  </svg>
                  <span className="text-white font-black text-sm">SPORTEX</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);

ScoreCard.displayName = "ScoreCard";

const NoLiveMatchesCard = ({
  isActive,
  isHovered,
  isPaused,
  handleHoverStart,
  handleHoverEnd,
  match,
}) => {
  return (
    <motion.div
      className="relative min-w-[420px] snap-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isActive ? 1 : 0.7,
        scale: isActive ? 1 : 0.95,
      }}
      transition={{ duration: 0.4 }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
    >
      {/* Glow Effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-3xl blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          style={{
            background: `linear-gradient(135deg, ${match.color1}, ${match.color2})`,
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Card Content */}
      <motion.div
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 border-2 border-cyan-500/40 shadow-2xl overflow-hidden"
        whileHover={{
          borderColor: "rgba(6, 182, 212, 0.8)",
          y: -8,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Static Field Lines */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 30px, white 30px, white 32px), repeating-linear-gradient(90deg, transparent, transparent 30px, white 30px, white 32px)",
            }}
          />
        </div>

        {/* No Live Matches Message */}
        <motion.div
          className="flex flex-col items-center justify-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="rounded-2xl border-3 border-white/30 shadow-xl flex items-center justify-center font-black text-2xl text-white">
            No matches in play right now. Action returns soon!
          </p>
        </motion.div>

        {/* Decoration */}
        <div className="absolute -top-4 -right-4 opacity-1">
          <HockeyBall className="w-16 h-16" shouldAnimate={true} />
        </div>
      </motion.div>
    </motion.div>
  );
};

NoLiveMatchesCard.displayName = "NoLiveMatchesCard";

// Main Carousel Component - Optimized
const LiveScoreCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Memoized matches data
  const matches = useMemo(
    () => [
      {
        team1: "Thunder Hawks",
        team2: "Storm Riders",
        score1: 3,
        score2: 2,
        time: "35:20",
        period: "2nd Quarter",
        stats1: 12,
        stats2: 8,
        color1: "#3B82F6",
        color2: "#EF4444",
      },
      {
        team1: "Green Wolves",
        team2: "Golden Eagles",
        score1: 1,
        score2: 1,
        time: "42:15",
        period: "3rd Quarter",
        stats1: 7,
        stats2: 9,
        color1: "#10B981",
        color2: "#F59E0B",
      },
      {
        team1: "Midnight Strikers",
        team2: "Silver Sharks",
        score1: 4,
        score2: 3,
        time: "28:45",
        period: "2nd Quarter",
        stats1: 15,
        stats2: 11,
        color1: "#1F2937",
        color2: "#6B7280",
      },
      {
        team1: "Phoenix Fire",
        team2: "Ice Dragons",
        score1: 2,
        score2: 0,
        time: "50:30",
        period: "4th Quarter",
        stats1: 10,
        stats2: 5,
        color1: "#DC2626",
        color2: "#06B6D4",
      },
    ],
    []
  );

  const paginate = useCallback(
    (newDirection) => {
      setDirection(newDirection);
      setActiveIndex((prev) => {
        const next = prev + newDirection;
        if (next < 0) return matches.length - 1;
        if (next >= matches.length) return 0;
        return next;
      });
    },
    [matches.length]
  );

  const goToSlide = useCallback(
    (index) => {
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    },
    [activeIndex]
  );

  // Optimized auto-rotate with pause on hover
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        paginate(1);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, paginate]);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleCardHover = useCallback((isHovering) => {
    setIsPaused(isHovering);
  }, []);

  return (
    <section id="live-scores" className="relative py-24 px-4 bg-slate-300 overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-4 mb-6">
            <motion.div
              animate={!isPaused ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative"
            >
              <div className="w-5 h-5 bg-red-500 rounded-full" />
              <div className="absolute inset-0 w-5 h-5 bg-red-500 rounded-full animate-ping" />
            </motion.div>

            <h2 className="text-6xl md:text-7xl font-black">
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                LIVE MATCHES
              </span>
            </h2>

            <motion.div
              animate={!isPaused ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              className="relative"
            >
              <div className="w-5 h-5 bg-red-500 rounded-full" />
              <div className="absolute inset-0 w-5 h-5 bg-red-500 rounded-full animate-ping" />
            </motion.div>
          </div>

          <p className="text-gray-800 text-xl font-semibold">
            {isPaused
              ? "Paused - Hover to explore"
              : "Catch all the action as it happens"}
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <motion.button
            onClick={() => paginate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl"
            aria-label="Previous match"
          >
            <ChevronLeft className="w-7 h-7 text-white" />
          </motion.button>

          <motion.button
            onClick={() => paginate(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl"
            aria-label="Next match"
          >
            <ChevronRight className="w-7 h-7 text-white" />
          </motion.button>

          {/* Cards Display */}
          <div className="flex gap-6 overflow-hidden py-8 px-4">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  opacity: { duration: 0.2 },
                }}
                className="flex gap-6 min-w-full justify-center"
              >
                <ScoreCard
                  match={matches[activeIndex]}
                  index={activeIndex}
                  isActive={true}
                  isPaused={isPaused}
                  onHoverChange={handleCardHover}
                />
                {/* <NoLiveMatchesCard
                  isActive={true}
                  isPaused={isPaused}
                  onHoverChange={handleCardHover}
                /> */}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {matches.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                className="relative focus:outline-none"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to match ${index + 1}`}
              >
                <div
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === activeIndex ? "bg-cyan-400" : "bg-gray-600"
                  }`}
                />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveScoreCarousel;
