// @ts-nocheck
import { supabase } from './client';
import type { Database } from './database.types';

export type EmployeeDocument = Database['public']['Tables']['employee_documents']['Row'];

// --- Employee Management ---

export const getEmployeeDocuments = async (profileId: string) => {
  return supabase
    .from('employee_documents')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
};

export const uploadEmployeeDocument = async (
  profileId: string, 
  documentName: string, 
  requiresSigning: boolean, 
  file: File
): Promise<EmployeeDocument> => {
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${documentName.replace(/ /g, '_')}_${Date.now()}.${fileExt}`;
  const filePath = `${profileId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('employee_documents')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error(`Storage Error: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('employee_documents')
    .getPublicUrl(filePath);

  if (!urlData) {
    throw new Error('Could not get public URL for the uploaded file.');
  }

  // Insert record into the database table
  const { data: dbData, error: dbError } = await supabase
    .from('employee_documents')
    .insert({
      profile_id: profileId,
      document_name: documentName,
      storage_url: urlData.publicUrl,
      requires_signing: requiresSigning,
      // storage_path: filePath, // This column doesn't exist in your table
    })
    .select()
    .single();

  if (dbError) {
    console.error('Database insert error:', dbError);
    // Attempt to delete the orphaned file from storage
    await supabase.storage.from('employee_documents').remove([filePath]);
    throw new Error(`Database Error: ${dbError.message}`);
  }

  return dbData;
};

export const deleteEmployeeDocument = async (doc: EmployeeDocument) => {
  if (!doc.storage_url) {
    throw new Error('Document has no storage URL to delete.');
  }

  // 1. Extract file path from URL
  // URL format: https://[...].supabase.co/storage/v1/object/public/employee_documents/[filePath]
  let filePath = '';
  try {
    const url = new URL(doc.storage_url);
    filePath = url.pathname.split('/employee_documents/')[1];
  } catch (e) {
    console.error('Invalid URL:', doc.storage_url);
    throw new Error('Could not parse file path from URL.');
  }
  
  if (!filePath) {
    throw new Error('Could not determine file path.');
  }

  // 2. Delete from storage
  const { error: storageError } = await supabase.storage
    .from('employee_documents')
    .remove([filePath]);

  if (storageError && storageError.message !== 'Object not found') {
    // Log the error but proceed to delete the DB record
    console.warn(`Could not delete file from storage: ${storageError.message}`);
  }
  
  // 3. Delete signed doc if it exists
  if (doc.signed_storage_url) {
     try {
        const signedUrl = new URL(doc.signed_storage_url);
        const signedFilePath = signedUrl.pathname.split('/employee_documents/')[1];
        if (signedFilePath) {
           await supabase.storage.from('employee_documents').remove([signedFilePath]);
        }
     } catch (e) {
        console.warn('Could not parse or delete signed file:', e);
     }
  }

  // 4. Delete from database
  const { error: dbError } = await supabase
    .from('employee_documents')
    .delete()
    .eq('id', doc.id);

  if (dbError) {
    throw new Error(`Database delete error: ${dbError.message}`);
  }

  return true;
};


// --- THIS IS THE FIX ---
// Uncommented the function
export const signEmployeeDocument = async (doc: EmployeeDocument, userId: string): Promise<EmployeeDocument> => {
  if (!doc.storage_url) {
    throw new Error('Document has no file to sign.');
  }
  if (doc.signed_storage_url) {
    throw new Error('Document has already been signed.');
  }

  // 1. Create a "signed" copy in storage
  let originalFilePath = '';
  try {
    originalFilePath = doc.storage_url.split('/employee_documents/')[1];
  } catch (e) {
    throw new Error('Could not parse original file path.');
  }
  
  const pathParts = originalFilePath.split('/');
  const originalFileName = pathParts.pop();
  const signedFileName = `SIGNED_${originalFileName}`;
  const signedFilePath = [...pathParts, signedFileName].join('/');

  // 1. Download the original file
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('employee_documents')
    .download(originalFilePath);
    
  if (downloadError) throw new Error(`Failed to download original: ${downloadError.message}`);

  // 2. Re-upload it as the "signed" copy
  // In a real app, you'd add a signature here. For now, we just copy it.
  const { error: uploadError } = await supabase.storage
    .from('employee_documents')
    .upload(signedFilePath, fileData, {
      contentType: fileData.type,
    });
    
  if (uploadError) throw new Error(`Failed to upload signed copy: ${uploadError.message}`);

  // 3. Get the new public URL
  const { data: urlData } = supabase.storage
    .from('employee_documents')
    .getPublicUrl(signedFilePath);

  // 4. Update the database record
  const { data: updatedDoc, error: dbError } = await supabase
    .from('employee_documents')
    .update({
      signed_storage_url: urlData.publicUrl,
      signed_at: new Date().toISOString(),
    })
    .eq('id', doc.id)
    .select()
    .single();

  if (dbError) throw new Error(`Failed to update document record: ${dbError.message}`);
  
  return updatedDoc;
};


export const createDocumentSignedUrl = async (doc: EmployeeDocument) => {
   let filePath = '';
   try {
     filePath = doc.storage_url.split('/employee_documents/')[1];
   } catch (e) {
     throw new Error('Could not parse file path.');
   }
  
   const { data, error } = await supabase.storage
    .from('employee_documents')
    .createSignedUrl(filePath, 3600); // 1 hour expiry
    
   if (error) throw new Error(`Could not create signed URL: ${error.message}`);
   
   return data.signedUrl;
};
// --- END OF FIX ---


// --- Admin: Employee Management ---

export const deleteEmployeeAccount = async (profileId: string) => {
  const { error } = await supabase.rpc('delete_employee_account', {
    profile_id_to_delete: profileId
  });

  if (error) {
    console.error('Error calling delete_employee_account:', error);
    throw new Error(error.message);
  }
  return { success: true };
};

export const blockEmployeeAccess = async (profileId: string, newRole: 'blocked' | 'employee') => {
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', profileId);
    
  if (error) {
    console.error('Error updating employee role:', error);
    throw new Error(error.message);
  }
  return { success: true };
};


// --- Assignments (Admin & Employee) ---

export const getAssignmentsForEmployee = async (profileId: string) => {
  return supabase
    .from('assignments')
    .select(`
      *,
      client_id ( full_name )
    `)
    .eq('employee_id', profileId)
    .order('due_date', { ascending: true });
};

export const getFullAssignmentDetails = async (assignmentId: string) => {
  return supabase
    .from('assignments')
    .select(`
      *,
      client_id ( full_name, email, phone ),
      employee_id ( first_name, last_name, avatar_url ),
      created_by ( first_name, last_name, avatar_url ),
      deliverables ( * ),
      comments (
        *,
        author_id ( first_name, last_name, avatar_url, role )
      )
    `)
    .eq('id', assignmentId)
    .order('created_at', { referencedTable: 'comments', ascending: true })
    .single();
};

export const createAssignment = async (assignmentData: any, creatorId: string) => {
  return supabase.from('assignments').insert({
    ...assignmentData,
    created_by: creatorId,
    status: 'pending' 
  });
};

export const updateAssignmentStatus = async (assignmentId: string, status: string) => {
  return supabase
    .from('assignments')
    .update({ status })
    .eq('id', assignmentId);
};

export const postAssignmentComment = async (assignmentId: string, authorId: string, content: string) => {
  return supabase
    .from('comments')
    .insert({
      assignment_id: assignmentId,
      author_id: authorId,
      content: content
    });
};

// --- Deliverables (Employee) ---

export const uploadDeliverable = async (assignmentId: string, uploaderId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${file.name.replace(/ /g, '_')}_${Date.now()}.${fileExt}`;
  const filePath = `${assignmentId}/${uploaderId}/${fileName}`;

  // 1. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from('deliverables')
    .upload(filePath, file);

  if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

  // 2. Get Public URL
  const { data: urlData } = supabase.storage
    .from('deliverables')
    .getPublicUrl(filePath);

  // 3. Insert record into DB
  const { error: dbError } = await supabase
    .from('deliverables')
    .insert({
      assignment_id: assignmentId,
      uploader_id: uploaderId,
      file_name: file.name,
      storage_url: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
    });
    
  if (dbError) {
    // Attempt to delete orphaned file
    await supabase.storage.from('deliverables').remove([filePath]);
    throw new Error(`Database Error: ${dbError.message}`);
  }
  
  // 4. Update assignment status
  await updateAssignmentStatus(assignmentId, 'in_review');

  return true;
};

export const deleteDeliverable = async (deliverableId: string, storageUrl: string) => {
  // 1. Extract path
  let filePath = '';
  try {
    filePath = new URL(storageUrl).pathname.split('/deliverables/')[1];
  } catch(e) {
    throw new Error('Invalid storage URL');
  }

  // 2. Delete from Storage
  const { error: storageError } = await supabase.storage
    .from('deliverables')
    .remove([filePath]);
    
  if (storageError && storageError.message !== 'Object not found') {
    console.warn(`Could not delete file from storage: ${storageError.message}`);
  }
  
  // 3. Delete from DB
  const { error: dbError } = await supabase
    .from('deliverables')
    .delete()
    .eq('id', deliverableId);
    
  if (dbError) throw new Error(`Database delete error: ${dbError.message}`);
  
  return true;
};