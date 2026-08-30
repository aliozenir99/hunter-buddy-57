import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/GlobalSearch";
import { QuickCapture } from "@/components/QuickCapture";
import { useFollowUps } from "@/lib/api";
import { dueState, initials } from "@/lib/crm";
import {
  Crosshair,
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  Activity,
  Inbox,
  Target,
  ListChecks,
  BarChart3,
  Sparkles,
  Settings,
  Search,
  LogOut,
  Plus,
} from "lucide-react";

const WORKSPACE = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clients", label: "Clients", icon: Building2 },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/activities", label: "Activities", icon: Activity },
  { to: "/requests", label: "Requests", icon: Inbox },
] as const;

const PIPELINE = [
  { to: "/opportunities", label: "Opportunities", icon: Target },
  { to: "/follow-ups", label: "Follow-ups", icon: ListChecks },
] as const;

const SYSTEM = [
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [name, setName] = useState("Hunter");
  const [searchOpen, setSearchOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const { data: followUps = [] } = useFollowUps();

  const actionable = followUps.filter((f) => {
    const s = dueState(f.due_date, f.status);
    return s === "overdue" || s === "today";
  }).length;

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", data.user.id)
        .maybeSingle();
      setName(profile?.display_name || data.user.email?.split("@")[0] || "Hunter");
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  function NavItem({
    to,
    label,
    icon: Icon,
  }: {
    to: string;
    label: string;
    icon: typeof LayoutDashboard;
  }) {
    const active = pathname === to || pathname.startsWith(`${to}/`);
    return (
      <Link
        to={to}
        className={
          active
            ? "flex items-center gap-3 border-r-2 border-primary bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
            : "flex items-center gap-3 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        }
      >
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </Link>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <div className="grid size-6 place-items-center rounded-sm bg-primary">
            <Crosshair className="size-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">HUNTER v1.0</span>
        </div>

        <div className="flex-1 space-y-0.5 overflow-y-auto py-4">
          <div className="px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
          {WORKSPACE.map((i) => (
            <NavItem key={i.to} {...i} />
          ))}
          <div className="mt-6 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Pipeline
          </div>
          {PIPELINE.map((i) => (
            <NavItem key={i.to} {...i} />
          ))}
          <div className="mt-6 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            System
          </div>
          {SYSTEM.map((i) => (
            <NavItem key={i.to} {...i} />
          ))}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">
              {initials(name)}
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="truncate font-medium">{name}</p>
              <p className="truncate text-muted-foreground">Hotel B2B Hunter</p>
            </div>
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-border bg-surface px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted md:max-w-sm"
          >
            <Search className="size-3.5 shrink-0" />
            <span className="truncate">Search clients, meetings, requests…</span>
            <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] md:inline">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-3">
            <Link
              to="/follow-ups"
              className="hidden items-center gap-2 rounded-sm border border-border bg-surface px-3 py-1.5 sm:flex"
            >
              <span
                className={`size-2 rounded-full ${actionable > 0 ? "bg-today" : "bg-done"}`}
              />
              <span className="font-mono text-[11px] font-medium text-muted-foreground">
                {actionable} ACTIONS DUE
              </span>
            </Link>
            <Button size="sm" className="h-8 text-xs" onClick={() => setCaptureOpen(true)}>
              <Plus className="size-3.5" />
              Quick Capture
            </Button>
          </div>
        </header>

        <div className="flex-1 rise p-4 md:p-6">{children}</div>
      </main>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <QuickCapture open={captureOpen} onOpenChange={setCaptureOpen} />
    </div>
  );
}
