import * as React from "react"

import { ScheduledReminder } from "@/src/generated/client/client"

import { AdminRemindersCard } from "@/src/components/admin/AdminRemindersCard"

import { getAdminDashboardReminders } from "@/src/lib/admin-data"

interface DashboardRemindersWidgetProps {
  userId: string
}

export async function DashboardRemindersWidget({
  userId,
}: DashboardRemindersWidgetProps) {
  const reminders = await getAdminDashboardReminders(userId)
  return (
    <AdminRemindersCard items={reminders as unknown as ScheduledReminder[]} />
  )
}
