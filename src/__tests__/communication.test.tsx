import * as React from "react"

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DecisionCard } from "@/src/components/common/communication/DecisionCard"
import { MessageBubble } from "@/src/components/common/communication/MessageBubble"
import { ThreadList } from "@/src/components/common/communication/ThreadList"

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "pt",
}))

describe("Communication Components", () => {
  describe("MessageBubble", () => {
    it("renders message content correctly", () => {
      render(
        <MessageBubble
          id="msg1"
          content="Hello World"
          type="INFORMATIVE"
          author={{ id: "u1", name: "John", role: "ADMIN", avatarUrl: null }}
          createdAt={new Date()}
        />
      )
      expect(screen.getByText("Hello World")).toBeInTheDocument()
      expect(screen.getByText("John")).toBeInTheDocument()
    })

    it("renders badges for non-informative messages", () => {
      render(
        <MessageBubble
          id="msg1"
          content="Need approval"
          type="REQUIRES_APPROVAL"
          author={{ id: "u1", name: "John", role: "ADMIN", avatarUrl: null }}
          createdAt={new Date()}
        />
      )
      expect(screen.getByText("requires_approval")).toBeInTheDocument()
    })
  })

  describe("ThreadList", () => {
    it("renders empty state correctly", () => {
      render(<ThreadList threads={[]} onThreadClick={() => {}} />)
      expect(
        screen.getByText("Nenhuma conversa encontrada.")
      ).toBeInTheDocument()
    })

    it("renders threads correctly", () => {
      const threads = [
        {
          id: "t1",
          title: "Initial Meeting",
          entityType: "Project",
          status: "OPEN" as const,
          updatedAt: new Date(),
          lastMessage: { content: "Hey", createdAt: new Date() },
        },
      ]
      render(<ThreadList threads={threads} onThreadClick={() => {}} />)
      expect(screen.getByText("Initial Meeting")).toBeInTheDocument()
      expect(screen.getByText("Hey")).toBeInTheDocument()
    })
  })

  describe("DecisionCard", () => {
    it("renders decision details correctly", () => {
      const decision = {
        id: "d1",
        title: "New Color Palette",
        description: "Old one was too dark",
        decision: "Use OKLCH vibrant green",
        impactScope: "None",
        impactDeadline: "None",
        impactFinancial: "None",
        decidedAt: new Date(),
        decidedBy: { name: "MAGUI" },
      }
      render(<DecisionCard decision={decision} />)
      expect(screen.getByText("New Color Palette")).toBeInTheDocument()
      expect(screen.getByText("Use OKLCH vibrant green")).toBeInTheDocument()
    })
  })
})
