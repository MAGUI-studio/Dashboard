import * as React from "react"

import Link from "next/link"

import { Show, UserButton } from "@clerk/nextjs"

export default function Page(): React.JSX.Element {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8">
      <div className="flex items-center gap-4">
        <Show when="signed-in">
          <div className="flex flex-col items-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary sm:text-[11px]">
              Authentication Active
            </p>
            <UserButton showName />
          </div>
        </Show>
      </div>
      <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl lg:text-8xl">
        Home
      </h1>
    </main>
  )
}
