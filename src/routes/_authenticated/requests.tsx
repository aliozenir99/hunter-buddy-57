import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Panel, Pill, RecordDialog, type FieldSpec } from "@/components/cockpit";
import {
  useAccountManagers,
  useCompanies,
  useContacts,
  useRequests,
  useUpsert,
  type RequestRow,
} from "@/lib/api";
import { formatDate, REQUEST_STATUSES, REQUEST_TYPES, todayISO } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({
    meta: [
      { title: "Requests — Hunter Assistant" },
      { name: "description", content: "Accommodation, conference and event requests pipeline." },
      { property: "og:title", content: "Requests — Hunter Assistant" },
      { property: "og:description", content: "Accommodation, conference and event requests." },
    ],
  }),
  component: Requests,
});

function Requests() {
  const { data: requests = [] } = useRequests();
  const { data: companies = [] } = useCompanies();
  const { data: contacts = [] } = useContacts();
  const { data: managers = [] } = useAccountManagers();
  const save = useUpsert("requests", "Request saved");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RequestRow | null>(null);
  const [status, setStatus] = useState("");

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "—";

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
    { name: "title", label: "Title", required: true, full: true },
    { name: "request_type", label: "Type", type: "select", options: REQUEST_TYPES },
    { name: "status", label: "Status", type: "select", options: REQUEST_STATUSES },
    { name: "request_date", label: "Request date", type: "date" },
    { name: "deadline", label: "Deadline", type: "date" },
    { name: "check_in", label: "Check-in", type: "date" },
    { name: "check_out", label: "Check-out", type: "date" },
    { name: "rooms", label: "Rooms", type: "number" },
    { name: "room_type", label: "Room type" },
    { name: "guests", label: "Guests", type: "number" },
    { name: "event_date", label: "Event date", type: "date" },
    { name: "conference_room", label: "Conference room" },
    { name: "fnb", label: "F&B" },
    { name: "budget", label: "Budget" },
    {
      name: "account_manager_id",
      label: "Account manager",
      type: "select",
      options: managers.map((m) => ({ value: m.id, label: m.name })),
    },
    { name: "details", label: "Details", type: "textarea" },
    { name: "special_requirements", label: "Special requirements", type: "textarea" },
  ];

  const filtered = status ? requests.filter((r) => r.status === status) : requests;

  return (
    <>
      <PageHeader
        title="Requests"
        subtitle={`${requests.length} requests captured`}
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> New request
          </Button>
        }
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="mb-4 h-9 rounded-sm border border-input bg-background px-2 text-sm"
      >
        <option value="">All statuses</option>
        {REQUEST_STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      <Panel>
        {filtered.length === 0 ? (
          <Empty label="No requests." />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((r) => (
              <li
                key={r.id}
                className="flex cursor-pointer flex-wrap items-center gap-3 py-2.5 text-sm hover:bg-foreground/[0.03]"
                onClick={() => {
                  setEditing(r);
                  setOpen(true);
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {companyName(r.company_id)} · {r.request_type ?? "—"}
                  </p>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatDate(r.request_date)}
                </span>
                <Pill
                  tone={r.status === "Won" ? "done" : r.status === "Lost" ? "overdue" : "primary"}
                >
                  {r.status}
                </Pill>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit request" : "New request"}
        fields={fields}
        initial={
          (editing as unknown as Record<string, unknown>) ?? {
            request_date: todayISO(),
            status: "New",
            request_type: "Accommodation",
          }
        }
        pending={save.isPending}
        onSubmit={(v) => save.mutate(v, { onSuccess: () => setOpen(false) })}
      />
    </>
  );
}
