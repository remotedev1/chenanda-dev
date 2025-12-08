"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  Trophy,
  Zap,
  Target,
  Award,
  TrendingUp,
  Users,
} from "lucide-react";

const matches = [
  {
    id: 1,
    team1: "Thunder",
    team2: "Storm",
    score1: 3,
    score2: 2,
    time: "14:00",
    date: "Nov 20",
    status: "live",
    venue: "Arena A",
  },
  {
    id: 2,
    team1: "Blue",
    team2: "Gold",
    score1: 1,
    score2: 1,
    time: "16:30",
    date: "Nov 20",
    status: "live",
    venue: "Arena B",
  },
  {
    id: 3,
    team1: "Fire",
    team2: "Ice",
    score1: null,
    score2: null,
    time: "18:00",
    date: "Nov 21",
    status: "upcoming",
    venue: "Arena A",
  },
  {
    id: 4,
    team1: "Lightning",
    team2: "Shadow",
    score1: null,
    score2: null,
    time: "14:00",
    date: "Nov 21",
    status: "upcoming",
    venue: "Arena B",
  },
  {
    id: 5,
    team1: "Phoenix",
    team2: "Dragons",
    score1: 4,
    score2: 1,
    time: "10:00",
    date: "Nov 19",
    status: "completed",
    venue: "Arena A",
  },
  {
    id: 6,
    team1: "Eagles",
    team2: "Hawks",
    score1: 2,
    score2: 3,
    time: "12:30",
    date: "Nov 19",
    status: "completed",
    venue: "Arena B",
  },
];

const topPlayers = [
  {
    name: "Sarah Mitchell",
    team: "Thunder",
    goals: 23,
    avatar: "SM",
  },
  {
    name: "Alex Chen",
    team: "Storm",
    goals: 21,
    avatar: "AC",
  },
  {
    name: "Maya Patel",
    team: "Blue",
    goals: 19,
    avatar: "MP",
  },
  {
    name: "Jordan Hayes",
    team: "Golden",
    goals: 18,
    avatar: "JH",
  },
];

const topTeams = [
  {
    name: "Thunder",
    wins: 12,
    losses: 2,
    points: 36,
    color: "from-purple-600 to-blue-600",
  },
  {
    name: "Storm",
    wins: 11,
    losses: 3,
    points: 33,
    color: "from-blue-600 to-cyan-600",
  },
  {
    name: "Fire",
    wins: 10,
    losses: 4,
    points: 30,
    color: "from-orange-600 to-red-600",
  },
  {
    name: "Blue",
    wins: 9,
    losses: 5,
    points: 27,
    color: "from-cyan-600 to-blue-600",
  },
];

