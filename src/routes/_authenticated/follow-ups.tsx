import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Panel, Pill, RecordDialog, type FieldSpec } from "@/components/cockpit";
import {
  useCompanies,
  useFollowUps,
  useOpportunities,
  useUpsert,
  type FollowUp,
} from "@/lib/api";
import { dueState, formatDate, FOLLOW_UP_STATUSES, PRIORITIES, todayISO } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/follow-ups")({
  head: () => ({
    meta: [
      { title: "Follow-ups — Hunter Assistant" },
      { name: "description", content: "Never drop a promise: every task with its due date." },
      { property: "og:title", content: "Follow-ups — Hunter Assistant" },
      { property: "og:description", content: "Every follow-up task with its due date." },
    ],
  }),
  component: FollowUps,
});

function FollowUps() {
  const { data: followUps = [] } = useFollowUps();
  const { data: companies = [] } = useCompanies();
  const { data: opportunities = [] } = useOpportunities();
  const save = useUpsert("follow_ups", "Follow-up saved");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FollowUp | null>(null);

  const companyName = (id: string | null) => companies.find((c) => c.id === id)?.name ?? "—";

  const fields: FieldSpec[] = [
    { name: "task", label: "Task", required: true, full: true },
    {
      name: "company_id",
      label: "Client",
      type: "select",
      options: companies.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: "opportunity_id",
      label: "Opportunity",
      type: "select",
      options: opportunities.map((o) => ({ value: o.id, label: o.name })),
    },
    { name: "due_date", label: "Due date", type: "date", required: true },
    { name: "priority", label: "Priority", type: "select", options: PRIORITIES },
    { name: "status", label: "Status", type: "select", options: FOLLOW_UP_STATUSES },
    { name: "responsible", label: "Responsible" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const groups: { label: string; rows: FollowUp[]; tone: "overdue" | "today" | "muted" | "done" }[] =
    [
      {
        label: "Overdue",
        tone: "overdue",
        rows: followUps.filter((f) => dueState(f.due_date, f.status) === "overdue"),
      },
      {
        label: "Today",
        tone: "today",
        rows: followUps.filter((f) => dueState(f.due_date, f.status) === "today"),
      },
      {
        label: "Upcoming",
        tone: "muted",
        rows: followUps.filter((f) => dueState(f.due_date, f.status) === "upcoming"),
      },
      {
        label: "Completed",
        tone: "done",
        rows: followUps.filter((f) => f.status === "Completed"),
      },
    ];

  return (
    <>
      <PageHeader
        title="Follow-ups"
        subtitle="Promises kept, deals kept"
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> New follow-up
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((g) => (
          <Panel key={g.label} title={`${g.label} (${g.rows.length})`}>
            {g.rows.length === 0 ? (
              <Empty label="Nothing here." />
            ) : (
              <ul className="divide-y divide-border">
                {g.rows.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <button
                      aria-label="Mark complete"
                      className="text-muted-foreground hover:text-done"
                      onClick={() => save.mutate({ id: f.id, status: "Completed" })}
                    >
                      <Check className="size-4" />
                    </button>
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => {
                        setEditing(f);
                        setOpen(true);
                      }}
                    >
                      <p className="truncate">{f.task}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {companyName(f.company_id)} · {f.responsible ?? "—"}
                      </p>
                    </div>
                    <Pill tone={g.tone}>{formatDate(f.due_date)}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        ))}
      </div>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit follow-up" : "New follow-up"}
        fields={fields}
        initial={
          (editing as unknown as Record<string, unknown>) ?? {
            due_date: todayISO(),
            priority: "Medium",
            status: "Pending",
            responsible: "Ali",
          }
        }
        pending={save.isPending}
        onSubmit={(v) => save.mutate(v, { onSuccess: () => setOpen(false) })}
      />
    </>
  );
}
