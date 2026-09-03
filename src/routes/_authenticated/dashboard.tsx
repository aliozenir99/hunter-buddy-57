import { createFileRoute, Link } from "@tanstack/react-router";
import { Empty, PageHeader, Panel, Pill, Stat } from "@/components/cockpit";
import {
  useCompanies,
  useFollowUps,
  useMeetings,
  useOpportunities,
  useRequests,
} from "@/lib/api";
import { COLD_DAYS, daysBetween, dueState, formatDate, fullMoney, todayISO } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Hunter Assistant" },
      { name: "description", content: "Daily briefing for the hotel B2B sales hunter." },
      { property: "og:title", content: "Dashboard — Hunter Assistant" },
      { property: "og:description", content: "Daily briefing for the hotel B2B sales hunter." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: companies = [] } = useCompanies();
  const { data: meetings = [] } = useMeetings();
  const { data: requests = [] } = useRequests();
  const { data: opportunities = [] } = useOpportunities();
  const { data: followUps = [] } = useFollowUps();

  const today = todayISO();
  const todaysMeetings = meetings.filter((m) => m.meeting_date === today);
  const overdue = followUps.filter((f) => dueState(f.due_date, f.status) === "overdue");
  const dueToday = followUps.filter((f) => dueState(f.due_date, f.status) === "today");
  const openRequests = requests.filter(
    (r) => !["Won", "Lost", "Cancelled"].includes(r.status),
  );
  const pipeline = opportunities
    .filter((o) => o.stage !== "Handover Completed")
    .reduce((s, o) => s + Number(o.estimated_value ?? 0), 0);
  const cold = companies.filter((c) => {
    const d = daysBetween(c.last_contact_at);
    return d === null || d >= COLD_DAYS;
  });

  const companyName = (id: string | null) =>
    companies.find((c) => c.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader
        title="Daily briefing"
        subtitle={new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        })}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Meetings today" value={todaysMeetings.length} tone="primary" />
        <Stat label="Overdue" value={overdue.length} tone="overdue" />
        <Stat label="Due today" value={dueToday.length} tone="today" />
        <Stat label="Open requests" value={openRequests.length} />
        <Stat label="Pipeline" value={fullMoney(pipeline)} tone="done" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Today's schedule"
          action={
            <Link to="/calendar" className="text-xs text-primary hover:underline">
              Calendar
            </Link>
          }
        >
          {todaysMeetings.length === 0 ? (
            <Empty label="No meetings scheduled today." />
          ) : (
            <ul className="divide-y divide-border">
              {todaysMeetings.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">
                    {m.meeting_time?.slice(0, 5) ?? "--:--"}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {companyName(m.company_id)} · {m.purpose || m.meeting_type}
                  </span>
                  <Pill tone={m.is_completed ? "done" : "primary"}>
                    {m.is_completed ? "Done" : m.meeting_type}
                  </Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Priority actions"
          action={
            <Link to="/follow-ups" className="text-xs text-primary hover:underline">
              All follow-ups
            </Link>
          }
        >
          {[...overdue, ...dueToday].length === 0 ? (
            <Empty label="Nothing due. Go hunt." />
          ) : (
            <ul className="divide-y divide-border">
              {[...overdue, ...dueToday].slice(0, 8).map((f) => (
                <li key={f.id} className="flex items-center gap-3 py-2 text-sm">
                  <Pill tone={dueState(f.due_date, f.status) === "overdue" ? "overdue" : "today"}>
                    {formatDate(f.due_date)}
                  </Pill>
                  <span className="min-w-0 flex-1 truncate">{f.task}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {companyName(f.company_id)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Open requests"
          action={
            <Link to="/requests" className="text-xs text-primary hover:underline">
              All requests
            </Link>
          }
        >
          {openRequests.length === 0 ? (
            <Empty label="No open requests." />
          ) : (
            <ul className="divide-y divide-border">
              {openRequests.slice(0, 8).map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{r.title}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {companyName(r.company_id)}
                  </span>
                  <Pill>{r.status}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={`Cold clients (${COLD_DAYS}+ days)`}
          action={
            <Link to="/clients" className="text-xs text-primary hover:underline">
              All clients
            </Link>
          }
        >
          {cold.length === 0 ? (
            <Empty label="Every client is warm." />
          ) : (
            <ul className="divide-y divide-border">
              {cold.slice(0, 8).map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-2 text-sm">
                  <Link
                    to="/clients/$id"
                    params={{ id: c.id }}
                    className="min-w-0 flex-1 truncate hover:text-primary"
                  >
                    {c.name}
                  </Link>
                  <span className="font-mono text-xs text-muted-foreground">
                    {daysBetween(c.last_contact_at) ?? "∞"}d
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
