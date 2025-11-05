 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/pages/employee/EmployeeDashboardPage.tsx b/src/pages/employee/EmployeeDashboardPage.tsx
index adc5a2460991b525cb808e6dd1ffe0b9a6968a6a..40534f001f717cf77c45ec29cbaf4de238561ed6 100644
--- a/src/pages/employee/EmployeeDashboardPage.tsx
+++ b/src/pages/employee/EmployeeDashboardPage.tsx
@@ -1,39 +1,39 @@
 // @ts-nocheck
 import React, { useState, useEffect } from 'react';
 import { useAuth } from '../../features/auth/AuthProvider';
 import { supabase } from '../../lib/supabase/client';
 import {
   getAssignmentsForEmployee,
   getFullAssignmentDetails,
   getEmployeeDocuments,
   createDocumentSignedUrl,
   updateAssignmentStatus,
   postAssignmentComment,
   EmployeeDocument
 } from '../../lib/supabase/operations';
-import { Loader2, List, FileText, CheckCircle, Clock, Send, Eye, Download, AlertCircle, Inbox, User as UserIcon, Mail, Phone, MapPin, Calendar, Briefcase, Hash, DollarSign, Building, CreditCard, Edit2, Upload, FileSignature, AlertTriangle } from 'lucide-react';
+import { List, FileText, CheckCircle, Clock, Eye, Download, AlertCircle, Inbox, User as UserIcon, Mail, Phone, MapPin, Calendar, Briefcase, Hash, Edit2, FileSignature, AlertTriangle } from 'lucide-react';
 import { useToast } from '../../contexts/ToastContext';
 import EmployeeAssignmentPanel from './EmployeeAssignmentPanel';
 
 // Helper to format date
 const formatDate = (dateString: string | null) => {
   if (!dateString) return 'N/A';
   return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
 };
 
 // --- PDF Viewer (Copied from Admin Dashboard) ---
 import { motion, AnimatePresence } from 'framer-motion';
 import { X } from 'lucide-react';
 
 const PdfViewerModal: React.FC<{ pdfUrl: string; title: string; onClose: () => void }> = ({ pdfUrl, title, onClose }) => (
   <AnimatePresence>
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-labelledby="pdf-title" role="dialog" aria-modal="true">
       <motion.div
         className="absolute inset-0 bg-black/80 backdrop-blur-sm"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         onClick={onClose}
       />
       <motion.div
         initial={{ opacity: 0, scale: 0.9 }}
@@ -204,339 +204,466 @@ const EmployeeDashboardPage: React.FC = () => {
         .from('employee_documents')
         .getPublicUrl(uploadData.path);
 
       // Update document record
       const { error: updateError } = await supabase
         .from('employee_documents')
         .update({
           signed_storage_url: urlData.publicUrl,
           signed_at: new Date().toISOString(),
         })
         .eq('id', doc.id);
 
       if (updateError) throw updateError;
 
       addToast({ type: 'success', title: 'Document Signed!', message: 'Your signed document has been uploaded.' });
 
       // Refresh documents
       const result = await getEmployeeDocuments(user.id);
       if (!result.error) setDocuments(result.data || []);
     } catch (err: any) {
       addToast({ type: 'error', title: 'Signing Failed', message: err.message });
     }
   };
   
   const getStatusProps = (status: string) => {
-    switch (status) {
-      case 'completed': return { icon: CheckCircle, color: 'text-green-500', label: 'Completed' };
-      case 'in_progress': return { icon: Clock, color: 'text-blue-500', label: 'In Progress' };
-      case 'overdue': return { icon: AlertCircle, color: 'text-red-500', label: 'Overdue' };
-      default: return { icon: List, color: 'text-yellow-500', label: status };
+    const normalizedStatus = status || 'pending';
+    switch (normalizedStatus) {
+      case 'completed':
+        return { icon: CheckCircle, color: 'text-emerald-600', label: 'Completed', badgeClass: 'bg-emerald-100 text-emerald-600' };
+      case 'in_progress':
+        return { icon: Clock, color: 'text-blue-600', label: 'In Progress', badgeClass: 'bg-blue-100 text-blue-600' };
+      case 'overdue':
+        return { icon: AlertCircle, color: 'text-red-600', label: 'Overdue', badgeClass: 'bg-red-100 text-red-600' };
+      case 'pending_review':
+        return { icon: Clock, color: 'text-amber-600', label: 'Pending Review', badgeClass: 'bg-amber-100 text-amber-600' };
+      default:
+        return { icon: List, color: 'text-slate-600', label: normalizedStatus.replace('_', ' '), badgeClass: 'bg-slate-100 text-slate-600' };
     }
   };
 
   // Loading skeleton
   const LoadingSkeleton = () => (
-    <div className="flex h-screen bg-gray-100">
-      <main className="flex-1 overflow-y-auto p-6 md:p-10">
-        <div className="max-w-4xl mx-auto">
-          <div className="h-8 bg-gray-300 rounded w-1/3 animate-pulse" />
-          <div className="h-4 bg-gray-200 rounded w-2/3 mt-2 animate-pulse" />
-
-          <section className="mt-8">
-            <div className="h-6 bg-gray-300 rounded w-1/4 animate-pulse" />
-            <div className="mt-4 space-y-3">
-              {[1, 2, 3].map(i => (
-                <div key={i} className="w-full p-4 bg-white rounded-lg shadow-sm">
-                  <div className="h-5 bg-gray-300 rounded w-3/4 animate-pulse" />
-                  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2 animate-pulse" />
-                </div>
-              ))}
+    <div className="flex min-h-screen bg-gradient-to-br from-[#FCE6DB] via-[#F8F9FC] to-[#E7F0FF]">
+      <main className="relative flex-1 overflow-y-auto">
+        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,120,85,0.12),_transparent_55%)]" />
+        <div className="relative z-10 px-6 py-8 md:px-10">
+          <div className="max-w-5xl mx-auto space-y-8">
+            <div className="h-44 rounded-3xl bg-white/50 border border-white/60 shadow-lg animate-pulse" />
+            <div className="grid gap-6 lg:grid-cols-2">
+              <div className="h-72 rounded-3xl bg-white/60 border border-white/60 shadow-lg animate-pulse" />
+              <div className="h-72 rounded-3xl bg-white/60 border border-white/60 shadow-lg animate-pulse" />
             </div>
