import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";

async function chat(messages: Array<{ role: string; content: string }>, json = false) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (res.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

/* ---------- Smart meeting summary ---------- */

export interface SmartSummary {
  client_needs: string;
  competitors: string;
  opportunities: string;
  requirements: string;
  requests: string;
  pain_points: string;
  objections: string;
  decision_maker: string;
  budget: string;
  timeline: string;
  next_steps: string;
  priority: string;
  discussion: string;
}

const EMPTY_SUMMARY: SmartSummary = {
  client_needs: "",
  competitors: "",
  opportunities: "",
  requirements: "",
  requests: "",
  pain_points: "",
  objections: "",
  decision_maker: "",
  budget: "",
  timeline: "",
  next_steps: "",
  priority: "Medium",
  discussion: "",
};

export const smartSummarise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { notes: string }) => data)
  .handler(async ({ data }): Promise<SmartSummary> => {
    const raw = await chat(
      [
        {
          role: "system",
          content:
            "You structure messy hotel B2B sales meeting notes. Reply ONLY with a JSON object with these string keys: discussion, client_needs, competitors, opportunities, requirements, requests, pain_points, objections, decision_maker, budget, timeline, next_steps, priority. priority must be Low, Medium or High. Leave a key as an empty string when the notes contain nothing about it. Be concise and factual.",
        },
        { role: "user", content: data.notes },
      ],
      true,
    );
    return { ...EMPTY_SUMMARY, ...parseJson<Partial<SmartSummary>>(raw, {}) };
  });

/* ---------- Quick capture triage ---------- */

export interface QuickCaptureResult {
  summary: string;
  company_guess: string;
  suggested_request: { title: string; details: string } | null;
  suggested_opportunity: { name: string; potential_business: string } | null;
  suggested_follow_up: { task: string; priority: string } | null;
  client_need: string;
}

export const quickTriage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { note: string; companies: string[] }) => data)
  .handler(async ({ data }): Promise<QuickCaptureResult> => {
    const raw = await chat(
      [
        {
          role: "system",
          content: `You triage a hotel B2B sales hunter's 30-second note into structured records. Known companies: ${data.companies.join(", ") || "none"}. Reply ONLY with JSON: {"summary":string,"company_guess":string,"client_need":string,"suggested_request":{"title":string,"details":string}|null,"suggested_opportunity":{"name":string,"potential_business":string}|null,"suggested_follow_up":{"task":string,"priority":"Low"|"Medium"|"High"}|null}. company_guess must be an exact match from the known companies list, or "".`,
        },
        { role: "user", content: data.note },
      ],
      true,
    );
    return {
      summary: "",
      company_guess: "",
      client_need: "",
      suggested_request: null,
      suggested_opportunity: null,
      suggested_follow_up: null,
      ...parseJson<Partial<QuickCaptureResult>>(raw, {}),
    };
  });

/* ---------- Email assistant ---------- */

export const draftEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { context: string; instruction: string; previous?: string }) => data,
  )
  .handler(async ({ data }): Promise<{ subject: string; body: string }> => {
    const raw = await chat(
      [
        {
          role: "system",
          content:
            'You write internal hotel sales emails from a B2B Sales Hunter to an Account Manager. Reply ONLY with JSON: {"subject":string,"body":string}. Keep it professional, specific and free of filler. Body is plain text with line breaks.',
        },
        {
          role: "user",
          content: `CONTEXT:\n${data.context}\n\n${
            data.previous ? `PREVIOUS DRAFT:\n${data.previous}\n\n` : ""
          }INSTRUCTION: ${data.instruction}`,
        },
      ],
      true,
    );
    return { subject: "", body: "", ...parseJson<{ subject?: string; body?: string }>(raw, {}) };
  });

/* ---------- Handover generator ---------- */

export interface HandoverDraft {
  client_summary: string;
  relationship: string;
  business_need: string;
  opportunity_summary: string;
  requirements: string;
  budget: string;
  decision_maker: string;
  timeline: string;
  competitors: string;
  concerns: string;
  recommended_approach: string;
  previous_communication: string;
}

export const generateHandover = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { context: string }) => data)
  .handler(async ({ data }): Promise<HandoverDraft> => {
    const raw = await chat(
      [
        {
          role: "system",
          content:
            "You prepare a structured handover brief from a hotel B2B Sales Hunter to an Account Manager. Reply ONLY with JSON containing string keys: client_summary, relationship, business_need, opportunity_summary, requirements, budget, decision_maker, timeline, competitors, concerns, recommended_approach, previous_communication. Base everything strictly on the supplied CRM context. Use '—' where the data is unknown.",
        },
        { role: "user", content: data.context },
      ],
      true,
    );
    const empty: HandoverDraft = {
      client_summary: "",
      relationship: "",
      business_need: "",
      opportunity_summary: "",
      requirements: "",
      budget: "",
      decision_maker: "",
      timeline: "",
      competitors: "",
      concerns: "",
      recommended_approach: "",
      previous_communication: "",
    };
    return { ...empty, ...parseJson<Partial<HandoverDraft>>(raw, {}) };
  });

/* ---------- Personal assistant ---------- */

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { question: string; context: string }) => data)
  .handler(async ({ data }): Promise<{ answer: string }> => {
    const answer = await chat([
      {
        role: "system",
        content:
          "You are the personal sales assistant of a hotel B2B Sales Hunter. Answer ONLY from the CRM SNAPSHOT provided. Never invent clients, numbers or dates. If the snapshot does not contain the answer, say so plainly. Be direct and concise; use short markdown-free bullet lines starting with '- ' where a list helps.",
      },
      { role: "user", content: `CRM SNAPSHOT:\n${data.context}\n\nQUESTION: ${data.question}` },
    ]);
    return { answer };
  });
