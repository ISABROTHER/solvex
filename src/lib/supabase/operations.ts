// src/lib/supabase/operations.ts
// @ts-nocheck
import { supabase } from './client';
import type { Database } from './database.types';

// --- START: NEW V2 ASSIGNMENT TYPES ---
export type AssignmentStatus =
  | 'Draft'
  | 'Assigned'
  | 'In_Progress'
  | 'Submitted'
  | 'Changes_Requested'
  | 'Approved'
  | 'Closed'
  | 'Cancelled';

export type Assignment = Database['public']['Tables']['assignments']['Row'];
export type Milestone = Database['public']['Tables']['assignment_milestones']['Row'];
export type Deliverable = Database['public']['Tables']['assignment_deliverables']['Row'];
export type Comment = Database['public']['Tables']['assignment_comments']['Row'];
export type Event = Database['public']['Tables']['assignment_events']['Row'];

// Profile type for join
export type Profile = Database['public']['Tables']['profiles']['Row'];

// The fully-detailed assignment object for V2
export interface FullAssignment extends Assignment {
  milestones: Milestone[];
  deliverables: Deliverable[];
  comments: (Comment & { author: Profile | null })[];
  events: (Event & { actor: Profile | null })[];
  assignee: Profile | null;
  created_by_profile: Profile | null;
}
// --- END: NEW V2 ASSIGNMENT TYPES ---


/**
 * Fetches all essential data for the employee dashboard in one go.
 */
export const getEmployeeDashboardData = async (userId: string) => {
  // We fetch the profile first, then concurrently fetch assignments and documents
  const [profileRes, assignmentsRes, documentsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    getEmployeeAssignments(userId), // <-- UPDATED to V2 function
    getEmployeeDocuments(userId)
  ]);

  if (profileRes.error) throw profileRes.error;
  if (assignmentsRes.error) throw assignmentsRes.error;
  if (documentsRes.error) throw documentsRes.error;

  return {
    profile: profileRes.data,
    assignments: assignmentsRes.data,
    documents: documentsRes.data,
  };
};


// --- Type for Access Requests (ensure columns match your SQL) ---
export type AccessRequest = Database['public']['Tables']['access_requests']['Row'];
// Add Update type if needed, though status update is simple
// export type AccessRequestUpdate = Database['public']['Tables']['access_requests']['Update'];


// --- Existing functions (getRentalEquipment, services, jobs, etc.) ---
// ... keep all previously defined functions ...


// --- NEW Access Request Operations ---

/**
 * Fetches access requests, optionally filtering by status.
 */
export const getAccessRequests = async (status?: 'pending' | 'approved' | 'rejected') => {
  let query = supabase
    .from('access_requests')
    .select('*')
    .order('created_at', { ascending: true }); // Show oldest first

  if (status) {
    query = query.eq('status', status);
  }

  return query; // Returns { data, error }
};

/**
 * Updates the status of a specific access request.
 */
export const updateAccessRequestStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
  return supabase
    .from('access_requests')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select() // Return the updated row(s)
    .single(); // Expect only one row
};

/**
 * Invites a user via Supabase Auth Admin API.
 * ⚠️ THIS CANNOT BE CALLED FROM THE CLIENT-SIDE BROWSER.
 * This function must be moved to a Supabase Edge Function.
 * The 'supabase.auth.admin' object is not available on the client.
 */
export const inviteUserByEmail = async (email: string) => {
   if (!supabase.auth.admin) {
       console.error("supabase.auth.admin is not available. Move this to an Edge Function.");
       return { data: null, error: { message: "Admin Auth API not available on client." } };
   }
   
   // --- THIS CODE WILL FAIL IF RUN FROM THE BROWSER ---
   // --- IT MUST BE IN AN EDGE FUNCTION ---
   try {
     console.warn("Attempting to call admin function from client. This should be an Edge Function.");
     const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

     if (error && error.message?.includes('already registered')) {
        console.warn(`User ${email} already registered.`);
        const { data: existingUserData, error: getUserError } = await supabase.auth.admin.listUsers({ email: email });
        if (getUserError || !existingUserData?.users?.length) {
            return { data: null, error: { message: `User exists but failed to retrieve: ${getUserError?.message}` }};
        }
        return { data: { user: existingUserData.users[0] }, error: null }; 
     }
     return { data, error };
   } catch (err: any) {
      console.error("Caught exception during inviteUserByEmail:", err);
      return { data: null, error: { message: err.message || "An unexpected error occurred during invite." } };
   }
};

