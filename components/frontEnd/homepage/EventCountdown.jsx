"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, MapPin, Zap, Calendar, Flame } from "lucide-react";

// Optimized: Memoized animated number component to prevent unnecessary re-renders
const AnimatedNumber = React.memo(({ value }) => {
  const formattedValue = String(value).padStart(2, "0");

  return (
    <div className="relative h-8 w-6 xs:h-10 xs:w-8 sm:h-12 sm:w-10 md:h-14 md:w-14 lg:h-16 lg:w-16 overflow-hidden flex justify-center items-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={formattedValue}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-mono text-yellow-400 drop-shadow-lg will-change-transform"
        >
          {formattedValue}
        </motion.span>
      </AnimatePresence>
    </div>
  );
});

AnimatedNumber.displayName = "AnimatedNumber";

const EventCountdown = () => {
  // Optimized: Memoized target date to prevent recalculation
  const targetDate = useMemo(() => new Date("2026-04-05T00:00:00"), []);

  // Optimized: Memoized calculation function
  const calculateTimeLeft = useCallback(() => {
    const difference = +targetDate - +new Date();

    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

  useEffect(() => {
    // Optimized: Only update if component is mounted
    let mounted = true;

    const timer = setInterval(() => {
      if (mounted) {
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);

        // Optimized: Stop timer when countdown is complete
        if (!newTimeLeft) {
          clearInterval(timer);
        }
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [calculateTimeLeft]);

  // Optimized: Memoized stats to prevent recreation on every render
  const stats = useMemo(
    () => [
      { num: "450+", label: "Teams" },
      { num: "5000+", label: "Players" },
      { num: "200+", label: "Matches" },
      { num: "30", label: "Days" },
    ],
    []
  );

  // Optimized: Memoized countdown units
  const countdownUnits = useMemo(
    () => [
      { key: "days", label: "Days" },
      { key: "hours", label: "Hours" },
      { key: "minutes", label: "Mins" },
      { key: "seconds", label: "Secs" },
    ],
    []
  );

  return (
      <section className="relative xl:min-h-screen flex items-center justify-center overflow-hidden py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Optimized: Combined background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
            <div
              className="absolute inset-0 opacity-30 sm:opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 37px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.05) 50px, rgba(255,255,255,0.05) 52px)",
              }}
            />
          </div>

          {/* Field markings */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 xs:w-56 xs:h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 border-2 sm:border-3 md:border-4 border-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 bg-white/30 rounded-full" />
          </div>

          {/* Stadium lights */}
          <div className="absolute top-0 left-1/4 w-[200px] h-[200px] xs:w-[250px] xs:h-[250px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] bg-yellow-400 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] lg:blur-[150px] opacity-20" />
          <div className="absolute top-0 right-1/4 w-[200px] h-[200px] xs:w-[250px] xs:h-[250px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] bg-cyan-400 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] lg:blur-[150px] opacity-20" />
          <div className="absolute bottom-0 left-1/3 w-[180px] h-[180px] xs:w-[220px] xs:h-[220px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px] bg-blue-500 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] lg:blur-[120px] opacity-15" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-2 xs:px-3 sm:px-4 md:px-6 max-w-6xl w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            {/* Championship Badge */}
            <motion.div
              className="inline-block mb-3 xs:mb-4 sm:mb-5 md:mb-6 will-change-transform"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 blur-lg sm:blur-xl opacity-60" />
                <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 px-2 py-1.5 xs:px-3 xs:py-2 sm:px-5 sm:py-2.5 md:px-7 md:py-3 lg:px-8 lg:py-3 rounded-full border-2 sm:border-3 md:border-4 border-yellow-300 shadow-2xl transform -rotate-2">
                  <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                    <Trophy className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-900 flex-shrink-0" />
                    <span className="text-yellow-900 font-black text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg tracking-tight xs:tracking-wide sm:tracking-wider whitespace-nowrap">
                      KODAVA HOCKEY TOURNAMENT 2026
                    </span>
                    <Trophy className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-900 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black mb-2 xs:mb-3 sm:mb-4 relative px-2">
              <span className="relative inline-block">
                <span className="absolute inset-0 text-yellow-400 blur-md sm:blur-lg opacity-50">
                  CHENANDA
                </span>
                <span className="relative bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl">
                  CHENANDA
                </span>
              </span>
            </h1>
          </motion.div>

          {/* Event Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 justify-center items-stretch sm:items-center mb-4 xs:mb-5 sm:mb-6 md:mb-8 lg:mb-10 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 bg-black/60 backdrop-blur-lg px-2.5 py-2 xs:px-3 xs:py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3.5 lg:px-6 lg:py-4 rounded-full border-2 border-cyan-500/50 w-full sm:w-auto">
              <Calendar className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-cyan-400 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-[9px] xs:text-[10px] sm:text-xs text-cyan-400 font-bold uppercase truncate">
                  Tournament Dates
                </div>
                <div className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-black text-white truncate">
                  April 5 - May 2, 2026
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 bg-black/60 backdrop-blur-lg px-2.5 py-2 xs:px-3 xs:py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3.5 lg:px-6 lg:py-4 rounded-full border-2 border-green-500/50 w-full sm:w-auto">
              <MapPin className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-green-400 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-[9px] xs:text-[10px] sm:text-xs text-green-400 font-bold uppercase truncate">
                  Venue
                </div>
                <div className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-black text-white truncate">
                  Gen. Thimmaiah Stadium, Napokulu
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col lg:flex-row xs:flex-row gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 justify-center mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12 max-w-2xl mx-auto"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "#payment")}
              className="w-full xs:w-auto px-4 py-2.5 xs:px-5 xs:py-3 sm:px-7 sm:py-3.5 md:px-9 md:py-4 lg:px-10 lg:py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-sm xs:text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl shadow-2xl will-change-transform"
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <Flame className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 flex-shrink-0" />
                <span className="truncate">REGISTER NOW</span>
                <Flame className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 flex-shrink-0" />
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "#live-scores")}
              className="w-full xs:w-auto px-4 py-2.5 xs:px-5 xs:py-3 sm:px-7 sm:py-3.5 md:px-9 md:py-4 lg:px-10 lg:py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm xs:text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl shadow-2xl border-2 border-cyan-400 will-change-transform"
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <Zap className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 flex-shrink-0" />
                <span className="truncate">LIVE SCORES</span>
              </span>
            </motion.button>
          </motion.div>

          {/* Optimized Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12"
          >
            <div className="bg-black/60 backdrop-blur-lg rounded-xl xs:rounded-2xl sm:rounded-3xl p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 border-2 border-yellow-500/50 shadow-2xl max-w-4xl mx-auto">
              <h3 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-black text-yellow-400 mb-3 xs:mb-4 sm:mb-5 md:mb-6 uppercase tracking-wide sm:tracking-wider">
                Tournament Starts In
              </h3>

              {timeLeft ? (
                <div className="flex justify-center items-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8">
                  {countdownUnits.map((unit, index) => (
                    <React.Fragment key={unit.key}>
                      <div className="flex flex-col items-center">
                        <AnimatedNumber value={timeLeft[unit.key]} />
                        <div className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-gray-300 uppercase tracking-wider font-bold mt-0.5 xs:mt-1 sm:mt-1.5 md:mt-2 whitespace-nowrap">
                          {unit.label}
                        </div>
                      </div>
                      {index < countdownUnits.length - 1 && (
                        <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-yellow-400">
                          :
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center px-2"
                >
                  <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-yellow-400 mb-2">
                    🏑 LET&apos;S PLAY HOCKEY! 🏑
                  </div>
                  <p className="text-sm xs:text-base sm:text-lg md:text-xl text-white">
                    The tournament has begun!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-yellow-400">
                  {stat.num}
                </div>
                <div className="text-[10px] xs:text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wide sm:tracking-wider mt-0.5 xs:mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-12 h-12 xs:w-16 xs:h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 border-l-2 border-t-2 sm:border-l-3 sm:border-t-3 md:border-l-4 md:border-t-4 border-yellow-400 opacity-30" />
        <div className="absolute top-0 right-0 w-12 h-12 xs:w-16 xs:h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 border-r-2 border-t-2 sm:border-r-3 sm:border-t-3 md:border-r-4 md:border-t-4 border-cyan-400 opacity-30" />
        <div className="absolute bottom-0 left-0 w-12 h-12 xs:w-16 xs:h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 border-l-2 border-b-2 sm:border-l-3 sm:border-b-3 md:border-l-4 md:border-b-4 border-green-400 opacity-30" />
        <div className="absolute bottom-0 right-0 w-12 h-12 xs:w-16 xs:h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 border-r-2 border-b-2 sm:border-r-3 sm:border-b-3 md:border-r-4 md:border-b-4 border-blue-400 opacity-30" />
      </section>
  );
};

export default EventCountdown;
