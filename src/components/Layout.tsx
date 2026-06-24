import { useState, type ReactNode } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Boxes,
  Warehouse,
  ClipboardList,
  Cog,
  Menu,
  X,
} from "lucide-react"
import { Sidebar } from "./Sidebar"
import { cn } from "@/lib/cn"

const mobileNav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/frames", label: "Frames", icon: Boxes },
  { to: "/inventory", label: "Inventory", icon: Warehouse },
  { to: "/blueprints", label: "Blueprints", icon: ClipboardList },
]

const titles: Record<string, string> = {
  "/": "Overview",
  "/frames": "Frames",
  "/inventory": "Inventory",
  "/blueprints": "Blueprints",
}

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const title = titles[pathname] ?? "Factory Control"

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="text-muted-foreground transition-colors hover:text-foreground lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
                <Cog className="size-3.5" />
              </div>
              <span className="text-sm font-semibold">Axle</span>
            </div>
            <h1 className="hidden text-sm font-semibold tracking-tight lg:block">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" />
              Line active
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-64 border-r border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Cog className="size-4" />
                </div>
                <span className="text-sm font-semibold">Axle</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close navigation"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {mobileNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
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
          </div>
        </div>
      )}
    </div>
  )
}
