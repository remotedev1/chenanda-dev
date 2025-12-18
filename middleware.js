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

// Rate limiters for different route types
const rateLimiters = {
  // General rate limiter - 40 requests per minute
  general: new RateLimiterMemory({
    points: 60,
    duration: 10,
  }),

  // Stricter rate limiter for auth routes - 10 requests per minute
  auth: new RateLimiterMemory({
    points: 60,
    duration: 60,
  }),

  // API routes - 100 requests per minute
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

// Helper function to check if route matches pattern
function matchesRoute(pathname, routes) {
  return routes.some((route) => {
    if (route.includes(":id")) {
      // Handle dynamic routes like /tournament/:id
      const regex = new RegExp("^" + route.replace(/:[\w]+/g, "[^/]+") + "$");
      return regex.test(pathname);
    }
    // Exact match
    return route === pathname;
  });
}

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.role || null;
  const ip = getClientIp(req);

  // Determine route types
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = matchesRoute(nextUrl.pathname, authRoutes);
  const isPublicRoute = matchesRoute(nextUrl.pathname, publicRoutes);
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

  // === Rate Limiting ===
  try {
    // Apply stricter rate limiting to auth routes
    if (isAuthRoute && !isApiAuthRoute) {
      await rateLimiters.auth.consume(ip);
    }
    // Apply API rate limiting
    else if (isApiAuthRoute) {
      await rateLimiters.api.consume(ip);
    }
    // Apply general rate limiting to authenticated routes
    else if (isLoggedIn && isDashboardRoute) {
      await rateLimiters.general.consume(ip);
    }
  } catch (rateLimiterRes) {
    console.warn(
      `Rate limit exceeded for IP: ${ip}, Path: ${nextUrl.pathname}`
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

  // === Allow API auth routes (login, register, verify APIs) ===
  if (isApiAuthRoute) {
    return null;
  }

  // === Allow public routes ===
  if (isPublicRoute) {
    return null;
  }

  // === Handle auth routes (login, register, etc.) ===
  if (isAuthRoute) {
    // If already logged in, redirect to dashboard
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    // Allow access to auth pages
    return null;
  }

  // === Protect dashboard routes - Basic authentication check only ===
  // CASL handles fine-grained permissions within the app
  if (isDashboardRoute) {
    // Check if user is logged in
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(
        nextUrl.pathname + (nextUrl.search || "")
      );
      return Response.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl)
      );
    }

    // Basic role check - only allow authenticated users with admin-level roles
    // Fine-grained permissions are handled by CASL in your components/API routes
    const allowedRoles = ["ADMIN", "SUPER_ADMIN"];
    if (!allowedRoles.includes(userRole?.toUpperCase())) {
      console.warn(
        `Unauthorized dashboard access attempt: ${req.auth?.email}, Role: ${userRole}, IP: ${ip}`
      );
      return Response.redirect(new URL("/unauthorized", nextUrl));
    }

    // Allow access - CASL will handle specific permissions
    return null;
  }

  // === Protect all other routes (require authentication) ===
  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(
      nextUrl.pathname + (nextUrl.search || "")
    );
    return Response.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // === Allow authenticated users to access protected routes ===
  // CASL handles permissions at component/API level
  return null;
});

// Middleware matcher configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// ===== Example Usage in Components =====
/*
"use client";

import { Can, useAbility } from "@/hooks/useAbility";
import { Button } from "@/components/ui/button";

export function TournamentActions({ tournament }) {
  const ability = useAbility();

  return (
    <div className="flex gap-2">
      <Can I="update" a="Tournament">
        <Button onClick={() => handleEdit(tournament)}>Edit</Button>
      </Can>

      <Can I="delete" a="Tournament">
        <Button variant="destructive" onClick={() => handleDelete(tournament)}>
          Delete
        </Button>
      </Can>

      {ability.can("manage", "Tournament") && (
        <Button>Advanced Settings</Button>
      )}
    </div>
  );
}
*/

// ===== Example Usage in API Routes =====
/*
import { auth } from "@/auth";
import { defineAbilitiesFor } from "@/lib/casl/ability";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ability = defineAbilitiesFor(session.user);

  // Check permission
  if (!ability.can("delete", "Tournament")) {
    return NextResponse.json(
      { error: "Forbidden: You don't have permission to delete tournaments" },
      { status: 403 }
    );
  }

  // Proceed with deletion
  // ...
}
*/
