import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Empty, PageHeader, Panel, RecordDialog, type FieldSpec } from "@/components/cockpit";
import { supabase } from "@/integrations/supabase/client";
import { useAccountManagers, useUpsert } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Hunter Assistant" },
      { name: "description", content: "Profile and account manager directory settings." },
      { property: "og:title", content: "Settings — Hunter Assistant" },
      { property: "og:description", content: "Profile and account manager directory." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { data: managers = [] } = useAccountManagers();
  const saveManager = useUpsert("account_managers", "Account manager saved");
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", data.user.id)
        .maybeSingle();
      setDisplayName(profile?.display_name ?? "");
    });
  }, []);

  async function saveProfile() {
    setSaving(true);
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", data.user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  const fields: FieldSpec[] = [
    { name: "name", label: "Name", required: true },
    { name: "email", label: "Email" },
    { name: "phone", label: "Phone" },
    { name: "department", label: "Department" },
  ];

  return (
    <>
      <PageHeader title="Settings" subtitle="Profile and team directory" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Profile">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">
                Display name
              </Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={email} disabled />
            </div>
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </Panel>

        <Panel
          title="Account managers"
          action={
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen(true)}>
              <Plus className="size-3.5" /> Add
            </Button>
          }
        >
          {managers.length === 0 ? (
            <Empty label="No account managers yet." />
          ) : (
            <ul className="divide-y divide-border">
              {managers.map((m) => (
                <li key={m.id} className="py-2 text-sm">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[m.department, m.email].filter(Boolean).join(" · ") || "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="New account manager"
        fields={fields}
        pending={saveManager.isPending}
        onSubmit={(v) => saveManager.mutate(v, { onSuccess: () => setOpen(false) })}
      />
    </>
  );
}
