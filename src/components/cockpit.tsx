import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-sm border border-border bg-card ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </h2>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "overdue" | "today" | "done" | "primary";
}) {
  const toneClass = {
    default: "text-foreground",
    overdue: "text-overdue",
    today: "text-today",
    done: "text-done",
    primary: "text-primary",
  }[tone];
  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Pill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "overdue" | "today" | "done" | "primary";
}) {
  const map = {
    muted: "border-border bg-muted text-muted-foreground",
    overdue: "border-overdue/30 bg-overdue/10 text-overdue",
    today: "border-today/30 bg-today/10 text-today",
    done: "border-done/30 bg-done/10 text-done",
    primary: "border-primary/30 bg-primary/10 text-primary",
  };
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function Empty({ label }: { label: string }) {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">{label}</p>
  );
}

/* ---------------- Generic record form ---------------- */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "time"
  | "select"
  | "multiselect"
  | "checkbox";

export interface FieldSpec {
  name: string;
  label: string;
  type?: FieldType;
  options?: readonly string[] | { value: string; label: string }[];
  required?: boolean;
  full?: boolean;
}

export type RecordValues = Record<string, unknown>;

export function RecordDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initial,
  onSubmit,
  pending,
  onDelete,
  deleteName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  fields: FieldSpec[];
  initial?: RecordValues;
  onSubmit: (values: RecordValues) => void;
  pending?: boolean;
  onDelete?: () => void;
  deleteName?: string;
}) {
  const [confirm, setConfirm] = useState(false);
  const [values, setValues] = useState<RecordValues>(initial ?? {});

  useEffect(() => {
    if (open) setValues(initial ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set(name: string, value: unknown) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(values);
          }}
        >
          {fields.map((f) => {
            const type = f.type ?? "text";
            const value = values[f.name];
            const options = (f.options ?? []).map((o) =>
              typeof o === "string" ? { value: o, label: o } : o,
            );
            return (
              <div
                key={f.name}
                className={`space-y-1.5 ${f.full || type === "textarea" ? "sm:col-span-2" : ""}`}
              >
                <Label htmlFor={f.name} className="text-xs">
                  {f.label}
                </Label>
                {type === "textarea" && (
                  <Textarea
                    id={f.name}
                    rows={3}
                    value={(value as string) ?? ""}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                )}
                {type === "select" && (
                  <select
                    id={f.name}
                    className="h-9 w-full rounded-sm border border-input bg-background px-2 text-sm"
                    value={(value as string) ?? ""}
                    onChange={(e) => set(f.name, e.target.value || null)}
                  >
                    <option value="">—</option>
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
                {type === "checkbox" && (
                  <div className="flex h-9 items-center">
                    <Checkbox
                      id={f.name}
                      checked={Boolean(value)}
                      onCheckedChange={(c) => set(f.name, Boolean(c))}
                    />
                  </div>
                )}
                {["text", "number", "date", "time"].includes(type) && (
                  <Input
                    id={f.name}
                    type={type}
                    required={f.required}
                    value={(value as string) ?? ""}
                    onChange={(e) =>
                      set(
                        f.name,
                        type === "number"
                          ? e.target.value === ""
                            ? null
                            : Number(e.target.value)
                          : e.target.value || null,
                      )
                    }
                  />
                )}
              </div>
            );
          })}

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
