"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, MapPin, Zap, Calendar, Flame } from "lucide-react";

// Optimized: Memoized animated number component to prevent unnecessary re-renders
const AnimatedNumber = React.memo(({ value }) => {
  const formattedValue = String(value).padStart(2, "0");

  return (
    <div className="relative h-12 w-16 overflow-hidden flex justify-center items-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={formattedValue}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute text-5xl font-black font-mono text-yellow-400 drop-shadow-lg"
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
      { key: "minutes", label: "Minutes" },
      { key: "seconds", label: "Seconds" },
    ],
    []
  );

  return (
    <section className="bg-gradient-to-b from-black via-gray-950 to-black">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4">
        {/* Optimized: Combined background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-950">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 37px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.05) 50px, rgba(255,255,255,0.05) 52px)",
              }}
            />
          </div>

          {/* Field markings */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-4 border-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/30 rounded-full" />
          </div>

          {/* Stadium lights */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-400 rounded-full blur-[150px] opacity-20" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-400 rounded-full blur-[150px] opacity-20" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-blue-500 rounded-full blur-[120px] opacity-15" />
        </div>

        {/* Hockey Sticks - Optimized animations */}
        <motion.svg
          initial={{ x: -300, rotate: -45, opacity: 0 }}
          animate={{ x: 0, rotate: -30, opacity: 0.25 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute left-0 top-1/4 w-[400px] h-[400px] text-white pointer-events-none"
          viewBox="0 0 100 100"
        >
          <path
            d="M20,80 Q25,20 40,10 L45,15 Q32,25 28,80 Z"
            fill="currentColor"
            stroke="white"
            strokeWidth="0.5"
            opacity="0.8"
          />
          <rect
            x="38"
            y="8"
            width="8"
            height="15"
            rx="4"
            fill="currentColor"
            opacity="0.8"
          />
        </motion.svg>

        <motion.svg
          initial={{ x: 300, rotate: 45, opacity: 0 }}
          animate={{ x: 0, rotate: 30, opacity: 0.25 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute right-0 top-1/4 w-[400px] h-[400px] text-white pointer-events-none"
          viewBox="0 0 100 100"
        >
          <path
            d="M80,80 Q75,20 60,10 L55,15 Q68,25 72,80 Z"
            fill="currentColor"
            stroke="white"
            strokeWidth="0.5"
            opacity="0.8"
          />
          <rect
            x="54"
            y="8"
            width="8"
            height="15"
            rx="4"
            fill="currentColor"
            opacity="0.8"
          />
        </motion.svg>

        {/* Animated Hockey Balls */}
        <motion.div
          animate={{
            y: [-30, 30, -30],
            x: [0, 120, 0],
            rotate: [0, 360, 720],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-1/3 pointer-events-none"
        >
          <svg className="w-16 h-16" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#FCD34D" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="3"
            />
            <path
              d="M30,50 Q50,30 70,50 Q50,70 30,50"
              fill="white"
              opacity="0.4"
            />
            <circle cx="35" cy="35" r="8" fill="white" opacity="0.6" />
          </svg>
        </motion.div>

        <motion.div
          animate={{
            y: [40, -40, 40],
            x: [0, -100, 0],
            rotate: [0, -360, -720],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-32 left-1/4 pointer-events-none"
        >
          <svg className="w-12 h-12" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#FBBF24" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="3"
            />
            <path
              d="M30,50 Q50,30 70,50 Q50,70 30,50"
              fill="white"
              opacity="0.4"
            />
          </svg>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            {/* Championship Badge */}
            <motion.div
              className="inline-block mb-6"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 blur-xl opacity-60" />
                <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 px-8 py-3 rounded-full border-4 border-yellow-300 shadow-2xl transform -rotate-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-900" />
                    <span className="text-yellow-900 font-black text-lg tracking-wider">
                      KODAVA HOCKEY TOURNAMENT 2026
                    </span>
                    <Trophy className="w-6 h-6 text-yellow-900" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-7xl md:text-9xl font-black mb-4 relative">
              <span className="relative inline-block">
                <span className="absolute inset-0 text-yellow-400 blur-lg opacity-50">
                  CHENANDA
                </span>
                <span className="relative bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl">
                  CHENANDA 
                </span>
              </span>
            </h1>

            {/* <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 mb-8 tracking-wide">
                ELITE TOURNAMENT SERIES
              </h2>
            </motion.div> */}
          </motion.div>

          {/* Event Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col md:flex-row gap-6 justify-center items-center mb-10"
          >
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-lg px-6 py-4 rounded-full border-2 border-cyan-500/50">
              <Calendar className="w-7 h-7 text-cyan-400" />
              <div className="text-left">
                <div className="text-xs text-cyan-400 font-bold uppercase">
                  Tournament Dates
                </div>
                <div className="text-xl font-black text-white">
                  {" "}
                  April 5 - May 2, 2026
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-lg px-6 py-4 rounded-full border-2 border-green-500/50">
              <MapPin className="w-7 h-7 text-green-400" />
              <div className="text-left">
                <div className="text-xs text-green-400 font-bold uppercase">
                  Venue
                </div>
                <div className="text-xl font-black text-white">
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
            className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-xl rounded-2xl shadow-2xl"
            >
              <span className="flex items-center justify-center gap-2">
                <Flame className="w-6 h-6" />
                REGISTER NOW
                <Flame className="w-6 h-6" />
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xl rounded-2xl shadow-2xl border-2 border-cyan-400"
            >
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-6 h-6" />
                LIVE SCORES
              </span>
            </motion.button>
          </motion.div>

          {/* Optimized Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mb-12"
          >
            <div className="bg-black/60 backdrop-blur-lg rounded-3xl p-8 border-2 border-yellow-500/50 shadow-2xl max-w-3xl mx-auto">
              <h3 className="text-2xl font-black text-yellow-400 mb-6 uppercase tracking-wider">
                Tournament Starts In
              </h3>

              {timeLeft ? (
                <div className="flex justify-center items-center gap-4 md:gap-8">
                  {countdownUnits.map((unit, index) => (
                    <React.Fragment key={unit.key}>
                      <div className="flex flex-col items-center">
                        <AnimatedNumber value={timeLeft[unit.key]} />
                        <div className="text-xs md:text-sm text-gray-300 uppercase tracking-widest font-bold mt-2">
                          {unit.label}
                        </div>
                      </div>
                      {index < countdownUnits.length - 1 && (
                        <div className="text-4xl font-black text-yellow-400">
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
                  className="text-center"
                >
                  <div className="text-5xl font-black text-yellow-400 mb-2">
                    🏑 LET&apos;S PLAY HOCKEY! 🏑
                  </div>
                  <p className="text-xl text-white">
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
            className="flex flex-wrap justify-center gap-8"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-yellow-400">
                  {stat.num}
                </div>
                <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-40 h-40 border-l-4 border-t-4 border-yellow-400 opacity-30" />
        <div className="absolute top-0 right-0 w-40 h-40 border-r-4 border-t-4 border-cyan-400 opacity-30" />
        <div className="absolute bottom-0 left-0 w-40 h-40 border-l-4 border-b-4 border-green-400 opacity-30" />
        <div className="absolute bottom-0 right-0 w-40 h-40 border-r-4 border-b-4 border-blue-400 opacity-30" />
      </section>
    </section>
  );
};

export default EventCountdown;
