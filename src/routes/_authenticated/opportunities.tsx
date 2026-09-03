import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Panel, Pill, RecordDialog, Stat, type FieldSpec } from "@/components/cockpit";
import {
  useAccountManagers,
  useCompanies,
  useContacts,
  useOpportunities,
  useUpsert,
  type Opportunity,
} from "@/lib/api";
import { formatDate, fullMoney, OPPORTUNITY_STAGES } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/opportunities")({
  head: () => ({
    meta: [
      { title: "Pipeline — Hunter Assistant" },
      { name: "description", content: "Opportunity pipeline from target to handover." },
      { property: "og:title", content: "Pipeline — Hunter Assistant" },
      { property: "og:description", content: "Opportunity pipeline from target to handover." },
    ],
  }),
  component: Opportunities,
});

function Opportunities() {
  const { data: opportunities = [] } = useOpportunities();
  const { data: companies = [] } = useCompanies();
  const { data: contacts = [] } = useContacts();
  const { data: managers = [] } = useAccountManagers();
  const save = useUpsert("opportunities", "Opportunity saved");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "—";
  const total = opportunities.reduce((s, o) => s + Number(o.estimated_value ?? 0), 0);
  const weighted = opportunities.reduce(
    (s, o) => s + (Number(o.estimated_value ?? 0) * Number(o.probability ?? 0)) / 100,
    0,
  );

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
    { name: "name", label: "Opportunity", required: true, full: true },
    { name: "stage", label: "Stage", type: "select", options: OPPORTUNITY_STAGES },
    { name: "estimated_value", label: "Estimated value", type: "number" },
    { name: "probability", label: "Probability %", type: "number" },
    { name: "expected_decision_date", label: "Expected decision", type: "date" },
    { name: "source", label: "Source" },
    {
      name: "account_manager_id",
      label: "Account manager",
      type: "select",
      options: managers.map((m) => ({ value: m.id, label: m.name })),
    },
    { name: "handover_date", label: "Handover date", type: "date" },
    { name: "potential_business", label: "Potential business", type: "textarea" },
    { name: "next_action", label: "Next action", full: true },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Pipeline"
        subtitle={`${opportunities.length} opportunities`}
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> New opportunity
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Total value" value={fullMoney(total)} tone="primary" />
        <Stat label="Weighted" value={fullMoney(Math.round(weighted))} tone="done" />
        <Stat
          label="In handover"
          value={opportunities.filter((o) => o.stage.includes("Handover")).length}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {OPPORTUNITY_STAGES.map((stage) => {
          const rows = opportunities.filter((o) => o.stage === stage);
          return (
            <Panel key={stage} title={`${stage} (${rows.length})`}>
              {rows.length === 0 ? (
                <Empty label="—" />
              ) : (
                <ul className="space-y-2">
                  {rows.map((o) => (
                    <li
                      key={o.id}
                      className="cursor-pointer rounded-sm border border-border bg-surface p-2.5 text-sm hover:border-primary/40"
                      onClick={() => {
                        setEditing(o);
                        setOpen(true);
                      }}
                    >
                      <p className="truncate font-medium">{o.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {companyName(o.company_id)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Pill tone="done">{fullMoney(o.estimated_value)}</Pill>
                        <Pill>{o.probability ?? 0}%</Pill>
                        {o.expected_decision_date && (
                          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                            {formatDate(o.expected_decision_date)}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          );
        })}
      </div>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit opportunity" : "New opportunity"}
        fields={fields}
        initial={
          (editing as unknown as Record<string, unknown>) ?? {
            stage: "Target Identified",
            probability: 20,
          }
        }
        pending={save.isPending}
        onSubmit={(v) => save.mutate(v, { onSuccess: () => setOpen(false) })}
      />
    </>
  );
}
