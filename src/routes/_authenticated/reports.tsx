import { createFileRoute } from "@tanstack/react-router";
import { Empty, PageHeader, Panel, Stat } from "@/components/cockpit";
import {
  useActivities,
  useCompanies,
  useFollowUps,
  useMeetings,
  useOpportunities,
  useRequests,
} from "@/lib/api";
import { fullMoney, OPPORTUNITY_STAGES, REQUEST_STATUSES } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Hunter Assistant" },
      { name: "description", content: "Hunting performance: pipeline, conversion and activity." },
      { property: "og:title", content: "Reports — Hunter Assistant" },
      { property: "og:description", content: "Pipeline, conversion and activity metrics." },
    ],
  }),
  component: Reports,
});

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="truncate">{label}</span>
        <span className="font-mono text-muted-foreground">{value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-muted">
        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Reports() {
  const { data: companies = [] } = useCompanies();
  const { data: meetings = [] } = useMeetings();
  const { data: requests = [] } = useRequests();
  const { data: opportunities = [] } = useOpportunities();
  const { data: followUps = [] } = useFollowUps();
  const { data: activities = [] } = useActivities();

  const stageCounts = OPPORTUNITY_STAGES.map((s) => ({
    label: s,
    value: opportunities.filter((o) => o.stage === s).length,
  }));
  const statusCounts = REQUEST_STATUSES.map((s) => ({
    label: s,
    value: requests.filter((r) => r.status === s).length,
  }));
  const maxStage = Math.max(1, ...stageCounts.map((s) => s.value));
  const maxStatus = Math.max(1, ...statusCounts.map((s) => s.value));

  const won = requests.filter((r) => r.status === "Won").length;
  const closed = requests.filter((r) => ["Won", "Lost"].includes(r.status)).length;
  const conversion = closed === 0 ? 0 : Math.round((won / closed) * 100);
  const completedFollowUps = followUps.filter((f) => f.status === "Completed").length;

  return (
    <>
      <PageHeader title="Reports" subtitle="Where the hunting stands" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Clients" value={companies.length} tone="primary" />
        <Stat label="Meetings held" value={meetings.filter((m) => m.is_completed).length} />
        <Stat label="Request win rate" value={`${conversion}%`} tone="done" />
        <Stat
          label="Pipeline value"
          value={fullMoney(opportunities.reduce((s, o) => s + Number(o.estimated_value ?? 0), 0))}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Pipeline by stage">
          {opportunities.length === 0 ? (
            <Empty label="No opportunities yet." />
          ) : (
            stageCounts.map((s) => <Bar key={s.label} {...s} max={maxStage} />)
          )}
        </Panel>

        <Panel title="Requests by status">
          {requests.length === 0 ? (
            <Empty label="No requests yet." />
          ) : (
            statusCounts.map((s) => <Bar key={s.label} {...s} max={maxStatus} />)
          )}
        </Panel>

        <Panel title="Activity mix">
          {activities.length === 0 ? (
            <Empty label="No activities yet." />
          ) : (
            Object.entries(
              activities.reduce<Record<string, number>>((acc, a) => {
                acc[a.activity_type] = (acc[a.activity_type] ?? 0) + 1;
                return acc;
              }, {}),
            ).map(([label, value]) => (
              <Bar
                key={label}
                label={label}
                value={value}
                max={Math.max(1, activities.length)}
              />
            ))
          )}
        </Panel>

        <Panel title="Discipline">
          <Bar
            label="Follow-ups completed"
            value={completedFollowUps}
            max={Math.max(1, followUps.length)}
          />
          <Bar
            label="Meetings logged"
            value={meetings.filter((m) => m.is_completed).length}
            max={Math.max(1, meetings.length)}
          />
        </Panel>
      </div>
    </>
  );
}
