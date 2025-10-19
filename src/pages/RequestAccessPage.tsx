// src/pages/RequestAccessPage.tsx
import React, { useState, useEffect } from 'react'; // Import useEffect
// ... other imports ...

const RequestAccessPage: React.FC = () => {
    // ... existing state (addToast, isSubmitting, etc.) ...
    const [formError, setFormError] = useState<string | null>(null); // <-- Add this state

    const {
        register,
        handleSubmit,
        reset,
        watch, // <-- Import watch from useForm
        formState: { errors },
    } = useForm<RequestAccessFormData>({
        resolver: zodResolver(requestAccessSchema),
    });

    // Watch input fields to clear the error when the user types
    const watchedFields = watch(["firstName", "lastName", "email", "phone"]);

    // Effect to clear formError when inputs change
    useEffect(() => {
        if (formError) {
            setFormError(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedFields]); // Rerun when watched fields change
    // Note: formError intentionally omitted from deps to only clear, not set

    // ... onSubmit function ...
    // ... Success View JSX ...
    // ... Form View JSX ...
};