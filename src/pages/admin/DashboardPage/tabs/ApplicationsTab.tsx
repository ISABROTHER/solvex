// @ts-nocheck
import React, { useMemo, useState, useEffect } from "react";
import Card from "../components/Card";
import { Search, SlidersHorizontal, X, Mail, Phone, Link as LinkIcon, Loader as Loader2 } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { getAllJobApplications, updateJobApplicationStatus, createMember, onJobApplicationsChange } from "../../../../lib/supabase/operations";
import type { Database } from "../../../../lib/supabase/database.types";

type JobApplication = Database['public']['Tables']['job_applications']['Row'];
type Application = JobApplication & {
  job_positions?: {
    title: string;
    team_name: string;
  } | null;
  position?: string;
};
type ApplicantStatus = JobApplication['status'];

const statusBadge = (s: ApplicantStatus) => ({
  pending: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200",
  accepted: "bg-green-100 text-green-800 ring-1 ring-inset ring-green-200",
  rejected: "bg-red-100 text-red-800 ring-1 ring-inset ring-red-200",
  reviewing: "bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200",
  interviewed: "bg-purple-100 text-purple-800 ring-1 ring-inset ring-purple-200",
}[s] || "bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-200");

const ApplicationsTab: React.FC = () => {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ApplicantStatus | "All">("All");
  const [jobTitle, setJobTitle] = useState<string>("All");
  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Application | null>(null);
  const [jobTitles, setJobTitles] = useState<string[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await getAllJobApplications();
      if (fetchError) {
        setError("Failed to fetch applications.");
        console.error('Failed to fetch applications:', fetchError);
      } else if (data) {
        const mapped = data.map(app => ({
          ...app,
          position: app.job_positions?.title || 'N/A'
        }));
        setRows(mapped);

        // Extract unique job titles for filtering
        const uniqueTitles = Array.from(new Set(mapped.map(app => app.position).filter(Boolean)));
        setJobTitles(uniqueTitles.sort());
      }
      setLoading(false);
    };
    fetchApplications();

    const subscription = onJobApplicationsChange(() => {
      fetchApplications();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const searchString = q.toLowerCase();
      const matchesQ = !q || [r.full_name, r.email, r.position].some(field => field?.toLowerCase().includes(searchString));
      const matchesStatus = status === "All" || r.status === status;
      const matchesJobTitle = jobTitle === "All" || r.position === jobTitle;
      return matchesQ && matchesStatus && matchesJobTitle;
    });
  }, [rows, q, status, jobTitle]);

  // Group applications by job title for display
  const groupedByJobTitle = useMemo(() => {
    const groups: { [key: string]: Application[] } = {};
    filtered.forEach(app => {
      const title = app.position || 'N/A';
      if (!groups[title]) {
        groups[title] = [];
      }
      groups[title].push(app);
    });
    return groups;
  }, [filtered]);

  const handleUpdateStatus = async (applicant: Application, newStatus: ApplicantStatus) => {
    const originalRows = [...rows];
    
    // Optimistically update the UI for the application list
    setRows(prev => prev.map(r => (r.id === applicant.id ? { ...r, status: newStatus } : r)));
    if (detail?.id === applicant.id) setDetail(null);

    // If 'accepted', create a new member record if needed
    if (newStatus === 'accepted') {
      try {
        const positionTitle = applicant.job_positions?.title || applicant.position || 'Team Member';
        const { error: createError } = await createMember({
          full_name: applicant.full_name,
          email: applicant.email,
          phone: applicant.phone,
          role_title: positionTitle,
          status: 'Active',
          application_id: applicant.id,
        });

        if (createError) {
          console.error('Failed to create member:', createError);
        } else {
          console.log("Member Created", `${applicant.full_name} has been added to the Teams tab.`);
        }
      } catch (memberError) {
        console.error('Member creation error:', memberError);
      }
    }

    // Finally, update the application status itself
    const { error: updateError } = await updateJobApplicationStatus(applicant.id, newStatus);
    if (updateError) {
      setError("Failed to update application status.");
      setRows(originalRows); // Revert UI
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Job Applications" right={
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="h-9 w-40 sm:w-56 rounded-lg border border-gray-200 bg-gray-50 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="h-9 appearance-none rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
              <option value="All">All Positions</option>
              {jobTitles.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="h-9 appearance-none rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
              <option>All</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="interviewed">Interviewed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      }>
        {loading && <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-gray-400 animate-spin" /></div>}
        {error && <div className="text-center py-20 text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="space-y-6">
            {Object.entries(groupedByJobTitle).map(([title, applications]) => (
              <div key={title} className="border-b pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
                  </span>
                </div>
                <div className="overflow-x-auto -mx-6">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50"><tr className="text-left text-gray-600">
                        <th className="px-6 py-3 font-semibold">Name</th>
                        <th className="px-6 py-3 font-semibold">Contact</th>
                        <th className="px-6 py-3 font-semibold">Applied</th>
                        <th className="px-6 py-3 font-semibold text-center">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-200">
                      {applications.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-800">{r.full_name}</td>
                          <td className="px-6 py-4 text-gray-600">{r.email}</td>
                          <td className="px-6 py-4 text-gray-600">{new Date(r.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-center capitalize">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge(r.status)}`}>{r.status}</span>
                          </td>
                          <td className="px-6 py-4"><div className="flex justify-end">
                            <button className="rounded-md border bg-white px-3 py-1.5 font-medium hover:bg-gray-100 transition-colors" onClick={() => setDetail(r)}>View</button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-500">No applications match your filters.</div>
            )}
          </div>
        )}
      </Card>

      <AnimatePresence>
        {detail && (
          <div className="fixed inset-0 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl flex flex-col"
            >
              <div className="flex-shrink-0 p-6 flex items-center justify-between border-b">
                <h3 className="text-xl font-semibold">Applicant Details</h3>
                <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setDetail(null)}><X size={20} /></button>
              </div>
              <div className="p-6 overflow-auto space-y-6 text-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center font-bold text-2xl text-gray-600">
                    {detail.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{detail.full_name}</div>
                    <div className="text-gray-500">{detail.position}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-6">
                  <div className="flex items-center gap-2 text-gray-600"><Mail size={16}/> {detail.email}</div>
                  {detail.phone && <div className="flex items-center gap-2 text-gray-600"><Phone size={16}/> {detail.phone}</div>}
                  {detail.portfolio_url && <a href={detail.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline col-span-2"><LinkIcon size={16}/> View Portfolio</a>}
                </div>
                {detail.cover_letter && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-2">Statement</h4>
                    <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{detail.cover_letter}</p>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 p-6 border-t mt-auto flex gap-3 bg-gray-50">
                <button className="flex-1 rounded-lg bg-green-600 text-white px-4 py-2 font-semibold hover:bg-green-700 transition-colors" onClick={() => handleUpdateStatus(detail, "accepted")}>Accept</button>
                <button className="flex-1 rounded-lg border bg-white px-4 py-2 font-semibold hover:bg-gray-100 transition-colors" onClick={() => handleUpdateStatus(detail, "rejected")}>Reject</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicationsTab;