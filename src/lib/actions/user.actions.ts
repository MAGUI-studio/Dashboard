"use server"

import { revalidatePath } from "next/cache"

import { auth, clerkClient } from "@clerk/nextjs/server"
import { z } from "zod"

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(8),
})

export async function createClientAction(formData: FormData) {
  const { sessionClaims } = await auth()

  if (sessionClaims?.metadata?.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const validatedFields = createUserSchema.safeParse({
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, firstName, lastName, password } = validatedFields.data

  try {
    const client = await clerkClient()
    await client.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      password,
      skipPasswordChecks: false,
      skipPasswordRequirement: false,
    })

    revalidatePath("/admin/clients")
    return { success: true }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create user"
    return {
      error: errorMessage,
    }
  }
}
