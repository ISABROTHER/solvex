-- Migration: Fixes the ON CONFLICT error for database sync

-- 1. Fix the 'rental_gear' table
-- Adds a unique constraint on the 'name' column so the dashboard's upsert works.
ALTER TABLE public.rental_gear
ADD CONSTRAINT unique_rental_gear_name UNIQUE (name);

-- 2. Fix the 'teams' table (based on the same upsert pattern in your code)
-- Adds a unique constraint on the 'name' column so the dashboard's upsert works.
ALTER TABLE public.teams
ADD CONSTRAINT unique_teams_name UNIQUE (name);