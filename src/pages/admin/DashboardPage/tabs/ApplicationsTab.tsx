// src/pages/admin/DashboardPage/tabs/ApplicationsTab.tsx
// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Card from "../components/Card";
import { Loader2, Mail, Phone, ExternalLink, Calendar, Search, RefreshCw, AlertCircle, Briefcase, User, X } from "lucide-react";
import { getCareerApplications, updateCareerApplicationStatus } from "../../../../lib/supabase/operations"; // Functions now point to the correct table
import { supabase } from "../../../../lib/supabase/client";
import type { Database } from "../../../../lib/supabase/database.types"; // Ensure this is regenerated if schema changed
import { useToast } from "../../../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

// UPDATED TYPE: Point to 'submitted_applications' row type
type ApplicationRow = Database['public']['Tables']['submitted_applications']['Row'] & {
    job_position: { title: string, description: string | null, team_name: string | null, team_id: string | null } | null; // Keep the join structure alias
};

// Simplified application type for the component state
type Application = ApplicationRow;

// Define possible application statuses (adjust if your status values changed)
const STATUS_OPTIONS: Record<string, { label: string, color: string }> = {
    pending: { label: "Pending Review", color: "yellow" },
    reviewed: { label: "Under Review", color: "blue" }, // Example: Renamed from 'reviewing' if needed
    shortlisted: { label: "Shortlisted", color: "purple" }, // Example: Added new status
    interviewing: { label: "Interviewing", color: "indigo"}, // Example: Added new status
    offered: { label: "Offer Extended", color: "green" }, // Example: Added new status
    hired: { label: "Hired", color: "teal" }, // Example: Changed color
    rejected: { label: "Rejected", color: "red" },
    withdrawn: { label: "Withdrawn", color: "gray" } // Example: Added new status
};


