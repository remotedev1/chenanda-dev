import { z } from "zod";

// Tournament Status Enum
export const TournamentStatus = {
  DRAFT: "DRAFT",
  REGISTRATION: "REGISTRATION",
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

// Base Tournament Schema
export const tournamentSchema = z.object({
  name: z
    .string()
    .min(3, "Tournament name must be at least 3 characters")
    .max(150, "Tournament name must be less than 150 characters"),
  year: z
    .number()
    .int()
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year must be before 2100"),
  startDate: z.string().datetime("Invalid start date format"),
  endDate: z.string().datetime("Invalid end date format"),
  registrationDeadline: z
    .string()
    .datetime("Invalid registration deadline format")
    .optional()
    .nullable(),
  status: z.enum([
    TournamentStatus.DRAFT,
    TournamentStatus.REGISTRATION,
    TournamentStatus.UPCOMING,
    TournamentStatus.ONGOING,
    TournamentStatus.COMPLETED,
    TournamentStatus.CANCELLED,
  ]),
  description: z.string().max(500).optional().nullable(),
  sponsors: z.array(z.any()).max(20).optional(),
  info: z.array(z.any()).max(20).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  games: z.array(z.any()).max(20).optional(),
});

// Create Tournament Schema
export const createTournamentSchema = tournamentSchema.omit({
  status: true,
}).extend({
  status: z
    .enum([
      TournamentStatus.DRAFT,
      TournamentStatus.REGISTRATION,
      TournamentStatus.UPCOMING,
      TournamentStatus.ONGOING,
      TournamentStatus.COMPLETED,
      TournamentStatus.CANCELLED,
    ])
    .default(TournamentStatus.DRAFT)
    .optional(),
});

// Update Tournament Schema (all fields optional)
export const updateTournamentSchema = tournamentSchema.partial();

// Filter Schema
export const tournamentFilterSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum([
      TournamentStatus.DRAFT,
      TournamentStatus.REGISTRATION,
      TournamentStatus.UPCOMING,
      TournamentStatus.ONGOING,
      TournamentStatus.COMPLETED,
      TournamentStatus.CANCELLED,
    ])
    .optional(),
  year: z.number().int().optional(),
  sortBy: z
    .enum(["createdAt", "name", "year", "startDate"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// Helper function to validate dates
export function validateTournamentDates(data) {
  const errors = [];

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end <= start) {
      errors.push("End date must be after start date");
    }
  }

  if (data.registrationDeadline && data.startDate) {
    const regDeadline = new Date(data.registrationDeadline);
    const start = new Date(data.startDate);

    if (regDeadline >= start) {
      errors.push("Registration deadline must be before start date");
    }
  }

  return errors;
}

// Status badge configuration
export const statusConfig = {
  [TournamentStatus.DRAFT]: {
    label: "Draft",
    variant: "secondary",
    color: "gray",
  },
  [TournamentStatus.REGISTRATION]: {
    label: "Registration Open",
    variant: "default",
    color: "blue",
  },
  [TournamentStatus.UPCOMING]: {
    label: "Upcoming",
    variant: "default",
    color: "purple",
  },
  [TournamentStatus.ONGOING]: {
    label: "Live",
    variant: "default",
    color: "green",
  },
  [TournamentStatus.COMPLETED]: {
    label: "Completed",
    variant: "secondary",
    color: "gray",
  },
  [TournamentStatus.CANCELLED]: {
    label: "Cancelled",
    variant: "destructive",
    color: "red",
  },
};