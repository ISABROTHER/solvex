// src/pages/client/NewRequestPage.tsx

// ... (imports and schema definition) ...

const NewRequestPage: React.FC = () => {
  // ... (state, react-hook-form setup) ...
  const [showCustomService, setShowCustomService] = useState(false);
  const {
    // ... (other form methods) ...
    watch,
    setValue,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    // ... (defaultValues) ...
  });

  const selectedServiceType = watch('serviceType');

  // Handle showing/hiding the custom service input
  React.useEffect(() => {
    if (selectedServiceType === 'Other') {
      setShowCustomService(true);
    } else {
      setShowCustomService(false);
      setValue('customServiceType', ''); // Clear custom input if 'Other' is deselected
    }
  }, [selectedServiceType, setValue]);

  const onSubmit: SubmitHandler<RequestFormData> = async (data) => {
    // ... (submission logic) ...
    // Use custom service type if 'Other' is selected and custom input is filled
    const finalServiceType = data.serviceType === 'Other' && data.customServiceType
        ? data.customServiceType
        : data.serviceType;
    // ... (rest of submission logic using finalServiceType) ...
  };

  return (
    // ... (page structure) ...
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow border border-gray-100">
          {/* Service Type Dropdown */}
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium leading-6 text-gray-900">
              Service Type <span className="text-red-600">*</span>
            </label>
            <select
              id="serviceType"
              {...register('serviceType')}
              className={`mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#FF5722] sm:text-sm sm:leading-6 ${errors.serviceType ? 'ring-red-500' : ''}`}
            >
              <option value="" disabled>Select a service...</option>
              {SERVICES_DATA.map((service) => (
                <option key={service.id} value={service.title}>{service.title}</option>
              ))}
              {/* --- This is the custom option --- */}
              <option value="Other">Other (Please specify)</option>
            </select>
            {errors.serviceType && <p className="mt-1 text-xs text-red-600">{errors.serviceType.message}</p>}
          </div>

          {/* --- Custom Service Type Input (Conditional) --- */}
          {showCustomService && (
            <div>
              <label htmlFor="customServiceType" className="block text-sm font-medium leading-6 text-gray-900">
                Custom Service Type <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="customServiceType"
                {...register('customServiceType')}
                className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#FF5722] sm:text-sm sm:leading-6 ${errors.customServiceType ? 'ring-red-500' : ''}`}
                placeholder="e.g., Custom Software Development"
              />
               {/* Conditionally validate custom input if 'Other' is selected */}
               {selectedServiceType === 'Other' && errors.serviceType && !watch('customServiceType') && (
                   <p className="mt-1 text-xs text-red-600">Please specify the service type.</p>
               )}
               {errors.customServiceType && <p className="mt-1 text-xs text-red-600">{errors.customServiceType.message}</p>}
            </div>
          )}
          {/* --- End Conditional Input --- */}

          {/* ... (rest of the form fields: Project Title, Brief, Timeline, Submit Button) ... */}
        </form>
    // ... (rest of component) ...
  );
};

export default NewRequestPage;