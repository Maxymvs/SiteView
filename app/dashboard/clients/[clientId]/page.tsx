"use client"

import { use } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconBuilding, IconMail } from "@tabler/icons-react"
import Link from "next/link"

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = use(params)
  const client = useQuery(api.clients.get, { id: clientId as Id<"clients"> })
  const projects = useQuery(api.projects.list, { clientId: clientId as Id<"clients"> })

  if (client === undefined) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (client === null) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="text-muted-foreground">Client not found</div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{client.name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconMail className="size-4" />
          <span className="text-sm">{client.email}</span>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-medium mb-4">Projects</h2>

        {projects === undefined ? (
          <div className="text-muted-foreground">Loading projects...</div>
        ) : projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <IconBuilding className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No projects yet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                This client has no projects.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project._id} href={`/dashboard/projects/${project._id}`}>
                <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{project.address}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
