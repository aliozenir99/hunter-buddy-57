import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DeleteButton,
  Empty,
  PageHeader,
  Panel,
  Pill,
  RecordDialog,
  Stat,
  type FieldSpec,
} from "@/components/cockpit";
import {
  useAccountManagers,
  useActivities,
  useCompanies,
  useContacts,
  useFollowUps,
  useMeetings,
  useOpportunities,
  useRemove,
  useRequests,
  useUpsert,
  type Contact,
} from "@/lib/api";
import {
  COMPANY_STATUSES,
  formatDate,
  formatLongDate,
  fullMoney,
  INTEREST_OPTIONS,
  LEVELS,
  PRIORITIES,
  RELATIONSHIP_STRENGTHS,
} from "@/lib/crm";

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
  const { data: managers = [] } = useAccountManagers();
  const saveContact = useUpsert("contacts", "Contact saved");
  const saveCompany = useUpsert("companies", "Client saved");
  const removeContact = useRemove("contacts");
  const removeCompany = useRemove("companies");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [companyOpen, setCompanyOpen] = useState(false);

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

  const companyFields: FieldSpec[] = [
    { name: "name", label: "Company name", required: true },
    { name: "industry", label: "Industry" },
    { name: "company_type", label: "Type" },
    { name: "website", label: "Website" },
    { name: "city", label: "City" },
    { name: "country", label: "Country" },
    { name: "status", label: "Status", type: "select", options: COMPANY_STATUSES },
    { name: "priority", label: "Priority", type: "select", options: PRIORITIES },
    { name: "lead_source", label: "Lead source" },
    { name: "potential_value", label: "Potential value", type: "number" },
    {
      name: "relationship_strength",
      label: "Relationship",
      type: "select",
      options: RELATIONSHIP_STRENGTHS,
    },
    { name: "business_potential", label: "Business potential", type: "select", options: LEVELS },
    { name: "engagement", label: "Engagement", type: "select", options: LEVELS },
    {
      name: "account_manager_id",
      label: "Account manager",
      type: "select",
      options: managers.map((m) => ({ value: m.id, label: m.name })),
    },
    { name: "interests", label: "Interests", type: "multiselect", options: INTEREST_OPTIONS, full: true },
    { name: "next_action", label: "Next action", full: true },
    { name: "important_notes", label: "Notes", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title={company.name}
        subtitle={[company.industry, company.city, company.country].filter(Boolean).join(" · ")}
        action={
          <div className="flex items-center gap-2">
            <Link to="/clients" className="text-sm text-primary hover:underline">
              ← All clients
            </Link>
            <Button size="sm" variant="outline" onClick={() => setCompanyOpen(true)}>
              <Pencil className="size-3.5" /> Edit
            </Button>
            <DeleteButton
              name={company.name}
              onConfirm={() =>
                removeCompany.mutate(company.id, {
                  onSuccess: () => navigate({ to: "/clients" }),
                })
              }
            />
          </div>
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
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => {
                setEditingContact(null);
                setOpen(true);
              }}
            >
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
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${c.full_name}`}
                        className="rounded-sm p-1 text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setEditingContact(c);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <DeleteButton
                        name={c.full_name}
                        onConfirm={() => removeContact.mutate(c.id)}
                      />
                    </div>
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
        title={editingContact ? "Edit contact" : "New contact"}
        fields={contactFields}
        initial={
          (editingContact as unknown as Record<string, unknown>) ?? { company_id: id }
        }
        pending={saveContact.isPending}
        onSubmit={(v) =>
          saveContact.mutate({ ...v, company_id: id }, { onSuccess: () => setOpen(false) })
        }
        deleteName={editingContact?.full_name}
        onDelete={
          editingContact
            ? () =>
                removeContact.mutate(editingContact.id, { onSuccess: () => setOpen(false) })
            : undefined
        }
      />

      <RecordDialog
        open={companyOpen}
        onOpenChange={setCompanyOpen}
        title="Edit client"
        fields={companyFields}
        initial={company as unknown as Record<string, unknown>}
        pending={saveCompany.isPending}
        onSubmit={(v) =>
          saveCompany.mutate({ ...v, id: company.id }, { onSuccess: () => setCompanyOpen(false) })
        }
        deleteName={company.name}
        onDelete={() =>
          removeCompany.mutate(company.id, { onSuccess: () => navigate({ to: "/clients" }) })
        }
      />
    </>
  );
}
