import { describe, expect, it } from "vitest"

import { briefingSchema } from "@/src/lib/validations/briefing"

describe("Briefing Schema Expansion", () => {
  it("should validate a complete expanded briefing", () => {
    const fullData = {
      brandTone: "Sophisticated and strategic, focus on high performance.",
      businessGoals:
        "Increase conversion by 20% and establish premium positioning.",
      primaryCta: "Schedule a Demo",
      targetAudience: "Tech founders and enterprise managers aged 30-50.",
      differentiators:
        "Direct access to senior engineers and strategic design depth.",
      palette: {
        primary: "#101010",
        secondary: "#FFFFFF",
      },
      typography: {
        primary: "Inter",
        secondary: "Montserrat",
      },
      governance: {
        primaryApprover: "Guilherme Bustamante",
      },
    }
    const result = briefingSchema.safeParse(fullData)
    expect(result.success).toBe(true)
  })

  it("should fail if brandTone is too short", () => {
    const data = { brandTone: "Short" }
    const result = briefingSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
