import { auth } from "@clerk/nextjs/server"

export type Role = "admin" | "member" | "client"

/**
 * Checks if the current user has a specific role on the server.
 * This is secure and can be used in Server Components, Server Actions, or Route Handlers.
 */
export async function hasRole(role: Role | Role[]): Promise<boolean> {
  const { sessionClaims } = await auth()
  const userRole = sessionClaims?.metadata?.role as Role | undefined

  if (!userRole) return false

  if (Array.isArray(role)) {
    return role.includes(userRole)
  }

  return userRole === role
}

/**
 * Convenience function for admin checks.
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin")
}

/**
 * Throws an error if the user doesn't have the required role.
 * Useful for protecting Server Actions.
 */
export async function protect(role: Role | Role[] = "admin"): Promise<void> {
  const allowed = await hasRole(role)
  if (!allowed) {
    throw new Error("Unauthorized: Insufficient permissions")
  }
}
