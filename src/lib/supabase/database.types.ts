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
      submitted_applications: {
        Row: {
          id: string
          full_name: string
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
          full_name: string
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
          full_name?: string
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
      job_positions: {
        Row: {
          id: string
          title: string
          description: string | null
          requirements: string | null
          team_id: string | null
          team_name: string | null
          status: string
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          requirements?: string | null
          team_id?: string | null
          team_name?: string | null
          status?: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          requirements?: string | null
          team_id?: string | null
          team_name?: string | null
          status?: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      rental_gear: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          price_per_day: number
          available_quantity: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          price_per_day: number
          available_quantity?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          price_per_day?: number
          available_quantity?: number
          image_url?: string | null
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
          status: string
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
          status?: string
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
          status?: string
          is_deleted?: boolean
          deleted_at?: string | null
          image_fit?: string | null
          image_position?: string | null
          image_rotation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
