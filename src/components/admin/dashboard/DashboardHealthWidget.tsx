import * as React from "react"

import { AdminProjectHealthList } from "@/src/components/admin/AdminProjectHealthList"

import { getAdminDashboardHealth } from "@/src/lib/admin-data"

export async function DashboardHealthWidget() {
  const { projectHealth } = await getAdminDashboardHealth()
  return <AdminProjectHealthList items={projectHealth} />
}
