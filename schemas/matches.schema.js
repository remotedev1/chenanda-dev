import { z } from "zod";

// Enums
export const MatchStatus = {
  SCHEDULED: "SCHEDULED",
  DELAYED: "DELAYED",
  LIVE: "LIVE",
  SUSPENDED: "SUSPENDED",
  COMPLETED: "COMPLETED",
  POSTPONED: "POSTPONED",
  CANCELLED: "CANCELLED",
  ABANDONED: "ABANDONED",
  WALKOVER: "WALKOVER",
  NO_RESULT: "NO_RESULT",
};

export const Round = {
  POOL_STAGE: "POOL_STAGE",
  ROUND_1: "ROUND_1",
  ROUND_2: "ROUND_2",
  ROUND_OF_32: "ROUND_OF_32",
  ROUND_OF_16: "ROUND_OF_16",
  PRE_QUARTER: "PRE_QUARTER",
  QUARTER_FINAL: "QUARTER_FINAL",
  SEMI_FINAL: "SEMI_FINAL",
  THIRD_PLACE: "THIRD_PLACE",
  FINAL: "FINAL",
};

export const Venues = {
  GROUND_1: "GROUND_1",
  GROUND_2: "GROUND_2",
  GROUND_3: "GROUND_3",
  GROUND_4: "GROUND_4",
  GROUND_5: "GROUND_5",
  GROUND_6: "GROUND_6",
  GROUND_7: "GROUND_7",
  GROUND_8: "GROUND_8",
  MAIN_STADIUM: "MAIN_STADIUM",
};

export const MatchPeriod = {
  WARM_UP: "WARM_UP",
  FULL_TIME: "FULL_TIME",
  FIRST_HALF: "FIRST_HALF",
  HALF_TIME: "HALF_TIME",
  SECOND_HALF: "SECOND_HALF",
  FIRST_QUARTER: "FIRST_QUARTER",
  SECOND_QUARTER: "SECOND_QUARTER",
  THIRD_QUARTER: "THIRD_QUARTER",
  FOURTH_QUARTER: "FOURTH_QUARTER",
  FIRST_INNINGS: "FIRST_INNINGS",
  SECOND_INNINGS: "SECOND_INNINGS",
};

// Create match schema
export const createMatchSchema = z.object({
  tournamentId: z.string().min(1),
  sport: z.string().min(1),
  matchNo: z.number().int().min(1),
  name: z.string().max(200).optional(),
  venue: z.nativeEnum(Venues),
  scheduledOn: z.string().datetime(),
  pool: z.string().optional(),
  round: z.nativeEnum(Round),
  status: z.nativeEnum(MatchStatus).default(MatchStatus.SCHEDULED),
  participants: z.array(z.any()).min(2).max(2),
  notes: z.string().max(500).optional(),
});

// Update match schema
export const updateMatchSchema = z.object({
  name: z.string().max(200).optional(),
  venue: z.nativeEnum(Venues).optional(),
  scheduledOn: z.string().datetime().optional(),
  actualStartTime: z.string().datetime().optional().nullable(),
  actualEndTime: z.string().datetime().optional().nullable(),
  status: z.nativeEnum(MatchStatus).optional(),
  currentPeriod: z.nativeEnum(MatchPeriod).optional().nullable(),
  winnerId: z.string().optional().nullable(),
  isDraw: z.boolean().optional(),
  manOfTheMatchId: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

// Match status configuration
export const matchStatusConfig = {
  [MatchStatus.SCHEDULED]: {
    label: "Scheduled",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    icon: "📅",
  },
  [MatchStatus.DELAYED]: {
    label: "Delayed",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    icon: "⏰",
  },
  [MatchStatus.LIVE]: {
    label: "Live",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    icon: "🔴",
    pulse: true,
  },
  [MatchStatus.SUSPENDED]: {
    label: "Suspended",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    icon: "⏸️",
  },
  [MatchStatus.COMPLETED]: {
    label: "Completed",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    icon: "✅",
  },
  [MatchStatus.POSTPONED]: {
    label: "Postponed",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    icon: "📆",
  },
  [MatchStatus.CANCELLED]: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    icon: "❌",
  },
  [MatchStatus.ABANDONED]: {
    label: "Abandoned",
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    icon: "🚫",
  },
  [MatchStatus.WALKOVER]: {
    label: "Walkover",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    icon: "🚶",
  },
  [MatchStatus.NO_RESULT]: {
    label: "No Result",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    icon: "➖",
  },
};

// Round configuration
export const roundConfig = {
  [Round.POOL_STAGE]: { label: "Pool Stage", shortLabel: "Pool" },
  [Round.ROUND_1]: { label: "Round 1", shortLabel: "R1" },
  [Round.ROUND_2]: { label: "Round 2", shortLabel: "R2" },
  [Round.ROUND_OF_32]: { label: "Round of 32", shortLabel: "R32" },
  [Round.ROUND_OF_16]: { label: "Round of 16", shortLabel: "R16" },
  [Round.PRE_QUARTER]: { label: "Pre Quarter Final", shortLabel: "PQF" },
  [Round.QUARTER_FINAL]: { label: "Quarter Final", shortLabel: "QF" },
  [Round.SEMI_FINAL]: { label: "Semi Final", shortLabel: "SF" },
  [Round.THIRD_PLACE]: { label: "3rd Place", shortLabel: "3rd" },
  [Round.FINAL]: { label: "Final", shortLabel: "Final" },
};

// Venue configuration
export const venueConfig = {
  [Venues.GROUND_1]: { label: "Ground 1", capacity: "Medium" },
  [Venues.GROUND_2]: { label: "Ground 2", capacity: "Medium" },
  [Venues.GROUND_3]: { label: "Ground 3", capacity: "Medium" },
  [Venues.GROUND_4]: { label: "Ground 4", capacity: "Small" },
  [Venues.GROUND_5]: { label: "Ground 5", capacity: "Small" },
  [Venues.GROUND_6]: { label: "Ground 6", capacity: "Small" },
  [Venues.GROUND_7]: { label: "Ground 7", capacity: "Small" },
  [Venues.GROUND_8]: { label: "Ground 8", capacity: "Small" },
  [Venues.MAIN_STADIUM]: { label: "Main Stadium", capacity: "Large" },
};