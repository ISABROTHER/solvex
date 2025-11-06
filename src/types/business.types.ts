import type { Database } from '../lib/supabase/database.types';

// Core business service type
export interface BusinessService {
  title: string;
  summary: string;
  imageUrl: string;
  titleColor: string;
  details: {
    description: string;
    subServices: string[];
    outcome: string;
  };
}

// Equipment rental type - synced with Supabase
export type RentalEquipment = Database['public']['Tables']['rental_gear']['Row'];

// Team member type
export interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
  bio: string;
  fullBio?: string;
  linkedinUrl?: string;
  email?: string;
}