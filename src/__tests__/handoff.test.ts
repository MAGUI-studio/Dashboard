import { describe, expect, it, vi } from "vitest"

import { processProjectHandoffAction } from "@/src/lib/actions/handoff.actions"
import prisma from "@/src/lib/prisma"

// Mock Prisma
vi.mock("@/src/lib/prisma", () => ({
  default: {
    proposal: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

describe("Project Handoff Logic", () => {
  it("should fail if proposal is not found", async () => {
    vi.mocked(prisma.proposal.findUnique).mockResolvedValue(null)

    const result = await processProjectHandoffAction("non-existent-id")
    expect(result.success).toBe(false)
    expect(result.error).toBe("Proposal not found")
  })
})