/**
 * Creates or updates a profile entry for a user in the 'profiles' table.
 * Links the Supabase Auth user ID to application-specific data like role.
 */
export const createOrUpdateClientProfile = async (
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    company?: string | null
) => {
    // Data to insert or update in the 'profiles' table
    const profileData = {
        id: userId,          // Must match the auth.users.id
        role: 'client',      // Assign the 'client' role
        first_name: firstName,
        last_name: lastName,
        email: email,        // Storing email redundantly can be useful
        phone: phone,
        company: company,
        updated_at: new Date().toISOString(), // Ensure updated_at is set
    };

    // Use upsert to handle both new profiles and existing ones
    // `onConflict: 'id'` tells Supabase to update if a profile with this ID already exists
    return supabase
        .from('profiles') // ** CHECK YOUR TABLE NAME **
        .upsert(profileData, { onConflict: 'id' })
        .select() // Return the created or updated profile row
        .single(); // Expect only one row
};

// --- Realtime listener for access requests ---
export const onAccessRequestsChange = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('access_requests_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'access_requests' }, callback)
    .subscribe();
  return channel;
};

// --- START: V2 ASSIGNMENT FUNCTIONS ---

/**
 * Creates an activity event.
 * This should be called *after* a main action (e.g., status change, comment).
 */
const createAssignmentEvent = async (
  assignmentId: string,
  actorId: string,
  type: string,
  payload: object = {}
) => {
  return supabase.from('assignment_events').insert({
    assignment_id: assignmentId,
    actor_id: actorId,
    type: type,
    payload: payload,
  });
};

/**
 * Fetches all assignments for the admin dashboard.
 * Includes assignee and creator profile info.
 */
