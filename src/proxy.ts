import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

import { defaultLocale, locales, pathnames } from "./i18n/config"

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "never",
  pathnames,
})

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/og(.*)",
])

const isAdminRoute = createRouteMatcher(["/admin(.*)"])

export default clerkMiddleware(async (auth, req) => {
  // 1. Exclude UploadThing from internationalization and auth redirection
  if (req.nextUrl.pathname.startsWith("/api/uploadthing")) {
    return NextResponse.next()
  }

  if (!isPublicRoute(req)) {
    const { sessionClaims } = await auth.protect()

    if (isAdminRoute(req) && sessionClaims?.metadata?.role !== "admin") {
      const url = new URL("/", req.url)
      return NextResponse.redirect(url)
    }
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.png|favicon-16x16.png|favicon-32x32.png|site.webmanifest|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
    "/(api|trpc)(.*)",
  ],
}
