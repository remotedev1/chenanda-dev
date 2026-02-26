"use client";
import { motion } from "framer-motion";
import { MapPin, Trophy, Clock, Navigation } from "lucide-react";

const arenaData = {
  "Arena A": {
    location: "North Complex",
    borderColor: "border-2 border-blue-500/50",
    glowColor: "rgba(59, 130, 246, 0.3)",
    gradient: "from-blue-500/20 to-purple-500/20",
    currentMatch: {
      team1: "Thunder",
      team2: "Lightning",
      score1: 3,
      score2: 2,
    },
  },
  "Arena B": {
    location: "South Complex",
    borderColor: "border-2 border-green-500/50",
    glowColor: "rgba(34, 197, 94, 0.3)",
    gradient: "from-green-500/20 to-teal-500/20",
    currentMatch: null,
  },
  "Arena C": {
    location: "East Complex",
    borderColor: "border-2 border-orange-500/50",
    glowColor: "rgba(249, 115, 22, 0.3)",
    gradient: "from-orange-500/20 to-red-500/20",
    currentMatch: {
      team1: "Phoenix",
      team2: "Dragons",
      score1: 1,
      score2: 1,
    },
  },
  "Arena D": {
    location: "West Complex",
    borderColor: "border-2 border-purple-500/50",
    glowColor: "rgba(168, 85, 247, 0.3)",
    gradient: "from-purple-500/20 to-pink-500/20",
    currentMatch: null,
  },
};

const VenueCard = ({ arena, index }) => {
  const data = arenaData[arena];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
      className={`relative overflow-hidden bg-white/60 rounded-xl sm:rounded-2xl ${data.borderColor}`}
      style={{
        boxShadow: `0 20px 40px ${data.glowColor}`,
      }}
    >
      {/* Content Section */}
      <div className="relative p-4 sm:p-6 md:p-8">
        {/* Live Match Notification */}
        {data.currentMatch ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 + 0.3 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 cursor-pointer rounded-lg sm:rounded-xl bg-gradient-to-r from-red-600/20 to-orange-600/20 border-2 border-red-500/50 relative overflow-hidden"
            style={{
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
            }}
          >
            {/* Animated Background Pulse */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* LIVE Badge */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <motion.div
                  className="flex items-center gap-1.5 sm:gap-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <motion.div
                    className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-red-400 font-black text-xs sm:text-sm uppercase tracking-wider">
                    Live Now
                  </span>
                </motion.div>
              </div>

              {/* Match Score */}
              <div className="flex items-center justify-between">
                <div className="flex-1 text-right">
                  <div className="text-slate-900 font-bold text-sm sm:text-base md:text-lg">
                    {data.currentMatch.team1}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 mx-2 sm:mx-4">
                  <div className="text-lg sm:text-xl md:text-2xl font-black text-blue-800">
                    {data.currentMatch.score1}
                  </div>
                  <span className="text-gray-600 font-bold text-sm sm:text-base">
                    -
                  </span>
                  <div className="text-lg sm:text-xl md:text-2xl font-black text-blue-800">
                    {data.currentMatch.score2}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-slate-900 font-bold text-sm sm:text-base md:text-lg">
                    {data.currentMatch.team2}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-200 border-2 border-gray-700/50">
            <span className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">
              No live match currently.
            </span>
          </div>
        )}

        {/* Arena Name */}
        <div className="flex  xs:flex-nowrap items-center justify-between gap-2 xs:gap-3 sm:gap-4">
          <h3 className="text-base xs:text-lg sm:text-xl md:text-3xl lg:text-4xl font-black text-black tracking-tight flex-shrink-0">
            {arena}
            <motion.button
              className="ml-5 w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-md xs:rounded-lg sm:rounded-xl bg-green-600 font-bold relative overflow-hidden group flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-20 transition-opacity"
                animate={{ x: [-200, 200] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              <span className="relative z-10 flex items-center justify-center">
                <Navigation className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-8 md:h-8 text-white" />
              </span>
            </motion.button>
          </h3>
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-slate-600 flex-shrink-0">
            <MapPin className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span className="text-[10px] xs:text-xs sm:text-sm whitespace-nowrap">
              {data.location}
            </span>
          </div>
          {/* Action Button */}
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div
        className={`h-1 bg-gradient-to-r ${data.gradient.replace("/20", "")}`}
      />
    </motion.div>
  );
};

export default function VenueDetails() {
  return (
    <div className="min-h-screen py-8 sm:py-16 md:py-20 px-3 sm:px-4 md:px-8 bg-slate-300">
      <div className=" mx-auto sm:max-w-7xl relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 sm:mb-12 md:mb-16"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 sm:gap-4 mb-2">
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-secondary flex-shrink-0" />
                <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-black tracking-tight">
                  Venue{" "}
                  <span className="text-secondary bg-clip-text">
                    Information
                  </span>
                </h2>
              </div>
            </div>

            {/* Decorative Line */}
            <motion.div
              className="hidden md:block flex-1 h-1 bg-gradient-to-r from-orange-300 via-orange-600/20 to-transparent rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start"
          >
            {[
              {
                icon: Trophy,
                text: "Field Hockey Venues",
                color: "text-yellow-400",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-600"
              >
                <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                <span className="text-white text-xs sm:text-sm font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Venue Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {["Arena A", "Arena B", "Arena C", "Arena D"].map((arena, i) => (
            <VenueCard key={i} arena={arena} index={i} />
          ))}
        </div>

        {/* Additional Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 sm:mt-12 md:mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-900 flex-shrink-0" />
            <span className="text-slate-800 text-xs sm:text-sm md:text-base">
              All venues open daily from 6:00 AM to 5:00 PM
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
