"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconUsers } from "@tabler/icons-react"
import Link from "next/link"

export default function ClientsPage() {
  const clients = useQuery(api.clients.list)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
      </div>

      {clients === undefined ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : clients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconUsers className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No clients yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Clients will appear here once added.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link key={client._id} href={`/dashboard/clients/${client._id}`}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
