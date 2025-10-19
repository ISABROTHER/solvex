// src/pages/RequestAccessPage.tsx

    const onSubmit: SubmitHandler<RequestAccessFormData> = async (data) => {
        setIsSubmitting(true);
        setIsSuccess(false);
        setSubmittedFirstName('');
        setFormError(null); // <-- Clear previous form error on new submit

        try {
            const { error } = await supabaseForms.submitAccessRequest(data); // Assuming forms.ts returns { error }

            if (error) {
                // Check if it's the specific duplicate email error
                if (error.code === '23505' || error.message?.includes('already exists')) {
                    // Set the form-specific error state instead of using toast
                    setFormError('An access request with this email already exists. Please use a different email.');
                } else {
                    // Use toast for other, unexpected database errors
                    console.error('Supabase submit error:', error);
                    addToast({ type: 'error', title: 'Database Error', message: error.message || 'Could not submit request. Please try again.' });
                }
            } else {
                // Success case - use toast
                addToast({ type: 'success', title: 'Request Sent!', message: 'We will review your request shortly.' });
                setSubmittedFirstName(data.firstName);
                reset();
                setIsSuccess(true);
            }
        } catch (err: any) { // Catch unexpected client-side errors during submission
            console.error('Failed to submit access request:', err);
            // Use toast for these unexpected errors
            addToast({ type: 'error', title: 'Submission Error', message: err.message || 'An unexpected error occurred. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };