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
      delivery_zones: {
        Row: {
          city_area: string | null
          created_at: string | null
          delivery_fee: number
          eta_max: number
          eta_min: number
          id: string
          is_active: boolean
          min_order_amount: number
          postal_code: string
        }
        Insert: {
          city_area?: string | null
          created_at?: string | null
          delivery_fee?: number
          eta_max?: number
          eta_min?: number
          id?: string
          is_active?: boolean
          min_order_amount?: number
          postal_code: string
        }
        Update: {
          city_area?: string | null
          created_at?: string | null
          delivery_fee?: number
          eta_max?: number
          eta_min?: number
          id?: string
          is_active?: boolean
          min_order_amount?: number
          postal_code?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string | null
          discount_type: string
          expires_at: string | null
          id: string
          max_uses: number | null
          min_order_amount: number
          used_count: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string | null
          discount_type: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order_amount?: number
          used_count?: number
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string | null
          discount_type?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order_amount?: number
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      loyalty_customers: {
        Row: {
          created_at: string | null
          free_pizzas_awarded: number
          id: string
          last_order_at: string | null
          phone: string
          pizza_count: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          free_pizzas_awarded?: number
          id?: string
          last_order_at?: string | null
          phone: string
          pizza_count?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          free_pizzas_awarded?: number
          id?: string
          last_order_at?: string | null
          phone?: string
          pizza_count?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_rewards: {
        Row: {
          created_at: string | null
          discount_code_id: string
          id: string
          phone: string
          reward_type: string
        }
        Insert: {
          created_at?: string | null
          discount_code_id: string
          id?: string
          phone: string
          reward_type: string
        }
        Update: {
          created_at?: string | null
          discount_code_id?: string
          id?: string
          phone?: string
          reward_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          discount_code_id: string | null
          email: string
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          discount_code_id?: string | null
          email: string
          id?: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          discount_code_id?: string | null
          email?: string
          id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_subscribers_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_hours: {
        Row: {
          close_time: string
          created_at: string | null
          day_of_week: number
          id: string
          is_open: boolean
          open_time: string
        }
        Insert: {
          close_time: string
          created_at?: string | null
          day_of_week: number
          id?: string
          is_open?: boolean
          open_time: string
        }
        Update: {
          close_time?: string
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_open?: boolean
          open_time?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          city: string
          created_at: string | null
          customer_name: string
          delivery_fee: number
          discount_amount: number
          email: string | null
          id: string
          notes: string | null
          payment_method: string
          phone: string
          postal_code: string
          shopify_checkout_id: string | null
          shopify_order_id: string | null
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          customer_name: string
          delivery_fee?: number
          discount_amount?: number
          email?: string | null
          id?: string
          notes?: string | null
          payment_method: string
          phone: string
          postal_code: string
          shopify_checkout_id?: string | null
          shopify_order_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          customer_name?: string
          delivery_fee?: number
          discount_amount?: number
          email?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          phone?: string
          postal_code?: string
          shopify_checkout_id?: string | null
          shopify_order_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
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
