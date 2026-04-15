export {}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "admin" | "member"
    }
  }

  interface UserPublicMetadata {
    role?: "admin" | "member"
  }
}
