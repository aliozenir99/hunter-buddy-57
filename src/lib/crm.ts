export const OPPORTUNITY_STAGES = [
  "Target Identified",
  "Researched & Qualified",
  "First Contact Made",
  "Engaged / Meeting Booked",
  "Visit / Meeting Held",
  "Opportunity Qualified",
  "DOSM Review",
  "Assigned to Account Manager",
  "Handover Completed",
] as const;

export const FUNNEL_STAGES = [
  { label: "Target Identified", stages: OPPORTUNITY_STAGES.slice(0) },
  { label: "Qualified", stages: OPPORTUNITY_STAGES.slice(1) },
  { label: "Contacted", stages: OPPORTUNITY_STAGES.slice(2) },
  { label: "Meeting", stages: OPPORTUNITY_STAGES.slice(3) },
  { label: "Opportunity", stages: OPPORTUNITY_STAGES.slice(4) },
  { label: "Qualified Opportunity", stages: OPPORTUNITY_STAGES.slice(5) },
  { label: "Handover", stages: OPPORTUNITY_STAGES.slice(7) },
];

export const REQUEST_STATUSES = [
  "New",
  "Information Needed",
  "Sent to Account Manager",
  "Proposal in Progress",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
  "Cancelled",
] as const;

export const REQUEST_TYPES = [
  "Accommodation",
  "Conference",
  "Event",
  "Corporate Agreement",
  "F&B",
  "Long Stay",
  "Other",
] as const;

export const FOLLOW_UP_STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"] as const;
export const PRIORITIES = ["Low", "Medium", "High"] as const;

export const MEETING_TYPES = [
  "Office Visit",
  "Client Visit",
  "Hotel Visit",
  "Online Meeting",
  "Phone Call",
  "Business Networking",
] as const;

export const ACTIVITY_TYPES = [
  "Call",
  "WhatsApp",
  "Email",
  "Meeting",
  "Visit",
  "Note",
] as const;

export const COMPANY_STATUSES = [
  "Lead",
  "Engaged",
  "Qualified Opportunity",
  "Active Client",
  "Cold",
  "Lost",
] as const;

export const RELATIONSHIP_STRENGTHS = ["Cold", "Warm", "Active", "Strong"] as const;
export const LEVELS = ["Low", "Medium", "High"] as const;

export const INTEREST_OPTIONS = [
  "Corporate accommodation",
  "Meetings",
  "Conferences",
  "Events",
  "F&B",
  "Long stay",
  "Business travel",
];

export const COLD_DAYS = 14;

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(iso: string | null | undefined) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  return Math.floor((Date.now() - then) / 86_400_000);
}

export function dueState(due: string, status: string) {
  if (status === "Completed") return "done" as const;
  if (status === "Cancelled") return "cancelled" as const;
  const today = todayISO();
  if (due < today) return "overdue" as const;
  if (due === today) return "today" as const;
  return "upcoming" as const;
}

export function money(value: number | null | undefined) {
  const n = Number(value ?? 0);
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n}`;
}

export function fullMoney(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString("en-US")}`;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function formatLongDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(t: string | null | undefined) {
  if (!t) return "";
  return t.slice(0, 5);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function priorityTone(p: string) {
  if (p === "High") return "text-overdue";
  if (p === "Medium") return "text-today";
  return "text-muted-foreground";
}

export function stageProgress(stage: string) {
  const i = OPPORTUNITY_STAGES.indexOf(stage as (typeof OPPORTUNITY_STAGES)[number]);
  return Math.round(((i + 1) / OPPORTUNITY_STAGES.length) * 100);
}
