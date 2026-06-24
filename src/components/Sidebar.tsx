import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Boxes,
  Warehouse,
  ClipboardList,
  Cog,
} from "lucide-react"
import { cn } from "@/lib/cn"

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/frames", label: "Frames", icon: Boxes },
  { to: "/inventory", label: "Inventory", icon: Warehouse },
  { to: "/blueprints", label: "Blueprints", icon: ClipboardList },
]

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Cog className="size-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Axle</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Factory Control
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Production
        </p>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-lg border border-border bg-secondary/40 p-3">
          <p className="text-xs font-medium">CarFactory API</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Connected to the live .NET service configured by{" "}
            <span className="font-mono text-foreground">VITE_API_BASE_URL</span>.
          </p>
        </div>
      </div>
    </aside>
  )
}
