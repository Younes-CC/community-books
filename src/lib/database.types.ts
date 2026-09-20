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
      admins: {
        Row: {
          created_at: string
          email: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          id: number
          meta: Json | null
          order_id: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          id?: never
          meta?: Json | null
          order_id?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          id?: never
          meta?: Json | null
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          created_at: string
          description: string
          id: string
          image_path: string | null
          is_active: boolean
          slug: string
          stock_available: number
          stock_total: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          slug: string
          stock_available?: number
          stock_total?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          slug?: string
          stock_available?: number
          stock_total?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          book_id: string
          book_title_snapshot: string
          cancelled_at: string | null
          city: string | null
          completed_at: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string
          fulfillment_type: string
          house_number: string | null
          id: string
          last_name: string
          notes: string | null
          order_number: string
          order_status: string
          paid_at: string | null
          payment_status: string
          postal_code: string | null
          reservation_expires_at: string | null
          shipped_at: string | null
          shipping_price: number
          social_username: string | null
          stock_returned: boolean
          street: string | null
          total: number
          updated_at: string
        }
        Insert: {
          book_id: string
          book_title_snapshot: string
          cancelled_at?: string | null
          city?: string | null
          completed_at?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name: string
          fulfillment_type: string
          house_number?: string | null
          id?: string
          last_name: string
          notes?: string | null
          order_number: string
          order_status?: string
          paid_at?: string | null
          payment_status?: string
          postal_code?: string | null
          reservation_expires_at?: string | null
          shipped_at?: string | null
          shipping_price?: number
          social_username?: string | null
          stock_returned?: boolean
          street?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          book_id?: string
          book_title_snapshot?: string
          cancelled_at?: string | null
          city?: string | null
          completed_at?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string
          fulfillment_type?: string
          house_number?: string | null
          id?: string
          last_name?: string
          notes?: string | null
          order_number?: string
          order_status?: string
          paid_at?: string | null
          payment_status?: string
          postal_code?: string | null
          reservation_expires_at?: string | null
          shipped_at?: string | null
          shipping_price?: number
          social_username?: string | null
          stock_returned?: boolean
          street?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: boolean
          payment_url: string | null
          reservation_duration_hours: number
          shipping_price: number
          updated_at: string
        }
        Insert: {
          id?: boolean
          payment_url?: string | null
          reservation_duration_hours?: number
          shipping_price?: number
          updated_at?: string
        }
        Update: {
          id?: boolean
          payment_url?: string | null
          reservation_duration_hours?: number
          shipping_price?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_order_status: {
        Args: { p_action: string; p_order_id: string }
        Returns: {
          book_id: string
          book_title_snapshot: string
          cancelled_at: string | null
          city: string | null
          completed_at: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string
          fulfillment_type: string
          house_number: string | null
          id: string
          last_name: string
          notes: string | null
          order_number: string
          order_status: string
          paid_at: string | null
          payment_status: string
          postal_code: string | null
          reservation_expires_at: string | null
          shipped_at: string | null
          shipping_price: number
          social_username: string | null
          stock_returned: boolean
          street: string | null
          total: number
          updated_at: string
        }
      }
      create_reservation: {
        Args: {
          p_book_id: string
          p_city: string
          p_country: string
          p_email: string
          p_first_name: string
          p_fulfillment_type: string
          p_house_number: string
          p_last_name: string
          p_postal_code: string
          p_social_username: string
          p_street: string
        }
        Returns: {
          order_id: string
          order_number: string
          order_status: string
          payment_status: string
          reservation_expires_at: string
          shipping_price: number
          total: number
        }[]
      }
      expire_expired_reservations: { Args: never; Returns: number }
      generate_order_number: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
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