// Helper component for the detail modal
const ApplicationDetailModal: React.FC<{ application: Application | null, isOpen: boolean, onClose: () => void, onUpdateStatus: (id: string, newStatus: string) => void }> = ({ application, isOpen, onClose, onUpdateStatus }) => {
    if (!isOpen || !application) return null;

    const currentStatus = application.status || 'pending';

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        onUpdateStatus(application.id, newStatus);
    };

    // Use job_position for linked data, falling back to position_title column if link fails
    const positionTitle = application.job_position?.title || application.position_title || 'N/A'; // Added fallback to position_title
    const teamName = application.job_position?.team_name || 'N/A'; // Get team from linked data if available

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose} // Close modal on backdrop click
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="relative w-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl my-12 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{application.full_name}</h3>
                        <p className="text-lg text-[#FF5722] mt-1">{positionTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
                </div>

                {/* Modal Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto flex-grow">
                    {/* Left Column: Status and Contact */}
                    <div className="space-y-4 md:col-span-1">
                        <Card title="Status Management" className="p-4"> {/* Adjusted Card Padding */}
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-700">Current Status:</p>
                                <div className={`inline-block px-3 py-1 text-sm font-semibold rounded-full bg-${STATUS_OPTIONS[currentStatus]?.color}-100 text-${STATUS_OPTIONS[currentStatus]?.color}-800`}>
                                    {STATUS_OPTIONS[currentStatus]?.label || currentStatus}
                                </div>
                                <select
                                    value={currentStatus}
                                    onChange={handleStatusChange}
                                    className="mt-3 w-full p-2 border rounded-lg bg-white text-sm focus:ring-[#FF5722] focus:border-[#FF5722]"
                                >
                                    {Object.entries(STATUS_OPTIONS).map(([key, value]) => (
                                        <option key={key} value={key}>{value.label}</option>
                                    ))}
                                </select>
                            </div>
                        </Card>

                        <Card title="Contact Info" className="p-4"> {/* Adjusted Card Padding */}
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-gray-500" />
                                    <a href={`mailto:${application.email}`} className="text-blue-600 hover:underline break-all">{application.email}</a>
                                </div>
                                {application.phone && <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-500" />
                                    <a href={`tel:${application.phone}`} className="text-blue-600 hover:underline">{application.country_code} {application.phone}</a>
                                </div>}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Application Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card title="Candidate Overview" className="p-4"> {/* Adjusted Card Padding */}
                            <div className="space-y-3 text-sm">
                                <p><strong>Position Applied:</strong> {positionTitle}</p>
                                <p><strong>Team:</strong> {teamName}</p>
                                <p><strong>Submitted:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
                                <p><strong>Country Code:</strong> {application.country_code || 'N/A'}</p>
                            </div>
                        </Card>

                        <Card title="Cover Letter" className="p-4"> {/* Adjusted Card Padding */}
                            <p className="text-gray-700 text-sm italic whitespace-pre-wrap">{application.cover_letter || 'No cover letter provided.'}</p>
                        </Card>

                        <Card title="Portfolio / Links" className="p-4"> {/* Adjusted Card Padding */}
                            <div className="flex flex-wrap gap-4 text-sm">
                                {application.portfolio_url ? (
                                    <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white bg-[#FF5722] px-3 py-1 rounded-lg hover:bg-[#E64A19] transition-colors">
                                        View Portfolio <ExternalLink size={14} />
                                    </a>
                                ) : (
                                     <p className="text-gray-500">No portfolio link provided.</p>
                                )}
                                {/* Add other links if needed, e.g., linkedin_url */}
                            </div>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </motion.div>
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

        // This function now correctly fetches from 'submitted_applications'
        const { data, error: fetchError } = await getCareerApplications();

        if (fetchError) {
            setError(`Failed to fetch applications. Error: ${fetchError.message}. Check RLS or table name.`);
            console.error("Applications Fetch Error:", fetchError);
            setApplications([]);
        } else {
            setApplications(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();

        // Real-time subscription for changes to the NEW applications table
        const channel = supabase.channel('public:submitted_applications') // <<< CHANGED CHANNEL/TABLE NAME
          .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'submitted_applications' }, // <<< CHANGED TABLE NAME
              (payload) => {
                console.log('Realtime change received:', payload); // For debugging
                fetchData(); // Refetch data on any change
              }
           )
          .subscribe((status, err) => { // Added subscription status/error logging
            if (err) {
              console.error("Realtime subscription error:", err);
              setError("Realtime connection failed. Updates may be delayed.");
            }
            console.log("Realtime subscription status:", status);
          });

        return () => {
          supabase.removeChannel(channel);
        };
    }, [fetchData]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            // This function now correctly updates 'submitted_applications'
            const { error: updateError } = await updateCareerApplicationStatus(id, newStatus);
            if (updateError) throw updateError;

            addToast({ type: 'success', title: 'Status Updated', message: `Application status set to ${STATUS_OPTIONS[newStatus]?.label || newStatus}.` });
            // Optimistically update the modal if it's open - Realtime listener handles main list
            if (selectedApplication?.id === id) {
                setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
            }
            // fetchData(); // Let realtime listener handle the update now
        } catch (error) {
            addToast({ type: 'error', title: 'Update Failed', message: `Failed to update status: ${error.message}. RLS write access required?` });
            console.error("Status Update Error:", error);
        }
    };

    const filteredApplications = useMemo(() => {
        if (!searchTerm.trim()) return applications;
        const term = searchTerm.toLowerCase();
        return applications.filter(app =>
            app.full_name?.toLowerCase().includes(term) ||
            app.email?.toLowerCase().includes(term) ||
            (app.job_position?.title || app.position_title || '').toLowerCase().includes(term) || // Check joined title OR raw title
            (app.job_position?.team_name || '').toLowerCase().includes(term) // Check joined team name
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
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name, email, position, team..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-[#FF5722] focus:border-[#FF5722]"
                        />
                    </div>
                </div>
            }>
                {error && <div className="text-center py-5 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error}</div>}

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

                                    // Use joined job_position data, fall back to position_title
                                    const positionTitle = app.job_position?.title || app.position_title || 'N/A';
                                    const teamName = app.job_position?.team_name || 'N/A';

                                    return (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedApplication(app)}>
                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                <p>{app.full_name}</p>
                                                <p className="text-xs text-gray-500">{app.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{positionTitle}</td>
                                            <td className="px-4 py-3 text-gray-600">{teamName}</td>
                                            <td className="px-4 py-3">
                                                <div className={`inline-block px-3 py-1 text-xs font-semibold rounded-full bg-${statusInfo?.color}-100 text-${statusInfo?.color}-800`}>
                                                    {statusInfo?.label || statusKey}
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
                                        {applications.length === 0 ? "No job applications found." : "No applications match your search term."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal Rendering */}
            <AnimatePresence>
                {selectedApplication && ( // Render only when an application is selected
                    <ApplicationDetailModal
                        isOpen={!!selectedApplication}
                        onClose={() => setSelectedApplication(null)}
                        application={selectedApplication}
                        onUpdateStatus={handleUpdateStatus}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ApplicationsTab;