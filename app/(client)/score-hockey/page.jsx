"use client";
import React, { useState } from "react";
import { Trophy, Calendar, Clock, MapPin, Users } from "lucide-react";

// Mock data for demonstration
const mockMatch = {
  status: "LIVE",
  scheduledOn: "2024-12-08T15:30:00",
  venue: "CENTRAL_STADIUM",
  duration: "SECOND_HALF",
  sponsor: "/sponsor.png",
  participants: [
    {
      family: "Johnson",
      goals: [
        { playerName: "Mike Johnson", minute: 23 },
        { playerName: "Sarah Johnson", minute: 45 },
        { playerName: "Tom Johnson", minute: 67 },
      ],
      penaltyShoot: [],
    },
    {
      family: "Smith",
      goals: [
        { playerName: "John Smith", minute: 34 },
        { playerName: "Emma Smith", minute: 56 },
      ],
      penaltyShoot: [],
    },
  ],
};

const ScoreCardPage = () => {
  const [match] = useState(mockMatch);
  const [activeUsers] = useState(247);

  const removeUnderScore = (text) => text?.replace(/_/g, " ") || "";

  const addSuffixToMinute = (minute) => {
    if (!minute) return "";
    const j = minute % 10;
    const k = minute % 100;
    if (j === 1 && k !== 11) return minute + "st";
    if (j === 2 && k !== 12) return minute + "nd";
    if (j === 3 && k !== 13) return minute + "rd";
    return minute + "th";
  };

  const formattedScheduledOnDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formattedScheduledOnTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "LIVE":
        return "bg-gradient-to-r from-green-500 to-emerald-600";
      case "UPCOMING":
        return "bg-gradient-to-r from-blue-500 to-indigo-600";
      case "PLAYED":
        return "bg-gradient-to-r from-red-500 to-rose-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight">
            Live Match
          </h1>
          <p className="text-gray-300 text-lg">Family Championship 2024</p>
        </div>

        {/* Main Scorecard */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
          {/* Status Banner */}
          <div
            className={`${getStatusColor(
              match.status
            )} p-4 relative overflow-hidden`}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full bg-white ${
                    match.status === "LIVE" ? "animate-pulse" : ""
                  }`}
                ></div>
                <span className="text-white font-bold text-lg md:text-xl uppercase tracking-wide">
                  {removeUnderScore(match.status)}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Users size={18} className="text-white" />
                <span className="text-white font-semibold">
                  {activeUsers} watching
                </span>
              </div>
            </div>
            {match.status === "LIVE" && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            )}
          </div>

          {/* Match Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-purple-600" />
                <span>{formattedScheduledOnDate(match.scheduledOn)}</span>
              </div>
              <div className="hidden md:block w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-purple-600" />
                <span>{formattedScheduledOnTime(match.scheduledOn)}</span>
              </div>
              <div className="hidden md:block w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-purple-600" />
                <span>{removeUnderScore(match.venue)}</span>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-semibold">
                {removeUnderScore(match.duration)}
              </span>
            </div>
          </div>

          {/* Score Section */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-2 gap-8 md:gap-16">
              {match.participants.map((participant, index) => (
                <div key={index} className="flex flex-col items-center">
                  {/* Score Circle */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                      <span className="text-5xl md:text-7xl font-bold text-white">
                        {participant.goals?.length || 0}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <Trophy size={16} className="text-yellow-800" />
                    </div>
                  </div>

                  {/* Team Name */}
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                    {participant.family.toUpperCase()}
                  </h2>

                  {/* Goal Scorers */}
                  <div className="w-full space-y-2">
                    {participant.goals.map((scorer, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-3 rounded-r-lg transform transition-all hover:translate-x-1"
                      >
                        <div className="flex items-center gap-2 text-sm md:text-base">
                          <span className="text-xl">⚽</span>
                          <span className="font-medium text-gray-800 capitalize">
                            {scorer?.playerName}
                          </span>
                          <span className="ml-auto text-green-600 font-bold">
                            {addSuffixToMinute(scorer?.minute)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Penalty Shootout */}
                  {participant.penaltyShoot?.length > 0 && (
                    <div className="mt-6 w-full bg-gray-900 rounded-xl p-4">
                      <div className="text-center mb-3">
                        <span className="text-white text-sm font-semibold uppercase">
                          Penalty Shootout
                        </span>
                        <span className="ml-2 text-2xl font-bold text-white">
                          ({participant.penaltyShoot.filter(Boolean).length})
                        </span>
                      </div>
                      <div className="flex justify-center gap-2 flex-wrap">
                        {participant.penaltyShoot.map((scored, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-white ${
                              scored ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            {scored ? "✓" : "✗"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Winner Banner (if applicable) */}
          {match.status === "LIVE" && match.duration === "FULLTIME" && (
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 p-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <Trophy size={32} className="text-yellow-900" />
                <h3 className="text-2xl md:text-3xl font-bold text-yellow-900">
                  JOHNSON WINS!
                </h3>
                <Trophy size={32} className="text-yellow-900" />
              </div>
            </div>
          )}
        </div>

        {/* Additional Stats (Optional) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {match.participants.reduce((sum, p) => sum + p.goals.length, 0)}
            </div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">
              Total Goals
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {activeUsers}
            </div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">
              Live Viewers
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {removeUnderScore(match.duration)}
            </div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">
              Match Status
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default ScoreCardPage;
