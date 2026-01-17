import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merger
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format date to readable string
export function formatDate(date, options = {}) {
  if (!date) return "";

  const d = new Date(date);
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return d.toLocaleDateString("en-US", defaultOptions);
}

// Format datetime to readable string
export function formatDateTime(date) {
  if (!date) return "";

  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Get relative time (e.g., "2 days ago")
export function getRelativeTime(date) {
  if (!date) return "";

  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) {
    return formatDate(date);
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}

// Calculate tournament progress percentage
export function calculateProgress(tournament) {
  if (!tournament) return 0;

  const now = new Date();
  const start = new Date(tournament.startDate);
  const end = new Date(tournament.endDate);

  if (now < start) return 0;
  if (now > end) return 100;

  const totalDuration = end - start;
  const elapsed = now - start;
  const progress = (elapsed / totalDuration) * 100;

  return Math.min(100, Math.max(0, Math.round(progress)));
}

// Get tournament status color
export function getStatusColor(status) {
  const colors = {
    DRAFT: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
    REGISTRATION:
      "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900",
    UPCOMING:
      "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900",
    ONGOING:
      "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900",
    COMPLETED: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
    CANCELLED: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900",
  };

  return colors[status] || colors.DRAFT;
}

// Check if tournament is active
export function isTournamentActive(tournament) {
  if (!tournament) return false;

  const now = new Date();
  const start = new Date(tournament.startDate);
  const end = new Date(tournament.endDate);

  return now >= start && now <= end && tournament.status === "ONGOING";
}

// Check if tournament can be edited
export function canEditTournament(tournament) {
  if (!tournament) return false;

  const editableStatuses = ["DRAFT", "REGISTRATION", "UPCOMING"];
  return editableStatuses.includes(tournament.status);
}

// Check if tournament can be deleted
export function canDeleteTournament(tournament) {
  if (!tournament) return false;

  return (
    tournament._count?.participation === 0 &&
    tournament._count?.matches === 0 &&
    tournament._count?.placements === 0
  );
}

// Generate tournament slug
export function generateTournamentSlug(tournament) {
  if (!tournament) return "";

  const name = tournament.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${name}-${tournament.year}`;
}

// Truncate text
export function truncate(text, length = 100) {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Format number with commas
export function formatNumber(num) {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get tournament duration in days
export function getTournamentDuration(tournament) {
  if (!tournament) return 0;

  const start = new Date(tournament.startDate);
  const end = new Date(tournament.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
