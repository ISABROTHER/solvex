const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    addToast({
        type: 'success',
        title: 'Request Sent',
        message: 'Thank you! We have received your access request and will get back to you shortly.',
    });
    setFormData({ fullName: '', email: '', company: '', phone: '', reason: '' });
};

return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-stone-50 via-orange-50 to-amber-50 items-center justify-center px-5 py-10 selection:bg-[#FF5722]/20">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
            {/* Header / Logo */}
            <div className="flex flex-col items-center text-center p-8 border-b border-gray-100">
                <img src="/Solvexstudios logo.png" alt="Solvex Logo" className="h-10 w-auto mb-4" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                    Client Dashboard Access
                </h1>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Welcome! Provide your details below to request access. We'll review it promptly.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                {[
                    { name: 'fullName', type: 'text', icon: User, placeholder: 'Full Name *', required: true },
                    { name: 'email', type: 'email', icon: Mail, placeholder: 'Email *', required: true },
                ].map(({ name, type, icon: Icon, placeholder, required }) => (
                    <div key={name} className="relative group">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5722]" size={20} />
                        <input
                            type={type}
                            name={name}
                            placeholder={placeholder}
                            value={(formData as any)[name]}
                            onChange={handleChange}
                            required={required}
                            className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400/70"
                        />
                    </div>
                ))}

                {/* Company + Phone */}
                <div className="space-y-5 sm:grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                    {[
                        { name: 'company', type: 'text', icon: Building, placeholder: 'Company / Org' },
                        { name: 'phone', type: 'tel', icon: Phone, placeholder: 'Phone' },
                    ].map(({ name, type, icon: Icon, placeholder }) => (
                        <div key={name} className="relative group">
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5722]" size={20} />
                            <input
                                type={type}
                                name={name}
                                placeholder={placeholder}
                                value={(formData as any)[name]}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400/70"
                            />
                        </div>
                    ))}
                </div>

                {/* Reason */}
                <div className="relative group">
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <MessageSquareText size={16} className="text-gray-500" />
                        Reason for access *
                        <span className="relative ml-1 group/tooltip">
                            <Info size={14} className="text-gray-400 cursor-help" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 leading-snug shadow-lg">
                                e.g., Project details, service needed, account check-in.
                            </span>
                        </span>
                    </label>
                    <textarea
                        id="reason"
                        name="reason"
                        placeholder="Briefly tell us why you need access..."
                        value={formData.reason}
                        onChange={handleChange}
                        rows={4}
                        required
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition duration-200 ease-in-out resize-none placeholder-gray-400/70"
                    />
                </div>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={isLoading}
                    className="w-full bg-[#FF5722] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#E64A19] disabled:opacity-75 flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            <span>Submitting...</span>
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            <span>Request Access</span>
                        </>
                    )}
                </motion.button>
            </form>

            {/* Visual Section (shown only on md+) */}
            <div className="relative hidden md:block h-64 sm:h-72 md:h-96 overflow-hidden">
                <img
                    src="/client-access-image.jpg"
                    alt="Client Access Portal"
                    className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/30 to-transparent"></div>
                <div className="relative h-full flex flex-col justify-end p-8 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <h2 className="text-2xl sm:text-3xl font-semibold mb-3 leading-tight drop-shadow-md">
                            Your Project Hub Awaits
                        </h2>
                        <p className="text-gray-200 text-sm sm:text-base leading-relaxed max-w-md">
                            Manage your projects, track progress, and communicate with the Solvex team — seamlessly.
                        </p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    </div>
);
