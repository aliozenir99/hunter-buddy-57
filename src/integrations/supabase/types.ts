export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_managers: {
        Row: {
          created_at: string
          created_by: string
          department: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          department?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          department?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          activity_date: string
          activity_type: string
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          duration_minutes: number | null
          id: string
          meeting_id: string | null
          subject: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          activity_date?: string
          activity_type?: string
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          duration_minutes?: number | null
          id?: string
          meeting_id?: string | null
          subject: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          duration_minutes?: number | null
          id?: string
          meeting_id?: string | null
          subject?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          account_manager_id: string | null
          address: string | null
          business_potential: string | null
          city: string | null
          company_type: string | null
          country: string | null
          created_at: string
          created_by: string
          engagement: string | null
          id: string
          important_notes: string | null
          industry: string | null
          interests: string[] | null
          last_contact_at: string | null
          lead_source: string | null
          name: string
          next_action: string | null
          potential_value: number | null
          priority: string
          relationship_strength: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          account_manager_id?: string | null
          address?: string | null
          business_potential?: string | null
          city?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string
          created_by?: string
          engagement?: string | null
          id?: string
          important_notes?: string | null
          industry?: string | null
          interests?: string[] | null
          last_contact_at?: string | null
          lead_source?: string | null
          name: string
          next_action?: string | null
          potential_value?: number | null
          priority?: string
          relationship_strength?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_manager_id?: string | null
          address?: string | null
          business_potential?: string | null
          city?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string
          created_by?: string
          engagement?: string | null
          id?: string
          important_notes?: string | null
          industry?: string | null
          interests?: string[] | null
          last_contact_at?: string | null
          lead_source?: string | null
          name?: string
          next_action?: string | null
          potential_value?: number | null
          priority?: string
          relationship_strength?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "account_managers"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          email: string | null
          full_name: string
          id: string
          is_decision_maker: boolean
          is_influencer: boolean
          notes: string | null
          phone: string | null
          position: string | null
          telegram: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string
          email?: string | null
          full_name: string
          id?: string
          is_decision_maker?: boolean
          is_influencer?: boolean
          notes?: string | null
          phone?: string | null
          position?: string | null
          telegram?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          email?: string | null
          full_name?: string
          id?: string
          is_decision_maker?: boolean
          is_influencer?: boolean
          notes?: string | null
          phone?: string | null
          position?: string | null
          telegram?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      email_drafts: {
        Row: {
          body: string
          company_id: string | null
          created_at: string
          created_by: string
          id: string
          language: string | null
          request_id: string | null
          subject: string
          tone: string | null
          updated_at: string
        }
        Insert: {
          body: string
          company_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          language?: string | null
          request_id?: string | null
          subject: string
          tone?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          company_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          language?: string | null
          request_id?: string | null
          subject?: string
          tone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_drafts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_drafts_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string
          due_date: string
          id: string
          meeting_id: string | null
          notes: string | null
          opportunity_id: string | null
          priority: string
          responsible: string | null
          status: string
          task: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string
          due_date?: string
          id?: string
          meeting_id?: string | null
          notes?: string | null
          opportunity_id?: string | null
          priority?: string
          responsible?: string | null
          status?: string
          task: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string
          due_date?: string
          id?: string
          meeting_id?: string | null
          notes?: string | null
          opportunity_id?: string | null
          priority?: string
          responsible?: string | null
          status?: string
          task?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      handovers: {
        Row: {
          account_manager_id: string | null
          budget: string | null
          business_need: string | null
          client_summary: string | null
          company_id: string
          competitors: string | null
          concerns: string | null
          created_at: string
          created_by: string
          decision_maker: string | null
          handover_date: string | null
          id: string
          opportunity_id: string | null
          opportunity_summary: string | null
          previous_communication: string | null
          recommended_approach: string | null
          relationship: string | null
          requirements: string | null
          status: string
          timeline: string | null
          updated_at: string
        }
        Insert: {
          account_manager_id?: string | null
          budget?: string | null
          business_need?: string | null
          client_summary?: string | null
          company_id: string
          competitors?: string | null
          concerns?: string | null
          created_at?: string
          created_by?: string
          decision_maker?: string | null
          handover_date?: string | null
          id?: string
          opportunity_id?: string | null
          opportunity_summary?: string | null
          previous_communication?: string | null
          recommended_approach?: string | null
          relationship?: string | null
          requirements?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          account_manager_id?: string | null
          budget?: string | null
          business_need?: string | null
          client_summary?: string | null
          company_id?: string
          competitors?: string | null
          concerns?: string | null
          created_at?: string
          created_by?: string
          decision_maker?: string | null
          handover_date?: string | null
          id?: string
          opportunity_id?: string | null
          opportunity_summary?: string | null
          previous_communication?: string | null
          recommended_approach?: string | null
          relationship?: string | null
          requirements?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "handovers_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "account_managers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handovers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handovers_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          budget: string | null
          client_needs: string | null
          company_id: string | null
          competitors: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          decision_maker: string | null
          discussion: string | null
          id: string
          is_completed: boolean
          location: string | null
          meeting_date: string
          meeting_time: string | null
          meeting_type: string
          next_steps: string | null
          objections: string | null
          opportunities: string | null
          pain_points: string | null
          personal_notes: string | null
          preparation_notes: string | null
          purpose: string | null
          requests: string | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          budget?: string | null
          client_needs?: string | null
          company_id?: string | null
          competitors?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          decision_maker?: string | null
          discussion?: string | null
          id?: string
          is_completed?: boolean
          location?: string | null
          meeting_date: string
          meeting_time?: string | null
          meeting_type?: string
          next_steps?: string | null
          objections?: string | null
          opportunities?: string | null
          pain_points?: string | null
          personal_notes?: string | null
          preparation_notes?: string | null
          purpose?: string | null
          requests?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          budget?: string | null
          client_needs?: string | null
          company_id?: string | null
          competitors?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          decision_maker?: string | null
          discussion?: string | null
          id?: string
          is_completed?: boolean
          location?: string | null
          meeting_date?: string
          meeting_time?: string | null
          meeting_type?: string
          next_steps?: string | null
          objections?: string | null
          opportunities?: string | null
          pain_points?: string | null
          personal_notes?: string | null
          preparation_notes?: string | null
          purpose?: string | null
          requests?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          account_manager_id: string | null
          company_id: string
          contact_id: string | null
          created_at: string
          created_by: string
          estimated_value: number | null
          expected_decision_date: string | null
          handover_date: string | null
          id: string
          name: string
          next_action: string | null
          notes: string | null
          potential_business: string | null
          probability: number | null
          source: string | null
          stage: string
          updated_at: string
        }
        Insert: {
          account_manager_id?: string | null
          company_id: string
          contact_id?: string | null
          created_at?: string
          created_by?: string
          estimated_value?: number | null
          expected_decision_date?: string | null
          handover_date?: string | null
          id?: string
          name: string
          next_action?: string | null
          notes?: string | null
          potential_business?: string | null
          probability?: number | null
          source?: string | null
          stage?: string
          updated_at?: string
        }
        Update: {
          account_manager_id?: string | null
          company_id?: string
          contact_id?: string | null
          created_at?: string
          created_by?: string
          estimated_value?: number | null
          expected_decision_date?: string | null
          handover_date?: string | null
          id?: string
          name?: string
          next_action?: string | null
          notes?: string | null
          potential_business?: string | null
          probability?: number | null
          source?: string | null
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "account_managers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role_title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role_title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          account_manager_id: string | null
          budget: string | null
          check_in: string | null
          check_out: string | null
          company_id: string
          conference_room: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          deadline: string | null
          details: string | null
          event_date: string | null
          fnb: string | null
          guests: number | null
          id: string
          meeting_id: string | null
          request_date: string
          request_type: string | null
          room_type: string | null
          rooms: number | null
          special_requirements: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          account_manager_id?: string | null
          budget?: string | null
          check_in?: string | null
          check_out?: string | null
          company_id: string
          conference_room?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          deadline?: string | null
          details?: string | null
          event_date?: string | null
          fnb?: string | null
          guests?: number | null
          id?: string
          meeting_id?: string | null
          request_date?: string
          request_type?: string | null
          room_type?: string | null
          rooms?: number | null
          special_requirements?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          account_manager_id?: string | null
          budget?: string | null
          check_in?: string | null
          check_out?: string | null
          company_id?: string
          conference_room?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          deadline?: string | null
          details?: string | null
          event_date?: string | null
          fnb?: string | null
          guests?: number | null
          id?: string
          meeting_id?: string | null
          request_date?: string
          request_type?: string | null
          room_type?: string | null
          rooms?: number | null
          special_requirements?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "account_managers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
