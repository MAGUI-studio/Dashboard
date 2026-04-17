import { auth } from "@clerk/nextjs/server"

export type Role = "admin" | "member" | "client"

export async function hasRole(role: Role | Role[]): Promise<boolean> {
  const { sessionClaims } = await auth()
  const userRole = sessionClaims?.metadata?.role as Role | undefined

  if (!userRole) return false

  if (Array.isArray(role)) {
    return role.includes(userRole)
  }

  return userRole === role
}

export async function isAdmin(): Promise<boolean> {
  return hasRole("admin")
}

export async function protect(role: Role | Role[] = "admin"): Promise<void> {
  const allowed = await hasRole(role)
  if (!allowed) {
    throw new Error("Unauthorized: Insufficient permissions")
  }
}
