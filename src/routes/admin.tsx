import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Package, PlusCircle, LogOut, Truck, Loader2, Menu,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard | Vura Logistics" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (loc.pathname === "/admin/login") return;
    if (!user || !isAdmin) navigate({ to: "/admin/login" });
  }, [user, isAdmin, loading, navigate, loc.pathname]);

  // Login page: render child only (no chrome)
  if (loc.pathname === "/admin/login") return <Outlet />;

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Loader2 className="h-6 w-6 animate-spin text-navy" />
      </div>
    );
  }

  const nav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/shipments", label: "Shipments", icon: Package },
    { to: "/admin/shipments/new", label: "Create Shipment", icon: PlusCircle },
  ];

  return (
    <div className="flex min-h-screen bg-secondary">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
        open && "translate-x-0"
      )}>
        <div className="flex h-16 items-center gap-2 border-b border-border px-6 font-display text-lg font-bold text-navy">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent text-primary">
            <Truck className="h-4 w-4" />
          </span>
          Vura Admin
        </div>
        <nav className="space-y-1 p-4">
          {nav.map((n) => (
            <Link
              key={n.to} to={n.to} onClick={() => setOpen(false)}
              activeProps={{ className: "flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 text-sm font-semibold text-navy" }}
              activeOptions={{ exact: n.exact }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-navy"
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <div className="mb-2 truncate text-xs text-muted-foreground">{user.email}</div>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/admin/login" }); }}
            className="flex w-full items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-navy hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
          <button onClick={() => setOpen((v) => !v)} className="rounded-lg bg-secondary p-2 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="font-display text-base font-semibold text-navy">Control Panel</div>
          <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-navy">View site →</Link>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
