// PASTE THESE TWO NEW FUNCTIONS AT THE END OF src/lib/supabase/operations.ts

/**
 * Uploads a SIGNED version of an employee document.
 */
export const uploadSignedEmployeeDocument = async (
  doc: EmployeeDocument,
  file: File,
  userId: string
) => {
  // 1. Create a new file path for the signed version
  const fileExtension = file.name.split('.').pop();
  const baseName = file.name.replace(`.${fileExtension}`, '');
  // Add _SIGNED suffix to distinguish from original
  const signedFilePath = `${userId}/${baseName}_SIGNED.${fileExtension}`;

  // 2. Upload the new signed file to storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from('employee_documents')
    .upload(signedFilePath, file, {
      cacheControl: '3600',
      upsert: true, // Overwrite if it already exists
    });

  if (storageError) throw storageError;

  // 3. Get the public URL for the signed file
  const { data: urlData } = supabase.storage
    .from('employee_documents')
    .getPublicUrl(storageData.path);

  const signedPublicUrl = urlData.publicUrl;

  // 4. Update the database record with the signed file URL and timestamp
  const { data: dbData, error: dbError } = await supabase
    .from('employee_documents')
    .update({
      signed_storage_url: signedPublicUrl,
      signed_at: new Date().toISOString(),
    })
    .eq('id', doc.id)
    .select()
    .single();

  if (dbError) throw dbError;
  return dbData;
};

/**
 * Generates a signed URL for viewing a private SIGNED document.
 */
export const createSignedDocumentSignedUrl = async (doc: EmployeeDocument) => {
  if (!doc.signed_storage_url) {
    throw new Error('Document does not have a signed version.');
  }
  
  // Extract path from the full public URL
  const urlParts = doc.signed_storage_url.split('/');
  // Reconstruct the storage path: profile_id/filename_SIGNED.pdf
  const filePath = `${doc.profile_id}/${urlParts[urlParts.length - 1]}`;

  const { data, error } = await supabase.storage
    .from('employee_documents')
    .createSignedUrl(filePath, 3600); // URL expires in 1 hour

  if (error) throw error;
  return data.signedUrl;
};