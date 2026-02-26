const { headers } = require("next/headers");

export const getRateLimitKey = (options = {}) => {
  const headersList = headers();

  const ip =
    headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    "unknown";

  const parts = [
    options.prefix || "api",
    options.email,
    ip,
  ].filter(Boolean);

  return parts.join(":");
};
