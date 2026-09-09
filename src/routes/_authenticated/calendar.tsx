import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DeleteButton,
  Empty,
  PageHeader,
  Panel,
  Pill,
  RecordDialog,
  type FieldSpec,
} from "@/components/cockpit";
import {
  useCompanies,
  useContacts,
  useMeetings,
  useRemove,
  useUpsert,
  type Meeting,
} from "@/lib/api";
import { formatDate, formatTime, MEETING_TYPES, todayISO } from "@/lib/crm";
import { smartSummarise } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Hunter Assistant" },
      { name: "description", content: "Plan visits and log structured meeting notes." },
      { property: "og:title", content: "Calendar — Hunter Assistant" },
      { property: "og:description", content: "Plan visits and log structured meeting notes." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { data: meetings = [] } = useMeetings();
  const { data: companies = [] } = useCompanies();
  const { data: contacts = [] } = useContacts();
  const save = useUpsert("meetings", "Meeting saved");
  const remove = useRemove("meetings");
  const summarise = useServerFn(smartSummarise);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const companyName = (id: string | null) => companies.find((c) => c.id === id)?.name ?? "—";
  const today = todayISO();
  const upcoming = meetings.filter((m) => m.meeting_date >= today).reverse();
  const past = meetings.filter((m) => m.meeting_date < today);

  const fields: FieldSpec[] = [
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
    { name: "meeting_date", label: "Date", type: "date", required: true },
    { name: "meeting_time", label: "Time", type: "time" },
    { name: "meeting_type", label: "Type", type: "select", options: MEETING_TYPES },
    { name: "location", label: "Location" },
    { name: "purpose", label: "Purpose", full: true },
    { name: "preparation_notes", label: "Preparation notes", type: "textarea" },
    { name: "discussion", label: "Discussion", type: "textarea" },
    { name: "client_needs", label: "Client needs", type: "textarea" },
    { name: "pain_points", label: "Pain points", type: "textarea" },
    { name: "objections", label: "Objections", type: "textarea" },
    { name: "competitors", label: "Competitors" },
    { name: "decision_maker", label: "Decision maker" },
    { name: "budget", label: "Budget" },
    { name: "timeline", label: "Timeline" },
    { name: "next_steps", label: "Next steps", type: "textarea" },
    { name: "is_completed", label: "Completed", type: "checkbox" },
  ];

  async function structure() {
    if (!notes.trim()) return;
    setBusy(true);
    try {
      const s = await summarise({ data: { notes } });
      setEditing({ ...(editing ?? {}), ...s } as Meeting);
      setOpen(true);
      toast.success("Notes structured — review and save");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    } finally {
      setBusy(false);
    }
  }

  function list(rows: Meeting[], empty: string) {
    if (rows.length === 0) return <Empty label={empty} />;
    return (
      <ul className="divide-y divide-border">
        {rows.map((m) => (
          <li
            key={m.id}
            className="flex cursor-pointer items-center gap-3 py-2.5 text-sm hover:bg-foreground/[0.03]"
            onClick={() => {
              setEditing(m);
              setOpen(true);
            }}
          >
            <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
              {formatDate(m.meeting_date)} {formatTime(m.meeting_time)}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {companyName(m.company_id)} · {m.purpose || m.meeting_type}
            </span>
            <Pill tone={m.is_completed ? "done" : "today"}>
              {m.is_completed ? "Logged" : "Planned"}
            </Pill>
            <DeleteButton
              name={`the meeting with ${companyName(m.company_id)}`}
              onConfirm={() => remove.mutate(m.id)}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Meetings, visits and structured notes"
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> New meeting
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Upcoming">{list(upcoming, "Nothing scheduled.")}</Panel>
          <Panel title="Past meetings">{list(past.slice(0, 25), "No past meetings.")}</Panel>
        </div>

        <Panel title="AI meeting notes">
          <Textarea
            rows={10}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste raw meeting notes here…"
          />
          <Button className="mt-3 w-full" onClick={structure} disabled={busy || !notes.trim()}>
            <Sparkles className="size-4" />
            {busy ? "Structuring…" : "Structure notes"}
          </Button>
        </Panel>
      </div>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title={editing?.id ? "Edit meeting" : "New meeting"}
        fields={fields}
        initial={
          (editing as unknown as Record<string, unknown>) ?? {
            meeting_date: today,
            meeting_type: "Office Visit",
          }
        }
        pending={save.isPending}
        onSubmit={(v) => save.mutate(v, { onSuccess: () => setOpen(false) })}
        deleteName={editing?.id ? "this meeting" : undefined}
        onDelete={
          editing?.id
            ? () => remove.mutate(editing.id, { onSuccess: () => setOpen(false) })
            : undefined
        }
      />
    </>
  );
}