export const getAdminAssignments = async () => {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      assignee:profiles!assignee_id(id, first_name, last_name, avatar_url),
      created_by_profile:profiles!created_by(id, first_name, last_name, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { data: data || [], error: null };
};

/**
 * Fetches all assignments for a specific employee.
 */
export const getEmployeeAssignments = async (employeeId: string) => {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      assignee:profiles!assignee_id(id, first_name, last_name, avatar_url),
      created_by_profile:profiles!created_by(id, first_name, last_name, avatar_url)
    `)
    .eq('assignee_id', employeeId)
    .order('due_date', { ascending: true });
    
  if (error) throw error;
  return { data: data || [], error: null };
};

/**
 * Fetches all details for a single assignment (V2).
 */
export const getFullAssignmentDetailsV2 = async (assignmentId: string): Promise<{ data: FullAssignment | null, error: any }> => {
  // Fetch all data in parallel
  const [
    assignmentRes,
    milestonesRes,
    deliverablesRes,
    commentsRes,
    eventsRes
  ] = await Promise.all([
    supabase
      .from('assignments')
      .select(`
        *,
        assignee:profiles!assignee_id(id, first_name, last_name, avatar_url),
        created_by_profile:profiles!created_by(id, first_name, last_name, avatar_url)
      `)
      .eq('id', assignmentId)
      .single(),
    supabase
      .from('assignment_milestones')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('order_index', { ascending: true }),
    supabase
      .from('assignment_deliverables')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: false }),
    supabase
      .from('assignment_comments')
      .select(`
        *,
        author:profiles!author_id(id, first_name, last_name, avatar_url)
      `)
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: true }),
    supabase
      .from('assignment_events')
      .select(`
        *,
        actor:profiles!actor_id(id, first_name, last_name, avatar_url)
      `)
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: false })
      .limit(20)
  ]);

  if (assignmentRes.error) return { data: null, error: assignmentRes.error };

  const fullAssignment: FullAssignment = {
    ...assignmentRes.data,
    milestones: milestonesRes.data || [],
    deliverables: deliverablesRes.data || [],
    comments: commentsRes.data || [],
    events: eventsRes.data || [],
    assignee: assignmentRes.data.assignee,
    created_by_profile: assignmentRes.data.created_by_profile
  };

  return { data: fullAssignment, error: null };
};

/**
 * Creates a new assignment (V2).
 * This is a multi-step process:
 * 1. Upload brief (if provided)
 * 2. Create assignment record
 * 3. Create milestone records
 * 4. Create "Created" event
 */
export const createAssignmentV2 = async (
  formData: {
    title: string,
    description: string,
    assignee_id: string,
    category: string,
    priority: string,
    due_date: string,
    acceptance_criteria: string,
    milestones: { title: string }[],
    briefFile: File | null
  },
  adminId: string
) => {
  let briefUrl = null;

  // 1. Upload brief
  if (formData.briefFile) {
    const filePath = `briefs/${adminId}/${formData.briefFile.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('briefs')
      .upload(filePath, formData.briefFile, { upsert: true });
    
    if (storageError) throw new Error(`Brief upload failed: ${storageError.message}`);
    
    const { data: urlData } = supabase.storage.from('briefs').getPublicUrl(storageData.path);
    briefUrl = urlData.publicUrl;
  }

  // 2. Create assignment record
  const { data: newAssignment, error: assignmentError } = await supabase
    .from('assignments')
    .insert({
      title: formData.title,
      description: formData.description,
      assignee_id: formData.assignee_id,
      category: formData.category,
      priority: formData.priority,
      due_date: formData.due_date || null,
      acceptance_criteria: formData.acceptance_criteria,
      brief_url: briefUrl,
      created_by: adminId,
      status: 'Assigned', // Automatically set to Assigned
    })
    .select()
    .single();

  if (assignmentError) throw assignmentError;

  // 3. Create milestone records
  if (formData.milestones && formData.milestones.length > 0) {
    const milestoneInserts = formData.milestones.map((m, index) => ({
      assignment_id: newAssignment.id,
      title: m.title,
      order_index: index,
      status: 'Not_Started',
    }));
    
    const { error: milestoneError } = await supabase
      .from('assignment_milestones')
      .insert(milestoneInserts);
    
    if (milestoneError) {
      // Non-critical error, just log it
      console.warn("Failed to create milestones:", milestoneError.message);
    }
  }

  // 4. Create events
  await createAssignmentEvent(newAssignment.id, adminId, 'Created', { title: newAssignment.title });
  await createAssignmentEvent(newAssignment.id, adminId, 'StatusChanged', { newStatus: 'Assigned' });

  return { data: newAssignment, error: null };
};

/**
 * Updates an assignment's status (V2).
 * Creates an event log for the status change.
 */
export const updateAssignmentStatusV2 = async (
  assignmentId: string,
  newStatus: AssignmentStatus,
  actorId: string,
  payload: object = {}
) => {
  const { data, error } = await supabase
    .from('assignments')
    .update({ status: newStatus })
    .eq('id', assignmentId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Create event
  await createAssignmentEvent(assignmentId, actorId, 'StatusChanged', { newStatus, ...payload });
  
  return { data, error: null };
};

/**
 * Updates an assignment's progress value (V2).
 */
export const updateAssignmentProgress = async (
  assignmentId: string,
  progressValue: number,
  actorId: string
) => {
  const { data, error } = await supabase
    .from('assignments')
    .update({ progress_value: progressValue })
    .eq('id', assignmentId)
    .select()
    .single();
    
  if (error) throw error;
  
  // Create event
  await createAssignmentEvent(assignmentId, actorId, 'ProgressUpdated', { newProgress: progressValue });
  
  return { data, error: null };
};

/**
 * Updates a milestone's status (V2).
 */
export const updateMilestoneStatus = async (
  milestoneId: string,
  newStatus: 'Not_Started' | 'In_Progress' | 'Done',
  actorId: string
) => {
  const { data: milestone, error } = await supabase
    .from('assignment_milestones')
    .update({ status: newStatus })
    .eq('id', milestoneId)
    .select()
    .single();
    
  if (error) throw error;
  
  // Create event
  await createAssignmentEvent(milestone.assignment_id, actorId, 'MilestoneUpdated', {
    milestone: milestone.title,
    newStatus: newStatus
  });
  
  return { data: milestone, error: null };
};

/**
 * Posts a comment on an assignment (V2).
 */
export const postAssignmentCommentV2 = async (
  assignmentId: string,
  authorId: string,
  body: string,
  visibility: 'Internal' | 'AdminOnly' = 'Internal'
) => {
  const { data, error } = await supabase
    .from('assignment_comments')
    .insert({
      assignment_id: assignmentId,
      author_id: authorId,
      body: body,
      visibility: visibility
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Create event
  await createAssignmentEvent(assignmentId, authorId, 'Commented', {
    commentBody: body.substring(0, 50) + '...'
  });
  
  return { data, error: null };
};

/**
 * Uploads a deliverable file to storage (V2).
 * 1. Get next version number
 * 2. Upload file to storage
 * 3. Create deliverable record
 * 4. Create event
 */
export const uploadAssignmentDeliverable = async (
  assignmentId: string,
  file: File,
  label: string,
  uploaderId: string
) => {
  
  // 1. Get next version number
  const { data: existing, error: versionError } = await supabase
    .from('assignment_deliverables')
    .select('file_version')
    .eq('assignment_id', assignmentId)
    .eq('label', label)
    .order('file_version', { ascending: false })
    .limit(1);
    
  if (versionError) throw versionError;
  
  const nextVersion = (existing?.[0]?.file_version || 0) + 1;
  const fileExtension = file.name.split('.').pop();
  const baseName = label.replace(/[^a-zA-Z0-9]/g, '_');
  const newFileName = `${baseName}_v${nextVersion}.${fileExtension}`;
  
  // 2. Upload file to storage
  const filePath = `deliverables/${assignmentId}/${newFileName}`;
  const { data: storageData, error: storageError } = await supabase.storage
    .from('deliverables')
    .upload(filePath, file);

  if (storageError) throw new Error(`Deliverable upload failed: ${storageError.message}`);

  // 3. Create deliverable record
  const { data: deliverable, error: dbError } = await supabase
    .from('assignment_deliverables')
    .insert({
      assignment_id: assignmentId,
      label: label,
      file_path: storageData.path, // Store the path, not the full URL
      file_version: nextVersion,
      uploaded_by: uploaderId,
      notes: `Uploaded version ${nextVersion}`
    })
    .select()
    .single();
    
  if (dbError) throw dbError;
  
  // 4. Create event
  await createAssignmentEvent(assignmentId, uploaderId, 'FileUploaded', {
    fileName: newFileName,
    version: nextVersion
  });
  
  return { data: deliverable, error: null };
};

/**
 * Gets a temporary signed URL for a deliverable or brief.
 */
export const createStorageSignedUrl = async (bucket: 'deliverables' | 'briefs', filePath: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 3600); // Expires in 1 hour

  if (error) throw error;
  return data.signedUrl;
};

// --- END: V2 ASSIGNMENT FUNCTIONS ---

// --- START: EMPLOYEE DOCUMENT FUNCTIONS ---
export type EmployeeDocument = Database['public']['Tables']['employee_documents']['Row'];

/**
 * Fetches all documents for a specific employee.
 */
export const getEmployeeDocuments = async (profileId: string) => {
  return supabase
    .from('employee_documents')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
};

/**
 * Uploads a document for an employee.
 */
export const uploadEmployeeDocument = async (
  profileId: string,
  fileName: string,
  requiresSigning: boolean,
  file: File
) => {
  // 1. Upload the file to storage
  const filePath = `${profileId}/${file.name}`;
  const { data: storageData, error: storageError } = await supabase.storage
    .from('employee_documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // Overwrite if exists
    });

  if (storageError) throw storageError;

  // 2. Get the public URL
  const { data: urlData } = supabase.storage
    .from('employee_documents')
    .getPublicUrl(storageData.path);
  
  const publicUrl = urlData.publicUrl;

  // 3. Insert the record into the database table
  const { data: dbData, error: dbError } = await supabase
    .from('employee_documents')
    .insert({
      profile_id: profileId,
      document_name: fileName,
      storage_url: publicUrl, // Store the public URL
      requires_signing: requiresSigning,
    })
    .select()
    .single();

  if (dbError) throw dbError;
  return dbData;
};

// --- START: NEW FUNCTION ---
/**
 * Uploads a SIGNED document from an employee and updates the existing record.
 */
export const uploadSignedEmployeeDocument = async (
  originalDocument: EmployeeDocument,
  signedFile: File
) => {
  // 1. Create a new file name for the signed version
  const fileExtension = signedFile.name.split('.').pop();
  const baseName = originalDocument.document_name.replace(/\.[^/.]+$/, ""); // Remove original extension
  const newFileName = `${baseName}_SIGNED.${fileExtension}`;
  const filePath = `${originalDocument.profile_id}/${newFileName}`;

  // 2. Upload the signed file to storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from('employee_documents') // Use the same bucket
    .upload(filePath, signedFile, {
      cacheControl: '3600',
      upsert: true, // Overwrite if it already exists
    });

  if (storageError) throw storageError;

  // 3. Get the public URL for the new signed file
  const { data: urlData } = supabase.storage
    .from('employee_documents')
    .getPublicUrl(storageData.path);
  
  const signedPublicUrl = urlData.publicUrl;

  // 4. Update the ORIGINAL database record
  const { data: dbData, error: dbError } = await supabase
    .from('employee_documents')
    .update({
      signed_storage_url: signedPublicUrl, // Set the signed URL
      signed_at: new Date().toISOString()   // Set the signed timestamp
    })
    .eq('id', originalDocument.id) // Match the original document ID
    .select()
    .single();

  if (dbError) throw dbError;
  return dbData;
};
// --- END: NEW FUNCTION ---


/**
 * Deletes an employee document from both storage and database.
 */
export const deleteEmployeeDocument = async (doc: EmployeeDocument) => {
  // 1. Delete from storage
  // Extract the file path from the URL
  const urlParts = doc.storage_url.split('/');
  const filePath = `${doc.profile_id}/${urlParts[urlParts.length - 1]}`;

  const { error: storageError } = await supabase.storage
    .from('employee_documents')
    .remove([filePath]);

  if (storageError && storageError.message !== 'The resource was not found') {
    console.warn("Storage delete error:", storageError.message);
  }
  
  // Also try to delete signed doc if it exists
  if(doc.signed_storage_url) {
     const signedUrlParts = doc.signed_storage_url.split('/');
     const signedFilePath = `${doc.profile_id}/${signedUrlParts[signedUrlParts.length - 1]}`;
     await supabase.storage.from('employee_documents').remove([signedFilePath]);
  }

  // 2. Delete from database
  const { error: dbError } = await supabase
    .from('employee_documents')
    .delete()
    .eq('id', doc.id);

  if (dbError) throw dbError;
  return true;
};

/**
 * Generates a signed URL for viewing a private document.
 * NOTE: This is how employees will view docs. Admins can use public URLs
 * if policies are set, but signed URLs are safer.
 */
export const createDocumentSignedUrl = async (doc: EmployeeDocument) => {
  const urlParts = doc.storage_url.split('/');
  const filePath = `${doc.profile_id}/${urlParts[urlParts.length - 1]}`;

  const { data, error } = await supabase.storage
    .from('employee_documents')
    .createSignedUrl(filePath, 3600); // URL expires in 1 hour

  if (error) throw error;
  return data.signedUrl;
};

// --- END: EMPLOYEE DOCUMENT FUNCTIONS ---


export type Service = Database['public']['Tables']['services']['Row'];

export const getServices = async () => {
  return supabase.from('services').select('*').is('deleted_at', null).order('title');
};

export const createService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
  return supabase.from('services').insert(service).select().single();
};

export const updateService = async (id: string, updates: Partial<Service>) => {
  return supabase.from('services').update(updates).eq('id', id).select().single();
};

export const softDeleteService = async (id: string) => {
  return supabase.from('services').update({ deleted_at: new Date().toISOString() }).eq('id', id).select().single();
};

export const restoreService = async (id: string) => {
  return supabase.from('services').update({ deleted_at: null }).eq('id', id).select().single();
};

export const permanentDeleteService = async (id: string) => {
  return supabase.from('services').delete().eq('id', id);
};

export const getDeletedServices = async () => {
  return supabase.from('services').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false });
};

export const onServicesChange = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('services_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, callback)
    .subscribe();
  return channel;
};

export type CareerApplication = Database['public']['Tables']['submitted_applications']['Row'];

/**
 * Fetches applications from 'submitted_applications' and joins 'job_positions' data.
 */
export const getCareerApplications = async (status?: string) => {
  let query = supabase
    .from('submitted_applications') // <-- USES YOUR TABLE
    .select(`
      id,
      first_name, 
      last_name, 
      email,
      phone,
      country_code,
      job_position_id,
      position_title,
      cover_letter,
      portfolio_url,
      status,
      created_at,
      updated_at,
      job_position:job_positions (
        title,
        description,
        team_name,
        team_id
      )
    `)
    .order('created_at', { ascending: false });
    
  if (status) query = query.eq('status', status);
  return query;
};

/**
 * Updates an application's status in 'submitted_applications'.
 */
export const updateCareerApplicationStatus = async (id: string, status: string) => {
  return supabase
    .from('submitted_applications') // <-- USES YOUR TABLE
    .update({ status })
    .eq('id', id)
    .select()
    .single();
};

export type JobPosition = Database['public']['Tables']['job_positions']['Row'];

/**
 * Fetches all *open* job positions. (For public careers page)
 */
export const getOpenJobPositions = async () => {
  return supabase
    .from('job_positions')
    .select('*')
    .eq('status', 'open')
    .is('deleted_at', null)
    .order('title');
};

