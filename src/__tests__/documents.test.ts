import { describe, expect, it } from "vitest"

import { CreateDocumentSchema } from "@/src/lib/validations/document"

describe("Document Module Logic", () => {
  it("should validate a correct document creation input", () => {
    const data = {
      type: "CONTRACT",
      title: "Contrato de Design v1",
      clientId: "client-123",
      clauses: [{ title: "Objeto", content: "Design de Interface", order: 0 }],
      signers: [
        {
          name: "Guilherme",
          email: "guilherme@magui.studio",
          role: "CONTRACTOR",
        },
      ],
    }
    const result = CreateDocumentSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it("should fail if title is missing", () => {
    const data = {
      type: "CONTRACT",
      clientId: "client-123",
    }
    const result = CreateDocumentSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
