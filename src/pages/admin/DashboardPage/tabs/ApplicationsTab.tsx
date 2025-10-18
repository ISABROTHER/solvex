// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Card from "../components/Card";
import { Loader2, Mail, Phone, ExternalLink, Calendar, Search, RefreshCw, AlertCircle, Briefcase, User, MapPin } from "lucide-react";
import { getCareerApplications, updateCareerApplicationStatus } from "../../../../lib/supabase/operations";
import { supabase } from "../../../../lib/supabase/client";
import type { Database } from "../../../../lib/supabase/database.types";
import { useToast } from "../../../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

// Define the joined type for clarity
type ApplicationRow = Database['public']['Tables']['job_applications']['Row'] & {
    job_positions: { id: string, title: string, team_name: string | null, team_id: string | null, status: string | null } | null;
};

// Simplified application type for the component state
type Application = ApplicationRow;

// Define possible application statuses
const STATUS_OPTIONS = {
    pending: { label: "Pending Review", color: "yellow" },
    reviewing: { label: "In Review", color: "blue" },
    interview: { label: "Interview Scheduled", color: "purple" },
    hired: { label: "Hired", color: "green" },
    rejected: { label: "Rejected", color: "red" },
};

// Helper component for the detail modal
const ApplicationDetailModal: React.FC<{ application: Application, isOpen: boolean, onClose: () => void, onUpdateStatus: (id: string, newStatus: string) => void }> = ({ application, isOpen, onClose, onUpdateStatus }) => {
    if (!isOpen || !application) return null;

    const currentStatus = application.status || 'pending';

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        onUpdateStatus(application.id, newStatus);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="relative w-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl my-12"
            >
                <div className="flex justify-between items-start p-6 border-b">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{application.full_name}</h3>
                        <p className="text-lg text-[#FF5722] mt-1">{application.job_positions?.title || 'Position'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Status and Contact */}
                    <div className="space-y-4 md:col-span-1">
                        <Card title="Status Management">
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-700">Current Status:</p>
                                <div className={`inline-block px-3 py-1 text-sm font-semibold rounded-full bg-${STATUS_OPTIONS[currentStatus]?.color}-100 text-${STATUS_OPTIONS[currentStatus]?.color}-800`}>
                                    {STATUS_OPTIONS[currentStatus]?.label}
                                </div>
                                <select 
                                    value={currentStatus} 
                                    onChange={handleStatusChange} 
                                    className="mt-3 w-full p-2 border rounded-lg bg-white text-sm"
                                >
                                    {Object.entries(STATUS_OPTIONS).map(([key, value]) => (
                                        <option key={key} value={key}>{value.label}</option>
                                    ))}
                                </select>
                            </div>
                        </Card>

                        <Card title="Contact Info">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-gray-500" />
                                    <a href={`mailto:${application.email}`} className="text-blue-600 hover:underline">{application.email}</a>
                                </div>
                                {application.phone && <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-500" />
                                    <a href={`tel:${application.phone}`} className="text-blue-600 hover:underline">{application.phone}</a>
                                </div>}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Application Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card title="Candidate Overview">
                            <div className="space-y-3 text-sm">
                                <p><strong>Position Applied:</strong> {application.job_positions?.title || 'N/A'}</p>
                                <p><strong>Submitted:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
                                <p><strong>Team:</strong> {application.job_positions?.team_name || 'N/A'}</p>
                                {application.country_code && <p><strong>Country:</strong> {application.country_code}</p>}
                            </div>
                        </Card>

                        <Card title="Cover Letter">
                            <p className="text-gray-700 text-sm italic whitespace-pre-wrap">{application.cover_letter || 'No cover letter provided.'}</p>
                        </Card>

                        <Card title="Attachments & Portfolio">
                            <div className="flex flex-wrap gap-4 text-sm">
                                {application.linkedin_url && <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white bg-gray-800 px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors">
                                    LinkedIn <ExternalLink size={14} />
                                </a>}
                                {application.portfolio_url && <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white bg-[#FF5722] px-3 py-1 rounded-lg hover:bg-[#E64A19] transition-colors">
                                    Portfolio <ExternalLink size={14} />
                                </a>}
                                {(!application.linkedin_url && !application.portfolio_url) && <p className="text-gray-500">No links provided.</p>}
                            </div>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


const ApplicationsTab: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await getCareerApplications();

        if (fetchError) {
            setError("Failed to fetch applications. Check RLS policies on 'job_applications'.");
            console.error("Applications Fetch Error:", fetchError);
            setApplications([]);
        } else {
            setApplications(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
        
        // Real-time subscription for changes to the applications table
        const channel = supabase.channel('public:career_applications')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'career_applications' }, () => fetchData())
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
    }, [fetchData]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error: updateError } = await updateCareerApplicationStatus(id, newStatus);
            if (updateError) throw updateError;
            
            addToast({ type: 'success', title: 'Status Updated', message: `Application status set to ${STATUS_OPTIONS[newStatus].label}.` });
            fetchData(); // Re-fetch to update UI or rely on real-time listener (fetchData ensures full consistency)
            if (selectedApplication?.id === id) {
                // Optimistically update the modal if it's open
                setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Update Failed', message: `Failed to update status. RLS write access required.` });
            console.error("Status Update Error:", error);
        }
    };

    const filteredApplications = useMemo(() => {
        if (!searchTerm) return applications;

        const lowerCaseSearch = searchTerm.toLowerCase();
        
        return applications.filter(app => 
            app.full_name?.toLowerCase().includes(lowerCaseSearch) ||
            app.email?.toLowerCase().includes(lowerCaseSearch) ||
            app.position?.toLowerCase().includes(lowerCaseSearch) ||
            app.job_positions?.title?.toLowerCase().includes(lowerCaseSearch)
        );
    }, [applications, searchTerm]);

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
    }

    const applicationCount = filteredApplications.length;

    return (
        <div className="space-y-6">
            <Card title={`Job Applications (${applicationCount})`} right={
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="p-1.5 rounded-full hover:bg-gray-100" title="Refresh Data">
                        <RefreshCw size={18} />
                    </button>
                </div>
            }>
                {error && <div className="text-center py-5 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error}</div>}
                
                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or position..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-[#FF5722] focus:border-[#FF5722]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-left text-gray-600">
                                <th className="px-4 py-2 font-semibold w-1/4">Applicant</th>
                                <th className="px-4 py-2 font-semibold w-1/4">Position</th>
                                <th className="px-4 py-2 font-semibold">Team</th>
                                <th className="px-4 py-2 font-semibold">Status</th>
                                <th className="px-4 py-2 font-semibold">Date</th>
                                <th className="px-4 py-2 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredApplications.length > 0 ? (
                                filteredApplications.map((app) => {
                                    const statusKey = app.status || 'pending';
                                    const statusInfo = STATUS_OPTIONS[statusKey];
                                    const teamName = app.job_positions?.title || 'N/A';
                                    
                                    return (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedApplication(app)}>
                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                <p>{app.full_name}</p>
                                                <p className="text-xs text-gray-500">{app.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{app.position}</td>
                                            <td className="px-4 py-3 text-gray-600">{teamName}</td>
                                            <td className="px-4 py-3">
                                                <div className={`inline-block px-3 py-1 text-xs font-semibold rounded-full bg-${statusInfo?.color}-100 text-${statusInfo?.color}-800`}>
                                                    {statusInfo?.label}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedApplication(app); }}
                                                    className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors text-xs font-medium"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        {applications.length === 0 ? "No job applications found in the database." : "No applications match your search term."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AnimatePresence>
                <ApplicationDetailModal 
                    isOpen={!!selectedApplication} 
                    onClose={() => setSelectedApplication(null)}
                    application={selectedApplication as Application}
                    onUpdateStatus={handleUpdateStatus}
                />
            </AnimatePresence>
        </div>
    );
};

export default ApplicationsTab;