/**
 * Fetches all *active* (not deleted) teams. (For public careers page)
 */
export const getActiveTeams = async () => {
  return supabase
    .from('teams')
    .select('*')
    .is('deleted_at', null) // Use 'is' or 'neq' depending on your 'is_deleted' column
    .neq('is_deleted', true)
    .order('name');
};

// Mapped type for rental equipment display in the UI
export interface RentalItemDisplay {
  id: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  price: number;
  images: string[] | null;
  features: string[] | null;
  videoUrl: string | null;
  status: string;
}

// Maps database rental_gear row to RentalItemDisplay format
const mapRentalGearToDisplay = (gear: RentalGear): RentalItemDisplay => {
  return {
    id: gear.id,
    title: gear.name,
    subtitle: gear.description,
    category: gear.category,
    price: gear.price_per_day,
    images: gear.image_url ? [gear.image_url] : null,
    features: gear.features,
    videoUrl: gear.video_url,
    status: gear.is_available ? 'Available' : 'Unavailable'
  };
};

export const getRentalEquipment = async () => {
  const result = await supabase.from('rental_gear').select('*').order('name');

  if (result.error) {
    return { data: null, error: result.error };
  }

  const mappedData = result.data?.map(mapRentalGearToDisplay) || [];
  return { data: mappedData, error: null };
};

