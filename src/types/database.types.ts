export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      accounts_payable: {
        Row: {
          category_id: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string;
          due_date: string;
          id: string;
          issue_date: string;
          organization_id: string;
          payee_name: string | null;
          status: string;
          supplier_id: string | null;
          total_amount: number;
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          code: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description: string;
          due_date: string;
          id?: string;
          issue_date?: string;
          organization_id: string;
          payee_name?: string | null;
          status?: string;
          supplier_id?: string | null;
          total_amount: number;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string;
          due_date?: string;
          id?: string;
          issue_date?: string;
          organization_id?: string;
          payee_name?: string | null;
          status?: string;
          supplier_id?: string | null;
          total_amount?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_payable_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_payable_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_payable_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_payable_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_payable_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      accounts_payable_payments: {
        Row: {
          accounts_payable_id: string;
          amount: number;
          bank_account_id: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          method_id: string | null;
          notes: string | null;
          paid_at: string;
          reversed_at: string | null;
          reversed_by: string | null;
          updated_at: string;
        };
        Insert: {
          accounts_payable_id: string;
          amount: number;
          bank_account_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          method_id?: string | null;
          notes?: string | null;
          paid_at?: string;
          reversed_at?: string | null;
          reversed_by?: string | null;
          updated_at?: string;
        };
        Update: {
          accounts_payable_id?: string;
          amount?: number;
          bank_account_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          method_id?: string | null;
          notes?: string | null;
          paid_at?: string;
          reversed_at?: string | null;
          reversed_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_payable_payments_accounts_payable_id_fkey";
            columns: ["accounts_payable_id"];
            isOneToOne: false;
            referencedRelation: "accounts_payable";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_payable_payments_bank_account_id_fkey";
            columns: ["bank_account_id"];
            isOneToOne: false;
            referencedRelation: "bank_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_payable_payments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_payable_payments_method_id_fkey";
            columns: ["method_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_payable_payments_reversed_by_fkey";
            columns: ["reversed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      accounts_receivable: {
        Row: {
          category_id: string | null;
          client_id: string;
          code: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string;
          due_date: string;
          id: string;
          issue_date: string;
          organization_id: string;
          quote_id: string | null;
          service_order_id: string | null;
          status: string;
          total_amount: number;
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          client_id: string;
          code: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description: string;
          due_date: string;
          id?: string;
          issue_date?: string;
          organization_id: string;
          quote_id?: string | null;
          service_order_id?: string | null;
          status?: string;
          total_amount: number;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          client_id?: string;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string;
          due_date?: string;
          id?: string;
          issue_date?: string;
          organization_id?: string;
          quote_id?: string | null;
          service_order_id?: string | null;
          status?: string;
          total_amount?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_receivable_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_receivable_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_receivable_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_receivable_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_receivable_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_receivable_service_order_id_fkey";
            columns: ["service_order_id"];
            isOneToOne: false;
            referencedRelation: "service_orders";
            referencedColumns: ["id"];
          },
        ];
      };
      accounts_receivable_payments: {
        Row: {
          accounts_receivable_id: string;
          amount: number;
          card_brand: string | null;
          card_installments: number | null;
          created_at: string;
          created_by: string | null;
          id: string;
          method_id: string | null;
          notes: string | null;
          paid_at: string;
          reversed_at: string | null;
          reversed_by: string | null;
          stage: string | null;
          updated_at: string;
        };
        Insert: {
          accounts_receivable_id: string;
          amount: number;
          card_brand?: string | null;
          card_installments?: number | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          method_id?: string | null;
          notes?: string | null;
          paid_at?: string;
          reversed_at?: string | null;
          reversed_by?: string | null;
          stage?: string | null;
          updated_at?: string;
        };
        Update: {
          accounts_receivable_id?: string;
          amount?: number;
          card_brand?: string | null;
          card_installments?: number | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          method_id?: string | null;
          notes?: string | null;
          paid_at?: string;
          reversed_at?: string | null;
          reversed_by?: string | null;
          stage?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_payments_accounts_receivable_id_fkey";
            columns: ["accounts_receivable_id"];
            isOneToOne: false;
            referencedRelation: "accounts_receivable";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_receivable_payments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_receivable_payments_method_id_fkey";
            columns: ["method_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_receivable_payments_reversed_by_fkey";
            columns: ["reversed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          all_day: boolean;
          appointment_type_id: string | null;
          assigned_to: string | null;
          client_id: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          ends_at: string;
          id: string;
          inspection_id: string | null;
          location: string | null;
          notes: string | null;
          organization_id: string;
          quote_id: string | null;
          reminder_minutes_before: number | null;
          service_order_id: string | null;
          starts_at: string;
          status: string;
          title: string;
          updated_at: string;
          vehicle_id: string | null;
        };
        Insert: {
          all_day?: boolean;
          appointment_type_id?: string | null;
          assigned_to?: string | null;
          client_id?: string | null;
          code: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          ends_at: string;
          id?: string;
          inspection_id?: string | null;
          location?: string | null;
          notes?: string | null;
          organization_id: string;
          quote_id?: string | null;
          reminder_minutes_before?: number | null;
          service_order_id?: string | null;
          starts_at: string;
          status?: string;
          title: string;
          updated_at?: string;
          vehicle_id?: string | null;
        };
        Update: {
          all_day?: boolean;
          appointment_type_id?: string | null;
          assigned_to?: string | null;
          client_id?: string | null;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          ends_at?: string;
          id?: string;
          inspection_id?: string | null;
          location?: string | null;
          notes?: string | null;
          organization_id?: string;
          quote_id?: string | null;
          reminder_minutes_before?: number | null;
          service_order_id?: string | null;
          starts_at?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          vehicle_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_appointment_type_id_fkey";
            columns: ["appointment_type_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_appointments_inspection";
            columns: ["inspection_id"];
            isOneToOne: false;
            referencedRelation: "vehicle_inspections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_appointments_quote";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_appointments_service_order";
            columns: ["service_order_id"];
            isOneToOne: false;
            referencedRelation: "service_orders";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          changes: Json | null;
          created_at: string;
          entity_id: string | null;
          id: string;
          ip_address: unknown;
          module: string;
          organization_id: string;
          user_email: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          changes?: Json | null;
          created_at?: string;
          entity_id?: string | null;
          id?: string;
          ip_address?: unknown;
          module: string;
          organization_id: string;
          user_email?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          changes?: Json | null;
          created_at?: string;
          entity_id?: string | null;
          id?: string;
          ip_address?: unknown;
          module?: string;
          organization_id?: string;
          user_email?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bank_accounts: {
        Row: {
          account: string | null;
          agency: string | null;
          bank_name: string;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          id: string;
          is_active: boolean;
          organization_id: string;
          updated_at: string;
        };
        Insert: {
          account?: string | null;
          agency?: string | null;
          bank_name: string;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          is_active?: boolean;
          organization_id: string;
          updated_at?: string;
        };
        Update: {
          account?: string | null;
          agency?: string | null;
          bank_name?: string;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          is_active?: boolean;
          organization_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bank_accounts_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bank_accounts_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      checklist_template_items: {
        Row: {
          id: string;
          label: string;
          sort_order: number;
          stage_id: string;
        };
        Insert: {
          id?: string;
          label: string;
          sort_order?: number;
          stage_id: string;
        };
        Update: {
          id?: string;
          label?: string;
          sort_order?: number;
          stage_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checklist_template_items_stage_id_fkey";
            columns: ["stage_id"];
            isOneToOne: false;
            referencedRelation: "checklist_template_stages";
            referencedColumns: ["id"];
          },
        ];
      };
      checklist_template_stages: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          template_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          template_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          template_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checklist_template_stages_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "checklist_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      checklist_templates: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          id: string;
          is_active: boolean;
          kind: string;
          name: string;
          organization_id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          is_active?: boolean;
          kind: string;
          name: string;
          organization_id: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          is_active?: boolean;
          kind?: string;
          name?: string;
          organization_id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checklist_templates_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checklist_templates_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checklist_templates_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      clients: {
        Row: {
          address: string | null;
          address_complement: string | null;
          address_number: string | null;
          birth_date: string | null;
          city: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          document: string | null;
          document_type: string | null;
          email: string | null;
          fantasy_name: string | null;
          full_name: string;
          id: string;
          neighborhood: string | null;
          notes: string | null;
          organization_id: string;
          phone: string | null;
          responsible_name: string | null;
          rg: string | null;
          state: string | null;
          state_registration: string | null;
          status: string;
          updated_at: string;
          whatsapp: string | null;
          zip_code: string | null;
        };
        Insert: {
          address?: string | null;
          address_complement?: string | null;
          address_number?: string | null;
          birth_date?: string | null;
          city?: string | null;
          code: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          document?: string | null;
          document_type?: string | null;
          email?: string | null;
          fantasy_name?: string | null;
          full_name: string;
          id?: string;
          neighborhood?: string | null;
          notes?: string | null;
          organization_id: string;
          phone?: string | null;
          responsible_name?: string | null;
          rg?: string | null;
          state?: string | null;
          state_registration?: string | null;
          status?: string;
          updated_at?: string;
          whatsapp?: string | null;
          zip_code?: string | null;
        };
        Update: {
          address?: string | null;
          address_complement?: string | null;
          address_number?: string | null;
          birth_date?: string | null;
          city?: string | null;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          document?: string | null;
          document_type?: string | null;
          email?: string | null;
          fantasy_name?: string | null;
          full_name?: string;
          id?: string;
          neighborhood?: string | null;
          notes?: string | null;
          organization_id?: string;
          phone?: string | null;
          responsible_name?: string | null;
          rg?: string | null;
          state?: string | null;
          state_registration?: string | null;
          status?: string;
          updated_at?: string;
          whatsapp?: string | null;
          zip_code?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clients_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clients_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      config_categories: {
        Row: {
          code: string;
          color: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          is_active: boolean;
          is_system: boolean;
          name: string;
          normalized_name: string | null;
          organization_id: string;
          sort_order: number;
          type: string;
          updated_at: string;
          usage_count: number;
        };
        Insert: {
          code: string;
          color?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          is_system?: boolean;
          name: string;
          normalized_name?: string | null;
          organization_id: string;
          sort_order?: number;
          type: string;
          updated_at?: string;
          usage_count?: number;
        };
        Update: {
          code?: string;
          color?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          is_system?: boolean;
          name?: string;
          normalized_name?: string | null;
          organization_id?: string;
          sort_order?: number;
          type?: string;
          updated_at?: string;
          usage_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "config_categories_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "config_categories_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "config_categories_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      document_sequences: {
        Row: {
          entity_type: string;
          id: string;
          last_number: number;
          organization_id: string;
          prefix: string;
          year: number | null;
        };
        Insert: {
          entity_type: string;
          id?: string;
          last_number?: number;
          organization_id: string;
          prefix: string;
          year?: number | null;
        };
        Update: {
          entity_type?: string;
          id?: string;
          last_number?: number;
          organization_id?: string;
          prefix?: string;
          year?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "document_sequences_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      entity_events: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          entity_id: string;
          entity_type: string;
          event_type: string;
          id: string;
          metadata: Json;
          organization_id: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          entity_id: string;
          entity_type: string;
          event_type: string;
          id?: string;
          metadata?: Json;
          organization_id: string;
          title: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          entity_id?: string;
          entity_type?: string;
          event_type?: string;
          id?: string;
          metadata?: Json;
          organization_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entity_events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entity_events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      file_metadata: {
        Row: {
          attachment_type: string | null;
          bucket: string;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string | null;
          entity_id: string;
          entity_type: string;
          file_name: string;
          file_path: string;
          id: string;
          mime_type: string | null;
          organization_id: string;
          size_bytes: number | null;
          uploaded_by: string | null;
        };
        Insert: {
          attachment_type?: string | null;
          bucket: string;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          entity_id: string;
          entity_type: string;
          file_name: string;
          file_path: string;
          id?: string;
          mime_type?: string | null;
          organization_id: string;
          size_bytes?: number | null;
          uploaded_by?: string | null;
        };
        Update: {
          attachment_type?: string | null;
          bucket?: string;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          entity_id?: string;
          entity_type?: string;
          file_name?: string;
          file_path?: string;
          id?: string;
          mime_type?: string | null;
          organization_id?: string;
          size_bytes?: number | null;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "file_metadata_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "file_metadata_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "file_metadata_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      financial_audit_logs: {
        Row: {
          action: string;
          changed_at: string;
          changed_by: string | null;
          id: string;
          new_data: Json | null;
          old_data: Json | null;
          organization_id: string;
          previous_hash: string;
          record_hash: string;
          record_id: string;
          table_name: string;
        };
        Insert: {
          action: string;
          changed_at?: string;
          changed_by?: string | null;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          organization_id: string;
          previous_hash: string;
          record_hash: string;
          record_id: string;
          table_name: string;
        };
        Update: {
          action?: string;
          changed_at?: string;
          changed_by?: string | null;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          organization_id?: string;
          previous_hash?: string;
          record_hash?: string;
          record_id?: string;
          table_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "financial_audit_logs_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "financial_audit_logs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      inspection_items: {
        Row: {
          description: string;
          id: string;
          inspection_id: string;
          is_completed: boolean;
          sort_order: number;
          stage_name: string | null;
        };
        Insert: {
          description: string;
          id?: string;
          inspection_id: string;
          is_completed?: boolean;
          sort_order?: number;
          stage_name?: string | null;
        };
        Update: {
          description?: string;
          id?: string;
          inspection_id?: string;
          is_completed?: boolean;
          sort_order?: number;
          stage_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "inspection_items_inspection_id_fkey";
            columns: ["inspection_id"];
            isOneToOne: false;
            referencedRelation: "vehicle_inspections";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          document: string | null;
          id: string;
          name: string;
          plan: string;
          settings: Json;
          slug: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          document?: string | null;
          id?: string;
          name: string;
          plan?: string;
          settings?: Json;
          slug: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          document?: string | null;
          id?: string;
          name?: string;
          plan?: string;
          settings?: Json;
          slug?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_organizations_deleted_by";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      parts: {
        Row: {
          category_id: string | null;
          created_at: string;
          created_by: string | null;
          default_price: number | null;
          deleted_at: string | null;
          deleted_by: string | null;
          id: string;
          is_active: boolean;
          name: string;
          normalized_name: string | null;
          organization_id: string;
          sku: string | null;
          stock_quantity: number;
          unit: string;
          updated_at: string;
          usage_count: number;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          default_price?: number | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          normalized_name?: string | null;
          organization_id: string;
          sku?: string | null;
          stock_quantity?: number;
          unit?: string;
          updated_at?: string;
          usage_count?: number;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          default_price?: number | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          normalized_name?: string | null;
          organization_id?: string;
          sku?: string | null;
          stock_quantity?: number;
          unit?: string;
          updated_at?: string;
          usage_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "parts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "parts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "parts_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "parts_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      permissions: {
        Row: {
          action: string;
          id: string;
          module: string;
        };
        Insert: {
          action: string;
          id?: string;
          module: string;
        };
        Update: {
          action?: string;
          id?: string;
          module?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          email: string;
          full_name: string;
          id: string;
          job_title: string | null;
          must_change_password: boolean;
          organization_id: string;
          phone: string | null;
          role_id: string | null;
          status: string;
          theme_preference: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          email: string;
          full_name: string;
          id: string;
          job_title?: string | null;
          must_change_password?: boolean;
          organization_id: string;
          phone?: string | null;
          role_id?: string | null;
          status?: string;
          theme_preference?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
          job_title?: string | null;
          must_change_password?: boolean;
          organization_id?: string;
          phone?: string | null;
          role_id?: string | null;
          status?: string;
          theme_preference?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_profiles_deleted_by";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      quote_items: {
        Row: {
          category_id: string | null;
          created_at: string;
          description: string;
          discount_amount: number;
          id: string;
          item_type: string;
          part_id: string | null;
          quantity: number;
          quote_id: string;
          service_id: string | null;
          sort_order: number;
          total_amount: number | null;
          unit_price: number;
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          description: string;
          discount_amount?: number;
          id?: string;
          item_type: string;
          part_id?: string | null;
          quantity?: number;
          quote_id: string;
          service_id?: string | null;
          sort_order?: number;
          total_amount?: number | null;
          unit_price: number;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          description?: string;
          discount_amount?: number;
          id?: string;
          item_type?: string;
          part_id?: string | null;
          quantity?: number;
          quote_id?: string;
          service_id?: string | null;
          sort_order?: number;
          total_amount?: number | null;
          unit_price?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quote_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_items_part_id_fkey";
            columns: ["part_id"];
            isOneToOne: false;
            referencedRelation: "parts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_items_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      quote_status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          from_status_id: string | null;
          id: string;
          notes: string | null;
          quote_id: string;
          reason: string | null;
          to_status_id: string;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          from_status_id?: string | null;
          id?: string;
          notes?: string | null;
          quote_id: string;
          reason?: string | null;
          to_status_id: string;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          from_status_id?: string | null;
          id?: string;
          notes?: string | null;
          quote_id?: string;
          reason?: string | null;
          to_status_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quote_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_status_history_from_status_id_fkey";
            columns: ["from_status_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_status_history_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_status_history_to_status_id_fkey";
            columns: ["to_status_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      quotes: {
        Row: {
          client_id: string;
          converted_to_service_order_id: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          discount_amount: number;
          discount_percent: number;
          id: string;
          issue_date: string;
          notes: string | null;
          organization_id: string;
          quote_number: string;
          status_id: string | null;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          updated_at: string;
          valid_until: string | null;
          vehicle_id: string;
        };
        Insert: {
          client_id: string;
          converted_to_service_order_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          discount_amount?: number;
          discount_percent?: number;
          id?: string;
          issue_date?: string;
          notes?: string | null;
          organization_id: string;
          quote_number: string;
          status_id?: string | null;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          updated_at?: string;
          valid_until?: string | null;
          vehicle_id: string;
        };
        Update: {
          client_id?: string;
          converted_to_service_order_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          discount_amount?: number;
          discount_percent?: number;
          id?: string;
          issue_date?: string;
          notes?: string | null;
          organization_id?: string;
          quote_number?: string;
          status_id?: string | null;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          updated_at?: string;
          valid_until?: string | null;
          vehicle_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_quotes_converted_so";
            columns: ["converted_to_service_order_id"];
            isOneToOne: false;
            referencedRelation: "service_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_status_id_fkey";
            columns: ["status_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      role_permissions: {
        Row: {
          allowed: boolean;
          id: string;
          permission_id: string;
          role_id: string;
          scope: string;
        };
        Insert: {
          allowed?: boolean;
          id?: string;
          permission_id: string;
          role_id: string;
          scope?: string;
        };
        Update: {
          allowed?: boolean;
          id?: string;
          permission_id?: string;
          role_id?: string;
          scope?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string | null;
          id: string;
          is_system: boolean;
          name: string;
          organization_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          name: string;
          organization_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          name?: string;
          organization_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_roles_deleted_by";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      service_order_checklist_items: {
        Row: {
          completed_at: string | null;
          completed_by: string | null;
          description: string;
          id: string;
          is_completed: boolean;
          service_order_id: string;
          sort_order: number;
          stage_name: string | null;
        };
        Insert: {
          completed_at?: string | null;
          completed_by?: string | null;
          description: string;
          id?: string;
          is_completed?: boolean;
          service_order_id: string;
          sort_order?: number;
          stage_name?: string | null;
        };
        Update: {
          completed_at?: string | null;
          completed_by?: string | null;
          description?: string;
          id?: string;
          is_completed?: boolean;
          service_order_id?: string;
          sort_order?: number;
          stage_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_order_checklist_items_completed_by_fkey";
            columns: ["completed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_order_checklist_items_service_order_id_fkey";
            columns: ["service_order_id"];
            isOneToOne: false;
            referencedRelation: "service_orders";
            referencedColumns: ["id"];
          },
        ];
      };
      service_order_items: {
        Row: {
          category_id: string | null;
          created_at: string;
          description: string;
          discount_amount: number;
          id: string;
          item_type: string;
          part_id: string | null;
          quantity: number;
          service_id: string | null;
          service_order_id: string;
          sort_order: number;
          total_amount: number | null;
          unit_price: number;
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          description: string;
          discount_amount?: number;
          id?: string;
          item_type: string;
          part_id?: string | null;
          quantity?: number;
          service_id?: string | null;
          service_order_id: string;
          sort_order?: number;
          total_amount?: number | null;
          unit_price: number;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          description?: string;
          discount_amount?: number;
          id?: string;
          item_type?: string;
          part_id?: string | null;
          quantity?: number;
          service_id?: string | null;
          service_order_id?: string;
          sort_order?: number;
          total_amount?: number | null;
          unit_price?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_order_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_order_items_part_id_fkey";
            columns: ["part_id"];
            isOneToOne: false;
            referencedRelation: "parts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_order_items_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_order_items_service_order_id_fkey";
            columns: ["service_order_id"];
            isOneToOne: false;
            referencedRelation: "service_orders";
            referencedColumns: ["id"];
          },
        ];
      };
      service_order_status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          from_status_id: string | null;
          id: string;
          notes: string | null;
          service_order_id: string;
          to_status_id: string;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          from_status_id?: string | null;
          id?: string;
          notes?: string | null;
          service_order_id: string;
          to_status_id: string;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          from_status_id?: string | null;
          id?: string;
          notes?: string | null;
          service_order_id?: string;
          to_status_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_order_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_order_status_history_from_status_id_fkey";
            columns: ["from_status_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_order_status_history_service_order_id_fkey";
            columns: ["service_order_id"];
            isOneToOne: false;
            referencedRelation: "service_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_order_status_history_to_status_id_fkey";
            columns: ["to_status_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      service_order_time_logs: {
        Row: {
          duration_minutes: number | null;
          ended_at: string | null;
          id: string;
          notes: string | null;
          service_order_id: string;
          started_at: string;
          user_id: string;
        };
        Insert: {
          duration_minutes?: number | null;
          ended_at?: string | null;
          id?: string;
          notes?: string | null;
          service_order_id: string;
          started_at: string;
          user_id: string;
        };
        Update: {
          duration_minutes?: number | null;
          ended_at?: string | null;
          id?: string;
          notes?: string | null;
          service_order_id?: string;
          started_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_order_time_logs_service_order_id_fkey";
            columns: ["service_order_id"];
            isOneToOne: false;
            referencedRelation: "service_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_order_time_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      service_orders: {
        Row: {
          assigned_to: string | null;
          cancellation_reason_id: string | null;
          client_id: string;
          completed_at: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          delivered_at: string | null;
          delivery_mileage: number | null;
          discount_amount: number;
          entry_date: string;
          expected_delivery_date: string | null;
          id: string;
          notes: string | null;
          organization_id: string;
          os_number: string;
          quote_id: string | null;
          started_at: string | null;
          status_id: string | null;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          updated_at: string;
          vehicle_id: string;
          warranty_period: number | null;
        };
        Insert: {
          assigned_to?: string | null;
          cancellation_reason_id?: string | null;
          client_id: string;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          delivered_at?: string | null;
          delivery_mileage?: number | null;
          discount_amount?: number;
          entry_date?: string;
          expected_delivery_date?: string | null;
          id?: string;
          notes?: string | null;
          organization_id: string;
          os_number: string;
          quote_id?: string | null;
          started_at?: string | null;
          status_id?: string | null;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          updated_at?: string;
          vehicle_id: string;
          warranty_period?: number | null;
        };
        Update: {
          assigned_to?: string | null;
          cancellation_reason_id?: string | null;
          client_id?: string;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          delivered_at?: string | null;
          delivery_mileage?: number | null;
          discount_amount?: number;
          entry_date?: string;
          expected_delivery_date?: string | null;
          id?: string;
          notes?: string | null;
          organization_id?: string;
          os_number?: string;
          quote_id?: string | null;
          started_at?: string | null;
          status_id?: string | null;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          updated_at?: string;
          vehicle_id?: string;
          warranty_period?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_orders_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_cancellation_reason_id_fkey";
            columns: ["cancellation_reason_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_status_id_fkey";
            columns: ["status_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          category_id: string | null;
          created_at: string;
          created_by: string | null;
          default_price: number | null;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string | null;
          estimated_duration_minutes: number | null;
          id: string;
          is_active: boolean;
          name: string;
          normalized_name: string | null;
          organization_id: string;
          updated_at: string;
          usage_count: number;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          default_price?: number | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          estimated_duration_minutes?: number | null;
          id?: string;
          is_active?: boolean;
          name: string;
          normalized_name?: string | null;
          organization_id: string;
          updated_at?: string;
          usage_count?: number;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          default_price?: number | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          estimated_duration_minutes?: number | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          normalized_name?: string | null;
          organization_id?: string;
          updated_at?: string;
          usage_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "services_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "services_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "services_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      suppliers: {
        Row: {
          address: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          document: string | null;
          email: string | null;
          id: string;
          name: string;
          organization_id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          document?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          document?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          organization_id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "suppliers_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "suppliers_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "suppliers_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      user_permission_overrides: {
        Row: {
          allowed: boolean;
          id: string;
          permission_id: string;
          scope: string;
          user_id: string;
        };
        Insert: {
          allowed: boolean;
          id?: string;
          permission_id: string;
          scope?: string;
          user_id: string;
        };
        Update: {
          allowed?: boolean;
          id?: string;
          permission_id?: string;
          scope?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_permission_overrides_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_permission_overrides_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      vehicle_inspections: {
        Row: {
          appointment_id: string | null;
          client_id: string;
          code: string;
          created_at: string;
          created_by: string | null;
          damage_map: Json;
          deleted_at: string | null;
          deleted_by: string | null;
          fuel_level: number | null;
          id: string;
          inspection_date: string;
          inspector_id: string | null;
          mileage: number | null;
          notes: string | null;
          organization_id: string;
          quote_id: string | null;
          status: string;
          updated_at: string;
          vehicle_id: string;
        };
        Insert: {
          appointment_id?: string | null;
          client_id: string;
          code: string;
          created_at?: string;
          created_by?: string | null;
          damage_map?: Json;
          deleted_at?: string | null;
          deleted_by?: string | null;
          fuel_level?: number | null;
          id?: string;
          inspection_date?: string;
          inspector_id?: string | null;
          mileage?: number | null;
          notes?: string | null;
          organization_id: string;
          quote_id?: string | null;
          status?: string;
          updated_at?: string;
          vehicle_id: string;
        };
        Update: {
          appointment_id?: string | null;
          client_id?: string;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          damage_map?: Json;
          deleted_at?: string | null;
          deleted_by?: string | null;
          fuel_level?: number | null;
          id?: string;
          inspection_date?: string;
          inspector_id?: string | null;
          mileage?: number | null;
          notes?: string | null;
          organization_id?: string;
          quote_id?: string | null;
          status?: string;
          updated_at?: string;
          vehicle_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_inspections_quote";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_inspections_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_inspections_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_inspections_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_inspections_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_inspections_inspector_id_fkey";
            columns: ["inspector_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_inspections_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_inspections_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      vehicle_shop_visits: {
        Row: {
          checked_in_at: string;
          checked_out_at: string | null;
          client_id: string;
          created_at: string;
          current_stage_id: string | null;
          id: string;
          inspection_id: string | null;
          organization_id: string;
          parking_spot: string | null;
          service_order_id: string | null;
          updated_at: string;
          vehicle_id: string;
        };
        Insert: {
          checked_in_at?: string;
          checked_out_at?: string | null;
          client_id: string;
          created_at?: string;
          current_stage_id?: string | null;
          id?: string;
          inspection_id?: string | null;
          organization_id: string;
          parking_spot?: string | null;
          service_order_id?: string | null;
          updated_at?: string;
          vehicle_id: string;
        };
        Update: {
          checked_in_at?: string;
          checked_out_at?: string | null;
          client_id?: string;
          created_at?: string;
          current_stage_id?: string | null;
          id?: string;
          inspection_id?: string | null;
          organization_id?: string;
          parking_spot?: string | null;
          service_order_id?: string | null;
          updated_at?: string;
          vehicle_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_shop_visits_service_order";
            columns: ["service_order_id"];
            isOneToOne: false;
            referencedRelation: "service_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_shop_visits_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_shop_visits_current_stage_id_fkey";
            columns: ["current_stage_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_shop_visits_inspection_id_fkey";
            columns: ["inspection_id"];
            isOneToOne: false;
            referencedRelation: "vehicle_inspections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_shop_visits_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_shop_visits_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      vehicles: {
        Row: {
          brand: string | null;
          chassis: string | null;
          client_id: string;
          code: string;
          color: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          fuel_type_id: string | null;
          id: string;
          journey_stage_id: string | null;
          journey_stage_updated_at: string | null;
          mileage: number | null;
          model: string | null;
          notes: string | null;
          organization_id: string;
          plate: string;
          renavam: string | null;
          status: string;
          updated_at: string;
          year_manufacture: number | null;
          year_model: number | null;
        };
        Insert: {
          brand?: string | null;
          chassis?: string | null;
          client_id: string;
          code: string;
          color?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          fuel_type_id?: string | null;
          id?: string;
          journey_stage_id?: string | null;
          journey_stage_updated_at?: string | null;
          mileage?: number | null;
          model?: string | null;
          notes?: string | null;
          organization_id: string;
          plate: string;
          renavam?: string | null;
          status?: string;
          updated_at?: string;
          year_manufacture?: number | null;
          year_model?: number | null;
        };
        Update: {
          brand?: string | null;
          chassis?: string | null;
          client_id?: string;
          code?: string;
          color?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          fuel_type_id?: string | null;
          id?: string;
          journey_stage_id?: string | null;
          journey_stage_updated_at?: string | null;
          mileage?: number | null;
          model?: string | null;
          notes?: string | null;
          organization_id?: string;
          plate?: string;
          renavam?: string | null;
          status?: string;
          updated_at?: string;
          year_manufacture?: number | null;
          year_model?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "vehicles_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicles_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicles_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicles_fuel_type_id_fkey";
            columns: ["fuel_type_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicles_journey_stage_id_fkey";
            columns: ["journey_stage_id"];
            isOneToOne: false;
            referencedRelation: "config_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      cash_flow_entries: {
        Row: {
          amount: number | null;
          category_id: string | null;
          entry_date: string | null;
          entry_type: string | null;
          id: string | null;
          organization_id: string | null;
          reference_id: string | null;
          reference_table: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      fn_current_org_id: { Args: never; Returns: string };
      fn_current_role_id: { Args: never; Returns: string };
      fn_get_my_permissions: {
        Args: never;
        Returns: {
          action: string;
          allowed: boolean;
          module: string;
        }[];
      };
      fn_get_my_role_name: { Args: never; Returns: string };
      fn_has_permission: {
        Args: { p_action: string; p_module: string };
        Returns: boolean;
      };
      fn_is_overdue: {
        Args: { p_due_date: string; p_status: string };
        Returns: boolean;
      };
      fn_log_entity_event: {
        Args: {
          p_description?: string;
          p_entity_id: string;
          p_entity_type: string;
          p_event_type: string;
          p_metadata?: Json;
          p_title: string;
        };
        Returns: undefined;
      };
      fn_module_for_entity_type: {
        Args: { p_entity_type: string };
        Returns: string;
      };
      fn_module_for_file_entity_type: {
        Args: { p_entity_type: string };
        Returns: string;
      };
      fn_next_document_number: {
        Args: { p_entity_type: string; p_org: string };
        Returns: string;
      };
      fn_normalize_text: { Args: { p_text: string }; Returns: string };
      fn_set_vehicle_journey_stage: {
        Args: { p_stage_id: string; p_vehicle_id: string };
        Returns: undefined;
      };
      fn_update_my_profile: {
        Args: { p_job_title: string; p_phone: string };
        Returns: {
          avatar_url: string | null;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          email: string;
          full_name: string;
          id: string;
          job_title: string | null;
          must_change_password: boolean;
          organization_id: string;
          phone: string | null;
          role_id: string | null;
          status: string;
          theme_preference: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "profiles";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      unaccent: { Args: { "": string }; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
