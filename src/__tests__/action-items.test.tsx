import * as React from "react"

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ActionItemsWidget } from "@/src/components/common/ActionItemsWidget"

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    if (namespace === "ActionItems" && key === "title") return "Ações Necessárias"
    return key
  },
}))

const mockItems = [
  {
    id: "act1",
    title: "Provide brand guidelines",
    description: "Upload the PDF to the assets engine",
    dueDate: new Date().toISOString(),
    status: "PENDING",
    createdAt: new Date().toISOString(),
    projectId: "p1"
  }
]

describe("ActionItemsWidget", () => {
  it("renders empty state if no items without breaking", () => {
    const { container } = render(<ActionItemsWidget items={[]} />)
    // Se o array estiver vazio, o widget retorna um div vazio ou null (no caso retorna <div /> no código)
    expect(container.firstChild).toBeEmptyDOMElement()
  })

  it("renders pending action items", () => {
    render(<ActionItemsWidget items={mockItems as any} />)
    
    expect(screen.getByText("Provide brand guidelines")).toBeInTheDocument()
    expect(screen.getByText("Upload the PDF to the assets engine")).toBeInTheDocument()
    expect(screen.getByText("Ações Necessárias")).toBeInTheDocument()
  })
})
