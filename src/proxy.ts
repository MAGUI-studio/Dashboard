import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

import { defaultLocale, locales } from "./i18n/config"

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "never",
})

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/(pt|en)",
  "/(pt|en)/sign-in(.*)",
  "/(pt|en)/sign-up(.*)",
])

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/(pt|en)/admin(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const { sessionClaims } = await auth.protect()

    // If it's an admin route, check for admin role
    if (isAdminRoute(req) && sessionClaims?.metadata?.role !== "admin") {
      const url = new URL("/", req.url)
      return NextResponse.redirect(url)
    }
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.png|favicon-16x16.png|favicon-32x32.png|site.webmanifest|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
