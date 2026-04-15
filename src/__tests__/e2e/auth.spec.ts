import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { expect, test } from "@playwright/test"

test.describe("Authentication Flow", () => {
  test("should show sign-in and sign-up buttons on home page when signed out", async ({
    page,
  }) => {
    await page.goto("/")

    const signInButton = page.getByRole("link", { name: /sign in/i })
    const signUpButton = page.getByRole("link", { name: /sign up/i })

    await expect(signInButton).toBeVisible()
    await expect(signUpButton).toBeVisible()
  })

  test("should navigate to sign-in page correctly", async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto("/")

    await page.getByRole("link", { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/sign-in/)

    const clerkComponent = page.locator(".cl-rootBox")
    await expect(clerkComponent).toBeVisible()
  })

  test("should navigate to sign-up page correctly", async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto("/")

    await page.getByRole("link", { name: /sign up/i }).click()

    await expect(page).toHaveURL(/\/sign-up/)

    const clerkComponent = page.locator(".cl-rootBox")
    await expect(clerkComponent).toBeVisible()
  })

  test("should protect admin route and redirect to sign-in", async ({
    page,
  }) => {
    await page.goto("/admin")

    await expect(page).toHaveURL(/\/sign-in/)
  })
})
