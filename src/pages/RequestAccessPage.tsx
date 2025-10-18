// src/pages/RequestAccessPage.tsx
// ... other imports ...
import { supabaseForms } from '../lib/supabase/forms'; // Correct path to the forms file
// ... rest of the component ...

const onSubmit: SubmitHandler<RequestAccessFormData> = async (data) => {
  setIsSubmitting(true);
  setIsSuccess(false);
  try {
    const { error } = await supabaseForms.submitAccessRequest(data); // Use the imported function
    if (error) {
      if (error.code === '23505') {
        addToast({ type: 'error', title: 'Email already exists', message: 'An access request with this email already exists.' });
      } else {
        throw error;
      }
    } else {
      addToast({ type: 'success', title: 'Success!', message: 'Access request submitted successfully! We will review it shortly.' });
      reset();
      setIsSuccess(true);
    }
  } catch (error: any) {
    console.error('Failed to submit access request:', error);
    addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to submit request. Please try again.' });
  } finally {
    setIsSubmitting(false);
  }
};
// ... rest of the component ...