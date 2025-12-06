"use client";
import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  Sparkles,
  Navigation,
  Clock,
  Ticket,
  Trophy,
  Zap,
} from "lucide-react";

const VenueCard = ({ arena, index }) => {
  const arenaData = {
    "Arena A": {
      location: "National Sports Complex, Downtown",
      capacity: "5,000",
      currentMatch: {
        team1: "Thunder",
        team2: "Storm",
        score1: 3,
        score2: 2,
        status: "live",
        time: "42:15",
      },
      features: [
        { icon: Users, text: "Premium VIP Seating", color: "text-yellow-400" },
        {
          icon: Sparkles,
          text: "LED Stadium Lighting",
          color: "text-cyan-400",
        },
        {
          icon: Ticket,
          text: "Online Booking Available",
          color: "text-green-400",
        },
      ],
      gradient: "from-cyan-600/20 to-blue-600/20",
      borderColor: "border-cyan-500",
      glowColor: "rgba(6, 182, 212, 0.3)",
    },
    "Arena B": {
      location: "Elite Sports Arena, Riverside",
      currentMatch: {
        team1: "Blue",
        team2: "Gold",
        score1: 1,
        score2: 1,
        status: "live",
        time: "38:52",
      },

      gradient: "from-green-600/20 to-emerald-600/20",
      borderColor: "border-green-500",
      glowColor: "rgba(16, 185, 129, 0.3)",
    },
    "Arena C": {
      location: "Olympic Training Center, Westside",
      currentMatch: {
        team1: "Fire",
        team2: "Ice",
        score1: 2,
        score2: 0,
        status: "live",
        time: "28:30",
      },

      gradient: "from-orange-600/20 to-red-600/20",
      borderColor: "border-orange-500",
      glowColor: "rgba(249, 115, 22, 0.3)",
    },
    "Arena D": {
      location: "University Sports Complex, Campus",

      // currentMatch: {
      //   team1: "Lightning",
      //   team2: "Shadow",
      //   score1: 4,
      //   score2: 3,
      //   status: "live",
      //   time: "55:08",
      // },

      gradient: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500",
      glowColor: "rgba(168, 85, 247, 0.3)",
    },
  };

  const data = arenaData[arena];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
      className={`relative overflow-hidden bg-white/60 rounded-2xl  ${data.borderColor}`}
      style={{
        boxShadow: `0 20px 40px ${data.glowColor}`,
      }}
    >
      {/* Content Section */}
      <div className="relative p-8">
        {/* Live Match Notification */}
        {data.currentMatch ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 + 0.3 }}
            className="mb-6 p-4 cursor-pointer rounded-xl bg-gradient-to-r from-red-600/20 to-orange-600/20 border-2 border-red-500/50 relative overflow-hidden"
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
              <div className="flex items-center justify-between mb-3">
                <motion.div
                  className="flex items-center gap-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <motion.div
                    className="w-3 h-3 bg-red-500 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-red-400 font-black text-sm uppercase tracking-wider">
                    Live Now
                  </span>
                </motion.div>
              </div>

              {/* Match Score */}
              <div className="flex items-center justify-between">
                <div className="flex-1 text-right">
                  <div className="text-slate-900 font-bold text-lg">
                    {data.currentMatch.team1}
                  </div>
                </div>

                <div className="flex items-center gap-3 mx-4">
                  <motion.div
                    className="text-2xl font-black text-blue-800"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {data.currentMatch.score1}
                  </motion.div>
                  <span className="text-gray-600 font-bold">-</span>
                  <motion.div
                    className="text-2xl font-black text-blue-800"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    {data.currentMatch.score2}
                  </motion.div>
                </div>

                <div className="flex-1">
                  <div className="text-slate-900 font-bold text-lg">
                    {data.currentMatch.team2}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="mb-6 p-4 rounded-xl bg-slate-200 border-2 border-gray-700/50">
            <span className="text-gray-600 font-medium">
              No live match currently.
            </span>
          </div>
        )}

        {/* Arena Name */}
        <div className="flex items-center justify-around   gap-4">
          <h3 className="text-4xl font-black text-black mb-3 tracking-tight">
            {arena}
          </h3>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-5 h-5" />
            <span className="text-sm">{data.location}</span>
          </div>
          {/* Action Button */}
          <motion.button
            className="w-16 py-4 rounded-xl bg-green-600  font-bold text-lg uppercase tracking-wider relative overflow-hidden group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Button Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-20 transition-opacity"
              animate={{ x: [-200, 200] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            <span className="relative z-10 flex items-center justify-center gap-2">
              <Navigation className="w-5 h-5" />
            </span>
          </motion.button>
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
    <div className="min-h-screen py-20 px-4 md:px-8 bg-slate-300">
      <div className="container mx-auto max-w-7xl relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <MapPin className="w-8 h-8 text-secondary" />
                <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight">
                  Venue{" "}
                  <span className="text-secondary bg-clip-text ">
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
            className="flex flex-wrap gap-4 justify-center md:justify-start"
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
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600"
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-white text-sm font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Venue Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 lg:gap-8">
          {["Arena A", "Arena B", "Arena C", "Arena D"].map((arena, i) => (
            <VenueCard key={i} arena={arena} index={i} />
          ))}
        </div>

        {/* Additional Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full ">
            <Clock className="w-5 h-5 text-green-900" />
            <span className="text-slate-800">
              All venues open daily from 6:00 AM to 5:00 PM
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
