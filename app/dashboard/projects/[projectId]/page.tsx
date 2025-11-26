"use client"

import { use } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconCalendar, IconMapPin, IconUser } from "@tabler/icons-react"
import Link from "next/link"

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)
  const project = useQuery(api.projects.get, { id: projectId as Id<"projects"> })
  const visits = useQuery(api.visits.list, { projectId: projectId as Id<"projects"> })
  const client = useQuery(
    api.clients.get,
    project?.clientId ? { id: project.clientId } : "skip"
  )

  if (project === undefined) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (project === null) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="text-muted-foreground">Project not found</div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <IconMapPin className="size-4" />
            <span className="text-sm">{project.address}</span>
          </div>
          {client && (
            <Link
              href={`/dashboard/clients/${client._id}`}
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <IconUser className="size-4" />
              <span className="text-sm">{client.name}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-medium mb-4">Site Visits</h2>

        {visits === undefined ? (
          <div className="text-muted-foreground">Loading visits...</div>
        ) : visits.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <IconCalendar className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No visits yet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Site visits will appear here once recorded.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visits.map((visit) => (
              <Card key={visit._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {new Date(visit.date).toLocaleDateString()}
                    </CardTitle>
                    <Badge variant="outline">{visit.exteriorType}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {visit.notes || "No notes"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
