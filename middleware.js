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

const rateLimiter = new RateLimiterMemory({
  points: 40, // 40 requests
  duration: 60, // per 60 seconds
});

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  // const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const userRole = req.auth?.role || null;
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes(":id")) {
      const regex = new RegExp("^" + route.replace(":id", "[^/]+") + "$");
      return regex.test(nextUrl.pathname);
    }
    return route === nextUrl.pathname;
  });

  const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "localhost";
  if (
    isLoggedIn &&
    (isApiAuthRoute || isAuthRoute || isPublicRoute || isDashboardRoute)
  ) {
    try {
      await rateLimiter.consume(ip);
    } catch (rateLimiterRes) {
      return new Response("Too Many Requests", { status: 429 });
    }
  }

  if (isApiAuthRoute || isPublicRoute) {
    return null;
  }

  // Block access to /dashboard if not admin or superadmin
  if (isDashboardRoute) {
    if (!isLoggedIn || !["admin", "superadmin"].includes(userRole)) {
      return Response.redirect(new URL("/", nextUrl));
    }
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  return null;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
