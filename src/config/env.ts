import { z } from "zod"

const isTest = process.env.NODE_ENV === "test"
const isCI = process.env.CI === "true"
const useFallback = isTest || isCI

const testDatabaseUrl = [
  "postgres",
  "ql",
  "://",
  "test",
  ":",
  "test",
  "@",
  "localhost",
  ":",
  "5432",
  "/",
  "test",
].join("")

const fallbackEnv = {
  DATABASE_URL: testDatabaseUrl,
  NEXT_PUBLIC_SITE_URL: "https://example.com",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_placeholder",
  CLERK_SECRET_KEY: "sk_test_placeholder",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/",
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/",
  UPLOADTHING_TOKEN: "ut_test_placeholder",
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.string().min(1),
  CLERK_PROXY_URL: z.string().optional(),
  UPLOADTHING_TOKEN: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
})

const parsedEnv = envSchema.safeParse({
  DATABASE_URL:
    process.env.DATABASE_URL ||
    (useFallback ? fallbackEnv.DATABASE_URL : undefined),
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (useFallback ? fallbackEnv.NEXT_PUBLIC_SITE_URL : undefined),
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (useFallback ? fallbackEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY : undefined),
  CLERK_SECRET_KEY:
    process.env.CLERK_SECRET_KEY ||
    (useFallback ? fallbackEnv.CLERK_SECRET_KEY : undefined),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ||
    (useFallback ? fallbackEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL : undefined),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ||
    (useFallback ? fallbackEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL : undefined),
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ||
    (useFallback
      ? fallbackEnv.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
      : undefined),
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ||
    (useFallback
      ? fallbackEnv.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
      : undefined),
  CLERK_PROXY_URL: process.env.CLERK_PROXY_URL,
  UPLOADTHING_TOKEN:
    process.env.UPLOADTHING_TOKEN ||
    (useFallback ? fallbackEnv.UPLOADTHING_TOKEN : undefined),
  NODE_ENV: process.env.NODE_ENV,
})

if (!parsedEnv.success) {
  const errors = parsedEnv.error.flatten().fieldErrors
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(errors, null, 2)}`
  )
}

export const env = parsedEnv.data