const TopPlayerCard = ({ player, rank }) => {
  const medals = ["🥇", "🥈", "🥉", "🏅"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      whileHover={{ scale: 1.03, x: 10 }}
      className={`relative overflow-hidden rounded-xl border-2 ${
        rank === 0
          ? "bg-red-400/30 border-red-400"
          : rank === 1
          ? "bg-gray-400/30 border-gray-400"
          : rank === 2
          ? "bg-orange-400/30 border-orange-400"
          : "bg-green-400/30 border-green-400"
      }`}
    >
      {/* Rank Badge */}
      <div className="absolute top-0 left-0 w-16 h-16">
        <div
          className={`absolute top-2 left-2 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
            rank === 0
              ? "bg-red-500/20"
              : rank === 1
              ? "bg-gray-500/20"
              : rank === 2
              ? "bg-orange-500/20"
              : "bg-green-500/20"
          }`}
        >
          {medals[rank]}
        </div>
      </div>

      <div className="relative p-6 pl-20">
        <div className="flex items-center justify-between">
          {/* Player Info */}
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${
                rank === 0
                  ? "bg-gradient-to-br from-red-400 to-orange-500 text-black"
                  : rank === 1
                  ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black"
                  : rank === 2
                  ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                  : "bg-gradient-to-br from-green-400 to-green-600 text-white"
              }`}
            >
              {player.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold text-black mb-1">
                {player.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <Users className="w-4 h-4" />
                <span>{player.team}</span>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="text-right">
            <motion.div
              className={`text-4xl font-black ${
                rank === 0
                  ? "text-red-500"
                  : rank === 1
                  ? "text-gray-500"
                  : rank === 2
                  ? "text-orange-500"
                  : "text-green-500"
              }`}
              animate={rank === 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {player.goals}
            </motion.div>
            <div className="text-sm text-gray-500 font-medium">GOALS</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(player.goals / topPlayers[0].goals) * 100}%`,
            }}
            transition={{ duration: 1, delay: rank * 0.1 }}
            className={`h-full ${
              rank === 0
                ? "bg-gradient-to-r from-red-500 to-orange-500"
                : rank === 1
                ? "bg-gradient-to-r from-gray-400 to-gray-600"
                : rank === 2
                ? "bg-gradient-to-r from-orange-500 to-red-500"
                : "bg-gradient-to-r from-green-500 to-cyan-500"
            }`}
          />
        </div>
      </div>

      {/* Glow Effect for Top 3 */}
      {rank < 3 && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              rank === 0
                ? "radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.1) 0%, transparent 70%)"
                : rank === 1
                ? "radial-gradient(circle at 50% 50%, rgba(156, 163, 175, 0.1) 0%, transparent 70%)"
                : "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.1) 0%, transparent 70%)",
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

// const TopTeamCard = ({ team, rank }) => {
//   const medals = ["🥇", "🥈", "🥉", "🏅"];

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: rank * 0.1 }}
//       whileHover={{ scale: 1.03, y: -5 }}
//       className={`relative overflow-hidden rounded-xl border-2 ${
//         rank === 0
//           ? "border-red-400 shadow-lg shadow-red-500/30"
//           : rank === 1
//           ? "border-gray-400 shadow-lg shadow-gray-500/30"
//           : "border-green-600"
//       }`}
//       style={{
//         background: `linear-gradient(135deg, #0a1f1a 0%, #0d2b26 50%, #0a1f1a 100%)`,
//       }}
//     >
//       {/* Rank Number */}
//       <div className="absolute top-4 right-4 text-6xl font-black text-white/5">
//         #{rank + 1}
//       </div>

//       {/* Turf Pattern */}
//       <div className="absolute inset-0 opacity-5">
//         <div
//           className="w-full h-full"
//           style={{
//             backgroundImage:
//               "repeating-linear-gradient(90deg, transparent, transparent 25px, #10b981 25px, #10b981 27px)",
//           }}
//         />
//       </div>

//       <div className="relative p-6">
//         {/* Medal Badge */}
//         <div className="flex items-start justify-between mb-4">
//           <div className="text-4xl">{medals[rank]}</div>
//           <div
//             className={`px-3 py-1 rounded-full text-xs font-bold ${
//               rank === 0
//                 ? "bg-red-500/20 text-red-400"
//                 : rank === 1
//                 ? "bg-gray-500/20 text-gray-400"
//                 : rank === 2
//                 ? "bg-orange-500/20 text-orange-400"
//                 : "bg-green-500/20 text-green-400"
//             }`}
//           >
//             RANK {rank + 1}
//           </div>
//         </div>

//         {/* Team Name */}
//         <div className="mb-6">
//           <h3
//             className={`text-3xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r ${team.color}`}
//           >
//             {team.name}
//           </h3>
//           <div className="flex items-center gap-2 text-gray-400">
//             <Trophy className="w-4 h-4" />
//             <span className="text-sm">Championship Contender</span>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-3 gap-4">
//           <div className="text-center">
//             <motion.div
//               className="text-3xl font-black text-green-400"
//               animate={rank === 0 ? { scale: [1, 1.1, 1] } : {}}
//               transition={{ duration: 2, repeat: Infinity }}
//             >
//               {team.wins}
//             </motion.div>
//             <div className="text-xs text-gray-500 mt-1">WINS</div>
//           </div>
//           <div className="text-center">
//             <div className="text-3xl font-black text-red-400">
//               {team.losses}
//             </div>
//             <div className="text-xs text-gray-500 mt-1">LOSSES</div>
//           </div>
//           <div className="text-center">
//             <motion.div
//               className={`text-3xl font-black ${
//                 rank === 0 ? "text-red-400" : "text-cyan-400"
//               }`}
//               animate={rank === 0 ? { scale: [1, 1.1, 1] } : {}}
//               transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
//             >
//               {team.points}
//             </motion.div>
//             <div className="text-xs text-gray-500 mt-1">POINTS</div>
//           </div>
//         </div>

