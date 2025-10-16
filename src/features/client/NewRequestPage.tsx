// src/pages/client/NewRequestPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useClientMock } from './useClientMock';
import { businessServicesData } from '../../data/business/services.data';

const NewRequestPage: React.FC = () => {
    const [formData, setFormData] = useState({ serviceType: '', projectTitle: '', brief: '', timeline: '' });
    const [errors, setErrors] = useState<Partial<typeof formData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addRequest } = useClientMock();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors: Partial<typeof formData> = {};
        if (!formData.serviceType) newErrors.serviceType = 'Service type is required.';
        if (!formData.projectTitle) newErrors.projectTitle = 'Project title is required.';
        if (!formData.brief) newErrors.brief = 'A brief description is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        // TODO: Replace setTimeout with actual API call
        setTimeout(() => {
            const newRequest = addRequest(formData);
            setIsSubmitting(false);
            // Show toast here in a real app
            navigate(`/client/requests/${newRequest.id}`);
        }, 1000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service Type*</label>
                        <select id="serviceType" name="serviceType" value={formData.serviceType} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-brand focus:ring-brand sm:text-sm ${errors.serviceType ? 'border-red-500' : ''}`}>
                            <option value="">Select a service</option>
                            {businessServicesData.map(service => (
                                <option key={service.title} value={service.title}>{service.title}</option>
                            ))}
                        </select>
                        {errors.serviceType && <p className="mt-2 text-sm text-red-600">{errors.serviceType}</p>}
                    </div>

                    <div>
                        <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Title*</label>
                        <input type="text" name="projectTitle" id="projectTitle" value={formData.projectTitle} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-brand focus:ring-brand sm:text-sm ${errors.projectTitle ? 'border-red-500' : ''}`} />
                        {errors.projectTitle && <p className="mt-2 text-sm text-red-600">{errors.projectTitle}</p>}
                    </div>

                    <div>
                        <label htmlFor="brief" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brief / Details*</label>
                        <textarea id="brief" name="brief" rows={6} value={formData.brief} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-brand focus:ring-brand sm:text-sm ${errors.brief ? 'border-red-500' : ''}`}></textarea>
                        {errors.brief && <p className="mt-2 text-sm text-red-600">{errors.brief}</p>}
                    </div>

                    <div>
                        <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Timeline (Optional)</label>
                        <input type="text" name="timeline" id="timeline" placeholder="e.g., '2-3 weeks', 'Before Oct 31st'" value={formData.timeline} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-brand focus:ring-brand sm:text-sm" />
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Save Draft</button>
                        <button type="submit" disabled={isSubmitting} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark disabled:opacity-50">
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default NewRequestPage;