-          </section>
+          </div>
         </div>
       </main>
     </div>
   );
 
   if (loading) {
     return <LoadingSkeleton />;
   }
   
   if (error) {
     return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
   }
 
   const handleEditProfile = () => {
     setProfileForm({
       first_name: profile?.first_name || '',
       last_name: profile?.last_name || '',
       phone: profile?.phone || '',
       home_address: profile?.home_address || '',
     });
     setIsEditingProfile(true);
   };
 
   const handleSaveProfile = async () => {
     if (!user) return;
     try {
       const { error } = await supabase
         .from('profiles')
         .update(profileForm)
         .eq('id', user.id);
 
       if (error) throw error;
       addToast({ type: 'success', title: 'Profile Updated!' });
       setIsEditingProfile(false);
       // Refresh will happen via AuthContext
       window.location.reload();
     } catch (err: any) {
       addToast({ type: 'error', title: 'Update Failed', message: err.message });
     }
   };
 
   const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) => (
-    <div className="flex items-start gap-3">
-      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
+    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-[#FF7043]/40 transition-colors">
+      <span className="w-9 h-9 rounded-xl bg-white shadow-inner flex items-center justify-center">
+        <Icon className="w-4 h-4 text-[#FF7043]" />
+      </span>
       <div>
-        <p className="text-xs text-gray-500">{label}</p>
-        <p className="font-medium text-gray-900">{value || 'N/A'}</p>
+        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
+        <p className="font-semibold text-slate-800">{value || 'N/A'}</p>
       </div>
     </div>
   );
 
-  return (
-    <div className="flex h-screen bg-gray-100">
-      {/* Main Content */}
-      <main className="flex-1 overflow-y-auto p-6 md:p-10">
-        <div className="max-w-4xl mx-auto">
-          <div className="flex justify-between items-start mb-6">
-            <div>
-              <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.first_name || 'Employee'}</h1>
-              <p className="text-gray-600 mt-1">Here's what's on your plate. Let's get to work.</p>
-            </div>
-          </div>
+  const totalAssignments = assignments.length;
+  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
+  const activeAssignments = assignments.filter(a => a.status !== 'completed').length;
+  const overdueAssignments = assignments.filter(a => a.status === 'overdue').length;
+  const signatureRequiredCount = documents.filter(doc => doc.requires_signing && !doc.signed_at).length;
 
-          {/* Profile Section */}
-          <section className="mb-8">
-            <div className="bg-white rounded-lg shadow-sm p-6">
-              <div className="flex justify-between items-center mb-4">
-                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
-                  <UserIcon className="text-gray-500" /> My Profile
-                </h2>
-                {!isEditingProfile && (
-                  <button
-                    onClick={handleEditProfile}
-                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
-                  >
-                    <Edit2 size={16} /> Edit Profile
-                  </button>
-                )}
-              </div>
+  const nextDueAssignment = assignments
+    .filter(a => a.due_date && a.status !== 'completed')
+    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];
 
