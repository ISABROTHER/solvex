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
          status: 'draft' | 'published'
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
          status?: 'draft' | 'published'
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
          status?: 'draft' | 'published'
          is_deleted?: boolean
          deleted_at?: string | null
          image_fit?: string | null
          image_position?: string | null
          image_rotation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          tier: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          tier?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          tier?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      service_requests: {
        Row: {
          id: string
          client_id: string
          service_type: string | null
          status: string
          requested_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_type?: string | null
          status?: string
          requested_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          service_type?: string | null
          status?: string
          requested_at?: string
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
