"use client"

import { useUser } from "@clerk/nextjs"

export type Role = "admin" | "member" | "client"

export function usePermissions() {
  const { user, isLoaded } = useUser()
  const userRole = user?.publicMetadata?.role as Role | undefined

  const hasRole = (role: Role | Role[]): boolean => {
    if (!isLoaded || !userRole) return false

    if (Array.isArray(role)) {
      return role.includes(userRole)
    }

    return userRole === role
  }

  return {
    isLoaded,
    userRole,
    hasRole,
    isAdmin: hasRole("admin"),
    isMember: hasRole("member"),
    isClient: hasRole("client"),
  }
}
