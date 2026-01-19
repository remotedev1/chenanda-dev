import { z } from "zod";

// Game Category enum
export const GameCategory = {
  MENS: "MENS",
  WOMENS: "WOMENS",
  JUNIOR: "JUNIOR",
  VETERANS: "VETERANS",
  MIXED: "MIXED",
};

// Sport Type (from participants schema)
export const SportType = {
  FOOTBALL: "FOOTBALL",
  CRICKET: "CRICKET",
  BASKETBALL: "BASKETBALL",
  VOLLEYBALL: "VOLLEYBALL",
  BADMINTON: "BADMINTON",
  TABLE_TENNIS: "TABLE_TENNIS",
  TENNIS: "TENNIS",
  HOCKEY: "HOCKEY",
  FIELD_HOCKEY: "FIELD_HOCKEY",
  HANDBALL: "HANDBALL",
  KABADDI: "KABADDI",
  ATHLETICS: "ATHLETICS",
  SWIMMING: "SWIMMING",
};

// Create game schema
export const createGameSchema = z.object({
  sportType: z.nativeEnum(SportType),
  name: z.string().min(3, "Game name must be at least 3 characters"),
  format: z.string().optional(),
  category: z.nativeEnum(GameCategory),
  date: z.string().datetime(),
  registrationDeadline: z.string().datetime(),
  registrationFee: z.number().min(0, "Fee must be positive"),
  isActive: z.boolean().default(true),
  icon: z.string().optional(),
  description: z.string().optional(),
  rules: z.string().optional(),
});

// Update game schema
export const updateGameSchema = createGameSchema.partial();

// Category configuration
export const categoryConfig = {
  [GameCategory.MENS]: {
    label: "Men's",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    icon: "👨",
  },
  [GameCategory.WOMENS]: {
    label: "Women's",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    icon: "👩",
  },
  [GameCategory.JUNIOR]: {
    label: "Junior",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    icon: "🧒",
  },
  [GameCategory.VETERANS]: {
    label: "Veterans",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    icon: "👴",
  },
  [GameCategory.MIXED]: {
    label: "Mixed",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    icon: "👥",
  },
};

// Sport icons and colors
export const sportConfigExtended = {
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
  [SportType.FIELD_HOCKEY]: {
    label: "Field Hockey",
    icon: "🏑",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
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
    label: "Ice Hockey",
    icon: "🏒",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  },
  [SportType.HANDBALL]: {
    label: "Handball",
    icon: "🤾",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  },
  [SportType.KABADDI]: {
    label: "Kabaddi",
    icon: "🤼",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
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