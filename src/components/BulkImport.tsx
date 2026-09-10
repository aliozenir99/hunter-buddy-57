import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pill } from "@/components/cockpit";
import { supabase } from "@/integrations/supabase/client";
import { PRIORITIES } from "@/lib/crm";

export interface ImportRow {
  company: string;
  industry: string | null;
  priority: string | null;
  contactName: string | null;
  position: string | null;
  phone: string | null;
  email: string | null;
  lastContact: string | null;
  valid: boolean;
}

const ALIASES: Record<keyof Omit<ImportRow, "valid">, string[]> = {
  company: ["company", "company name", "client", "account", "organisation", "organization", "firma"],
  industry: ["industry", "sector", "segment"],
  priority: ["priority", "rating", "grade", "importance"],
  contactName: ["contact", "contact name", "person", "full name", "name"],
  position: ["position", "title", "role", "job title"],
  phone: ["phone", "mobile", "telephone", "tel", "whatsapp"],
  email: ["email", "e-mail", "mail"],
  lastContact: ["last contact", "last contact date", "last contacted", "last touch", "date"],
};

function splitLine(line: string, delim: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if (ch === delim && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

function normalisePriority(v: string | null) {
  if (!v) return null;
  const s = v.trim().toLowerCase();
  if (["a", "high", "hot", "1", "***"].includes(s)) return "High";
  if (["b", "medium", "med", "warm", "2", "**"].includes(s)) return "Medium";
  if (["c", "low", "cold", "3", "*"].includes(s)) return "Low";
  const match = PRIORITIES.find((p) => p.toLowerCase() === s);
  return match ?? null;
}

function normaliseDate(v: string | null) {
  if (!v) return null;
  const s = v.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (m) {
    const d = m[1] ?? "";
    const mo = m[2] ?? "";
    const y = m[3] ?? "";
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString().slice(0, 10);
}

export function parseImport(text: string): ImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  const first = lines[0] ?? "";
  const delim = first.includes("\t") ? "\t" : first.includes(";") ? ";" : ",";
  const header = splitLine(first, delim).map((h) => h.toLowerCase().replace(/[_]/g, " "));

  const index: Partial<Record<keyof Omit<ImportRow, "valid">, number>> = {};
  (Object.keys(ALIASES) as (keyof typeof ALIASES)[]).forEach((key) => {
    const i = header.findIndex((h) => ALIASES[key].includes(h));
    if (i >= 0) index[key] = i;
  });

  const hasHeader = Object.keys(index).length > 0;
  const body = hasHeader ? lines.slice(1) : lines;
  if (!hasHeader) {
    // positional fallback
    index.company = 0;
    index.industry = 1;
    index.priority = 2;
    index.contactName = 3;
    index.position = 4;
    index.phone = 5;
    index.email = 6;
    index.lastContact = 7;
  }

  const at = (cells: string[], key: keyof typeof ALIASES) => {
    const i = index[key];
    if (i === undefined) return null;
    const v = cells[i];
    return v && v.length ? v : null;
  };

  return body.map((line) => {
    const cells = splitLine(line, delim);
    const company = at(cells, "company") ?? "";
    return {
      company,
      industry: at(cells, "industry"),
      priority: normalisePriority(at(cells, "priority")),
      contactName: at(cells, "contactName"),
      position: at(cells, "position"),
      phone: at(cells, "phone"),
      email: at(cells, "email"),
      lastContact: normaliseDate(at(cells, "lastContact")),
      valid: company.trim().length > 0,
    };
  });
}

export function BulkImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [busy, setBusy] = useState(false);

  const valid = (rows ?? []).filter((r) => r.valid);
  const skipped = (rows ?? []).length - valid.length;

  function reset() {
    setText("");
    setRows(null);
  }

  async function runImport() {
    setBusy(true);
    try {
      const { data: existing } = await supabase.from("companies").select("id,name");
      const byName = new Map(
        (existing ?? []).map((c) => [c.name.trim().toLowerCase(), c.id as string]),
      );
      let companiesAdded = 0;
      let contactsAdded = 0;

      for (const r of valid) {
        const key = r.company.trim().toLowerCase();
        let companyId = byName.get(key);
        if (!companyId) {
          const { data, error } = await supabase
            .from("companies")
            .insert({
              name: r.company.trim(),
              industry: r.industry,
              priority: r.priority ?? "Medium",
              status: "Lead",
              last_contact_at: r.lastContact ? new Date(r.lastContact).toISOString() : null,
            })
            .select("id")
            .single();
          if (error) throw error;
          companyId = data.id as string;
          byName.set(key, companyId);
          companiesAdded++;
        }
        if (r.contactName) {
          const { error } = await supabase.from("contacts").insert({
            company_id: companyId,
            full_name: r.contactName,
            position: r.position,
            phone: r.phone,
            email: r.email,
          });
          if (error) throw error;
          contactsAdded++;
        }
      }

      await qc.invalidateQueries();
      toast.success(`${companiesAdded} companies and ${contactsAdded} contacts added`);
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk import clients</DialogTitle>
          <DialogDescription>
            Paste rows or upload a CSV. Columns: company name, industry, priority, contact name,
            position, phone, email, last contact date.
          </DialogDescription>
        </DialogHeader>

        {!rows ? (
          <div className="space-y-3">
            <Textarea
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Company,Industry,Priority,Contact,Position,Phone,Email,Last contact\nAcme Group,Logistics,High,Aida Toktogul,Travel Manager,+996700112233,aida@acme.kg,2026-08-30"}
              className="font-mono text-xs"
            />
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.tsv,.txt"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setText(await f.text());
                  e.target.value = "";
                }}
              />
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" /> Upload CSV
              </Button>
              <Button
                type="button"
                className="ml-auto"
                disabled={!text.trim()}
                onClick={() => setRows(parseImport(text))}
              >
                Preview
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {valid.length} rows ready
              {skipped > 0 && ` · ${skipped} skipped (missing company name)`}
            </p>
            <div className="max-h-[45vh] overflow-auto rounded-sm border border-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-2 py-2">Company</th>
                    <th className="px-2 py-2">Industry</th>
                    <th className="px-2 py-2">Priority</th>
                    <th className="px-2 py-2">Contact</th>
                    <th className="px-2 py-2">Position</th>
                    <th className="px-2 py-2">Phone</th>
                    <th className="px-2 py-2">Email</th>
                    <th className="px-2 py-2">Last contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r, i) => (
                    <tr key={i} className={r.valid ? "" : "bg-overdue/5 text-muted-foreground"}>
                      <td className="px-2 py-1.5">
                        {r.valid ? r.company : <Pill tone="overdue">Skipped</Pill>}
                      </td>
                      <td className="px-2 py-1.5">{r.industry ?? "—"}</td>
                      <td className="px-2 py-1.5">{r.priority ?? "Medium"}</td>
                      <td className="px-2 py-1.5">{r.contactName ?? "—"}</td>
                      <td className="px-2 py-1.5">{r.position ?? "—"}</td>
                      <td className="px-2 py-1.5">{r.phone ?? "—"}</td>
                      <td className="px-2 py-1.5">{r.email ?? "—"}</td>
                      <td className="px-2 py-1.5 font-mono">{r.lastContact ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          {rows && (
            <Button type="button" variant="outline" onClick={() => setRows(null)}>
              Back
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {rows && (
            <Button type="button" disabled={busy || valid.length === 0} onClick={runImport}>
              {busy ? "Importing…" : `Import ${valid.length} rows`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
