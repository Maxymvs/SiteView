"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { IconUsers, IconBuilding, IconCalendar } from "@tabler/icons-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  const clients = useQuery(api.clients.list)
  const projects = useQuery(api.projects.list, {})
  const visits = useQuery(api.visits.listByDate, { order: "desc" })

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconUsers className="size-5 text-muted-foreground" />
            <CardDescription>Total Clients</CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {clients === undefined ? "..." : clients.length}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconBuilding className="size-5 text-muted-foreground" />
            <CardDescription>Active Projects</CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {projects === undefined ? "..." : projects.length}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconCalendar className="size-5 text-muted-foreground" />
            <CardDescription>Total Visits</CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {visits === undefined ? "..." : visits.length}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
