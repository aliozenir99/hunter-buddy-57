import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Row = Record<string, unknown>;

export interface AccountManager {
  id: string;
  name: string;
  email: string | null;
  department: string | null;
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  company_type: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  status: string;
  lead_source: string | null;
  priority: string;
  potential_value: number | null;
  account_manager_id: string | null;
  relationship_strength: string | null;
  business_potential: string | null;
  engagement: string | null;
  interests: string[] | null;
  important_notes: string | null;
  next_action: string | null;
  last_contact_at: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  company_id: string;
  full_name: string;
  position: string | null;
  phone: string | null;
  email: string | null;
  telegram: string | null;
  whatsapp: string | null;
  is_decision_maker: boolean;
  is_influencer: boolean;
  notes: string | null;
}

export interface Meeting {
  id: string;
  company_id: string | null;
  contact_id: string | null;
  meeting_date: string;
  meeting_time: string | null;
  location: string | null;
  meeting_type: string;
  purpose: string | null;
  preparation_notes: string | null;
  discussion: string | null;
  client_needs: string | null;
  requests: string | null;
  pain_points: string | null;
  objections: string | null;
  opportunities: string | null;
  competitors: string | null;
  decision_maker: string | null;
  budget: string | null;
  timeline: string | null;
  next_steps: string | null;
  personal_notes: string | null;
  is_completed: boolean;
}

export interface RequestRow {
  id: string;
  company_id: string;
  contact_id: string | null;
  meeting_id: string | null;
  title: string;
  request_type: string | null;
  request_date: string;
  details: string | null;
  check_in: string | null;
  check_out: string | null;
  rooms: number | null;
  room_type: string | null;
  guests: number | null;
  event_date: string | null;
  conference_room: string | null;
  fnb: string | null;
  special_requirements: string | null;
  budget: string | null;
  deadline: string | null;
  status: string;
  account_manager_id: string | null;
}

export interface Opportunity {
  id: string;
  company_id: string;
  contact_id: string | null;
  name: string;
  potential_business: string | null;
  estimated_value: number | null;
  probability: number | null;
  expected_decision_date: string | null;
  source: string | null;
  stage: string;
  next_action: string | null;
  notes: string | null;
  account_manager_id: string | null;
  handover_date: string | null;
}

export interface FollowUp {
  id: string;
  company_id: string | null;
  meeting_id: string | null;
  opportunity_id: string | null;
  task: string;
  due_date: string;
  priority: string;
  responsible: string | null;
  status: string;
  notes: string | null;
}

export interface Activity {
  id: string;
  company_id: string | null;
  contact_id: string | null;
  meeting_id: string | null;
  activity_type: string;
  subject: string;
  summary: string | null;
  activity_date: string;
  duration_minutes: number | null;
}

export interface Handover {
  id: string;
  company_id: string;
  opportunity_id: string | null;
  account_manager_id: string | null;
  client_summary: string | null;
  relationship: string | null;
  business_need: string | null;
  opportunity_summary: string | null;
  requirements: string | null;
  budget: string | null;
  decision_maker: string | null;
  timeline: string | null;
  competitors: string | null;
  concerns: string | null;
  recommended_approach: string | null;
  previous_communication: string | null;
  status: string;
  handover_date: string | null;
  created_at: string;
}

export interface EmailDraft {
  id: string;
  company_id: string | null;
  request_id: string | null;
  subject: string;
  body: string;
  language: string | null;
  tone: string | null;
  created_at: string;
}

async function selectAll<T>(table: string, order: string, ascending = true): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(order, { ascending });
  if (error) throw error;
  return (data ?? []) as T[];
}

export const useCompanies = () =>
  useQuery({ queryKey: ["companies"], queryFn: () => selectAll<Company>("companies", "name") });

export const useContacts = () =>
  useQuery({ queryKey: ["contacts"], queryFn: () => selectAll<Contact>("contacts", "full_name") });

export const useMeetings = () =>
  useQuery({
    queryKey: ["meetings"],
    queryFn: () => selectAll<Meeting>("meetings", "meeting_date", false),
  });

export const useRequests = () =>
  useQuery({
    queryKey: ["requests"],
    queryFn: () => selectAll<RequestRow>("requests", "request_date", false),
  });

export const useOpportunities = () =>
  useQuery({
    queryKey: ["opportunities"],
    queryFn: () => selectAll<Opportunity>("opportunities", "estimated_value", false),
  });

export const useFollowUps = () =>
  useQuery({
    queryKey: ["follow_ups"],
    queryFn: () => selectAll<FollowUp>("follow_ups", "due_date"),
  });

export const useActivities = () =>
  useQuery({
    queryKey: ["activities"],
    queryFn: () => selectAll<Activity>("activities", "activity_date", false),
  });

export const useAccountManagers = () =>
  useQuery({
    queryKey: ["account_managers"],
    queryFn: () => selectAll<AccountManager>("account_managers", "name"),
  });

export const useHandovers = () =>
  useQuery({
    queryKey: ["handovers"],
    queryFn: () => selectAll<Handover>("handovers", "created_at", false),
  });

export const useEmailDrafts = () =>
  useQuery({
    queryKey: ["email_drafts"],
    queryFn: () => selectAll<EmailDraft>("email_drafts", "created_at", false),
  });

export function useUpsert(table: string, label = "Saved") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Row & { id?: string }) => {
      const { id, ...rest } = values;
      if (id) {
        const { data, error } = await supabase
          .from(table)
          .update(rest)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from(table).insert(rest).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success(label);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemove(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
