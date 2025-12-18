/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  "/",
  "/about-us",
  "/gallery",
  "/contact-us",
  // Add verification pages to public routes
  "/api/verify-email",
  "/auth/verify-success",
  "/auth/verify-error",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to dashboard
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/api/auth/verify-email",
  "/api/auth/resend-email-verification",
  "/auth/verify-email/error",
  "/auth/verify-email/success",
  "/auth/forgot-password",
  "/api/auth/forgot-password",
  "/auth/reset-password",
  "/api/auth/reset-password",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/**
 * Admin-only routes (enforced in middleware)
 * @type {string[]}
 */
export const adminRoutes = ["/dashboard"];
