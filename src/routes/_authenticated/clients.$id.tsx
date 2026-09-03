import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Panel, Pill, RecordDialog, Stat, type FieldSpec } from "@/components/cockpit";
import {
  useActivities,
  useCompanies,
  useContacts,
  useFollowUps,
  useMeetings,
  useOpportunities,
  useRequests,
  useUpsert,
} from "@/lib/api";
import { formatDate, formatLongDate, fullMoney } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/clients/$id")({
  head: () => ({
    meta: [
      { title: "Client 360° — Hunter Assistant" },
      { name: "description", content: "Full relationship view of a corporate client." },
      { property: "og:title", content: "Client 360° — Hunter Assistant" },
      { property: "og:description", content: "Full relationship view of a corporate client." },
    ],
  }),
  component: ClientDetail,
});

function ClientDetail() {
  const { id } = Route.useParams();
  const { data: companies = [] } = useCompanies();
  const { data: contacts = [] } = useContacts();
  const { data: meetings = [] } = useMeetings();
  const { data: requests = [] } = useRequests();
  const { data: opportunities = [] } = useOpportunities();
  const { data: followUps = [] } = useFollowUps();
  const { data: activities = [] } = useActivities();
  const saveContact = useUpsert("contacts", "Contact saved");
  const [open, setOpen] = useState(false);

  const company = companies.find((c) => c.id === id);
  if (!company) return <Empty label="Client not found." />;

  const cContacts = contacts.filter((c) => c.company_id === id);
  const cMeetings = meetings.filter((m) => m.company_id === id);
  const cRequests = requests.filter((r) => r.company_id === id);
  const cOpps = opportunities.filter((o) => o.company_id === id);
  const cFollow = followUps.filter((f) => f.company_id === id);
  const cActs = activities.filter((a) => a.company_id === id);

  const contactFields: FieldSpec[] = [
    { name: "full_name", label: "Full name", required: true },
    { name: "position", label: "Position" },
    { name: "phone", label: "Phone" },
    { name: "email", label: "Email" },
    { name: "telegram", label: "Telegram" },
    { name: "whatsapp", label: "WhatsApp" },
    { name: "is_decision_maker", label: "Decision maker", type: "checkbox" },
    { name: "is_influencer", label: "Influencer", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title={company.name}
        subtitle={[company.industry, company.city, company.country].filter(Boolean).join(" · ")}
        action={
          <Link to="/clients" className="text-sm text-primary hover:underline">
            ← All clients
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Status" value={company.status} tone="primary" />
        <Stat label="Potential" value={fullMoney(company.potential_value)} tone="done" />
        <Stat label="Relationship" value={company.relationship_strength ?? "—"} />
        <Stat label="Last contact" value={formatLongDate(company.last_contact_at)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Contacts"
          action={
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen(true)}>
              <Plus className="size-3.5" /> Add
            </Button>
          }
        >
          {cContacts.length === 0 ? (
            <Empty label="No contacts yet." />
          ) : (
            <ul className="divide-y divide-border">
              {cContacts.map((c) => (
                <li key={c.id} className="py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.full_name}</span>
                    {c.is_decision_maker && <Pill tone="primary">DM</Pill>}
                    {c.is_influencer && <Pill>Influencer</Pill>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[c.position, c.phone, c.email].filter(Boolean).join(" · ") || "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Opportunities">
          {cOpps.length === 0 ? (
            <Empty label="No opportunities." />
          ) : (
            <ul className="divide-y divide-border">
              {cOpps.map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{o.name}</span>
                  <Pill>{o.stage}</Pill>
                  <span className="font-mono text-xs">{fullMoney(o.estimated_value)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Requests">
          {cRequests.length === 0 ? (
            <Empty label="No requests." />
          ) : (
            <ul className="divide-y divide-border">
              {cRequests.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{r.title}</span>
                  <Pill>{r.status}</Pill>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDate(r.request_date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Follow-ups">
          {cFollow.length === 0 ? (
            <Empty label="No follow-ups." />
          ) : (
            <ul className="divide-y divide-border">
              {cFollow.map((f) => (
                <li key={f.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{f.task}</span>
                  <Pill>{f.status}</Pill>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDate(f.due_date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Meeting history" className="lg:col-span-2">
          {cMeetings.length === 0 ? (
            <Empty label="No meetings logged." />
          ) : (
            <ul className="divide-y divide-border">
              {cMeetings.map((m) => (
                <li key={m.id} className="py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatDate(m.meeting_date)}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {m.purpose || m.meeting_type}
                    </span>
                    <Pill tone={m.is_completed ? "done" : "today"}>
                      {m.is_completed ? "Completed" : "Planned"}
                    </Pill>
                  </div>
                  {m.next_steps && (
                    <p className="mt-1 text-xs text-muted-foreground">Next: {m.next_steps}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Activity timeline" className="lg:col-span-2">
          {cActs.length === 0 ? (
            <Empty label="No activities." />
          ) : (
            <ul className="divide-y divide-border">
              {cActs.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-2 text-sm">
                  <Pill>{a.activity_type}</Pill>
                  <span className="min-w-0 flex-1 truncate">{a.subject}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDate(a.activity_date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {company.important_notes && (
          <Panel title="Notes" className="lg:col-span-2">
            <p className="whitespace-pre-wrap text-sm">{company.important_notes}</p>
          </Panel>
        )}
      </div>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="New contact"
        fields={contactFields}
        initial={{ company_id: id }}
        pending={saveContact.isPending}
        onSubmit={(v) =>
          saveContact.mutate({ ...v, company_id: id }, { onSuccess: () => setOpen(false) })
        }
      />
    </>
  );
}
