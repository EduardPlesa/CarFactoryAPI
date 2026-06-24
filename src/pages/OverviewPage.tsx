import { useMemo } from "react"
import { Link } from "react-router-dom"
import {
  Boxes,
  Warehouse,
  ClipboardList,
  TriangleAlert,
  ArrowUpRight,
  PackageCheck,
} from "lucide-react"
import { Card, CardHeader, Badge, Spinner, EmptyState } from "@/components/ui"
import { useAsync } from "@/lib/useAsync"
import {
  getFrames,
  getStockSnapshot,
  listFrameTypes,
  listMaterials,
} from "@/lib/api"

const LOW_STOCK_THRESHOLD = 50

function StatCard({
  label,
  value,
  icon,
  to,
  accent,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  to: string
  accent?: boolean
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between">
        <div
          className={
            "flex size-9 items-center justify-center rounded-md " +
            (accent
              ? "bg-primary/15 text-primary"
              : "bg-secondary text-muted-foreground")
          }
        >
          {icon}
        </div>
        <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </Link>
  )
}

export function OverviewPage() {
  const frames = useAsync(getFrames, [])
  const materials = useAsync(listMaterials, [])
  const frameTypes = useAsync(listFrameTypes, [])
  const stockSnapshot = useAsync(getStockSnapshot, [])

  const stock = stockSnapshot.data ?? {}

  const lowStock = useMemo(() => {
    if (!materials.data) return []
    return materials.data
      .map((m) => ({ ...m, quantity: stock[m.id] ?? 0 }))
      .filter((m) => m.quantity <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.quantity - b.quantity)
  }, [materials.data, stock])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Production Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live snapshot of frames, material inventory, and assembly blueprints.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Frames assembled"
          value={frames.data?.length ?? "—"}
          icon={<Boxes className="size-5" />}
          to="/frames"
          accent
        />
        <StatCard
          label="Tracked materials"
          value={materials.data?.length ?? "—"}
          icon={<Warehouse className="size-5" />}
          to="/inventory"
        />
        <StatCard
          label="Active blueprints"
          value={frameTypes.data?.length ?? "â€”"}
          icon={<ClipboardList className="size-5" />}
          to="/blueprints"
        />
        <StatCard
          label="Low-stock alerts"
          value={lowStock.length}
          icon={<TriangleAlert className="size-5" />}
          to="/inventory"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low stock */}
        <Card>
          <CardHeader
            title="Low-stock materials"
            description={`At or below ${LOW_STOCK_THRESHOLD} units`}
            icon={<TriangleAlert className="size-4" />}
          />
          {materials.loading || stockSnapshot.loading ? (
            <div className="flex justify-center py-10">
              <Spinner className="text-muted-foreground" />
            </div>
          ) : lowStock.length === 0 ? (
            <EmptyState
              icon={<PackageCheck className="size-6" />}
              title="All materials healthy"
              description="No materials are running low right now."
            />
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {m.id.slice(0, 8)}
                    </p>
                  </div>
                  <Badge tone={m.quantity === 0 ? "danger" : "warning"}>
                    {m.quantity} {m.unit}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent frames */}
        <Card>
          <CardHeader
            title="Recent frames"
            description="Latest units to roll off the line"
            icon={<Boxes className="size-4" />}
            action={
              <Link
                to="/frames"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            }
          />
          {frames.loading ? (
            <div className="flex justify-center py-10">
              <Spinner className="text-muted-foreground" />
            </div>
          ) : !frames.data || frames.data.length === 0 ? (
            <EmptyState
              icon={<Boxes className="size-6" />}
              title="No frames yet"
              description="Assemble your first frame from the Frames page."
            />
          ) : (
            <ul className="divide-y divide-border">
              {frames.data.slice(0, 5).map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{f.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {f.slug}
                    </p>
                  </div>
                  <Badge tone="accent">{f.carType}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
