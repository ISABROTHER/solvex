import React, { useState, useEffect, useCallback, useMemo } from "react";
import Card from "../components/Card";
import { Loader2, Mail, Phone, ExternalLink, Calendar, Search, RefreshCw, AlertCircle, Briefcase, User, X } from "lucide-react";
import { getCareerApplications, updateCareerApplicationStatus } from "../../../../lib/supabase/operations";
import { supabase } from "../../../../lib/supabase/client";
import type { Database } from "../../../../lib/supabase/database.types";
import { useToast } from "../../../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

type ApplicationRow = Database['public']['Tables']['submitted_applications']['Row'] & {
    job_position: { title: string, description: string | null, team_name: string | null, team_id: string | null } | null;
};

type Application = ApplicationRow;

const STATUS_OPTIONS: Record<string, { label: string, color: string }> = {
    pending: { label: "Pending Review", color: "yellow" },
    reviewed: { label: "Under Review", color: "blue" },
    shortlisted: { label: "Shortlisted", color: "purple" },
    interviewing: { label: "Interviewing", color: "indigo" },
    offered: { label: "Offer Extended", color: "green" },
    hired: { label: "Hired", color: "teal" },
    rejected: { label: "Rejected", color: "red" },
    withdrawn: { label: "Withdrawn", color: "gray" }
};

interface ApplicationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: Application | null;
    onUpdateStatus: (id: string, newStatus: string) => void;
}

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({ isOpen, onClose, application, onUpdateStatus }) => {
    if (!application) return null;

    const statusKey = application.status || 'pending';
    const statusInfo = STATUS_OPTIONS[statusKey];
    const positionTitle = application.job_position?.title || application.position_title || 'N/A';
    const teamName = application.job_position?.team_name || 'N/A';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">Application Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <User size={24} />
                                {application.full_name}
                            </h3>
                            <div className="mt-2 space-y-1">
                                <p className="text-gray-600 flex items-center gap-2">
                                    <Mail size={16} />
                                    {application.email}
                                </p>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <Phone size={16} />
                                    {application.country_code} {application.phone}
                                </p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-semibold bg-${statusInfo?.color}-100 text-${statusInfo?.color}-800`}>
                            {statusInfo?.label}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Briefcase size={18} />
                            Position Applied For
                        </h4>
                        <p className="text-lg text-gray-800">{positionTitle}</p>
                        <p className="text-sm text-gray-500">Team: {teamName}</p>
                    </div>

                    {application.cover_letter && (
                        <div className="border-t pt-4">
                            <h4 className="font-bold text-gray-700 mb-2">Cover Letter</h4>
                            <p className="text-gray-600 whitespace-pre-wrap">{application.cover_letter}</p>
                        </div>
                    )}

                    {application.portfolio_url && (
                        <div className="border-t pt-4">
                            <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <ExternalLink size={18} />
                                Portfolio
                            </h4>
                            <a
                                href={application.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                {application.portfolio_url}
                            </a>
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Calendar size={18} />
                            Application Date
                        </h4>
                        <p className="text-gray-600">{new Date(application.created_at).toLocaleString()}</p>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-bold text-gray-700 mb-3">Update Status</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(STATUS_OPTIONS).map(([key, { label, color }]) => (
                                <button
                                    key={key}
                                    onClick={() => onUpdateStatus(application.id, key)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        application.status === key
                                            ? `bg-${color}-600 text-white`
                                            : `bg-${color}-100 text-${color}-800 hover:bg-${color}-200`
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
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

        const { data, error: fetchError } = await getCareerApplications();

        if (fetchError) {
            setError("Failed to fetch applications. Check network connection or RLS configuration.");
            console.error("Applications Fetch Error:", fetchError);
            setApplications([]);
        } else {
            setApplications(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();

        const channel = supabase.channel('public:submitted_applications')
          .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'submitted_applications' },
              () => fetchData()
           )
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
            fetchData();
            if (selectedApplication?.id === id) {
                setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Update Failed', message: `Failed to update status. RLS write access required.` });
            console.error("Status Update Error:", error);
        }
    };

    const filteredApplications = useMemo(() => {
        if (!searchTerm.trim()) return applications;
        const term = searchTerm.toLowerCase();
        return applications.filter(app =>
            app.full_name.toLowerCase().includes(term) ||
            app.email.toLowerCase().includes(term) ||
            (app.job_position?.title || app.position_title || '').toLowerCase().includes(term)
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
                            placeholder="Search by name, email, or position..."
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
                                        {applications.length === 0 ? "No job applications found." : "No applications match your search term."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AnimatePresence>
                {selectedApplication && (
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