-              {isEditingProfile ? (
+  const hour = new Date().getHours();
+  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
+  const firstName = profile?.first_name || 'there';
+
+  return (
+    <div className="flex min-h-screen bg-gradient-to-br from-[#FCE6DB] via-[#F8F9FC] to-[#E7F0FF]">
+      {/* Main Content */}
+      <main className="relative flex-1 overflow-y-auto">
+        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,120,85,0.12),_transparent_55%)]" />
+        <div className="relative z-10 px-6 py-8 md:px-10">
+          <div className="max-w-5xl mx-auto space-y-8">
+            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF784B] via-[#FF5722] to-[#FF9800] text-white shadow-2xl">
+              <div className="absolute -left-16 top-10 h-32 w-32 rounded-full bg-white/15 blur-3xl" />
+              <div className="absolute -right-20 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
+              <div className="relative z-10 grid gap-8 p-6 md:grid-cols-2 md:p-10">
                 <div className="space-y-4">
-                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
-                    <div>
-                      <label className="text-sm font-medium text-gray-700">First Name</label>
-                      <input
-                        type="text"
-                        value={profileForm.first_name}
-                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
-                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
-                      />
-                    </div>
-                    <div>
-                      <label className="text-sm font-medium text-gray-700">Last Name</label>
-                      <input
-                        type="text"
-                        value={profileForm.last_name}
-                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
-                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
-                      />
-                    </div>
-                    <div>
-                      <label className="text-sm font-medium text-gray-700">Phone</label>
-                      <input
-                        type="text"
-                        value={profileForm.phone}
-                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
-                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
-                      />
-                    </div>
-                    <div>
-                      <label className="text-sm font-medium text-gray-700">Home Address</label>
-                      <input
-                        type="text"
-                        value={profileForm.home_address}
-                        onChange={(e) => setProfileForm({ ...profileForm, home_address: e.target.value })}
-                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
-                      />
-                    </div>
+                  <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
+                    Employee Hub
+                  </span>
+                  <div>
+                    <h1 className="text-3xl font-bold md:text-4xl">{greeting}, {firstName}! 👋</h1>
+                    <p className="mt-2 text-sm text-white/80 md:text-base">
+                      Here's a snapshot of your workload and essentials for the week. Everything you need is right here.
+                    </p>
                   </div>
-                  <div className="flex gap-2 justify-end">
-                    <button
-                      onClick={() => setIsEditingProfile(false)}
-                      className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
-                    >
-                      Cancel
-                    </button>
-                    <button
-                      onClick={handleSaveProfile}
-                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#FF5722] text-white hover:bg-[#E64A19]"
-                    >
-                      Save Changes
-                    </button>
+                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
+                    <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Next deadline</p>
+                    {nextDueAssignment ? (
+                      <div className="mt-2 space-y-1">
+                        <p className="text-lg font-semibold">{nextDueAssignment.title}</p>
+                        <p className="text-sm text-white/80">Due {formatDate(nextDueAssignment.due_date)}</p>
+                      </div>
+                    ) : (
+                      <p className="mt-2 text-sm text-white/80">You're all caught up — no upcoming deadlines.</p>
+                    )}
                   </div>
                 </div>
-              ) : (
-                <div>
-                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
-                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
-                    <InfoRow icon={Mail} label="Email" value={profile?.email} />
-                    <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
-                    <InfoRow icon={MapPin} label="Address" value={profile?.home_address} />
-                    <InfoRow icon={Calendar} label="Birth Date" value={profile?.birth_date ? formatDate(profile.birth_date) : null} />
-                  </div>
 
-                  <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-6">Employment Details</h3>
-                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
-                    <InfoRow icon={Briefcase} label="Position" value={profile?.position} />
-                    <InfoRow icon={Hash} label="Employee #" value={profile?.employee_number} />
-                    <InfoRow icon={Calendar} label="Start Date" value={profile?.start_date ? formatDate(profile.start_date) : null} />
-                  </div>
-                </div>
-              )}
-            </div>
-          </section>
-
-          {/* Assignments Section */}
-          <section>
-            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
-              <List className="text-gray-500" /> My Assignments
-            </h2>
-            {assignments.length === 0 ? (
-               <div className="text-center p-10 bg-white rounded-lg shadow-sm mt-4">
-                  <Inbox size={48} className="mx-auto text-gray-300" />
-                  <h3 className="mt-4 font-semibold text-gray-700">All caught up!</h3>
-                  <p className="text-sm text-gray-500">You have no active assignments.</p>
-                </div>
-            ) : (
-              <div className="mt-4 space-y-3">
-                {assignments.map(assignment => {
-                  const { icon: Icon, color, label } = getStatusProps(assignment.status);
-                  return (
-                    <button
-                      key={assignment.id}
-                      onClick={() => handleAssignmentClick(assignment.id)}
-                      className={`w-full p-4 bg-white rounded-lg shadow-sm text-left transition-all ${
-                        selectedAssignment?.id === assignment.id ? 'ring-2 ring-[#FF5722]' : 'hover:shadow-md'
-                      }`}
+                <div className="grid gap-4 sm:grid-cols-2">
+                  {[
+                    {
+                      label: 'Active Assignments',
+                      value: activeAssignments.toString(),
+                      sublabel: `${completedAssignments} completed so far`,
+                    },
+                    {
+                      label: 'Total Assignments',
+                      value: totalAssignments.toString(),
+                      sublabel: overdueAssignments ? `${overdueAssignments} overdue` : 'No overdue tasks',
+                    },
+                    {
+                      label: 'Pending Signatures',
+                      value: signatureRequiredCount.toString(),
+                      sublabel: signatureRequiredCount ? 'Sign soon to stay compliant' : 'Nothing awaiting signature',
+                    },
+                    {
+                      label: 'Documents',
+                      value: documents.length.toString(),
+                      sublabel: 'Securely stored & accessible',
+                    },
+                  ].map(stat => (
+                    <div
+                      key={stat.label}
+                      className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur transition-transform hover:-translate-y-1"
                     >
-                      <div className="flex justify-between items-center">
-                        <span className="font-semibold text-gray-800">{assignment.title}</span>
-                        <span className={`flex items-center text-xs font-medium gap-1.5 ${color}`}>
-                          <Icon size={14} /> {label}
-                        </span>
+                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
+                      <div className="relative z-10 space-y-1">
+                        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{stat.label}</p>
+                        <p className="text-3xl font-semibold">{stat.value}</p>
+                        <p className="text-xs text-white/70">{stat.sublabel}</p>
                       </div>
-                      <p className="text-sm text-gray-500 mt-1">Due: {formatDate(assignment.due_date)}</p>
-                    </button>
-                  );
-                })}
-              </div>
-            )}
-          </section>
-
-          {/* Documents Section */}
-          <section className="mt-8">
-            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
-              <FileText className="text-gray-500" /> My Documents
-            </h2>
-            {documents.length === 0 ? (
-               <div className="text-center p-10 bg-white rounded-lg shadow-sm mt-4">
-                  <FileText size={48} className="mx-auto text-gray-300" />
-                  <h3 className="mt-4 font-semibold text-gray-700">No Documents</h3>
-                  <p className="text-sm text-gray-500">Your admin hasn't uploaded any documents for you yet.</p>
+                    </div>
+                  ))}
                 </div>
-            ) : (
-              <div className="mt-4 space-y-3">
-                {documents.map(doc => {
-                  const needsSignature = doc.requires_signing && !doc.signed_at;
-                  return (
-                    <div key={doc.id} className={`p-4 bg-white rounded-lg shadow-sm border ${
-                      needsSignature ? 'border-yellow-300' : 'border-gray-200'
-                    }`}>
-                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
-                        <div className="flex-1">
-                          <p className="font-semibold text-gray-800">{doc.document_name}</p>
-                          {needsSignature && (
-                            <div className="flex items-center gap-1.5 text-xs text-yellow-600 font-medium mt-1">
-                              <AlertTriangle size={14} /> Pending Signature - Action Required
-                            </div>
-                          )}
-                          {doc.signed_at && (
-                            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mt-1">
-                              <CheckCircle size={14} /> Signed on {formatDate(doc.signed_at)}
-                            </div>
-                          )}
-                          {!doc.requires_signing && (
-                            <span className="text-xs text-gray-500 mt-1 block">View Only</span>
-                          )}
+              </div>
+            </section>
+
+            {/* Profile Section */}
+            <section className="relative">
+              <div className="relative rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur md:p-10">
+                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white via-transparent to-[#FFEEE5]/40 opacity-60" />
+                <div className="relative z-10">
+                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
+                    <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
+                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF7043]/10 text-[#FF5722] shadow-inner">
+                        <UserIcon size={22} />
+                      </span>
+                      My Profile
+                    </h2>
+                    {!isEditingProfile && (
+                      <button
+                        onClick={handleEditProfile}
+                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#FF7043]/40 hover:text-[#FF5722]"
+                      >
+                        <Edit2 size={16} /> Edit Profile
+                      </button>
+                    )}
+                  </div>
+
+                  <div className="mt-6">
+                    {isEditingProfile ? (
+                      <div className="space-y-6">
+                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
+                          <div>
+                            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">First Name</label>
+                            <input
+                              type="text"
+                              value={profileForm.first_name}
+                              onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
+                              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#FF5722] focus:outline-none focus:ring-1 focus:ring-[#FF7043]/40"
+                            />
+                          </div>
+                          <div>
+                            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Last Name</label>
+                            <input
+                              type="text"
+                              value={profileForm.last_name}
+                              onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
+                              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#FF5722] focus:outline-none focus:ring-1 focus:ring-[#FF7043]/40"
+                            />
+                          </div>
+                          <div>
+                            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Phone</label>
+                            <input
+                              type="text"
+                              value={profileForm.phone}
+                              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
+                              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#FF5722] focus:outline-none focus:ring-1 focus:ring-[#FF7043]/40"
+                            />
+                          </div>
+                          <div>
+                            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Home Address</label>
+                            <input
+                              type="text"
+                              value={profileForm.home_address}
+                              onChange={(e) => setProfileForm({ ...profileForm, home_address: e.target.value })}
+                              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#FF5722] focus:outline-none focus:ring-1 focus:ring-[#FF7043]/40"
+                            />
+                          </div>
                         </div>
-                        <div className="flex gap-2 flex-wrap">
+                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
+                          <button
+                            onClick={() => setIsEditingProfile(false)}
+                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#FF7043]/40"
+                          >
+                            Cancel
+                          </button>
                           <button
-                            onClick={() => handleViewDocument(doc)}
-                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"
+                            onClick={handleSaveProfile}
+                            className="inline-flex items-center justify-center rounded-xl bg-[#FF5722] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#FF5722]/40 transition hover:bg-[#E64A19]"
                           >
-                            <Eye size={14} /> View
+                            Save Changes
                           </button>
-                          {needsSignature && (
-                            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF5722] text-white hover:bg-[#E64A19] cursor-pointer">
-                              <FileSignature size={14} /> Sign Document
-                              <input
-                                type="file"
-                                accept=".pdf"
-                                onChange={(e) => {
-                                  const file = e.target.files?.[0];
-                                  if (file) handleSignDocument(doc, file);
-                                }}
-                                className="hidden"
-                              />
-                            </label>
-                          )}
-                          {doc.signed_at && doc.signed_storage_url && (
-                            <a
-                              href={doc.signed_storage_url}
-                              download
-                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
-                            >
-                              <Download size={14} /> Download Signed
-                            </a>
-                          )}
                         </div>
                       </div>
+                    ) : (
+                      <div className="space-y-8">
+                        <div>
+                          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Contact Information</h3>
+                          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
+                            <InfoRow icon={Mail} label="Email" value={profile?.email} />
+                            <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
+                            <InfoRow icon={MapPin} label="Address" value={profile?.home_address} />
+                            <InfoRow icon={Calendar} label="Birth Date" value={profile?.birth_date ? formatDate(profile.birth_date) : null} />
+                          </div>
+                        </div>
+
+                        <div>
+                          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Employment Details</h3>
+                          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
+                            <InfoRow icon={Briefcase} label="Position" value={profile?.position} />
+                            <InfoRow icon={Hash} label="Employee #" value={profile?.employee_number} />
+                            <InfoRow icon={Calendar} label="Start Date" value={profile?.start_date ? formatDate(profile.start_date) : null} />
+                          </div>
+                        </div>
+                      </div>
+                    )}
+                  </div>
+                </div>
+              </div>
+            </section>
+
+            {/* Assignments & Documents */}
+            <section className="grid gap-6 lg:grid-cols-2">
+              <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
+                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white via-transparent to-[#FFE1D4]/50 opacity-70" />
+                <div className="relative z-10">
+                  <div className="flex items-center justify-between">
+                    <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
+                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF7043]/10 text-[#FF5722] shadow-inner">
+                        <List size={18} />
+                      </span>
+                      My Assignments
+                    </h2>
+                    {overdueAssignments > 0 && (
+                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
+                        <AlertCircle size={12} /> {overdueAssignments} overdue
+                      </span>
+                    )}
+                  </div>
+
+                  {assignments.length === 0 ? (
+                    <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 text-center">
+                      <Inbox size={48} className="mx-auto text-slate-300" />
+                      <h3 className="mt-4 text-lg font-semibold text-slate-700">All caught up!</h3>
+                      <p className="text-sm text-slate-500">You have no active assignments.</p>
+                    </div>
+                  ) : (
+                    <div className="mt-6 space-y-3">
+                      {assignments.map(assignment => {
+                        const { icon: Icon, color, label, badgeClass } = getStatusProps(assignment.status);
+                        const isSelected = selectedAssignment?.id === assignment.id;
+                        return (
+                          <button
+                            key={assignment.id}
+                            onClick={() => handleAssignmentClick(assignment.id)}
+                            className={`group w-full rounded-2xl border bg-white/80 p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
+                              isSelected ? 'border-[#FF7043] shadow-lg shadow-[#FF7043]/30' : 'border-slate-200'
+                            }`}
+                          >
+                            <div className="flex items-start justify-between gap-3">
+                              <div className="space-y-2">
+                                <p className="text-sm font-semibold text-slate-800">{assignment.title}</p>
+                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Due {formatDate(assignment.due_date)}</p>
+                                {assignment.category && (
+                                  <p className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{assignment.category}</p>
+                                )}
+                              </div>
+                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
+                                <Icon size={14} className={color} /> {label}
+                              </span>
+                            </div>
+                          </button>
+                        );
+                      })}
+                    </div>
+                  )}
+                </div>
+              </div>
+
+              <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
+                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white via-transparent to-[#FFF3E6]/60 opacity-70" />
+                <div className="relative z-10">
+                  <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
+                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF7043]/10 text-[#FF5722] shadow-inner">
+                      <FileText size={18} />
+                    </span>
+                    My Documents
+                  </h2>
+
+                  {documents.length === 0 ? (
+                    <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 text-center">
+                      <FileText size={48} className="mx-auto text-slate-300" />
+                      <h3 className="mt-4 text-lg font-semibold text-slate-700">No documents yet</h3>
+                      <p className="text-sm text-slate-500">Your admin hasn't uploaded any documents for you.</p>
+                    </div>
+                  ) : (
+                    <div className="mt-6 space-y-3">
+                      {documents.map(doc => {
+                        const needsSignature = doc.requires_signing && !doc.signed_at;
+                        return (
+                          <div
+                            key={doc.id}
+                            className={`rounded-2xl border bg-white/85 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
+                              needsSignature ? 'border-amber-300/70' : 'border-slate-200'
+                            }`}
+                          >
+                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
+                              <div className="space-y-2">
+                                <p className="text-base font-semibold text-slate-800">{doc.document_name}</p>
+                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
+                                  {needsSignature && (
+                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
+                                      <AlertTriangle size={12} /> Pending signature
+                                    </span>
+                                  )}
+                                  {doc.signed_at && (
+                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-600">
+                                      <CheckCircle size={12} /> Signed {formatDate(doc.signed_at)}
+                                    </span>
+                                  )}
+                                  {!doc.requires_signing && (
+                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-500">
+                                      View only
+                                    </span>
+                                  )}
+                                </div>
+                              </div>
+
+                              <div className="flex flex-wrap items-center gap-2">
+                                <button
+                                  onClick={() => handleViewDocument(doc)}
+                                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#FF7043]/40 hover:text-[#FF5722]"
+                                >
+                                  <Eye size={14} /> View
+                                </button>
+                                {needsSignature && (
+                                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#FF5722] px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-[#FF5722]/30 transition hover:bg-[#E64A19]">
+                                    <FileSignature size={14} /> Sign
+                                    <input
+                                      type="file"
+                                      accept=".pdf"
+                                      onChange={(e) => {
+                                        const file = e.target.files?.[0];
+                                        if (file) handleSignDocument(doc, file);
+                                      }}
+                                      className="hidden"
+                                    />
+                                  </label>
+                                )}
+                                {doc.signed_at && doc.signed_storage_url && (
+                                  <a
+                                    href={doc.signed_storage_url}
+                                    download
+                                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
+                                  >
+                                    <Download size={14} /> Download
+                                  </a>
+                                )}
+                              </div>
+                            </div>
+                          </div>
+                        );
+                      })}
                     </div>
-                  );
-                })}
+                  )}
+                </div>
               </div>
-            )}
-          </section>
+            </section>
+          </div>
         </div>
       </main>
 
       {/* Assignment Detail Panel */}
       <EmployeeAssignmentPanel
         assignment={selectedAssignment}
         onClose={() => setSelectedAssignment(null)}
         onPostComment={handlePostComment}
         onUpdateStatus={handleUpdateStatus}
       />
-      
+
       {/* PDF Viewer Modal */}
       <AnimatePresence>
         {viewingPdf && <PdfViewerModal pdfUrl={viewingPdf} title={viewingPdfTitle} onClose={() => setViewingPdf(null)} />}
       </AnimatePresence>
     </div>
   );
 };
 
 export default EmployeeDashboardPage;
\ No newline at end of file
 
EOF
)