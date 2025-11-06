/*
  # Populate Teams Table from Existing Job Positions

  1. Actions
    - Insert existing teams from job_positions
    - Link job_positions to teams via team_id
    - Set default images for teams
    
  2. Notes
    - Uses INSERT ON CONFLICT to handle if teams already exist
    - Updates job_positions to reference team_id
*/

-- Insert teams with default images
INSERT INTO teams (name, description, image_url, display_order, is_deleted)
VALUES 
  ('Content & Production Team', 'Create compelling content that engages and inspires audiences', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800', 1, false),
  ('Marketing Team', 'Drive brand awareness and customer engagement through strategic campaigns', 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=800', 2, false),
  ('Strategy & Planning Team', 'Shape the future through data-driven insights and strategic planning', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800', 3, false),
  ('Technology and Innovation Team', 'Build cutting-edge solutions that power our digital future', 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800', 4, false)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- Update job_positions to link to teams
UPDATE job_positions
SET team_id = teams.id
FROM teams
WHERE job_positions.team_name = teams.name
AND job_positions.team_id IS NULL;