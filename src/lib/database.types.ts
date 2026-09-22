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
      connected_accounts: {
        Row: {
          avatar_url: string | null
          connected_at: string | null
          created_at: string
          disconnected_at: string | null
          display_name: string
          environment: string | null
          external_account_id: string
          granted_scopes: string[]
          id: string
          last_error: string | null
          last_synced_at: string | null
          platform: string
          status: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          connected_at?: string | null
          created_at?: string
          disconnected_at?: string | null
          display_name: string
          environment?: string | null
          external_account_id: string
          granted_scopes?: string[]
          id?: string
          last_error?: string | null
          last_synced_at?: string | null
          platform: string
          status?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          connected_at?: string | null
          created_at?: string
          disconnected_at?: string | null
          display_name?: string
          environment?: string | null
          external_account_id?: string
          granted_scopes?: string[]
          id?: string
          last_error?: string | null
          last_synced_at?: string | null
          platform?: string
          status?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connected_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_checkins: {
        Row: {
          checked_in_at: string
          created_at: string
          goal_id: string
          id: string
          note: string | null
          user_id: string
          value: number
        }
        Insert: {
          checked_in_at?: string
          created_at?: string
          goal_id: string
          id?: string
          note?: string | null
          user_id?: string
          value: number
        }
        Update: {
          checked_in_at?: string
          created_at?: string
          goal_id?: string
          id?: string
          note?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_checkins_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          current_value: number
          deadline: string
          description: string
          id: string
          target_value: number
          title: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          deadline: string
          description?: string
          id?: string
          target_value: number
          title: string
          unit: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          deadline?: string
          description?: string
          id?: string
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inbox_items: {
        Row: {
          action_label: string
          category: string
          created_at: string
          description: string
          dismissed_at: string | null
          event_at: string
          href: string
          id: string
          metadata: Json
          read_at: string | null
          resolved_at: string | null
          source_key: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_label?: string
          category: string
          created_at?: string
          description?: string
          dismissed_at?: string | null
          event_at?: string
          href?: string
          id?: string
          metadata?: Json
          read_at?: string | null
          resolved_at?: string | null
          source_key: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_label?: string
          category?: string
          created_at?: string
          description?: string
          dismissed_at?: string | null
          event_at?: string
          href?: string
          id?: string
          metadata?: Json
          read_at?: string | null
          resolved_at?: string | null
          source_key?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbox_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_credentials: {
        Row: {
          access_token: string
          connected_account_id: string
          created_at: string
          expires_at: string | null
          refresh_expires_at: string | null
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          connected_account_id: string
          created_at?: string
          expires_at?: string | null
          refresh_expires_at?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          connected_account_id?: string
          created_at?: string
          expires_at?: string | null
          refresh_expires_at?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_credentials_connected_account_id_fkey"
            columns: ["connected_account_id"]
            isOneToOne: true
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          appearance: string
          created_at: string
          currency: string
          display_name: string
          email: string | null
          id: string
          notifications: boolean
          start_of_week: string
          timezone: string
          updated_at: string
        }
        Insert: {
          appearance?: string
          created_at?: string
          currency?: string
          display_name?: string
          email?: string | null
          id: string
          notifications?: boolean
          start_of_week?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          appearance?: string
          created_at?: string
          currency?: string
          display_name?: string
          email?: string | null
          id?: string
          notifications?: boolean
          start_of_week?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_snapshots: {
        Row: {
          captured_at: string
          connected_account_id: string
          created_at: string
          followers: number | null
          following: number | null
          id: string
          likes: number | null
          provider: string
          source_data: Json
          user_id: string
          videos: number | null
          views: number | null
        }
        Insert: {
          captured_at?: string
          connected_account_id: string
          created_at?: string
          followers?: number | null
          following?: number | null
          id?: string
          likes?: number | null
          provider: string
          source_data?: Json
          user_id: string
          videos?: number | null
          views?: number | null
        }
        Update: {
          captured_at?: string
          connected_account_id?: string
          created_at?: string
          followers?: number | null
          following?: number | null
          id?: string
          likes?: number | null
          provider?: string
          source_data?: Json
          user_id?: string
          videos?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_snapshots_connected_account_id_fkey"
            columns: ["connected_account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          active: boolean
          amount: number
          billing_cycle: string
          category: string
          created_at: string
          currency: string
          custom_interval_days: number | null
          icon: string | null
          id: string
          name: string
          renewal_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          billing_cycle: string
          category?: string
          created_at?: string
          currency: string
          custom_interval_days?: number | null
          icon?: string | null
          id?: string
          name: string
          renewal_date: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          active?: boolean
          amount?: number
          billing_cycle?: string
          category?: string
          created_at?: string
          currency?: string
          custom_interval_days?: number | null
          icon?: string | null
          id?: string
          name?: string
          renewal_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          period_month: string | null
          priority: string
          scope: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          period_month?: string | null
          priority?: string
          scope?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          period_month?: string | null
          priority?: string
          scope?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
