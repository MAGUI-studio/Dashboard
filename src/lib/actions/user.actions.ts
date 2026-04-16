"use server"

import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"

import { clerkClient } from "@clerk/nextjs/server"
import { z } from "zod"

import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  username: z.string().min(3),
  role: z.enum(["admin", "client"]),
  password: z.string().min(8),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  taxId: z.string().optional(),
})

export async function createClientAction(formData: FormData) {
  const t = await getTranslations("Admin.clients.form.errors")

  // Server-side role protection
  await protect("admin")

  const validatedFields = createUserSchema.safeParse({
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    username: formData.get("username"),
    role: formData.get("role"),
    password: formData.get("password"),
    companyName: formData.get("companyName"),
    phone: formData.get("phone"),
    position: formData.get("position"),
    taxId: formData.get("taxId"),
  })

  if (!validatedFields.success) {
    return {
      error: t("general"),
    }
  }

  const {
    email,
    firstName,
    lastName,
    username,
    role,
    password,
    companyName,
    phone,
    position,
    taxId,
  } = validatedFields.data

  try {
    const client = await clerkClient()

    const clerkUser = await client.users.createUser({
      emailAddress: [email],
      username,
      firstName,
      lastName,
      password,
      publicMetadata: { role },
    })

    // Sincronizar com Prisma
    await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name: `${firstName} ${lastName}`,
        role: role.toUpperCase(),
        companyName,
        phone,
        position,
        taxId,
      },
    })

    revalidatePath("/admin/clients")
    return { success: true }
  } catch (error) {
    console.error("Clerk Error:", error)

    const clerkError =
      error instanceof Object && "errors" in error
        ? (error as { errors: Array<{ code: string }> }).errors?.[0]
        : null
    const code = clerkError?.code

    if (code === "form_password_pwned") {
      return { error: t("password_pwned") }
    }
    if (code === "form_identifier_exists") {
      return { error: t("identifier_exists") }
    }
    if (code === "form_password_length_too_short") {
      return { error: t("password_too_short") }
    }
    if (
      code === "form_username_invalid" ||
      code === "form_param_value_invalid"
    ) {
      return { error: t("username_invalid") }
    }

    return {
      error: t("general"),
    }
  }
}
