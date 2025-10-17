// ... existing types

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
          team_id: string | null
          name: string
          description: string | null
          is_open: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id?: string | null
          name: string
          description?: string | null
          is_open?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string | null
          name?: string
          description?: string | null
          is_open?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
// ... rest of the file