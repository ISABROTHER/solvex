// src/pages/RequestAccessPage.tsx
// ... imports and schema ...

const RequestAccessPage: React.FC = () => {
    // ... hooks and state ...

    // ... onSubmit function ...

    if (isSuccess) {
      // ... success message JSX ...
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                {/* ... Heading ... */}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name <span className="text-red-600">*</span></label>
                            {/* Ensure /> is present */}
                            <input type="text" id="firstName" {...register('firstName')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.firstName ? 'border-red-500 ring-red-500' : ''}`} />
                            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-600">*</span></label>
                            {/* Ensure /> is present */}
                            <input type="text" id="lastName" {...register('lastName')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.lastName ? 'border-red-500 ring-red-500' : ''}`} />
                            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-600">*</span></label>
                         {/* Ensure /> is present */}
                        <input type="email" id="email" {...register('email')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.email ? 'border-red-500 ring-red-500' : ''}`} />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone <span className="text-red-600">*</span></label>
                         {/* Ensure /> is present */}
                        <input type="tel" id="phone" {...register('phone')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.phone ? 'border-red-500 ring-red-500' : ''}`} />
                        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                    </div>

                    {/* Company */}
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company <span className="text-gray-400">(Optional)</span></label>
                         {/* Ensure /> is present */}
                        <input type="text" id="company" {...register('company')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm" />
                    </div>

                    {/* Reason */}
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Access <span className="text-gray-400">(Optional)</span></label>
                        {/* Ensure closing </textarea> is present */}
                        <textarea id="reason" rows={3} {...register('reason')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.reason ? 'border-red-500 ring-red-500' : ''}`} placeholder="Briefly explain why..."></textarea>
                        {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        {/* Ensure closing </button> is present */}
                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 rounded-md bg-[#FF5722] px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E64A19] disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>

                     {/* Back Link */}
                     <div className="text-center mt-4">
                        {/* Ensure closing </Link> is present */}
                        <Link to="/my-page" className="text-sm text-gray-600 hover:text-[#FF5722]">
                            Back to Login
                        </Link>
                    </div>
                 {/* This is line 25 mentioned in the error */}
                </form>
            </div>
        </div>
    );
};

export default RequestAccessPage;