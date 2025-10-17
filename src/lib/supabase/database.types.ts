export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rental_gear: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          price_per_day: number
          is_available: boolean
          image_url: string | null
          video_url: string | null // ADDED
          features: Json | null // ADDED
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          price_per_day: number
          is_available?: boolean
          image_url?: string | null
          video_url?: string | null // ADDED
          features?: Json | null // ADDED
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          price_per_day?: number
          is_available?: boolean
          image_url?: string | null
          video_url?: string | null // ADDED
          features?: Json | null // ADDED
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          title: string
          summary: string | null
          image_url: string | null
          title_color: string | null
          description: string | null
          sub_services: string[] | null
          outcome: string | null
          status: string | null
          is_deleted: boolean | null
          deleted_at: string | null
          image_fit: string | null
          image_position: string | null
          image_rotation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          summary?: string | null
          image_url?: string | null
          title_color?: string | null
          description?: string | null
          sub_services?: string[] | null
          outcome?: string | null
          status?: string | null
          is_deleted?: boolean | null
          deleted_at?: string | null
          image_fit?: string | null
          image_position?: string | null
          image_rotation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string | null
          image_url?: string | null
          title_color?: string | null
          description?: string | null
          sub_services?: string[] | null
          outcome?: string | null
          status?: string | null
          is_deleted?: boolean | null
          deleted_at?: string | null
          image_fit?: string | null
          image_position?: string | null
          image_rotation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // NOTE: rental_equipment has been superseded by rental_gear
      rental_equipment: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          category: string | null
          price: number
          images: string[] | null
          features: string[] | null
          video_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          category?: string | null
          price: number
          images?: string[] | null
          features?: string[] | null
          video_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          category?: string | null
          price?: number
          images?: string[] | null
          features?: string[] | null
          video_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string | null
          company: string | null
          industry: string | null
          is_active: boolean | null
          full_name: string | null
          email: string | null
          phone: string | null
          tier: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id?: string | null
          company?: string | null
          industry?: string | null
          is_active?: boolean | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          tier?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          company?: string | null
          industry?: string | null
          is_active?: boolean | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          tier?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_requests: {
        Row: {
          id: string
          client_id: string | null
          type: string
          title: string
          description: string | null
          status: string | null
          priority: string | null
          service_key: string | null
          project_title: string | null
          brief: string | null
          attachments: Json
          requested_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          type: string
          title: string
          description?: string | null
          status?: string | null
          priority?: string | null
          service_key?: string | null
          project_title?: string | null
          brief?: string | null
          attachments?: Json
          requested_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          type?: string
          title?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          service_key?: string | null
          project_title?: string | null
          brief?: string | null
          attachments?: Json
          requested_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      career_applications: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          position: string
          experience_years: number | null
          portfolio_url: string | null
          cover_letter: string | null
          resume_url: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone?: string | null
          position: string
          experience_years?: number | null
          portfolio_url?: string | null
          cover_letter?: string | null
          resume_url?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          position?: string
          experience_years?: number | null
          portfolio_url?: string | null
          cover_letter?: string | null
          resume_url?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          team_name: string | null
          code: string | null
          lead_member_id: string | null
          email_alias: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          team_name?: string | null
          code?: string | null
          lead_member_id?: string | null
          email_alias?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          team_name?: string | null
          code?: string | null
          lead_member_id?: string | null
          email_alias?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          team_id: string | null
          profile_id: string | null
          role: string | null
          full_name: string | null
          email: string | null
          phone: string | null
          role_title: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id?: string | null
          profile_id?: string | null
          role?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          role_title?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string | null
          profile_id?: string | null
          role?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          role_title?: string | null
          status?: string | null
          created_at?: string
        }
      }
      rentals: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          price: number
          duration: string | null
          image: string | null
          specs: Json
          is_available: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description?: string | null
          price: number
          duration?: string | null
          image?: string | null
          specs?: Json
          is_available?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string | null
          price?: number
          duration?: string | null
          image?: string | null
          specs?: Json
          is_available?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      // === NEWLY ADDED TABLES ===
      job_teams: {
        Row: {
          id: string
          name: string
          image_url: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      job_positions: {
        Row: {
          id: string
          title: string
          description: string | null
          team_name: string
          team_id: string | null
          requirements: string | null
          status: string | null
          is_deleted: boolean | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          team_name: string
          team_id?: string | null
          requirements?: string | null
          status?: string | null
          is_deleted?: boolean | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          team_name?: string
          team_id?: string | null
          requirements?: string | null
          status?: string | null
          is_deleted?: boolean | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}