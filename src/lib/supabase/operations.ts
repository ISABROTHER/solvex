// src/lib/supabase/operations.ts
// @ts-nocheck
import { supabase } from './client';
import type { Database } from './database.types';

// Define the shape expected by RentalsPage.tsx
export type RentalItemDisplay = {
  id: string;
  title: string; // Mapped from 'name'
  subtitle: string | null; // Mapped from 'description'
  category: string | null; // Mapped from 'category'
  price: number; // Mapped from 'price_per_day'
  images: string[] | null; // Mapped from 'image_url' (put into an array)
  features: string[] | null; // Mapped from 'features'
  videoUrl: string | null; // Mapped from 'video_url'
  status: 'Available' | 'Unavailable'; // Mapped from 'is_available'
};

// ... other type definitions (RentalGear, Service, etc.) ...

// --- RENTAL EQUIPMENT OPERATIONS ---

/**
 * Fetches ALL rental items and maps them to the public display format.
 * Availability filtering/display is handled on the frontend.
 */
export const getRentalEquipment = async () => {
  const { data, error } = await supabase
    .from('rental_gear')
    .select(`
      id,
      name,
      description,
      category,
      price_per_day,
      is_available,
      image_url,
      video_url,
      features
    `)
    // REMOVED: .eq('is_available', true) - Fetch all items
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching rental gear:", error);
    return { data: [], error };
  }
  if (!data) {
    return { data: [], error: null }; // Handle null data case
  }

  // Map database columns to the RentalItemDisplay format
  const mappedData: RentalItemDisplay[] = data.map(item => ({
    id: item.id,
    title: item.name, // DB 'name' -> 'title'
    subtitle: item.description, // DB 'description' -> 'subtitle'
    category: item.category, // DB 'category' -> 'category'
    price: item.price_per_day ?? 0, // DB 'price_per_day' -> 'price', default to 0 if null
    // Ensure image_url becomes an array, handle null/empty string
    images: item.image_url ? [item.image_url] : [],
    // Ensure features is always an array
    features: Array.isArray(item.features) ? item.features : (item.features ? [item.features] : []),
    videoUrl: item.video_url, // DB 'video_url' -> 'videoUrl'
    // Map boolean to string status
    status: item.is_available ? 'Available' : 'Unavailable',
  }));

  return { data: mappedData, error: null };
};

// ... (keep getAllRentalEquipment, updateRentalEquipment, deleteRentalEquipment, onRentalGearChange etc.) ...
// ... (keep Service operations, Job Posting operations, etc.) ...