"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconBuilding, IconUser } from "@tabler/icons-react"
import Link from "next/link"

export default function ProjectsPage() {
  const projects = useQuery(api.projects.listWithClient)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
      </div>

      {projects === undefined ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconBuilding className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Projects will appear here once created.
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
                <CardContent className="space-y-1">
                  <p className="text-sm text-muted-foreground">{project.address}</p>
                  {project.client && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <IconUser className="size-3" />
                      <span>{project.client.name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
