"use client"

import * as React from "react"

import { Role, usePermissions } from "@/src/hooks/use-permissions"

interface CanProps {
  /**
   * Role(s) required to see the content.
   */
  role: Role | Role[]

  /**
   * The content to show if permissions are met.
   */
  children: React.ReactNode

  /**
   * Content to show while permissions are loading.
   */
  loadingFallback?: React.ReactNode

  /**
   * Content to show if the user doesn't have the required permissions.
   */
  fallback?: React.ReactNode
}

/**
 * Component to wrap content that requires specific permissions.
 */
export function Can({
  role,
  children,
  loadingFallback = null,
  fallback = null,
}: CanProps): React.JSX.Element | null {
  const { isLoaded, hasRole } = usePermissions()

  if (!isLoaded) {
    return <>{loadingFallback}</>
  }

  if (hasRole(role)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

/**
 * Specialized Admin-only wrapper.
 */
export function AdminOnly({
  children,
  loadingFallback,
  fallback,
}: Omit<CanProps, "role">): React.JSX.Element | null {
  return (
    <Can role="admin" loadingFallback={loadingFallback} fallback={fallback}>
      {children}
    </Can>
  )
}
