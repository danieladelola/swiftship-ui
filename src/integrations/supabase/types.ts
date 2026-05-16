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
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipment_updates: {
        Row: {
          created_at: string
          id: string
          location: string | null
          note: string | null
          shipment_id: string
          status: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          note?: string | null
          shipment_id: string
          status?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          note?: string | null
          shipment_id?: string
          status?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_updates_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          created_at: string
          created_by: string | null
          current_location: string | null
          delivery_fee: number | null
          delivery_location: string | null
          estimated_delivery_date: string | null
          id: string
          note: string | null
          package_name: string | null
          package_quantity: number | null
          package_type: string | null
          package_weight: number | null
          payment_status: string | null
          pickup_location: string | null
          receiver_address: string | null
          receiver_email: string | null
          receiver_name: string
          receiver_phone: string | null
          sender_address: string | null
          sender_email: string | null
          sender_name: string
          sender_phone: string | null
          status: string
          tracking_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_location?: string | null
          delivery_fee?: number | null
          delivery_location?: string | null
          estimated_delivery_date?: string | null
          id?: string
          note?: string | null
          package_name?: string | null
          package_quantity?: number | null
          package_type?: string | null
          package_weight?: number | null
          payment_status?: string | null
          pickup_location?: string | null
          receiver_address?: string | null
          receiver_email?: string | null
          receiver_name: string
          receiver_phone?: string | null
          sender_address?: string | null
          sender_email?: string | null
          sender_name: string
          sender_phone?: string | null
          status?: string
          tracking_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_location?: string | null
          delivery_fee?: number | null
          delivery_location?: string | null
          estimated_delivery_date?: string | null
          id?: string
          note?: string | null
          package_name?: string | null
          package_quantity?: number | null
          package_type?: string | null
          package_weight?: number | null
          payment_status?: string | null
          pickup_location?: string | null
          receiver_address?: string | null
          receiver_email?: string | null
          receiver_name?: string
          receiver_phone?: string | null
          sender_address?: string | null
          sender_email?: string | null
          sender_name?: string
          sender_phone?: string | null
          status?: string
          tracking_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          accent_color: string
          address: string
          button_color: string
          created_at: string
          dark_logo_url: string | null
          default_delivery_note: string
          default_payment_status: string
          default_status: string
          email: string
          favicon_url: string | null
          footer_text: string
          google_map_embed: string | null
          id: string
          light_logo_url: string | null
          main_logo_url: string | null
          pdf_footer_note: string
          pdf_logo_url: string | null
          pdf_show_company_address: boolean
          pdf_show_payment_status: boolean
          pdf_show_receiver_email: boolean
          pdf_show_sender: boolean
          pdf_terms: string
          pdf_title: string
          phone: string
          primary_color: string
          secondary_color: string
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_twitter: string | null
          text_color: string
          tracking_prefix: string
          updated_at: string
          website_name: string
          website_tagline: string
          whatsapp: string
        }
        Insert: {
          accent_color?: string
          address?: string
          button_color?: string
          created_at?: string
          dark_logo_url?: string | null
          default_delivery_note?: string
          default_payment_status?: string
          default_status?: string
          email?: string
          favicon_url?: string | null
          footer_text?: string
          google_map_embed?: string | null
          id?: string
          light_logo_url?: string | null
          main_logo_url?: string | null
          pdf_footer_note?: string
          pdf_logo_url?: string | null
          pdf_show_company_address?: boolean
          pdf_show_payment_status?: boolean
          pdf_show_receiver_email?: boolean
          pdf_show_sender?: boolean
          pdf_terms?: string
          pdf_title?: string
          phone?: string
          primary_color?: string
          secondary_color?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          text_color?: string
          tracking_prefix?: string
          updated_at?: string
          website_name?: string
          website_tagline?: string
          whatsapp?: string
        }
        Update: {
          accent_color?: string
          address?: string
          button_color?: string
          created_at?: string
          dark_logo_url?: string | null
          default_delivery_note?: string
          default_payment_status?: string
          default_status?: string
          email?: string
          favicon_url?: string | null
          footer_text?: string
          google_map_embed?: string | null
          id?: string
          light_logo_url?: string | null
          main_logo_url?: string | null
          pdf_footer_note?: string
          pdf_logo_url?: string | null
          pdf_show_company_address?: boolean
          pdf_show_payment_status?: boolean
          pdf_show_receiver_email?: boolean
          pdf_show_sender?: boolean
          pdf_terms?: string
          pdf_title?: string
          phone?: string
          primary_color?: string
          secondary_color?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          text_color?: string
          tracking_prefix?: string
          updated_at?: string
          website_name?: string
          website_tagline?: string
          whatsapp?: string
        }
        Relationships: []
      }
      staff_permissions: {
        Row: {
          can_create_shipments: boolean
          can_delete_shipments: boolean
          can_edit_shipments: boolean
          can_update_location: boolean
          can_view_settings: boolean
          can_view_shipments: boolean
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_create_shipments?: boolean
          can_delete_shipments?: boolean
          can_edit_shipments?: boolean
          can_update_location?: boolean
          can_view_settings?: boolean
          can_view_shipments?: boolean
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_create_shipments?: boolean
          can_delete_shipments?: boolean
          can_edit_shipments?: boolean
          can_update_location?: boolean
          can_view_settings?: boolean
          can_view_shipments?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_tracking_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "staff"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "staff"],
    },
  },
} as const
