import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCompanies, useContacts, useMeetings, useRequests } from "@/lib/api";
import { formatDate } from "@/lib/crm";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const { data: companies = [] } = useCompanies();
  const { data: contacts = [] } = useContacts();
  const { data: meetings = [] } = useMeetings();
  const { data: requests = [] } = useRequests();

  const companyName = (id: string | null) =>
    companies.find((c) => c.id === id)?.name ?? "Unassigned";

  function go(to: "/clients" | "/contacts" | "/calendar" | "/requests", id?: string) {
    onOpenChange(false);
    if (to === "/clients" && id) {
      navigate({ to: "/clients/$id", params: { id } });
      return;
    }
    navigate({ to });
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search clients, contacts, meetings, requests…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>

        <CommandGroup heading="Clients">
          {companies.slice(0, 30).map((c) => (
            <CommandItem key={c.id} value={`client ${c.name}`} onSelect={() => go("/clients", c.id)}>
              <span>{c.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{c.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Contacts">
          {contacts.slice(0, 30).map((c) => (
            <CommandItem
              key={c.id}
              value={`contact ${c.full_name} ${companyName(c.company_id)}`}
              onSelect={() => go("/clients", c.company_id)}
            >
              <span>{c.full_name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {companyName(c.company_id)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Meetings">
          {meetings.slice(0, 20).map((m) => (
            <CommandItem
              key={m.id}
              value={`meeting ${m.purpose ?? ""} ${companyName(m.company_id)}`}
              onSelect={() => go("/calendar")}
            >
              <span>{m.purpose || m.meeting_type}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatDate(m.meeting_date)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Requests">
          {requests.slice(0, 20).map((r) => (
            <CommandItem
              key={r.id}
              value={`request ${r.title} ${companyName(r.company_id)}`}
              onSelect={() => go("/requests")}
            >
              <span>{r.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{r.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
