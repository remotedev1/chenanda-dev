import { z } from "zod";

// Placement enum
export const Placements = {
  FIRST: "FIRST",
  SECOND: "SECOND",
  THIRD: "THIRD",
  FOURTH: "FOURTH",
  FIFTH: "FIFTH",
  SIXTH: "SIXTH",
  SEVENTH: "SEVENTH",
  EIGHTH: "EIGHTH",
};

// Create placement schema
export const createPlacementSchema = z.object({
  tournamentId: z.string().min(1),
  familyId: z.string().min(1),
  sport: z.string().min(1),
  placement: z.nativeEnum(Placements),
  prize: z.any().optional(),
});

// Update placement schema
export const updatePlacementSchema = z.object({
  placement: z.nativeEnum(Placements).optional(),
  prize: z.any().optional(),
});

// Placement configuration with medals
export const placementConfig = {
  [Placements.FIRST]: {
    label: "1st Place",
    shortLabel: "1st",
    medal: "🥇",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    gradient: "from-yellow-400 to-yellow-600",
  },
  [Placements.SECOND]: {
    label: "2nd Place",
    shortLabel: "2nd",
    medal: "🥈",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    gradient: "from-gray-300 to-gray-500",
  },
  [Placements.THIRD]: {
    label: "3rd Place",
    shortLabel: "3rd",
    medal: "🥉",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    gradient: "from-orange-400 to-orange-600",
  },
  [Placements.FOURTH]: {
    label: "4th Place",
    shortLabel: "4th",
    medal: "4️⃣",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    gradient: "from-blue-400 to-blue-600",
  },
  [Placements.FIFTH]: {
    label: "5th Place",
    shortLabel: "5th",
    medal: "5️⃣",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    gradient: "from-purple-400 to-purple-600",
  },
  [Placements.SIXTH]: {
    label: "6th Place",
    shortLabel: "6th",
    medal: "6️⃣",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    gradient: "from-green-400 to-green-600",
  },
  [Placements.SEVENTH]: {
    label: "7th Place",
    shortLabel: "7th",
    medal: "7️⃣",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    gradient: "from-pink-400 to-pink-600",
  },
  [Placements.EIGHTH]: {
    label: "8th Place",
    shortLabel: "8th",
    medal: "8️⃣",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    gradient: "from-indigo-400 to-indigo-600",
  },
};
