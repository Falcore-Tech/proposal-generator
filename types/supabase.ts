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
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      animated_proposal_events: {
        Row: {
          created_at: string
          event_type: string
          id: number
          ip: unknown
          meta: Json | null
          proposal_id: string
          ua: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: number
          ip?: unknown
          meta?: Json | null
          proposal_id: string
          ua?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: number
          ip?: unknown
          meta?: Json | null
          proposal_id?: string
          ua?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animated_proposal_events_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "animated_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      animated_proposals: {
        Row: {
          agency_name: string
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          brand: string
          challenge_intro: string
          client_first_name: string
          client_full_name: string
          client_signature_url: string | null
          client_signed_at: string | null
          company_name: string
          created_at: string
          created_by: string
          currency: string
          expires_at: string | null
          guarantee_text: string | null
          id: string
          intro_paragraph: string
          milestone_cents: number | null
          package_id: string | null
          phase_two_teaser: string | null
          problems: Json
          project_title: string
          proposal_date: string
          provider_name: string
          provider_signature_url: string | null
          provider_signed_at: string | null
          retainer_bullets: Json
          retainer_price_cents: number | null
          scope_items: Json
          scope_phase_name: string | null
          scope_subtitle: string | null
          signed_pdf_url: string | null
          slug: string
          solution_intro: string
          solutions: Json
          status: string
          stripe_link: string | null
          stripe_payment_intent_id: string | null
          terms: Json
          timeline_nodes: Json
          token: string
          tos_template_id: string | null
          total_days: number | null
          total_price_cents: number
          updated_at: string
        }
        Insert: {
          agency_name?: string
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          brand?: string
          challenge_intro: string
          client_first_name: string
          client_full_name: string
          client_signature_url?: string | null
          client_signed_at?: string | null
          company_name: string
          created_at?: string
          created_by: string
          currency?: string
          expires_at?: string | null
          guarantee_text?: string | null
          id?: string
          intro_paragraph: string
          milestone_cents?: number | null
          package_id?: string | null
          phase_two_teaser?: string | null
          problems: Json
          project_title: string
          proposal_date?: string
          provider_name: string
          provider_signature_url?: string | null
          provider_signed_at?: string | null
          retainer_bullets?: Json
          retainer_price_cents?: number | null
          scope_items?: Json
          scope_phase_name?: string | null
          scope_subtitle?: string | null
          signed_pdf_url?: string | null
          slug: string
          solution_intro: string
          solutions: Json
          status?: string
          stripe_link?: string | null
          stripe_payment_intent_id?: string | null
          terms?: Json
          timeline_nodes?: Json
          token?: string
          tos_template_id?: string | null
          total_days?: number | null
          total_price_cents: number
          updated_at?: string
        }
        Update: {
          agency_name?: string
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          brand?: string
          challenge_intro?: string
          client_first_name?: string
          client_full_name?: string
          client_signature_url?: string | null
          client_signed_at?: string | null
          company_name?: string
          created_at?: string
          created_by?: string
          currency?: string
          expires_at?: string | null
          guarantee_text?: string | null
          id?: string
          intro_paragraph?: string
          milestone_cents?: number | null
          package_id?: string | null
          phase_two_teaser?: string | null
          problems?: Json
          project_title?: string
          proposal_date?: string
          provider_name?: string
          provider_signature_url?: string | null
          provider_signed_at?: string | null
          retainer_bullets?: Json
          retainer_price_cents?: number | null
          scope_items?: Json
          scope_phase_name?: string | null
          scope_subtitle?: string | null
          signed_pdf_url?: string | null
          slug?: string
          solution_intro?: string
          solutions?: Json
          status?: string
          stripe_link?: string | null
          stripe_payment_intent_id?: string | null
          terms?: Json
          timeline_nodes?: Json
          token?: string
          tos_template_id?: string | null
          total_days?: number | null
          total_price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animated_proposals_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animated_proposals_tos_template_id_fkey"
            columns: ["tos_template_id"]
            isOneToOne: false
            referencedRelation: "tos_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          apply_vat: boolean | null
          bank_account_holder: string
          bank_address: string
          client_address: string
          client_company: string
          client_name: string
          client_trn: string | null
          created_at: string | null
          created_by: string | null
          currency: string
          discount_amount: number | null
          discount_type: string | null
          discount_value: number | null
          due_date: string
          iban: string
          id: string
          invoice_number: string
          is_recurring: boolean | null
          issue_date: string
          issuer_address: string
          issuer_name: string
          issuer_phone: string
          issuer_trn: string
          line_items: Json
          notes: string | null
          order_id: string
          parent_invoice_id: string | null
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          proposal_id: string | null
          recurring_end_date: string | null
          recurring_interval: string | null
          recurring_start_date: string | null
          status: string | null
          subtotal: number
          swift_code: string
          total_amount: number
          updated_at: string | null
          vat_amount: number
        }
        Insert: {
          apply_vat?: boolean | null
          bank_account_holder?: string
          bank_address: string
          client_address: string
          client_company: string
          client_name: string
          client_trn?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          due_date: string
          iban: string
          id?: string
          invoice_number: string
          is_recurring?: boolean | null
          issue_date?: string
          issuer_address: string
          issuer_name?: string
          issuer_phone: string
          issuer_trn?: string
          line_items: Json
          notes?: string | null
          order_id: string
          parent_invoice_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          proposal_id?: string | null
          recurring_end_date?: string | null
          recurring_interval?: string | null
          recurring_start_date?: string | null
          status?: string | null
          subtotal: number
          swift_code: string
          total_amount: number
          updated_at?: string | null
          vat_amount: number
        }
        Update: {
          apply_vat?: boolean | null
          bank_account_holder?: string
          bank_address?: string
          client_address?: string
          client_company?: string
          client_name?: string
          client_trn?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          due_date?: string
          iban?: string
          id?: string
          invoice_number?: string
          is_recurring?: boolean | null
          issue_date?: string
          issuer_address?: string
          issuer_name?: string
          issuer_phone?: string
          issuer_trn?: string
          line_items?: Json
          notes?: string | null
          order_id?: string
          parent_invoice_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          proposal_id?: string | null
          recurring_end_date?: string | null
          recurring_interval?: string | null
          recurring_start_date?: string | null
          status?: string | null
          subtotal?: number
          swift_code?: string
          total_amount?: number
          updated_at?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_parent_invoice_id_fkey"
            columns: ["parent_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "active_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      offerings: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          duration_months: number | null
          features: Json
          hero_media_type: string | null
          hero_media_url: string | null
          id: string
          is_active: boolean
          kind: string
          name: string
          price_cents: number
          slug: string
          sort_order: number
          stripe_price_id: string | null
          tagline: string | null
          updated_at: string
          video_count: number | null
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_months?: number | null
          features?: Json
          hero_media_type?: string | null
          hero_media_url?: string | null
          id?: string
          is_active?: boolean
          kind: string
          name: string
          price_cents?: number
          slug: string
          sort_order?: number
          stripe_price_id?: string | null
          tagline?: string | null
          updated_at?: string
          video_count?: number | null
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_months?: number | null
          features?: Json
          hero_media_type?: string | null
          hero_media_url?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          name?: string
          price_cents?: number
          slug?: string
          sort_order?: number
          stripe_price_id?: string | null
          tagline?: string | null
          updated_at?: string
          video_count?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          metadata: Json | null
          offering_id: string | null
          promo_code: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          metadata?: Json | null
          offering_id?: string | null
          promo_code?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          metadata?: Json | null
          offering_id?: string | null
          promo_code?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      package_features: {
        Row: {
          id: string
          is_bold: boolean | null
          is_included: boolean | null
          order_index: number
          package_id: string | null
          text: string
        }
        Insert: {
          id?: string
          is_bold?: boolean | null
          is_included?: boolean | null
          order_index: number
          package_id?: string | null
          text: string
        }
        Update: {
          id?: string
          is_bold?: boolean | null
          is_included?: boolean | null
          order_index?: number
          package_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_features_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_tos_mappings: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          package_id: string | null
          tos_template_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          package_id?: string | null
          tos_template_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          package_id?: string | null
          tos_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_tos_mappings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_tos_mappings_tos_template_id_fkey"
            columns: ["tos_template_id"]
            isOneToOne: false
            referencedRelation: "tos_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          brand: string
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_popular: boolean | null
          name: string
          price: number
          updated_at: string | null
          usd_price: number | null
        }
        Insert: {
          brand?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_popular?: boolean | null
          name: string
          price: number
          updated_at?: string | null
          usd_price?: number | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_popular?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
          usd_price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      proposal_links: {
        Row: {
          created_at: string | null
          id: string
          proposal_id: string | null
          token: string
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          proposal_id?: string | null
          token: string
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          proposal_id?: string | null
          token?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_links_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "active_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_links_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_services: {
        Row: {
          discount_type: string | null
          discount_value: number | null
          id: string
          proposal_id: string | null
          service_id: string | null
        }
        Insert: {
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          proposal_id?: string | null
          service_id?: string | null
        }
        Update: {
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          proposal_id?: string | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_services_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "active_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_services_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          additional_info: string | null
          archived_at: string | null
          archived_by: string | null
          client_id: string | null
          client_name: string
          company_name: string
          created_at: string | null
          created_by: string
          currency: string
          encoded_data: string | null
          expires_at: string | null
          id: string
          include_package: boolean | null
          include_tax: boolean | null
          order_id: string | null
          overall_discount_type: string | null
          overall_discount_value: number | null
          package_discount_type: string | null
          package_discount_value: number | null
          package_id: string | null
          proposal_data: Json | null
          proposal_date: string
          status: string | null
          title: string | null
          tos_snapshot: Json | null
          tos_template_id: string | null
          updated_at: string | null
          validity_days: number | null
        }
        Insert: {
          additional_info?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_id?: string | null
          client_name: string
          company_name: string
          created_at?: string | null
          created_by: string
          currency?: string
          encoded_data?: string | null
          expires_at?: string | null
          id?: string
          include_package?: boolean | null
          include_tax?: boolean | null
          order_id?: string | null
          overall_discount_type?: string | null
          overall_discount_value?: number | null
          package_discount_type?: string | null
          package_discount_value?: number | null
          package_id?: string | null
          proposal_data?: Json | null
          proposal_date: string
          status?: string | null
          title?: string | null
          tos_snapshot?: Json | null
          tos_template_id?: string | null
          updated_at?: string | null
          validity_days?: number | null
        }
        Update: {
          additional_info?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_id?: string | null
          client_name?: string
          company_name?: string
          created_at?: string | null
          created_by?: string
          currency?: string
          encoded_data?: string | null
          expires_at?: string | null
          id?: string
          include_package?: boolean | null
          include_tax?: boolean | null
          order_id?: string | null
          overall_discount_type?: string | null
          overall_discount_value?: number | null
          package_discount_type?: string | null
          package_discount_value?: number | null
          package_id?: string | null
          proposal_data?: Json | null
          proposal_date?: string
          status?: string | null
          title?: string | null
          tos_snapshot?: Json | null
          tos_template_id?: string | null
          updated_at?: string | null
          validity_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_tos_template_id_fkey"
            columns: ["tos_template_id"]
            isOneToOne: false
            referencedRelation: "tos_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_invoice_templates: {
        Row: {
          client_address: string
          client_company: string
          client_name: string
          client_trn: string | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          line_items: Json
          name: string
          next_invoice_date: string
          recurring_interval: string
          updated_at: string | null
        }
        Insert: {
          client_address: string
          client_company: string
          client_name: string
          client_trn?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          line_items: Json
          name: string
          next_invoice_date: string
          recurring_interval: string
          updated_at?: string | null
        }
        Update: {
          client_address?: string
          client_company?: string
          client_name?: string
          client_trn?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          line_items?: Json
          name?: string
          next_invoice_date?: string
          recurring_interval?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_monthly: boolean | null
          name: string
          price: number
          setup_fee: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_monthly?: boolean | null
          name: string
          price: number
          setup_fee?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_monthly?: boolean | null
          name?: string
          price?: number
          setup_fee?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tos_templates: {
        Row: {
          brand: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          payment_type: string | null
          terms: Json
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          brand?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          payment_type?: string | null
          terms?: Json
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          payment_type?: string | null
          terms?: Json
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      active_proposals: {
        Row: {
          additional_info: string | null
          archived_at: string | null
          archived_by: string | null
          client_id: string | null
          client_name: string | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          encoded_data: string | null
          expires_at: string | null
          id: string | null
          include_package: boolean | null
          include_tax: boolean | null
          order_id: string | null
          overall_discount_type: string | null
          overall_discount_value: number | null
          package_discount_type: string | null
          package_discount_value: number | null
          package_id: string | null
          proposal_data: Json | null
          proposal_date: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          validity_days: number | null
        }
        Insert: {
          additional_info?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_id?: string | null
          client_name?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          encoded_data?: string | null
          expires_at?: string | null
          id?: string | null
          include_package?: boolean | null
          include_tax?: boolean | null
          order_id?: string | null
          overall_discount_type?: string | null
          overall_discount_value?: number | null
          package_discount_type?: string | null
          package_discount_value?: number | null
          package_id?: string | null
          proposal_data?: Json | null
          proposal_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          validity_days?: number | null
        }
        Update: {
          additional_info?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_id?: string | null
          client_name?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          encoded_data?: string | null
          expires_at?: string | null
          id?: string | null
          include_package?: boolean | null
          include_tax?: boolean | null
          order_id?: string | null
          overall_discount_type?: string | null
          overall_discount_value?: number | null
          package_discount_type?: string | null
          package_discount_value?: number | null
          package_id?: string | null
          proposal_data?: Json | null
          proposal_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          validity_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_and_expire_proposals: { Args: never; Returns: undefined }
      generate_invoice_number: { Args: never; Returns: string }
      generate_monthly_invoice_number: { Args: never; Returns: string }
      generate_order_id: { Args: never; Returns: string }
      get_animated_by_token: {
        Args: { p_token: string }
        Returns: {
          agency_name: string
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          brand: string
          challenge_intro: string
          client_first_name: string
          client_full_name: string
          client_signature_url: string | null
          client_signed_at: string | null
          company_name: string
          created_at: string
          created_by: string
          currency: string
          expires_at: string | null
          guarantee_text: string | null
          id: string
          intro_paragraph: string
          milestone_cents: number | null
          package_id: string | null
          phase_two_teaser: string | null
          problems: Json
          project_title: string
          proposal_date: string
          provider_name: string
          provider_signature_url: string | null
          provider_signed_at: string | null
          retainer_bullets: Json
          retainer_price_cents: number | null
          scope_items: Json
          scope_phase_name: string | null
          scope_subtitle: string | null
          signed_pdf_url: string | null
          slug: string
          solution_intro: string
          solutions: Json
          status: string
          stripe_link: string | null
          stripe_payment_intent_id: string | null
          terms: Json
          timeline_nodes: Json
          token: string
          tos_template_id: string | null
          total_days: number | null
          total_price_cents: number
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "animated_proposals"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_role: { Args: never; Returns: string }
      initialize_admin_user: {
        Args: { admin_email: string; admin_password: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_sales_rep: { Args: never; Returns: boolean }
      log_activity: {
        Args: {
          p_action: string
          p_entity_id?: string
          p_entity_type: string
          p_metadata?: Json
        }
        Returns: undefined
      }
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
    Enums: {},
  },
} as const
