// src/pages/RequestAccessPage.tsx

    const onSubmit: SubmitHandler<RequestAccessFormData> = async (data) => {
        setIsSubmitting(true);
        setIsSuccess(false);
        setSubmittedFirstName('');
        setFormError(null); // Clear previous form error

        try {
            // Assuming forms.ts returns { error } where error might have code/message
            const { error } = await supabaseForms.submitAccessRequest(data);

            if (error) {
                console.log("Supabase Error Object:", error); // <-- Add this log

                // Check specifically for the unique constraint violation code from PostgreSQL
                if (error.code === '23505') {
                    // Set the form error state for duplicate email
                    setFormError('An access request with this email already exists. Please use a different email or log in.');
                    // IMPORTANT: Do NOT call addToast here
                }
                // Check if the custom message from forms.ts is being returned
                else if (error.message?.includes('already exists')) {
                     setFormError(error.message); // Use the message from forms.ts
                     // IMPORTANT: Do NOT call addToast here
                 }
                else {
                    // Handle OTHER database errors using toast
                    console.error('Unhandled Supabase submit error:', error);
                    addToast({ type: 'error', title: 'Database Error', message: error.message || 'Could not submit request. Please try again.' });
                }
            } else {
                // Success case - use toast
                addToast({ type: 'success', title: 'Request Sent!', message: 'We will review your request shortly.' });
                setSubmittedFirstName(data.firstName);
                reset();
                setIsSuccess(true);
            }
        } catch (err: any) { // Catch unexpected client-side errors
            console.error('Client-side error during submission:', err);
            addToast({ type: 'error', title: 'Submission Error', message: err.message || 'An unexpected error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };