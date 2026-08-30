import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Crosshair, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Hunter Assistant" },
      {
        name: "description",
        content: "Sign in to your personal B2B hotel sales workspace.",
      },
      { property: "og:title", content: "Sign in — Hunter Assistant" },
      {
        property: "og:description",
        content: "Sign in to your personal B2B hotel sales workspace.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. Signing you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate({ to: "/dashboard" });
      else toast.info("Check your inbox to confirm your email.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-panel p-10 text-panel-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="grid size-6 place-items-center rounded-sm bg-primary">
            <Crosshair className="size-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">HUNTER v1.0</span>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Your personal sales memory.
          </h2>
          <p className="text-sm leading-relaxed text-panel-foreground/60">
            Who am I talking to. What did we discuss. What did I promise. What should I do today.
            Hunter Assistant answers instantly — meetings, requests, follow-ups, opportunities and
            handovers in one cockpit.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4 font-mono text-[10px] uppercase tracking-widest text-panel-foreground/40">
            <div className="border-t border-panel-foreground/15 pt-2">Meetings</div>
            <div className="border-t border-panel-foreground/15 pt-2">Requests</div>
            <div className="border-t border-panel-foreground/15 pt-2">Handovers</div>
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-panel-foreground/30">
          Hotel B2B sales workspace
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-lg font-semibold tracking-tight">
            {mode === "signin" ? "Sign in to your workspace" : "Create your workspace"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Pick up exactly where you left off."
              : "Set up your personal hunter cockpit."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ali" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hotel.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={google}>
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "No workspace yet?" : "Already have a workspace?"}{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
