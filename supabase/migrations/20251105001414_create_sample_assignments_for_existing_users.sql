/*
  # Create Sample Assignments for Testing

  ## Purpose
  Create sample assignments using existing users in the system
  to test real-time synchronization.

  ## What This Does
  1. Creates sample assignments if there are existing employees
  2. Assigns them to employees
  3. Creates sample messages

  ## Note
  Only creates data if employees exist in the system.
*/

DO $$
DECLARE
  admin_id uuid;
  employee_id uuid;
  assignment_id_1 uuid;
  assignment_id_2 uuid;
BEGIN
  -- Get the first admin
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  -- Get an employee
  SELECT id INTO employee_id FROM profiles WHERE role = 'employee' LIMIT 1;
  
  -- Only proceed if we have both admin and employee
  IF admin_id IS NOT NULL AND employee_id IS NOT NULL THEN
    
    -- Create first assignment
    INSERT INTO assignments (
      title,
      instructions,
      status,
      due_date,
      created_by
    ) VALUES (
      'Website Redesign Project',
      'Lead the redesign of the company website. Focus on modern UI/UX, mobile responsiveness, and improved performance. Deliverables include wireframes, mockups, and final designs.',
      'pending',
      (CURRENT_DATE + INTERVAL '21 days')::timestamptz,
      admin_id
    )
    RETURNING id INTO assignment_id_1;
    
    -- Assign employee to first assignment
    INSERT INTO assignment_members (assignment_id, employee_id)
    VALUES (assignment_id_1, employee_id);
    
    -- Create welcome message for first assignment
    INSERT INTO assignment_messages (assignment_id, sender_id, content)
    VALUES (
      assignment_id_1,
      admin_id,
      'Hi! I''ve assigned you to lead the website redesign project. Please review the requirements and let me know your initial thoughts.'
    );
    
    -- Create second assignment
    INSERT INTO assignments (
      title,
      instructions,
      status,
      due_date,
      created_by
    ) VALUES (
      'Q1 Marketing Materials',
      'Create marketing materials for Q1 campaign including social media graphics, email templates, and promotional videos. Brand guidelines are attached.',
      'in_progress',
      (CURRENT_DATE + INTERVAL '14 days')::timestamptz,
      admin_id
    )
    RETURNING id INTO assignment_id_2;
    
    -- Assign employee to second assignment
    INSERT INTO assignment_members (assignment_id, employee_id)
    VALUES (assignment_id_2, employee_id);
    
    -- Create messages for second assignment
    INSERT INTO assignment_messages (assignment_id, sender_id, content)
    VALUES 
      (
        assignment_id_2,
        admin_id,
        'This is a high-priority project. Please prioritize the social media graphics first.'
      ),
      (
        assignment_id_2,
        employee_id,
        'Understood! I''m working on the social media graphics now. Should have the first drafts ready by tomorrow.'
      );
    
    RAISE NOTICE 'Created 2 sample assignments successfully';
  ELSE
    RAISE NOTICE 'Skipping: Need at least one admin and one employee to create sample assignments';
  END IF;
END $$;
