import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconSettings } from "@tabler/icons-react"

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <IconSettings className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Settings coming soon</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Account and application settings will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
