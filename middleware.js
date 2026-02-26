// ===== middleware.js =====
import NextAuth from "next-auth";
import { RateLimiterMemory } from "rate-limiter-flexible";

import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

// Rate limiters
const rateLimiters = {
  general: new RateLimiterMemory({
    points: 60,
    duration: 10,
  }),
  auth: new RateLimiterMemory({
    points: 60,
    duration: 60,
  }),
  api: new RateLimiterMemory({
    points: 100,
    duration: 60,
  }),
};

// Helper function to get client IP
function getClientIp(req) {
  return (
    req.ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role || null;
  const ip = getClientIp(req);
  const pathname = nextUrl.pathname;

  // Debug logging (remove after fixing)
  // console.log("🔍 Middleware Debug:", {
  //   pathname,
  //   isLoggedIn,
  //   authRoutes,
  //   isInAuthRoutes: authRoutes.includes(pathname),
  // });

  // Simple, direct checks (no complex matching)
  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // === Rate Limiting ===
  try {
    if (isAuthRoute && !isApiAuthRoute) {
      await rateLimiters.auth.consume(ip);
    } else if (isApiAuthRoute) {
      await rateLimiters.api.consume(ip);
    } else if (isLoggedIn && isDashboardRoute) {
      await rateLimiters.general.consume(ip);
    }
  } catch (rateLimiterRes) {
    console.warn(
      `Rate limit exceeded for IP: ${ip}, Path: ${pathname}`
    );
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": Math.ceil(
            rateLimiterRes.msBeforeNext / 1000
          ).toString(),
        },
      }
    );
  }

  // === 1. Allow API routes ===
  if (isApiAuthRoute) {
    // console.log("✅ Allowing API route:", pathname);
    return null;
  }

  // === 2. Allow public routes ===
  if (isPublicRoute) {
    // console.log("✅ Allowing public route:", pathname);
    return null;
  }

  // === 3. Handle auth routes (login, register, etc.) ===
  if (isAuthRoute) {
    // console.log("🔐 Auth route detected:", pathname, "isLoggedIn:", isLoggedIn);
    
    if (isLoggedIn) {
      // console.log("↪️ User logged in, redirecting to dashboard");
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    
    // console.log("✅ Allowing auth route access (user not logged in)");
    return null; // Allow access to login, register, etc.
  }

  // === 4. Protect dashboard routes ===
  if (isDashboardRoute) {
    if (!isLoggedIn) {
      // console.log("🚫 Dashboard access denied, redirecting to login");
      const callbackUrl = encodeURIComponent(pathname + (nextUrl.search || ""));
      return Response.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl)
      );
    }

    const allowedRoles = ["ADMIN", "SUPER_ADMIN"];
    if (!allowedRoles.includes(userRole?.toUpperCase())) {
      console.warn(
        `Unauthorized dashboard access: ${req.auth?.user?.email}, Role: ${userRole}`
      );
      return Response.redirect(new URL("/unauthorized", nextUrl));
    }

    return null;
  }

  // === 5. Protect all other routes ===
  if (!isLoggedIn) {
    // console.log("🚫 Protected route, redirecting to login:", pathname);
    const callbackUrl = encodeURIComponent(pathname + (nextUrl.search || ""));
    return Response.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // console.log("✅ Allowing authenticated access:", pathname);
  return null;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
