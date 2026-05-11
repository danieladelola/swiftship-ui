import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login | Vura Logistics" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const { signIn, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@vura.ng");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin" });
  }, [loading, user, isAdmin, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) toast.error(error);
    else {
      toast.success("Welcome back");
      navigate({ to: "/admin" });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elevated">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 font-display text-xl font-bold text-navy">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent text-primary">
            <Truck className="h-5 w-5" />
          </span>
          Vura Admin
        </Link>
        <h1 className="font-display text-2xl font-bold text-navy">Sign in to your dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use your admin credentials to access the control panel.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-navy">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-orange focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-navy">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-orange focus:outline-none"
            />
          </div>
          <button
            type="submit" disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full gradient-accent px-6 py-3 text-sm font-semibold text-primary disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Default admin: admin@vura.ng / 12345678
        </p>
      </div>
    </div>
  );
}
