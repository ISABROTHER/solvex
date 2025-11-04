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
      access_requests: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          company_name: string | null
          reason: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          company_name?: string | null
          reason?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          company_name?: string | null
          reason?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          role: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          company: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id: string
          role: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          role?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company?: string | null
          updated_at?: string
          created_at?: string
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
          is_deleted: boolean
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
          is_deleted?: boolean
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
          is_deleted?: boolean
          deleted_at?: string | null
          image_fit?: string | null
          image_position?: string | null
          image_rotation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rental_gear: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          price_per_day: number
          is_available: boolean
          image_url: string | null
          video_url: string | null
          features: string[] | null
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
          video_url?: string | null
          features?: string[] | null
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
          video_url?: string | null
          features?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          display_order: number | null
          is_deleted: boolean | null
          deleted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          display_order?: number | null
          is_deleted?: boolean | null
          deleted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          display_order?: number | null
          is_deleted?: boolean | null
          deleted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
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
          created_at: string | null
          updated_at: string | null
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
          created_at?: string | null
          updated_at?: string | null
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
          created_at?: string | null
          updated_at?: string | null
        }
      }
      job_applications: {
        Row: {
          id: string
          first_name: string // <-- UPDATED
          last_name: string // <-- UPDATED
          email: string
          phone: string
          country_code: string
          job_position_id: string | null
          position_title: string | null
          cover_letter: string | null
          portfolio_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string // <-- UPDATED
          last_name: string // <-- UPDATED
          email: string
          phone: string
          country_code: string
          job_position_id?: string | null
          position_title?: string | null
          cover_letter?: string | null
          portfolio_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string // <-- UPDATED
          last_name?: string // <-- UPDATED
          email?: string
          phone?: string
          country_code?: string
          job_position_id?: string | null
          position_title?: string | null
          cover_letter?: string | null
          portfolio_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      submitted_applications: {
        Row: {
          id: string
          first_name: string // <-- UPDATED
          last_name: string // <-- UPDATED
          email: string
          phone: string
          country_code: string
          job_position_id: string | null
          position_title: string | null
          cover_letter: string | null
          portfolio_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string // <-- UPDATED
          last_name: string // <-- UPDATED
          email: string
          phone: string
          country_code: string
          job_position_id?: string | null
          position_title?: string | null
          cover_letter?: string | null
          portfolio_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string // <-- UPDATED
          last_name?: string // <-- UPDATED
          email?: string
          phone?: string
          country_code?: string
          job_position_id?: string | null
          position_title?: string | null
          cover_letter?: string | null
          portfolio_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}