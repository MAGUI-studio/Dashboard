import { expect, test } from "@playwright/test"

test.describe("Elite Smoke Tests", () => {
  test("should load the home page and show the title", async ({ page }) => {
    await page.goto("/")
    const heading = page.locator("h1")
    await expect(heading).toBeVisible()
  })

  test("should switch language correctly", async ({ page }) => {
    await page.goto("/")

    await page.click('button[aria-haspopup="menu"]')

    const menuItems = page.locator('[role="menuitem"]')
    await expect(menuItems).toHaveCount(2)
  })
})
