export const RATE_LIMIT_PRESETS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 attempts
    lockoutMs: 15 * 60 * 1000, // 15 minutes lockout
  },

  PUBLIC_API: {
    windowMs: 60 * 1000,
    maxRequests: 60,
  },

  AUTHENTICATED_API: {
    windowMs: 60 * 1000,
    maxRequests: 120,
  },

  ADMIN_API: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },
};
