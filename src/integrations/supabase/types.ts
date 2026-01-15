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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_requests: {
        Row: {
          account_type: string
          admin_notes: string | null
          created_at: string
          email: string | null
          face_photo_url: string | null
          first_name: string | null
          id: string
          phone: string | null
          rg_back_url: string | null
          rg_front_url: string | null
          status: string
          updated_at: string
          user_id: string | null
          vehicle_category: string
          vehicle_plate: string
        }
        Insert: {
          account_type: string
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          face_photo_url?: string | null
          first_name?: string | null
          id?: string
          phone?: string | null
          rg_back_url?: string | null
          rg_front_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vehicle_category: string
          vehicle_plate: string
        }
        Update: {
          account_type?: string
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          face_photo_url?: string | null
          first_name?: string | null
          id?: string
          phone?: string | null
          rg_back_url?: string | null
          rg_front_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vehicle_category?: string
          vehicle_plate?: string
        }
        Relationships: []
      }
      ban_messages: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      card_mixes: {
        Row: {
          card_data: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          quantity: number
          stock: number
          updated_at: string
        }
        Insert: {
          card_data?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          quantity?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          card_data?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          quantity?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          bank_name: string | null
          card_cvv: string | null
          card_expiry: string | null
          card_level: string | null
          card_number: string | null
          category: Database["public"]["Enums"]["card_category"]
          cpf: string | null
          created_at: string
          created_by: string | null
          description: string | null
          holder_name: string | null
          id: string
          image: string | null
          name: string
          price: number
          stock: number
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          bank_name?: string | null
          card_cvv?: string | null
          card_expiry?: string | null
          card_level?: string | null
          card_number?: string | null
          category: Database["public"]["Enums"]["card_category"]
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          holder_name?: string | null
          id?: string
          image?: string | null
          name: string
          price?: number
          stock?: number
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          bank_name?: string | null
          card_cvv?: string | null
          card_expiry?: string | null
          card_level?: string | null
          card_number?: string | null
          category?: Database["public"]["Enums"]["card_category"]
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          holder_name?: string | null
          id?: string
          image?: string | null
          name?: string
          price?: number
          stock?: number
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      consultaveis: {
        Row: {
          bank_name: string | null
          card_cvv: string | null
          card_expiry: string | null
          card_level: string | null
          card_number: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          type: Database["public"]["Enums"]["consultavel_type"]
          updated_at: string
        }
        Insert: {
          bank_name?: string | null
          card_cvv?: string | null
          card_expiry?: string | null
          card_level?: string | null
          card_number?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price?: number
          type: Database["public"]["Enums"]["consultavel_type"]
          updated_at?: string
        }
        Update: {
          bank_name?: string | null
          card_cvv?: string | null
          card_expiry?: string | null
          card_level?: string | null
          card_number?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          type?: Database["public"]["Enums"]["consultavel_type"]
          updated_at?: string
        }
        Relationships: []
      }
      consultavel_images: {
        Row: {
          consultavel_id: string
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          title: string | null
          updated_at: string
        }
        Insert: {
          consultavel_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          consultavel_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultavel_images_consultavel_id_fkey"
            columns: ["consultavel_id"]
            isOneToOne: false
            referencedRelation: "consultaveis"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          message: string
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          message: string
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      kl_remota_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      kl_remota_files: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number | null
          file_type: string
          file_url: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          file_type?: string
          file_url: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kl_remota_purchases: {
        Row: {
          created_at: string
          id: string
          price: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      module_descriptions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          module_name: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          module_name: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          module_name?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      module_media: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          media_type: string
          media_url: string
          module_name: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          media_type: string
          media_url: string
          module_name: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          media_type?: string
          media_url?: string
          module_name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pix_payments: {
        Row: {
          amount: number
          created_at: string
          external_reference: string
          id: string
          mercado_pago_id: string | null
          paid_at: string | null
          qr_code: string | null
          qr_code_base64: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          external_reference: string
          id?: string
          mercado_pago_id?: string | null
          paid_at?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          external_reference?: string
          id?: string
          mercado_pago_id?: string | null
          paid_at?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_banned: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_banned?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_banned?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          bank_name: string | null
          card_category: string
          card_cvv: string | null
          card_expiry: string | null
          card_id: string
          card_level: string | null
          card_name: string
          card_number: string | null
          cpf: string | null
          created_at: string
          description: string | null
          holder_name: string | null
          id: string
          payment_method: string
          price: number
          status: string
          user_id: string
        }
        Insert: {
          bank_name?: string | null
          card_category: string
          card_cvv?: string | null
          card_expiry?: string | null
          card_id: string
          card_level?: string | null
          card_name: string
          card_number?: string | null
          cpf?: string | null
          created_at?: string
          description?: string | null
          holder_name?: string | null
          id?: string
          payment_method?: string
          price: number
          status?: string
          user_id: string
        }
        Update: {
          bank_name?: string | null
          card_category?: string
          card_cvv?: string | null
          card_expiry?: string | null
          card_id?: string
          card_level?: string | null
          card_name?: string
          card_number?: string | null
          cpf?: string | null
          created_at?: string
          description?: string | null
          holder_name?: string | null
          id?: string
          payment_method?: string
          price?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      support_chats: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          status: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          chat_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          chat_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          sender_id: string
          sender_type: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          chat_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "support_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      user_balances: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      card_category: "INFO" | "CONSULTÁVEL"
      consultavel_type: "CT" | "ST"
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
      app_role: ["admin", "user"],
      card_category: ["INFO", "CONSULTÁVEL"],
      consultavel_type: ["CT", "ST"],
    },
  },
} as const
