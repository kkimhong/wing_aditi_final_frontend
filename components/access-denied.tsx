import { ShieldAlert } from "lucide-react"

interface AccessDeniedProps {
  title?: string
  description?: string
}

export function AccessDenied({
  title = "Access denied",
  description = "You do not have permission to view this page.",
}: AccessDeniedProps) {
  return (
    <section className="rounded-none border border-amber-200/70 bg-amber-50/70 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-none border border-amber-300/60 bg-white/80 p-2 dark:border-amber-800/70 dark:bg-amber-950/40">
          <ShieldAlert className="h-4 w-4 text-amber-700 dark:text-amber-300" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </section>
  )
}
