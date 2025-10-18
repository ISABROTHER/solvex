// src/pages/admin/DashboardPage/tabs/ApplicationsTab.tsx
// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from "react";
// ... other imports
import { getCareerApplications, updateCareerApplicationStatus } from "../../../../lib/supabase/operations"; // Keep using this
import { supabase } from "../../../../lib/supabase/client";
import type { Database } from "../../../../lib/supabase/database.types"; // Keep using this
// ... other imports

// Define the joined type for clarity
// NOTE: The joined object is now aliased as 'job_position' in operations.ts
type ApplicationRow = Database['public']['Tables']['submitted_applications']['Row'] & { // <<< Use correct table type
    job_position: { title: string, description: string | null, team_name: string | null, team_id: string | null } | null;
};

// Simplified application type for the component state
type Application = ApplicationRow;

// ... (STATUS_OPTIONS and ApplicationDetailModal remain the same) ...

const ApplicationsTab: React.FC = () => {
    // ... (state variables remain the same) ...

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        // This function now correctly fetches from 'submitted_applications'
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

        // Real-time subscription for changes to the NEW applications table
        const channel = supabase.channel('public:submitted_applications') // <<< CHANGED CHANNEL/TABLE NAME
          .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'submitted_applications' }, // <<< CHANGED TABLE NAME
              () => fetchData()
           )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
    }, [fetchData]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            // This function now correctly updates 'submitted_applications'
            const { error: updateError } = await updateCareerApplicationStatus(id, newStatus);
            if (updateError) throw updateError;

            addToast({ type: 'success', title: 'Status Updated', message: `Application status set to ${STATUS_OPTIONS[newStatus].label}.` });
            fetchData(); // Re-fetch to update UI
            if (selectedApplication?.id === id) {
                setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Update Failed', message: `Failed to update status. RLS write access required.` });
            console.error("Status Update Error:", error);
        }
    };

    // ... (filteredApplications memo remains the same) ...

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
    }

    const applicationCount = filteredApplications.length; // Added for clarity below

    return (
        <div className="space-y-6">
            <Card title={`Job Applications (${applicationCount})`} right={ // Use applicationCount
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="p-1.5 rounded-full hover:bg-gray-100" title="Refresh Data">
                        <RefreshCw size={18} />
                    </button>
                    {/* Keep search input if you want it */}
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

                {/* Search Bar was moved to Card `right` prop */}
                {/* <div className="mb-4"> ... </div> */}

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            {/* Table headers remain the same */}
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

                                    // Use joined job_position data, fall back gracefully
                                    const positionTitle = app.job_position?.title || app.position_title || 'N/A'; // Use position_title from new table as fallback
                                    const teamName = app.job_position?.team_name || 'N/A'; // Get team name from joined data

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
                {selectedApplication && ( // Ensure modal only renders when an application is selected
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