/**
 * Fetches all *active* teams for the admin panel.
 */
export const getAllTeams = async () => {
  // Only select teams that are NOT soft-deleted.
  return supabase
    .from('teams')
    .select('*')
    .neq('is_deleted', true) // Keep this filter
    .order('name');
};

export const getMembers = async (teamId?: string) => {
  let query = supabase.from('members').select('*');
  if (teamId) query = query.eq('team_id', teamId);
  return query.order('created_at');
};

export type Team = Database['public']['Tables']['teams']['Row'];

export const createTeam = async (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
  return supabase.from('teams').insert(team).select().single();
};

export const updateTeam = async (id: string, updates: Partial<Team>) => {
  return supabase.from('teams').update(updates).eq('id', id).select().single();
};

export const deleteTeam = async (id: string) => {
  return supabase.from('teams').update({ deleted_at: new Date().toISOString(), is_deleted: true }).eq('id', id).select().single();
};

export type RentalGear = Database['public']['Tables']['rental_gear']['Row'];

export const getAllRentalEquipment = async () => {
  return supabase.from('rental_gear').select('*').order('name');
};

export const updateRentalEquipment = async (id: string, updates: Partial<RentalGear>) => {
  return supabase.from('rental_gear').update(updates).eq('id', id).select().single();
};

