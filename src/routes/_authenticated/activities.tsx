import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Panel, Pill, RecordDialog, type FieldSpec } from "@/components/cockpit";
import { useActivities, useCompanies, useContacts, useUpsert } from "@/lib/api";
import { ACTIVITY_TYPES, formatLongDate } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/activities")({
  head: () => ({
    meta: [
      { title: "Activities — Hunter Assistant" },
      { name: "description", content: "Calls, visits, messages and notes across every account." },
      { property: "og:title", content: "Activities — Hunter Assistant" },
      { property: "og:description", content: "Calls, visits, messages and notes." },
    ],
  }),
  component: Activities,
});

function Activities() {
  const { data: activities = [] } = useActivities();
  const { data: companies = [] } = useCompanies();
  const { data: contacts = [] } = useContacts();
  const save = useUpsert("activities", "Activity logged");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");

  const companyName = (id: string | null) => companies.find((c) => c.id === id)?.name ?? "—";

  const fields: FieldSpec[] = [
    { name: "subject", label: "Subject", required: true, full: true },
    { name: "activity_type", label: "Type", type: "select", options: ACTIVITY_TYPES },
    {
      name: "company_id",
      label: "Client",
      type: "select",
      options: companies.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: "contact_id",
      label: "Contact",
      type: "select",
      options: contacts.map((c) => ({ value: c.id, label: c.full_name })),
    },
    { name: "duration_minutes", label: "Duration (min)", type: "number" },
    { name: "summary", label: "Summary", type: "textarea" },
  ];

  const filtered = type ? activities.filter((a) => a.activity_type === type) : activities;

  return (
    <>
      <PageHeader
        title="Activities"
        subtitle={`${activities.length} interactions logged`}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Log activity
          </Button>
        }
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="mb-4 h-9 rounded-sm border border-input bg-background px-2 text-sm"
      >
        <option value="">All types</option>
        {ACTIVITY_TYPES.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>

      <Panel>
        {filtered.length === 0 ? (
          <Empty label="No activities." />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <Pill tone="primary">{a.activity_type}</Pill>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {companyName(a.company_id)}
                    {a.summary ? ` · ${a.summary}` : ""}
                  </p>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatLongDate(a.activity_date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="Log activity"
        fields={fields}
        initial={{ activity_type: "Call" }}
        pending={save.isPending}
        onSubmit={(v) => save.mutate(v, { onSuccess: () => setOpen(false) })}
      />
    </>
  );
}
