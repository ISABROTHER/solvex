// src/pages/RequestAccessPage.tsx
// Inside the <form ...>

  {/* Name Inputs - REPLACED */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name <span className="text-red-600">*</span></label>
        <input type="text" id="firstName" {...register('firstName')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.firstName ? 'border-red-500 ring-red-500' : ''}`} />
        {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
    </div>
    <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-600">*</span></label>
        <input type="text" id="lastName" {...register('lastName')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.lastName ? 'border-red-500 ring-red-500' : ''}`} />
        {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
    </div>
  </div>

  {/* Email */}
  {/* ... email input ... */}

  {/* Phone */}
  {/* ... phone input ... */}

  {/* ... rest of form ... */}
</form>