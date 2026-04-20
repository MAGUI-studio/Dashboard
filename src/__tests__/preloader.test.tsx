import * as React from "react"

import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Preloader } from "@/src/components/common/Preloader"

describe("Preloader", () => {
  it("renders with studio name from translations", () => {
    render(<Preloader />)

    // The mock translations return the key "name" or whatever was used
    // In our setup.tsx, it's mocked to return the key itself
    // split(".") on "name" gives ["name"]
    expect(screen.getByText("n")).toBeInTheDocument()
    expect(screen.getByText("a")).toBeInTheDocument()
    expect(screen.getByText("m")).toBeInTheDocument()
    expect(screen.getByText("e")).toBeInTheDocument()
  })

  it("calls onComplete after the timeout", async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()

    render(<Preloader onComplete={onComplete} />)

    // Initially not called
    expect(onComplete).not.toHaveBeenCalled()

    // Fast-forward 1100ms
    vi.advanceTimersByTime(1100)

    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
