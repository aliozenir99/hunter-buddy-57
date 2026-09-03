import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, PageHeader, Panel, Pill, RecordDialog, type FieldSpec } from "@/components/cockpit";
import { useCompanies, useContacts, useUpsert } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts — Hunter Assistant" },
      { name: "description", content: "Decision makers and influencers across every account." },
      { property: "og:title", content: "Contacts — Hunter Assistant" },
      { property: "og:description", content: "Decision makers and influencers per account." },
    ],
  }),
  component: Contacts,
});

function Contacts() {
  const { data: contacts = [] } = useContacts();
  const { data: companies = [] } = useCompanies();
  const save = useUpsert("contacts", "Contact saved");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "—";

  const fields: FieldSpec[] = [
    {
      name: "company_id",
      label: "Client",
      type: "select",
      options: companies.map((c) => ({ value: c.id, label: c.name })),
    },
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

  const filtered = contacts.filter((c) =>
    (c.full_name + (c.position ?? "") + companyName(c.company_id))
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length} people`}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New contact
          </Button>
        }
      />

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search contacts…"
        className="mb-4 max-w-xs"
      />

      <Panel>
        {filtered.length === 0 ? (
          <Empty label="No contacts match." />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.full_name}</span>
                    {c.is_decision_maker && <Pill tone="primary">DM</Pill>}
                    {c.is_influencer && <Pill>Influencer</Pill>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {[c.position, c.phone, c.email].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <Link
                  to="/clients/$id"
                  params={{ id: c.company_id }}
                  className="text-xs text-primary hover:underline"
                >
                  {companyName(c.company_id)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="New contact"
        fields={fields}
        pending={save.isPending}
        onSubmit={(v) => save.mutate(v, { onSuccess: () => setOpen(false) })}
      />
    </>
  );
}
