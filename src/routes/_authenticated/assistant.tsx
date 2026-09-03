import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Send, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Empty, PageHeader, Panel } from "@/components/cockpit";
import { askAssistant, draftEmail } from "@/lib/ai.functions";
import {
  useCompanies,
  useFollowUps,
  useMeetings,
  useOpportunities,
  useRequests,
  useUpsert,
} from "@/lib/api";
import { formatDate, fullMoney } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Hunter Assistant" },
      { name: "description", content: "Ask your CRM anything and draft account manager emails." },
      { property: "og:title", content: "AI Assistant — Hunter Assistant" },
      { property: "og:description", content: "Ask your CRM anything and draft emails." },
    ],
  }),
  component: Assistant,
});

function Assistant() {
  const { data: companies = [] } = useCompanies();
  const { data: meetings = [] } = useMeetings();
  const { data: requests = [] } = useRequests();
  const { data: opportunities = [] } = useOpportunities();
  const { data: followUps = [] } = useFollowUps();
  const ask = useServerFn(askAssistant);
  const draft = useServerFn(draftEmail);
  const saveDraft = useUpsert("email_drafts", "Draft saved");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [thinking, setThinking] = useState(false);

  const [companyId, setCompanyId] = useState("");
  const [instruction, setInstruction] = useState("");
  const [email, setEmail] = useState<{ subject: string; body: string } | null>(null);
  const [writing, setWriting] = useState(false);

  const companyName = (id: string | null) => companies.find((c) => c.id === id)?.name ?? "—";

  const snapshot = [
    "CLIENTS:",
    ...companies.map(
      (c) =>
        `- ${c.name} | status ${c.status} | priority ${c.priority} | potential ${fullMoney(c.potential_value)} | next: ${c.next_action ?? "—"}`,
    ),
    "OPPORTUNITIES:",
    ...opportunities.map(
      (o) =>
        `- ${o.name} (${companyName(o.company_id)}) | ${o.stage} | ${fullMoney(o.estimated_value)} | ${o.probability ?? 0}%`,
    ),
    "REQUESTS:",
    ...requests.map((r) => `- ${r.title} (${companyName(r.company_id)}) | ${r.status}`),
    "FOLLOW-UPS:",
    ...followUps.map((f) => `- ${f.task} | due ${f.due_date} | ${f.status} | ${f.priority}`),
    "MEETINGS:",
    ...meetings
      .slice(0, 20)
      .map(
        (m) =>
          `- ${formatDate(m.meeting_date)} ${companyName(m.company_id)} | ${m.purpose ?? m.meeting_type} | next: ${m.next_steps ?? "—"}`,
      ),
  ].join("\n");

  async function submitQuestion() {
    if (!question.trim()) return;
    setThinking(true);
    try {
      const r = await ask({ data: { question, context: snapshot } });
      setAnswer(r.answer);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Assistant failed");
    } finally {
      setThinking(false);
    }
  }

  async function writeEmail() {
    if (!instruction.trim()) return;
    setWriting(true);
    try {
      const company = companies.find((c) => c.id === companyId);
      const context = company
        ? [
            `Client: ${company.name} (${company.status}, ${company.industry ?? "—"})`,
            `Potential: ${fullMoney(company.potential_value)}`,
            `Notes: ${company.important_notes ?? "—"}`,
            "Requests: " +
              (requests
                .filter((r) => r.company_id === company.id)
                .map((r) => `${r.title} [${r.status}]`)
                .join("; ") || "none"),
          ].join("\n")
        : snapshot;
      const r = await draft({ data: { context, instruction, previous: email?.body } });
      setEmail(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Draft failed");
    } finally {
      setWriting(false);
    }
  }

  return (
    <>
      <PageHeader title="AI Assistant" subtitle="Your CRM, answered and written for you" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Ask your CRM">
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitQuestion()}
              placeholder="Which clients should I contact today?"
            />
            <Button onClick={submitQuestion} disabled={thinking}>
              <Send className="size-4" />
            </Button>
          </div>
          <div className="mt-3 min-h-32 rounded-sm border border-border bg-surface p-3 text-sm">
            {thinking ? (
              <p className="text-muted-foreground">Thinking…</p>
            ) : answer ? (
              <p className="whitespace-pre-wrap">{answer}</p>
            ) : (
              <Empty label="Ask about priorities, cold clients, pipeline or next steps." />
            )}
          </div>
        </Panel>

        <Panel title="Email assistant">
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="mb-2 h-9 w-full rounded-sm border border-input bg-background px-2 text-sm"
          >
            <option value="">Whole portfolio</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Textarea
            rows={3}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Hand this request over to the account manager with all details…"
          />
          <Button className="mt-2 w-full" onClick={writeEmail} disabled={writing || !instruction}>
            <Sparkles className="size-4" />
            {writing ? "Writing…" : "Draft email"}
          </Button>

          {email && (
            <div className="mt-3 space-y-2">
              <Input
                value={email.subject}
                onChange={(e) => setEmail({ ...email, subject: e.target.value })}
              />
              <Textarea
                rows={10}
                value={email.body}
                onChange={(e) => setEmail({ ...email, body: e.target.value })}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    saveDraft.mutate({
                      company_id: companyId || null,
                      subject: email.subject,
                      body: email.body,
                    })
                  }
                >
                  Save draft
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(`${email.subject}\n\n${email.body}`);
                    toast.success("Copied");
                  }}
                >
                  <Mail className="size-4" /> Copy
                </Button>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
