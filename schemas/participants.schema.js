import { z } from "zod";

// Sport Types enum
export const SportType = {
  FOOTBALL: "FOOTBALL",
  CRICKET: "CRICKET",
  BASKETBALL: "BASKETBALL",
  VOLLEYBALL: "VOLLEYBALL",
  BADMINTON: "BADMINTON",
  TABLE_TENNIS: "TABLE_TENNIS",
  TENNIS: "TENNIS",
  HOCKEY: "HOCKEY",
  HANDBALL: "HANDBALL",
  KABADDI: "KABADDI",
  ATHLETICS: "ATHLETICS",
  SWIMMING: "SWIMMING",
};

// Pool enum
export const Pool = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  H: "H",
};

// Register participant schema
export const registerParticipantSchema = z.object({
  familyId: z.string().min(1, "Family is required"),
  sports: z.array(z.nativeEnum(SportType)).min(1, "At least one sport is required"),
  pool: z.nativeEnum(Pool).optional(),
  registeredBy: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// Update participant schema
export const updateParticipantSchema = z.object({
  sports: z.array(z.nativeEnum(SportType)).optional(),
  pool: z.nativeEnum(Pool).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

// Bulk import schema
export const bulkImportParticipantsSchema = z.object({
  participants: z.array(
    z.object({
      familyId: z.string(),
      sports: z.array(z.nativeEnum(SportType)),
      pool: z.nativeEnum(Pool).optional(),
    })
  ),
});

// Sport configuration
export const sportConfig = {
  [SportType.FOOTBALL]: {
    label: "Football",
    icon: "⚽",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  [SportType.CRICKET]: {
    label: "Cricket",
    icon: "🏏",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  [SportType.BASKETBALL]: {
    label: "Basketball",
    icon: "🏀",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  [SportType.VOLLEYBALL]: {
    label: "Volleyball",
    icon: "🏐",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  },
  [SportType.BADMINTON]: {
    label: "Badminton",
    icon: "🏸",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  },
  [SportType.TABLE_TENNIS]: {
    label: "Table Tennis",
    icon: "🏓",
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
  [SportType.TENNIS]: {
    label: "Tennis",
    icon: "🎾",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
  [SportType.HOCKEY]: {
    label: "Hockey",
    icon: "🏑",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  },
  [SportType.HANDBALL]: {
    label: "Handball",
    icon: "🤾",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  },
  [SportType.KABADDI]: {
    label: "Kabaddi",
    icon: "🤼",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  },
  [SportType.ATHLETICS]: {
    label: "Athletics",
    icon: "🏃",
    color: "bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300",
  },
  [SportType.SWIMMING]: {
    label: "Swimming",
    icon: "🏊",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  },
};

// Pool configuration
export const poolConfig = {
  [Pool.A]: { label: "Pool A", color: "bg-red-100 text-red-700" },
  [Pool.B]: { label: "Pool B", color: "bg-blue-100 text-blue-700" },
  [Pool.C]: { label: "Pool C", color: "bg-green-100 text-green-700" },
  [Pool.D]: { label: "Pool D", color: "bg-yellow-100 text-yellow-700" },
  [Pool.E]: { label: "Pool E", color: "bg-purple-100 text-purple-700" },
  [Pool.F]: { label: "Pool F", color: "bg-pink-100 text-pink-700" },
  [Pool.G]: { label: "Pool G", color: "bg-indigo-100 text-indigo-700" },
  [Pool.H]: { label: "Pool H", color: "bg-orange-100 text-orange-700" },
};