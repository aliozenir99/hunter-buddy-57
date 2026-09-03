import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, PageHeader, Panel, Pill, RecordDialog, type FieldSpec } from "@/components/cockpit";
import { useAccountManagers, useCompanies, useUpsert } from "@/lib/api";
import {
  COLD_DAYS,
  COMPANY_STATUSES,
  daysBetween,
  fullMoney,
  LEVELS,
  PRIORITIES,
  RELATIONSHIP_STRENGTHS,
} from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/clients/")({
  head: () => ({
    meta: [
      { title: "Clients — Hunter Assistant" },
      { name: "description", content: "Every corporate client, lead and account in one list." },
      { property: "og:title", content: "Clients — Hunter Assistant" },
      { property: "og:description", content: "Every corporate client, lead and account." },
    ],
  }),
  component: Clients,
});

function Clients() {
  const { data: companies = [] } = useCompanies();
  const { data: managers = [] } = useAccountManagers();
  const save = useUpsert("companies", "Client saved");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const fields: FieldSpec[] = [
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
    { name: "next_action", label: "Next action", full: true },
    { name: "important_notes", label: "Notes", type: "textarea" },
  ];

  const filtered = companies.filter(
    (c) =>
      (!status || c.status === status) &&
      (c.name + (c.industry ?? "") + (c.city ?? "")).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={`${companies.length} companies tracked`}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New client
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search clients…"
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-sm border border-input bg-background px-2 text-sm"
        >
          <option value="">All statuses</option>
          {COMPANY_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <Panel>
        {filtered.length === 0 ? (
          <Empty label="No clients match." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Priority</th>
                  <th className="py-2 pr-3">Potential</th>
                  <th className="py-2 pr-3">Last contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => {
                  const d = daysBetween(c.last_contact_at);
                  return (
                    <tr key={c.id} className="hover:bg-foreground/[0.03]">
                      <td className="py-2 pr-3">
                        <Link
                          to="/clients/$id"
                          params={{ id: c.id }}
                          className="font-medium hover:text-primary"
                        >
                          {c.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {[c.industry, c.city].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </td>
                      <td className="py-2 pr-3">
                        <Pill tone={c.status === "Active Client" ? "done" : "muted"}>
                          {c.status}
                        </Pill>
                      </td>
                      <td className="py-2 pr-3">
                        <Pill tone={c.priority === "High" ? "overdue" : "muted"}>{c.priority}</Pill>
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {fullMoney(c.potential_value)}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        <span className={d === null || d >= COLD_DAYS ? "text-overdue" : ""}>
                          {d === null ? "never" : `${d}d ago`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="New client"
        fields={fields}
        initial={{ status: "Lead", priority: "Medium" }}
        pending={save.isPending}
        onSubmit={(v) => save.mutate(v, { onSuccess: () => setOpen(false) })}
      />
    </>
  );
}
