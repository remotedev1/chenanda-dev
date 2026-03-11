/**
 * Public routes - no authentication required
 */
export const publicRoutes = [
  "/",
  "/about-us",
  "/about-tournament",
  "/policies",
  "/terms-and-conditions",
  "/gallery",
  "/contact-us",
  "/sw.js",
  "/payment",
  "/payment/success",
  "/api/tournaments/game-registrations",
  "/api/tournaments/sponsors",
  "/payment/error ",
  "/api/tournaments/payment/phonepe/callback",
];

/**
 * Auth routes - accessible when NOT logged in
 * Logged-in users redirected to dashboard
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email/success",
  "/auth/verify-email/error",
  "/api/auth/verify-email",
  "/auth/verify-success",
  "/auth/verify-error",
  "/api/send-otp",
];

/**
 * API prefix
 */
export const apiAuthPrefix = "/api";

/**
 * Default redirect after login
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
