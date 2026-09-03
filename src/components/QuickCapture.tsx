import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Panel } from "@/components/cockpit";
import { quickTriage, type QuickCaptureResult } from "@/lib/ai.functions";
import { useCompanies, useUpsert } from "@/lib/api";
import { todayISO } from "@/lib/crm";

export function QuickCapture({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<QuickCaptureResult | null>(null);
  const { data: companies = [] } = useCompanies();
  const triage = useServerFn(quickTriage);
  const saveActivity = useUpsert("activities", "Note logged");
  const saveRequest = useUpsert("requests", "Request created");
  const saveOpportunity = useUpsert("opportunities", "Opportunity created");
  const saveFollowUp = useUpsert("follow_ups", "Follow-up created");

  const matched = companies.find(
    (c) => c.name.toLowerCase() === (result?.company_guess ?? "").toLowerCase(),
  );

  async function analyse() {
    if (!note.trim()) return;
    setBusy(true);
    try {
      const r = await triage({ data: { note, companies: companies.map((c) => c.name) } });
      setResult(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI triage failed");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setNote("");
    setResult(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Quick Capture</DialogTitle>
          <DialogDescription>
            Dump the raw note. AI structures it into CRM records.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          rows={5}
          value={note}
          placeholder="Met Nurlan from ABC Travel at the lobby — needs 40 rooms in October, comparing with Hyatt…"
          onChange={(e) => setNote(e.target.value)}
        />

        <Button onClick={analyse} disabled={busy || !note.trim()} className="w-full">
          <Sparkles className="size-4" />
          {busy ? "Analysing…" : "Analyse with AI"}
        </Button>

        {result && (
          <div className="space-y-3">
            <Panel title="Summary">
              <p className="text-sm">{result.summary || "—"}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Client: {matched?.name ?? result.company_guess || "unmatched"}
                {result.client_need ? ` · Need: ${result.client_need}` : ""}
              </p>
            </Panel>

            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  saveActivity.mutate({
                    company_id: matched?.id ?? null,
                    activity_type: "Note",
                    subject: result.summary.slice(0, 80) || "Quick note",
                    summary: note,
                  })
                }
              >
                Log as activity
              </Button>

              {result.suggested_request && (
                <Button
                  variant="outline"
                  disabled={!matched}
                  onClick={() =>
                    saveRequest.mutate({
                      company_id: matched!.id,
                      title: result.suggested_request!.title,
                      details: result.suggested_request!.details,
                      request_date: todayISO(),
                      status: "New",
                    })
                  }
                >
                  Create request: {result.suggested_request.title}
                </Button>
              )}

              {result.suggested_opportunity && (
                <Button
                  variant="outline"
                  disabled={!matched}
                  onClick={() =>
                    saveOpportunity.mutate({
                      company_id: matched!.id,
                      name: result.suggested_opportunity!.name,
                      potential_business: result.suggested_opportunity!.potential_business,
                      stage: "Target Identified",
                    })
                  }
                >
                  Create opportunity: {result.suggested_opportunity.name}
                </Button>
              )}

              {result.suggested_follow_up && (
                <Button
                  variant="outline"
                  onClick={() =>
                    saveFollowUp.mutate({
                      company_id: matched?.id ?? null,
                      task: result.suggested_follow_up!.task,
                      priority: result.suggested_follow_up!.priority || "Medium",
                      due_date: todayISO(),
                      status: "Pending",
                    })
                  }
                >
                  Add follow-up: {result.suggested_follow_up.task}
                </Button>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={reset}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
