const store = new Map();

export function checkRateLimit(key, options) {
  const now = Date.now();

  const entry = store.get(key) || {
    count: 0,
    resetAt: now + options.windowMs,
    lockedUntil: null,
  };

  // 🔒 Locked
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.lockedUntil - now) / 1000),
      message: "Too many requests. Please try again later.",
    };
  }

  // ⏱ Reset window
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + options.windowMs;
    entry.lockedUntil = null;
  }

  // 🚫 Limit exceeded
  if (entry.count >= options.maxRequests) {
    if (options.lockoutMs) {
      entry.lockedUntil = now + options.lockoutMs;
    }

    store.set(key, entry);

    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      message: "Rate limit exceeded. Please slow down.",
    };
  }

  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
  };
}

export function incrementRateLimit(key) {
  const now = Date.now();

  const entry = store.get(key) || {
    count: 0,
    resetAt: now,
    lockedUntil: null,
  };

  entry.count += 1;
  store.set(key, entry);
}

export function clearRateLimit(key) {
  store.delete(key);
}

// 🧹 Optional cleanup (cron / interval / manual call)
export function cleanupRateLimiter() {
  const now = Date.now();

  for (const [key, entry] of store.entries()) {
    if (
      now > entry.resetAt &&
      (!entry.lockedUntil || now > entry.lockedUntil)
    ) {
      store.delete(key);
    }
  }
}
