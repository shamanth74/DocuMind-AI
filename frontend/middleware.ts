import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/workspace(.*)",
  "/about(.*)",
  "/support(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 1. Root page "/" redirection
  if (req.nextUrl.pathname === "/") {
    if (userId) {
      // Logged in -> /dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      // Logged out -> /signin
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  // 2. Protect authenticated routes (like /dashboard)
  if (isProtectedRoute(req)) {
    if (!userId) {
      // If trying to access a protected route without logging in, redirect to /signin
      const signInUrl = new URL("/signin", req.url);
      // Optional: pass the original URL as a redirect_url parameter if you want to redirect back after signin
      return NextResponse.redirect(signInUrl);
    }
  }

  // Allow the request to proceed for all other cases
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
