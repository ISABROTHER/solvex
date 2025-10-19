// src/pages/RequestAccessPage.tsx

    // Inside the return statement for the Form View:
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Request Client Access</h1>
                <p className="text-center text-gray-500 mb-6 text-sm">Fill out the form for portal access.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Centered Form Error Display Area */}
                    {formError && (
                        <div className="my-4 p-4 text-center bg-red-50 border border-red-200 text-red-700 rounded-md text-sm shadow-sm" role="alert">
                            {formError}
                        </div>
                    )}
                    {/* End Form Error Display Area */}


                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {/* ... first name input ... */}
                       {/* ... last name input ... */}
                    </div>

                    {/* Email */}
                    {/* ... email input ... */}

                    {/* Phone */}
                    {/* ... phone input ... */}

                    {/* Company (Optional) */}
                    {/* ... company input ... */}

                    {/* Reason (Optional) */}
                    {/* ... reason textarea ... */}

                    {/* Submit Button */}
                    {/* ... submit button ... */}

                     {/* Back to Login Link */}
                     {/* ... back link ... */}
                </form>
            </div>
        </div>
    );