export const deleteRentalEquipment = async (id: string) => {
  return supabase.from('rental_gear').delete().eq('id', id);
};

export const onRentalGearChange = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('rental_gear_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_gear' }, callback)
    .subscribe();
  return channel;
};

/**
 * Fetches *all* job positions for the admin panel.
 */
export const getAllJobPositions = async () => {
  return supabase.from('job_positions').select('*').order('title');
};

export const createJobPosition = async (job: Omit<JobPosition, 'id' | 'created_at' | 'updated_at'>) => {
  return supabase.from('job_positions').insert(job).select().single();
};

export const updateJobPosition = async (id: string, updates: Partial<JobPosition>) => {
  return supabase.from('job_positions').update(updates).eq('id', id).select().single();
};

export const deleteJobPosition = async (id: string) => {
  // --- MODIFICATION: Changed from .update() to .delete() ---
  return supabase.from('job_positions').delete().eq('id', id);
};

export const getDeletedTeams = async () => {
  return supabase
    .from('teams')
    .select('*')
    .eq('is_deleted', true) // Only get deleted ones
    .order('deleted_at', { ascending: false });
};

export const restoreTeam = async (id: string) => {
  return supabase
    .from('teams')
    .update({ is_deleted: false, deleted_at: null })
    .eq('id', id)
    .select()
    .single();
};

// --- START: ***FIXED*** EMPLOYEE MANAGEMENT FUNCTIONS ---

/**
 * Deletes a user from the auth.users table and cascadingly deletes their profile.
 * This is now handled by an Edge Function for security.
 */
export async function deleteEmployeeAccount(userId: string) {
  // This invokes the 'manage-employee' Supabase Function
  const { data, error } = await supabase.functions.invoke('manage-employee', {
    body: { action: 'delete', userId },
  });

  if (error) {
    console.error("deleteEmployeeAccount Error:", error.message);
    // Return an error object that matches what the component expects
    return { data: null, error: new Error(error.message) };
  }
  
  // The 'data' from the function response might contain its own error
  if (data?.error) {
    console.error("deleteEmployeeAccount Function Error:", data.error);
    return { data: null, error: new Error(data.error) };
  }

  // Success 
  return { data: data?.data, error: null };
}

/**
 * Updates an employee's role in the public.profiles table to block/unblock access.
 * This is now handled by an Edge Function for security and to bypass RLS.
 */
export async function blockEmployeeAccess(userId: string, newRole: 'employee' | 'blocked') {
  // This invokes the 'manage-employee' Supabase Function
  const { data, error } = await supabase.functions.invoke('manage-employee', {
    body: { action: 'block', userId, newRole },
  });

  if (error) {
    console.error("blockEmployeeAccess Error:", error.message);
    return { data: null, error: new Error(error.message) };
  }
  
  // Check for the function's *internal* error property
  if (data?.error) {
    console.error("blockEmployeeAccess Function Error:", data.error);
    return { data: null, error: new Error(data.error) };
  }

  // Success
  return { data: data?.data, error: null };
}

// --- END: ***FIXED*** EMPLOYEE MANAGEMENT FUNCTIONS ---