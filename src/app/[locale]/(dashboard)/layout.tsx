import { Header } from "@/src/components/common/Header"
import BackgroundImages from "@/src/components/common/backgroundImages"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  return (
    <div className="flex min-h-svh flex-col selection:bg-brand-primary/20 selection:text-brand-primary">
      <BackgroundImages />
      <Header />
      <main className="flex flex-1 flex-col overflow-x-hidden">{children}</main>
    </div>
  )
}
