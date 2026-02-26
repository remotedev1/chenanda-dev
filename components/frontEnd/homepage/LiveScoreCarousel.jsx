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
import { Zap, ChevronLeft, ChevronRight, Share } from "lucide-react";
import { toPng } from "html-to-image";

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
      className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black drop-shadow-lg"
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
    const scorecardRef = useRef();
    const [showOptions, setShowOptions] = useState(false);
    // Reference for the scorecard
    const handleDownload = async () => {
      setShowOptions((prev) => !prev);
      if (scorecardRef.current) {
        try {
          const dataUrl = await toPng(scorecardRef.current);
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `${match.team1} vs ${match.team2}.png`;
          link.click();
        } catch (error) {
          console.error("Error capturing the scorecard:", error);
        }
      }
    };

    const handleShare = async () => {
      setShowOptions((prev) => !prev);
      if (scorecardRef.current && navigator.share) {
        try {
          const dataUrl = await toPng(scorecardRef.current);
          const response = await fetch(dataUrl);
          const blob = await response.blob();

          await navigator.share({
            files: [new File([blob], "scorecard.png", { type: "image/png" })],
            title: "Scorecard",
            text: "Check out this match scorecard!",
          });
        } catch (error) {
          console.error("Error sharing the scorecard:", error);
        }
      } else {
        alert("Sharing is not supported on this device.");
      }
    };
    const isShareSupported =
      typeof navigator !== "undefined" && navigator.share;

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
        ref={scorecardRef}
        className="relative min-w-[280px] xs:min-w-[320px] sm:min-w-[380px] md:min-w-[420px] snap-center "
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: isActive ? 1 : 0.7,
          scale: isActive ? 1 : 0.95,
        }}
        transition={{ duration: 0.3 }}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
      >
        {/* Dropdown Options */}
        <div className="absolute top-4 right-4 z-10">
          <div className="relative">
            <button
              onClick={() => setShowOptions((prev) => !prev)}
              className="p-2 bg-slate-900 rounded-full shadow hover:bg-gray-600"
            >
              <Share size={20} />
            </button>
            {showOptions && (
              <div className="absolute right-0 mt-2 w-fit bg-slate-600 p-2 shadow-lg rounded-lg border z-20 flex flex-col items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="block w-full px-4 py-2  bg-blue-500 text-sm text-white rounded-sm  hover:bg-blue-400"
                >
                  Download
                </button>
                {isShareSupported && (
                  <button
                    onClick={handleShare}
                    className="w-full px-4 py-2 bg-green-500 text-sm text-white rounded-sm  hover:bg-green-400"
                  >
                    Share
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Glow Effect - Only render when hovered */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl"
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
          className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-6 md:p-8 border-2 border-cyan-500/40 shadow-2xl overflow-hidden"
          whileHover={{
            borderColor: "rgba(6, 182, 212, 0.8)",
            y: -8,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Static Field Lines Background */}
          <div className="football-field-contrast w-full "></div>

          {/* Live Indicator & Time */}
          <div className="relative flex items-center mb-[3.2rem] justify-between">
            <motion.div
              className="relative px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full border-2 border-white/30 shadow-lg"
              animate={!isPaused ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-white text-xs xs:text-sm font-black flex items-center gap-1.5 xs:gap-2">
                <Zap className="w-3 h-3 xs:w-4 xs:h-4 z-10" />
                LIVE
              </span>
            </motion.div>
          </div>

          {/* Team 1 */}
          <div className="relative flex items-center justify-between mb-4 xs:mb-5 sm:mb-6">
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 flex-1">
              {/* Team Logo */}
              <div className="relative">
                <div
                  className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl border-3 border-white/30 shadow-xl flex items-center justify-center font-black text-base xs:text-lg sm:text-xl md:text-2xl text-white"
                  style={{ backgroundColor: match.color1 }}
                >
                  {match.team1.substring(0, 2).toUpperCase()}
                </div>
                <div
                  className="absolute inset-0 rounded-xl sm:rounded-2xl -z-10"
                  style={{
                    backgroundColor: match.color1,
                    filter: "blur(15px)",
                    opacity: 0.5,
                  }}
                />
              </div>

              {/* Team Name */}
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-1 truncate">
                  {match.team1}
                </h3>
              </div>
            </div>

            {/* Score */}
            <AnimatedScore score={match.score1} color="#FBBF24" />
          </div>

          {/* VS Divider */}
          <div className="relative flex items-center justify-center my-2 xs:my-4 sm:my-5 md:my-6">
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 px-4 xs:px-5 sm:px-6 py-1.5 xs:py-2 rounded-full text-white font-black text-xs xs:text-sm shadow-lg">
              VS
            </div>
          </div>

          {/* Team 2 */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 flex-1">
              {/* Team Logo */}
              <div className="relative">
                <div
                  className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl border-3 border-white/30 shadow-xl flex items-center justify-center font-black text-base xs:text-lg sm:text-xl md:text-2xl text-white"
                  style={{ backgroundColor: match.color2 }}
                >
                  {match.team2.substring(0, 2).toUpperCase()}
                </div>
                <div
                  className="absolute inset-0 rounded-xl sm:rounded-2xl -z-10"
                  style={{
                    backgroundColor: match.color2,
                    filter: "blur(15px)",
                    opacity: 0.5,
                  }}
                />
              </div>

              {/* Team Name */}
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-1 truncate">
                  {match.team2}
                </h3>
              </div>
            </div>

            {/* Score */}
            <AnimatedScore score={match.score2} color="#FBBF24" />
          </div>

          {/* Match Status Footer */}
          <div className="mt-4 xs:mt-5 sm:mt-6 pt-4 xs:pt-5 sm:pt-6 border-t border-gray-700/50 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-0">
            <div className="flex items-center gap-2 text-gray-400 text-xs xs:text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-bold">{match.period}</span>
            </div>

            <div className="flex items-center gap-2 xs:gap-3">
              <span className="text-gray-500 text-[10px] xs:text-xs font-semibold uppercase tracking-wider">
                Powered by
              </span>
              <div className="bg-white/10 backdrop-blur-sm px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg border border-white/20">
                <div className="flex items-center gap-1.5 xs:gap-2">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" viewBox="0 0 100 100">
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
                  <span className="text-white font-black text-xs xs:text-sm">
                    SPORTEX
                  </span>
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
      }, 9000);
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
    <section
      id="live-scores"
      className="relative py-12 px-4 bg-slate-300 overflow-hidden scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5"
        >
          <div className="inline-flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 flex-wrap px-2 sm:px-4">
            <motion.div
              animate={!isPaused ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative flex-shrink-0"
            >
              <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 bg-red-500 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 bg-red-500 rounded-full animate-ping" />
            </motion.div>

            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black text-center leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent whitespace-nowrap">
                LIVE MATCHES
              </span>
            </h2>

            <motion.div
              animate={!isPaused ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              className="relative flex-shrink-0"
            >
              <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 bg-red-500 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 bg-red-500 rounded-full animate-ping" />
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
          <div className="flex gap-6 overflow-hidden py-5 px-4">
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
