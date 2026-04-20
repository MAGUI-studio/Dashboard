import * as React from "react"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"

import { Header } from "@/src/components/common/Header"
import { DashboardSummary } from "@/src/components/common/DashboardSummary"
import { approveUpdateAction } from "@/src/lib/actions/project.actions"

// Mocks robustos para Vitest
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (!key) return ""
    const parts = key.split(".")
    return parts[parts.length - 1]
  },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
  usePathname: () => "/",
}))

vi.mock("@/src/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  usePathname: () => "/",
}))

vi.mock("@/src/lib/actions/project.actions", () => ({
  approveUpdateAction: vi.fn(() => Promise.resolve({ success: true })),
  rejectUpdateAction: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockPendingApprovals = [
  {
    count: 1,
    projectId: "p1",
    projectName: "Alpha Project",
    lastUpdateId: "u1",
    lastUpdateTitle: "Delivery One",
    lastUpdateDescription: "Desc 1",
  },
  {
    count: 1,
    projectId: "p2",
    projectName: "Beta Project",
    lastUpdateId: "u2",
    lastUpdateTitle: "Delivery Two",
    lastUpdateDescription: "Desc 2",
  }
]

describe("Dashboard Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Header Banner", () => {
    it("renders first pending item and navigates", () => {
      render(<Header pendingApprovals={mockPendingApprovals} />)
      
      expect(screen.getByText("Alpha Project")).toBeInTheDocument()
      expect(screen.getByText("Delivery One")).toBeInTheDocument()

      const buttons = screen.getAllByRole("button")
      // No header, temos botões de menu e as setas. 
      // Em Vitest sem CSS complexo, pegamos pela ordem ou ícone se possível.
      fireEvent.click(buttons[1]) // Botão Next (seta direita)
      
      expect(screen.getByText("Beta Project")).toBeInTheDocument()
    })

    it("opens drawer and handles approval", async () => {
      render(<Header pendingApprovals={mockPendingApprovals} />)
      
      fireEvent.click(screen.getByText("cta"))
      
      // O botão tem o texto 'approve'. Como há um h4 com o mesmo texto, usamos role.
      const approveBtn = screen.getByRole("button", { name: /approve/i })
      fireEvent.click(approveBtn)
      
      await waitFor(() => {
        expect(approveUpdateAction).toHaveBeenCalledWith("u1", "p1")
      })
    })
  })

  describe("Feed Expansion", () => {
    const mockProject = {
      id: "p1",
      name: "Test",
      status: "IN_PROGRESS",
      progress: 50,
      updates: Array.from({ length: 8 }, (_, i) => ({
        id: `u${i}`,
        title: `Update ${i}`,
        createdAt: new Date().toISOString(),
        approvalStatus: "APPROVED",
        attachments: []
      })),
      assets: []
    }

    it("shows 5 items initially and expands on click", () => {
      render(<DashboardSummary project={mockProject as any} />)
      
      expect(screen.getByText("Update 4")).toBeInTheDocument()
      expect(screen.queryByText("Update 5")).not.toBeInTheDocument()

      fireEvent.click(screen.getByText(/see_more/))
      expect(screen.getByText("Update 7")).toBeInTheDocument()

      fireEvent.click(screen.getByText(/see_less/))
      expect(screen.queryByText("Update 5")).not.toBeInTheDocument()
    })
  })
})
