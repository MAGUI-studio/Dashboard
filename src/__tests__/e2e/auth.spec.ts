import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { expect, test } from "@playwright/test"

test.describe("Authentication Flow", () => {
  test("should show sign-in screen and sign-up link when signed out", async ({
    page,
  }) => {
    await page.goto("/")

    await expect(page).toHaveURL(/\/sign-in/)
    await expect(
      page.getByRole("heading", { name: /sign in to magui\.studio/i })
    ).toBeVisible()
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible()
  })

  test("should load sign-in page correctly", async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto("/sign-in")

    await expect(page).toHaveURL(/\/sign-in/)

    const clerkComponent = page.locator(".cl-rootBox")
    await expect(clerkComponent).toBeVisible()
  })

  test("should load sign-up page correctly", async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto("/sign-up")

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