//         {/* Win Rate Bar */}
//         <div className="mt-4">
//           <div className="flex justify-between text-xs text-gray-500 mb-2">
//             <span>Win Rate</span>
//             <span>
//               {Math.round((team.wins / (team.wins + team.losses)) * 100)}%
//             </span>
//           </div>
//           <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
//             <motion.div
//               initial={{ width: 0 }}
//               animate={{
//                 width: `${(team.wins / (team.wins + team.losses)) * 100}%`,
//               }}
//               transition={{ duration: 1, delay: rank * 0.1 }}
//               className={`h-full bg-gradient-to-r ${team.color}`}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Bottom Accent */}
//       <div className={`h-1 bg-gradient-to-r ${team.color}`} />
//     </motion.div>
//   );
// };

const MatchCard = ({ match }) => {
  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";
  const isUpcoming = match.status === "upcoming";

  const winner =
    isCompleted && match.score1 !== match.score2
      ? match.score1 > match.score2
        ? "team1"
        : "team2"
      : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className={`relative   overflow-x-auto no-scrollbar rounded-xl  ${
        isLive
          ? "bg-blue-400/30"
          : isCompleted
          ? "bg-red-400/30"
          : "bg-green-400/30"
      }`}
    >
      {/* Turf Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 30px, #10b981 30px, #10b981 32px)",
          }}
        />
      </div>

      {/* Live Badge */}
      {isLive && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-3 right-2 z-10"
        >
          <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <span className="text-white text-xs font-bold uppercase tracking-wider">
              Live
            </span>
          </div>
        </motion.div>
      )}

      {/* Match Content */}
      <div className="relative p-6">
        {/* Date and Time */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-black/60 text-sm">
            <Clock className="w-4 h-4" />
            <span>
              {match.date} • {match.time}
            </span>
          </div>
          <div className="flex items-center gap-1 text-black/60 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{match.venue}</span>
          </div>
        </div>

        {/* Teams and Scores */}
        <div className="flex items-center justify-between gap-4">
          {/* Team 1 */}
          <motion.div
            className={`flex-1 text-right ${
              winner === "team1" ? "text-red-600" : "text-black"
            }`}
            whileHover={{ x: -5 }}
          >
            <div className="flex items-center justify-end gap-2">
              {winner === "team1" && <Trophy className="w-5 h-5" />}
              <h3
                className={`text-lg sm:text-3xl font-bold ${
                  winner === "team1" ? "text-red-600" : ""
                }`}
              >
                {match.team1}
              </h3>
            </div>
          </motion.div>

          {/* Score or VS */}
          <div className="flex items-center gap-4">
            {isUpcoming ? (
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-green-400 tracking-wider">
                  VS
                </span>
                <span className="text-xs text-gray-500 mt-1">Starts Soon</span>
              </div>
            ) : (
              <>
                <motion.div
                  className={`text-5xl font-black ${
                    isLive
                      ? "text-blue-700"
                      : winner === "team1"
                      ? "text-red-600"
                      : "text-black"
                  }`}
                  animate={isLive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {match.score1}
                </motion.div>
                <span className="text-3xl text-gray-600 font-bold">-</span>
                <motion.div
                  className={`text-5xl font-black ${
                    isLive
                      ? "text-blue-700"
                      : winner === "team2"
                      ? "text-red-600"
                      : "text-black"
                  }`}
                  animate={isLive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  {match.score2}
                </motion.div>
              </>
            )}
          </div>

          {/* Team 2 */}
          <motion.div
            className={`flex-1 ${
              winner === "team2" ? "text-red-600" : "text-black"
            }`}
            whileHover={{ x: 5 }}
          >
            <div className="flex items-center gap-2">
              <h3
                className={`text-lg sm:text-3xl font-bold ${
                  winner === "team2" ? "text-red-600" : ""
                }`}
              >
                {match.team2}
              </h3>
              {winner === "team2" && <Trophy className="w-5 h-5" />}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div
        className={`h-1 ${
          isLive
            ? "bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600"
            : isCompleted
            ? "bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"
            : "bg-gradient-to-r from-green-800 via-green-600 to-green-800"
        }`}
      />
    </motion.div>
  );
};

export default function FieldHockeySchedule() {
  const [activeTab, setActiveTab] = useState("live");
  const [activeSection, setActiveSection] = useState("matches"); // 'matches', 'players', 'teams'

  const tabs = ["upcoming", "live", "completed"];

  const filteredMatches = matches.filter((m) => m.status === activeTab);

  return (
    <div className=" bg-white p-4 md:p-16 relative">
      <div className="max-w-7xl mx-auto ">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-black text-black mb-4 tracking-tight">
            Tournament{" "}
            <span className="text-secondary bg-clip-text ">Dashboard</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Field Hockey Championship 2026
          </p>
        </motion.div>

        {/* Section Selector */}
        <div className="flex flex-wrap justify-center gap-2 xs:gap-2.5 sm:gap-3 mb-6 sm:mb-8 px-2">
          {[
            { id: "matches", icon: Clock, label: "Matches" },
            { id: "players", icon: Target, label: "Top 5 Scorers" },
            // { id: "teams", icon: Award, label: "Top Teams" },
          ].map((section) => (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
            flex items-center gap-1.5 xs:gap-2 
            px-3 xs:px-4 sm:px-5 md:px-6 
            py-2 xs:py-2.5 sm:py-3 
            rounded-lg xs:rounded-xl 
            font-bold 
            text-[10px] xs:text-xs sm:text-sm 
            uppercase tracking-wider 
            transition-all
            ${
              activeSection === section.id
                ? "bg-gradient-to-r from-blue-700 to-blue-900 text-white"
                : "bg-gradient-to-r from-gray-800 to-gray-900 text-gray-400 hover:from-gray-700 hover:to-gray-800"
            }
          `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <section.icon className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">{section.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Matches Section */}
          {activeSection === "matches" && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Tabs */}
              <div className="relative mb-8 w-full">
                {/* scroll container */}
                <div className="flex justify-center">
                  <div
                    className="flex gap-2 md:gap-4 bg-slate-300 backdrop-blur-sm p-2 rounded-2xl border-2 border-slate-400
      overflow-x-auto no-scrollbar max-w-full"
                  >
                    {tabs.map((tab) => (
                      <motion.button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative px-4 md:px-10 py-2 md:py-3 rounded-xl font-semibold text-xs md:text-lg uppercase tracking-wider transition-all whitespace-nowrap
            ${
              activeTab === tab
                ? "text-white"
                : "text-blue-600 hover:text-white"
            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {activeTab === tab && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-blue-600 rounded-xl"
                            style={{
                              boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)",
                            }}
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                        <span className="relative z-10">{tab}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.div
                  className="absolute -bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Match Cards Grid */}
              <motion.div
                layout
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Empty State */}
              {filteredMatches.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="text-gray-600 text-xl">
                    No {activeTab} matches
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Top Players Section */}
          {activeSection === "players" && (
            <motion.div
              key="players"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6 flex items-start justify-start gap-3">
                <Target className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-black text-black">
                  Top Goal Scorers
                </h2>
              </div>
              <div className="space-y-4">
                {topPlayers.map((player, index) => (
                  <TopPlayerCard key={index} player={player} rank={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Top Teams Section */}
          {activeSection === "teams" && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-red-400" />
                  <h2 className="text-3xl font-black text-white">
                    Leaderboard
                  </h2>
                </div>
                <Trophy className="w-8 h-8 text-red-400" />
              </div>
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topTeams.map((team, index) => (
                  <TopTeamCard key={index} team={team} rank={index} />
                ))}
              </div> */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
