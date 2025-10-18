// ... other imports ...
import { useForm, SubmitHandler } from 'react-hook-form';
import * as React from 'react'; // Ensure React is imported for useEffect/useState

// ... schema ...

const NewRequestPage: React.FC = () => {
  // ... hooks setup ...
  const [showCustomService, setShowCustomService] = React.useState(false); // State variable

  const {
    register,
    handleSubmit,
    watch, // <-- Used to monitor the dropdown value
    setValue,
    formState: { errors },
  } = useForm<RequestFormData>({
    // ... resolver and defaultValues ...
  });

  const selectedServiceType = watch('serviceType'); // <-- Watches the dropdown

  // Effect hook to show/hide the input
  React.useEffect(() => {
    if (selectedServiceType === 'Other') { // Check if 'Other' is selected
      setShowCustomService(true);         // Show the input
    } else {
      setShowCustomService(false);        // Hide the input
      setValue('customServiceType', '');  // Clear the input value
    }
  }, [selectedServiceType, setValue]); // Runs when selectedServiceType changes

  // ... onSubmit function ...

  return (
    // ... page structure ...
        <form onSubmit={handleSubmit(onSubmit)} /* ... */>
          {/* Service Type Dropdown */}
          <div>
            {/* ... dropdown code ... */}
            <select {...register('serviceType')} /* ... */>
              {/* ... options ... */}
              <option value="Other">Other (Please specify)</option>
            </select>
            {/* ... error display ... */}
          </div>

          {/* --- Custom Service Type Input (Conditional Rendering) --- */}
          {showCustomService && ( // <-- Only renders when showCustomService is true
            <div>
              <label htmlFor="customServiceType" /* ... */>
                Custom Service Type <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="customServiceType"
                {...register('customServiceType')}
                /* ... className and placeholder ... */
              />
              {/* ... error display ... */}
            </div>
          )}
          {/* --- End Conditional Input --- */}

          {/* ... rest of form ... */}
        </form>
      </div>
    // ...
  );
};

export default NewRequestPage;