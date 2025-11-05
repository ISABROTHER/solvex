diff --git a/src/pages/employee/EmployeeAssignmentPanel.tsx b/src/pages/employee/EmployeeAssignmentPanel.tsx
index 8ee6f28e6119aa26988026377be75ef94376e5e5..7617a49680275b3fb4798891e3ece2753519d00e 100644
--- a/src/pages/employee/EmployeeAssignmentPanel.tsx
+++ b/src/pages/employee/EmployeeAssignmentPanel.tsx
@@ -30,167 +30,182 @@ interface EmployeeAssignmentPanelProps {
   onPostComment: (assignmentId: string, content: string) => void;
   onUpdateStatus: (assignmentId: string, newStatus: string) => void;
 }
 
 const EmployeeAssignmentPanel: React.FC<EmployeeAssignmentPanelProps> = ({
   assignment,
   onClose,
   onPostComment,
   onUpdateStatus,
 }) => {
   const [newComment, setNewComment] = useState('');
 
   const handlePostComment = () => {
     if (!newComment.trim() || !assignment) return;
     onPostComment(assignment.id, newComment.trim());
     setNewComment('');
   };
 
   const renderContent = () => {
     if (!assignment) return null;
     
     // Show loading skeleton
     if (assignment.loading) {
       return (
         <div className="flex items-center justify-center h-full">
-          <Loader2 className="w-8 h-8 animate-spin text-[#FF5722]" />
+          <Loader2 className="h-8 w-8 animate-spin text-[#FF7849]" />
         </div>
       );
     }
     
     // Show full details
     return (
       <>
         {/* Header */}
-        <div className="flex-shrink-0 p-5 border-b">
-          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">{assignment.category}</span>
-          <h3 className="text-2xl font-bold text-gray-900 mt-1">{assignment.title}</h3>
-          <p className="text-sm text-gray-500 mt-1">Due: <span className="font-medium text-red-600">{formatDate(assignment.due_date)}</span></p>
+        <div className="flex-shrink-0 border-b border-white/10 p-5">
+          <span className="rounded-full border border-blue-500/40 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
+            {assignment.category}
+          </span>
+          <h3 className="mt-2 text-2xl font-bold text-white">{assignment.title}</h3>
+          <p className="mt-1 text-sm text-slate-300">
+            Due:{' '}
+            <span className="font-medium text-amber-200">{formatDate(assignment.due_date)}</span>
+          </p>
         </div>
-        
+
         {/* Content */}
-        <div className="flex-1 overflow-y-auto p-6 space-y-6">
-          
+        <div className="flex-1 space-y-6 overflow-y-auto p-6">
+
           {/* Status Updater */}
           <div>
-            <label className="text-sm font-semibold text-gray-700">Update Status</label>
+            <label className="text-sm font-semibold text-slate-200">Update Status</label>
             <select
               value={assignment.status}
               onChange={(e) => onUpdateStatus(assignment.id, e.target.value)}
-              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
+              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF7849]"
             >
               <option value="pending">Pending</option>
               <option value="in_progress">In Progress</option>
               <option value="pending_review">Pending Review</option>
               <option value="completed">Completed</option>
               {assignment.status === 'overdue' && <option value="overdue">Overdue</option>}
             </select>
             {assignment.status === 'pending_review' && (
-              <p className="text-xs text-green-600 mt-1">Your admin will be notified for review.</p>
+              <p className="mt-2 text-xs text-emerald-300">Your admin will be notified for review.</p>
             )}
           </div>
-          
+
           {/* Description */}
           <div>
-            <h4 className="font-semibold text-gray-800 flex items-center gap-2"><AlignLeft size={16} /> Description</h4>
-            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{assignment.description}</p>
+            <h4 className="flex items-center gap-2 font-semibold text-slate-200"><AlignLeft size={16} /> Description</h4>
+            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{assignment.description}</p>
           </div>
-          
+
           {/* Attachments from Admin */}
           {assignment.attachments?.length > 0 && (
             <div>
-              <h4 className="font-semibold text-gray-800 flex items-center gap-2"><Paperclip size={16} /> Attachments</h4>
-              <div className="mt-2 space-y-2">
+              <h4 className="flex items-center gap-2 font-semibold text-slate-200"><Paperclip size={16} /> Attachments</h4>
+              <div className="mt-3 space-y-2">
                 {assignment.attachments.map(file => (
-                  <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50">
-                    <FileText size={16} /> {file.file_name}
+                  <a
+                    href={file.file_url}
+                    target="_blank"
+                    rel="noopener noreferrer"
+                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-blue-200 transition hover:border-white/20 hover:bg-white/20"
+                  >
+                    <FileText size={16} />
+                    {file.file_name}
                   </a>
                 ))}
               </div>
             </div>
           )}
           
           {/* Deliverables (Your Uploads) */}
           <div>
-            <h4 className="font-semibold text-gray-800 flex items-center gap-2"><UploadCloud size={16} /> Submit Deliverables</h4>
-            <div className="mt-2 p-6 border-2 border-dashed rounded-lg text-center">
-              <p className="text-sm text-gray-500">File upload not implemented yet.</p>
+            <h4 className="flex items-center gap-2 font-semibold text-slate-200"><UploadCloud size={16} /> Submit Deliverables</h4>
+            <div className="mt-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 p-6 text-center">
+              <p className="text-sm text-slate-400">File upload not implemented yet.</p>
             </div>
           </div>
 
           {/* Comments */}
           <div>
-            <h4 className="font-semibold text-gray-800 flex items-center gap-2"><List size={16} /> Activity Feed</h4>
+            <h4 className="flex items-center gap-2 font-semibold text-slate-200"><List size={16} /> Activity Feed</h4>
             <div className="mt-4 space-y-4">
               {/* New Comment Form */}
               <div className="flex items-start gap-3">
-                <span className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
-                  <User size={16} className="text-gray-500" />
+                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10">
+                  <User size={16} className="text-white/80" />
                 </span>
                 <div className="flex-1 relative">
                   <textarea
                     value={newComment}
                     onChange={(e) => setNewComment(e.target.value)}
                     placeholder="Add a comment or ask a question..."
                     rows={3}
-                    className="w-full p-3 pr-12 rounded-lg border border-gray-300"
+                    className="w-full rounded-2xl border border-white/10 bg-slate-900/40 p-3 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF7849]"
                   />
-                  <button 
+                  <button
                     onClick={handlePostComment}
-                    className="absolute right-3 top-3 p-2 rounded-full bg-[#FF5722] text-white hover:bg-[#E64A19]"
+                    className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-[#FF7849] to-[#FF5722] p-2 text-white shadow-lg shadow-[#FF7849]/30 transition hover:shadow-[#FF5722]/40"
                   >
                     <Send size={16} />
                   </button>
                 </div>
               </div>
-              
+
               {/* Comment List */}
               {assignment.comments.length === 0 ? (
-                <p className="text-sm text-gray-500 text-center py-4">No comments yet.</p>
+                <p className="py-4 text-center text-sm text-slate-400">No comments yet.</p>
               ) : (
                 assignment.comments.slice().reverse().map(comment => (
                   <div key={comment.id} className="flex items-start gap-3">
-                    <span className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
-                      <User size={16} className="text-gray-500" />
+                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10">
+                      <User size={16} className="text-white/80" />
                     </span>
                     <div>
-                      <p className="text-sm font-semibold">
+                      <p className="text-sm font-semibold text-white">
                         {comment.profile.first_name} {comment.profile.last_name}
-                        <span className="text-xs text-gray-400 font-normal ml-2">{formatDate(comment.created_at)}</span>
+                        <span className="ml-2 text-xs font-normal text-slate-400">{formatDate(comment.created_at)}</span>
                       </p>
-                      <p className="text-sm text-gray-700">{comment.content}</p>
+                      <p className="text-sm text-slate-200">{comment.content}</p>
                     </div>
                   </div>
                 ))
               )}
             </div>
           </div>
           
         </div>
       </>
     );
   };
   
   return (
     <AnimatePresence>
       {assignment && (
         <motion.div
           initial={{ x: '100%' }}
           animate={{ x: 0 }}
           exit={{ x: '100%' }}
           transition={{ type: 'spring', stiffness: 300, damping: 30 }}
-          className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl flex flex-col z-40 border-l"
+          className="fixed right-0 top-0 bottom-0 z-40 flex w-full max-w-lg flex-col border-l border-white/10 bg-slate-950/95 text-slate-100 shadow-[0_0_30px_rgba(15,23,42,0.45)] backdrop-blur-xl"
         >
           {/* Close Button */}
-          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 z-50">
+          <button
+            onClick={onClose}
+            className="absolute right-4 top-4 z-50 rounded-full border border-white/10 bg-white/10 p-2 text-white transition hover:border-white/20 hover:bg-white/20"
+            aria-label="Close assignment details"
+          >
             <X size={24} />
           </button>
-          
+
           {renderContent()}
-          
+
         </motion.div>
       )}
     </AnimatePresence>
   );
 };
 
 export default EmployeeAssignmentPanel;
\ No newline at end of file
diff --git a/src/pages/employee/EmployeeDashboardPage.tsx b/src/pages/employee/EmployeeDashboardPage.tsx
index adc5a2460991b525cb808e6dd1ffe0b9a6968a6a..43ecfa68ebad19d35c81b59719e6d99c1bdf010c 100644
--- a/src/pages/employee/EmployeeDashboardPage.tsx
+++ b/src/pages/employee/EmployeeDashboardPage.tsx
@@ -1,39 +1,63 @@
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
+import {
+  Loader2,
+  List,
+  FileText,
+  CheckCircle,
+  Clock,
+  Send,
+  Eye,
+  Download,
+  AlertCircle,
+  Inbox,
+  User as UserIcon,
+  Mail,
+  Phone,
+  MapPin,
+  Calendar,
+  Briefcase,
+  Hash,
+  Edit2,
+  FileSignature,
+  AlertTriangle,
+  Sparkles,
+  CalendarClock,
+  ArrowUpRight
+} from 'lucide-react';
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
@@ -202,341 +226,490 @@ const EmployeeDashboardPage: React.FC = () => {
 
       const { data: urlData } = supabase.storage
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
-  
+
+  const totalAssignments = assignments.length;
+  const completedCount = assignments.filter(a => a.status === 'completed').length;
+  const inProgressCount = assignments.filter(a => a.status === 'in_progress').length;
+  const overdueCount = assignments.filter(a => a.status === 'overdue').length;
+  const pendingReviewCount = assignments.filter(a => a.status === 'pending_review').length;
+  const activeAssignments = Math.max(totalAssignments - completedCount, 0);
+  const completionRate = totalAssignments ? Math.round((completedCount / totalAssignments) * 100) : 0;
+
+  const upcomingAssignments = assignments
+    .filter(a => a.due_date && new Date(a.due_date).getTime() >= Date.now() && a.status !== 'completed')
+    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
+
+  const nextDueAssignment = upcomingAssignments[0] || assignments
+    .filter(a => a.due_date)
+    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0] || null;
+
   const getStatusProps = (status: string) => {
     switch (status) {
-      case 'completed': return { icon: CheckCircle, color: 'text-green-500', label: 'Completed' };
-      case 'in_progress': return { icon: Clock, color: 'text-blue-500', label: 'In Progress' };
-      case 'overdue': return { icon: AlertCircle, color: 'text-red-500', label: 'Overdue' };
-      default: return { icon: List, color: 'text-yellow-500', label: status };
+      case 'completed':
+        return { icon: CheckCircle, label: 'Completed', badgeClass: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40' };
+      case 'in_progress':
+        return { icon: Clock, label: 'In Progress', badgeClass: 'bg-blue-500/15 text-blue-200 border border-blue-500/40' };
+      case 'overdue':
+        return { icon: AlertCircle, label: 'Overdue', badgeClass: 'bg-red-500/15 text-red-200 border border-red-500/40' };
+      case 'pending_review':
+        return { icon: List, label: 'Pending Review', badgeClass: 'bg-amber-500/15 text-amber-200 border border-amber-500/40' };
+      default:
+        return { icon: List, label: status, badgeClass: 'bg-slate-500/15 text-slate-200 border border-slate-500/40' };
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
-            </div>
-          </section>
+    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-slate-100">
+      <div className="absolute inset-0 overflow-hidden">
+        <div className="absolute -top-32 -right-40 h-72 w-72 rounded-full bg-[#FF7849]/20 blur-3xl" />
+        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
+      </div>
+      <main className="relative z-10 flex-1 overflow-y-auto px-6 md:px-10 py-12">
+        <div className="mx-auto max-w-6xl space-y-8">
+          <div className="h-10 w-2/5 rounded-full bg-white/10 animate-pulse" />
+          <div className="h-4 w-1/3 rounded-full bg-white/5 animate-pulse" />
+          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
+            {[1, 2, 3, 4].map(i => (
+              <div key={i} className="h-32 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
+            ))}
+          </div>
+          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
+            {[1, 2].map(i => (
+              <div key={i} className="h-80 rounded-3xl border border-white/10 bg-white/5 animate-pulse" />
+            ))}
+          </div>
         </div>
       </main>
     </div>
   );
 
   if (loading) {
     return <LoadingSkeleton />;
   }
-  
+
   if (error) {
-    return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
+    return (
+      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-red-200">
+        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-8 py-6 backdrop-blur">
+          <p className="text-lg font-semibold">{error}</p>
+          <p className="mt-2 text-sm text-red-200/70">Please refresh the page or try again later.</p>
+        </div>
+      </div>
+    );
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
+    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
+      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
+        <Icon className="h-5 w-5 text-[#FFB74D]" />
+      </div>
       <div>
-        <p className="text-xs text-gray-500">{label}</p>
-        <p className="font-medium text-gray-900">{value || 'N/A'}</p>
+        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
+        <p className="text-sm font-semibold text-slate-50">{value || 'N/A'}</p>
       </div>
     </div>
   );
 
   return (
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
+    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-slate-100">
+      <div className="pointer-events-none absolute inset-0">
+        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-[#FF7849]/25 blur-3xl" />
+        <div className="absolute right-[-120px] top-1/2 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
+        <div className="absolute bottom-[-120px] left-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
+      </div>
 
-          {/* Profile Section */}
-          <section className="mb-8">
-            <div className="bg-white rounded-lg shadow-sm p-6">
-              <div className="flex justify-between items-center mb-4">
-                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
-                  <UserIcon className="text-gray-500" /> My Profile
-                </h2>
+      {/* Main Content */}
+      <main className="relative z-10 flex-1 overflow-y-auto px-6 py-12 md:px-10">
+        <div className="mx-auto max-w-6xl space-y-8">
+          {/* Hero */}
+          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 px-8 py-10 shadow-2xl shadow-black/40 backdrop-blur-xl">
+            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#FF7849]/20 blur-3xl" />
+            <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />
+            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
+              <div className="max-w-2xl">
+                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
+                  <Sparkles size={14} className="text-[#FFB74D]" />
+                  Employee Workspace
+                </span>
+                <h1 className="mt-5 text-3xl font-bold text-white md:text-4xl">
+                  Welcome back, {profile?.first_name || 'Employee'}!
+                </h1>
+                <p className="mt-3 text-sm leading-relaxed text-slate-300 md:text-base">
+                  Here's a snapshot of your current workload. Track assignments, review documents, and keep everything signed off without breaking a sweat.
+                </p>
                 {!isEditingProfile && (
                   <button
                     onClick={handleEditProfile}
-                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
+                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
                   >
-                    <Edit2 size={16} /> Edit Profile
+                    <Edit2 size={16} />
+                    Update profile
                   </button>
                 )}
               </div>
+              <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
+                <p className="text-xs uppercase tracking-wide text-slate-300">Next due</p>
+                {nextDueAssignment ? (
+                  <div className="mt-3 space-y-3">
+                    <p className="text-lg font-semibold leading-snug text-white">{nextDueAssignment.title}</p>
+                    <p className="flex items-center gap-2 text-sm text-slate-300">
+                      <CalendarClock size={16} className="text-[#FFB74D]" />
+                      {formatDate(nextDueAssignment.due_date)}
+                    </p>
+                    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusProps(nextDueAssignment.status).badgeClass}`}>
+                      <ArrowUpRight size={14} />
+                      {getStatusProps(nextDueAssignment.status).label}
+                    </div>
+                  </div>
+                ) : (
+                  <p className="mt-3 text-sm text-slate-300">
+                    No upcoming deadlines right now. Take a moment to recharge!
+                  </p>
+                )}
+              </div>
+            </div>
+          </div>
 
-              {isEditingProfile ? (
-                <div className="space-y-4">
-                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
-                    <div>
-                      <label className="text-sm font-medium text-gray-700">First Name</label>
-                      <input
-                        type="text"
-                        value={profileForm.first_name}
-                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
-                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
-                      />
+          {/* Stats */}
+          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
+            {[
+              { label: 'Active Assignments', value: activeAssignments, icon: List, accent: 'from-[#FF7849]/60 via-[#FF7849]/10 to-transparent' },
+              { label: 'Completion Rate', value: `${completionRate}%`, icon: CheckCircle, accent: 'from-emerald-500/60 via-emerald-500/10 to-transparent' },
+              { label: 'In Progress', value: inProgressCount, icon: Clock, accent: 'from-blue-500/60 via-blue-500/10 to-transparent' },
+              { label: 'Overdue', value: overdueCount, icon: AlertTriangle, accent: 'from-red-500/60 via-red-500/10 to-transparent' },
+            ].map(({ label, value, icon: Icon, accent }) => (
+              <div key={label} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur-lg">
+                <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-40`} />
+                <div className="relative z-10 flex items-start justify-between">
+                  <div>
+                    <p className="text-xs uppercase tracking-wide text-slate-300">{label}</p>
+                    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
+                  </div>
+                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
+                    <Icon className="h-6 w-6 text-white/80" />
+                  </span>
+                </div>
+              </div>
+            ))}
+          </section>
+
+          {/* Profile */}
+          <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-xl backdrop-blur-xl">
+            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
+              <div className="flex-1 space-y-6">
+                <div>
+                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
+                    <UserIcon className="text-[#FFB74D]" />
+                    My Profile
+                  </h2>
+                  <p className="mt-2 text-sm text-slate-300">
+                    Keep your contact information up to date so your team knows how to reach you.
+                  </p>
+                </div>
+
+                {isEditingProfile ? (
+                  <div className="space-y-6">
+                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
+                      {[
+                        { label: 'First Name', key: 'first_name' },
+                        { label: 'Last Name', key: 'last_name' },
+                        { label: 'Phone', key: 'phone' },
+                        { label: 'Home Address', key: 'home_address' },
+                      ].map(field => (
+                        <div key={field.key}>
+                          <label className="text-sm font-semibold text-slate-200">{field.label}</label>
+                          <input
+                            type="text"
+                            value={profileForm[field.key] || ''}
+                            onChange={(e) => setProfileForm({ ...profileForm, [field.key]: e.target.value })}
+                            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF7849]"
+                          />
+                        </div>
+                      ))}
                     </div>
-                    <div>
-                      <label className="text-sm font-medium text-gray-700">Last Name</label>
-                      <input
-                        type="text"
-                        value={profileForm.last_name}
-                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
-                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
-                      />
+                    <div className="flex flex-wrap justify-end gap-3">
+                      <button
+                        onClick={() => setIsEditingProfile(false)}
+                        className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/40 hover:bg-white/20"
+                      >
+                        Cancel
+                      </button>
+                      <button
+                        onClick={handleSaveProfile}
+                        className="rounded-full bg-gradient-to-r from-[#FF7849] to-[#FF5722] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#FF7849]/30 transition hover:shadow-[#FF5722]/40"
+                      >
+                        Save changes
+                      </button>
                     </div>
+                  </div>
+                ) : (
+                  <div className="space-y-6">
                     <div>
-                      <label className="text-sm font-medium text-gray-700">Phone</label>
-                      <input
-                        type="text"
-                        value={profileForm.phone}
-                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
-                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
-                      />
+                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
+                        Contact Information
+                      </h3>
+                      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
+                        <InfoRow icon={Mail} label="Email" value={profile?.email} />
+                        <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
+                        <InfoRow icon={MapPin} label="Address" value={profile?.home_address} />
+                        <InfoRow icon={Calendar} label="Birth Date" value={profile?.birth_date ? formatDate(profile.birth_date) : null} />
+                      </div>
                     </div>
                     <div>
-                      <label className="text-sm font-medium text-gray-700">Home Address</label>
-                      <input
-                        type="text"
-                        value={profileForm.home_address}
-                        onChange={(e) => setProfileForm({ ...profileForm, home_address: e.target.value })}
-                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
-                      />
+                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
+                        Employment Details
+                      </h3>
+                      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
+                        <InfoRow icon={Briefcase} label="Position" value={profile?.position} />
+                        <InfoRow icon={Hash} label="Employee #" value={profile?.employee_number} />
+                        <InfoRow icon={Calendar} label="Start Date" value={profile?.start_date ? formatDate(profile.start_date) : null} />
+                      </div>
                     </div>
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
-                  </div>
-                </div>
-              ) : (
-                <div>
-                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
-                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
-                    <InfoRow icon={Mail} label="Email" value={profile?.email} />
-                    <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
-                    <InfoRow icon={MapPin} label="Address" value={profile?.home_address} />
-                    <InfoRow icon={Calendar} label="Birth Date" value={profile?.birth_date ? formatDate(profile.birth_date) : null} />
-                  </div>
+                )}
+              </div>
 
-                  <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-6">Employment Details</h3>
-                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
-                    <InfoRow icon={Briefcase} label="Position" value={profile?.position} />
-                    <InfoRow icon={Hash} label="Employee #" value={profile?.employee_number} />
-                    <InfoRow icon={Calendar} label="Start Date" value={profile?.start_date ? formatDate(profile.start_date) : null} />
-                  </div>
+              {!isEditingProfile && (
+                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 shadow-inner shadow-white/5 lg:w-64">
+                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
+                    Quick Snapshot
+                  </h3>
+                  <ul className="mt-4 space-y-3">
+                    <li className="flex items-center justify-between">
+                      <span>Pending review</span>
+                      <span className="font-semibold text-white">{pendingReviewCount}</span>
+                    </li>
+                    <li className="flex items-center justify-between">
+                      <span>Signed documents</span>
+                      <span className="font-semibold text-white">{documents.filter(doc => doc.signed_at).length}</span>
+                    </li>
+                    <li className="flex items-center justify-between">
+                      <span>Awaiting signature</span>
+                      <span className="font-semibold text-white">
+                        {documents.filter(doc => doc.requires_signing && !doc.signed_at).length}
+                      </span>
+                    </li>
+                  </ul>
                 </div>
               )}
             </div>
           </section>
 
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
-                    >
-                      <div className="flex justify-between items-center">
-                        <span className="font-semibold text-gray-800">{assignment.title}</span>
-                        <span className={`flex items-center text-xs font-medium gap-1.5 ${color}`}>
-                          <Icon size={14} /> {label}
-                        </span>
-                      </div>
-                      <p className="text-sm text-gray-500 mt-1">Due: {formatDate(assignment.due_date)}</p>
-                    </button>
-                  );
-                })}
+          {/* Work */}
+          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
+            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
+              <div className="flex items-center justify-between">
+                <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
+                  <List className="text-[#FFB74D]" />
+                  My Assignments
+                </h2>
+                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300">
+                  {totalAssignments} total
+                </span>
               </div>
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
+              {assignments.length === 0 ? (
+                <div className="mt-10 text-center">
+                  <Inbox size={52} className="mx-auto text-white/30" />
+                  <h3 className="mt-4 text-lg font-semibold text-white/90">All caught up!</h3>
+                  <p className="mt-2 text-sm text-slate-300">
+                    You have no active assignments. Check back soon for new updates.
+                  </p>
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
+              ) : (
+                <div className="mt-6 grid grid-cols-1 gap-4">
+                  {assignments.map(assignment => {
+                    const { icon: Icon, label, badgeClass } = getStatusProps(assignment.status);
+                    const isSelected = selectedAssignment?.id === assignment.id;
+                    return (
+                      <button
+                        key={assignment.id}
+                        onClick={() => handleAssignmentClick(assignment.id)}
+                        className={`relative overflow-hidden rounded-2xl border px-5 py-4 text-left transition ${
+                          isSelected
+                            ? 'border-[#FF7849]/80 bg-[#FF7849]/20 shadow-lg shadow-[#FF7849]/20'
+                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
+                        }`}
+                      >
+                        <div className="flex items-start justify-between gap-4">
+                          <div>
+                            <p className="text-lg font-semibold text-white">{assignment.title}</p>
+                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
+                              <CalendarClock size={16} className="text-[#FFB74D]" />
+                              Due {formatDate(assignment.due_date)}
+                            </p>
+                          </div>
+                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}>
+                            <Icon size={14} />
+                            {label}
+                          </span>
                         </div>
-                        <div className="flex gap-2 flex-wrap">
-                          <button
-                            onClick={() => handleViewDocument(doc)}
-                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"
-                          >
-                            <Eye size={14} /> View
-                          </button>
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
+                      </button>
+                    );
+                  })}
+                </div>
+              )}
+            </div>
+
+            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
+              <div className="flex items-center justify-between">
+                <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
+                  <FileText className="text-[#FFB74D]" />
+                  My Documents
+                </h2>
+                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300">
+                  {documents.length} total
+                </span>
+              </div>
+              {documents.length === 0 ? (
+                <div className="mt-10 text-center">
+                  <FileText size={52} className="mx-auto text-white/30" />
+                  <h3 className="mt-4 text-lg font-semibold text-white/90">No documents yet</h3>
+                  <p className="mt-2 text-sm text-slate-300">
+                    Your admin hasn't uploaded any documents for you yet.
+                  </p>
+                </div>
+              ) : (
+                <div className="mt-6 space-y-4">
+                  {documents.map(doc => {
+                    const needsSignature = doc.requires_signing && !doc.signed_at;
+                    return (
+                      <div
+                        key={doc.id}
+                        className={`rounded-2xl border p-5 transition ${
+                          needsSignature
+                            ? 'border-amber-400/50 bg-amber-500/10'
+                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
+                        }`}
+                      >
+                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
+                          <div>
+                            <p className="text-lg font-semibold text-white">{doc.document_name}</p>
+                            {needsSignature && (
+                              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200">
+                                <AlertTriangle size={14} />
+                                Pending signature
+                              </div>
+                            )}
+                            {doc.signed_at && (
+                              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
+                                <CheckCircle size={14} />
+                                Signed on {formatDate(doc.signed_at)}
+                              </div>
+                            )}
+                            {!doc.requires_signing && (
+                              <p className="mt-2 text-xs uppercase tracking-wide text-slate-300">View only</p>
+                            )}
+                          </div>
+                          <div className="flex flex-wrap gap-2">
+                            <button
+                              onClick={() => handleViewDocument(doc)}
+                              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
                             >
-                              <Download size={14} /> Download Signed
-                            </a>
-                          )}
+                              <Eye size={14} />
+                              View
+                            </button>
+                            {needsSignature && (
+                              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF7849] to-[#FF5722] px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-[#FF7849]/30 transition hover:shadow-[#FF5722]/40">
+                                <FileSignature size={14} />
+                                Sign document
+                                <input
+                                  type="file"
+                                  accept=".pdf"
+                                  onChange={(e) => {
+                                    const file = e.target.files?.[0];
+                                    if (file) handleSignDocument(doc, file);
+                                  }}
+                                  className="hidden"
+                                />
+                              </label>
+                            )}
+                            {doc.signed_at && doc.signed_storage_url && (
+                              <a
+                                href={doc.signed_storage_url}
+                                download
+                                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400/80 hover:bg-emerald-500/20"
+                              >
+                                <Download size={14} />
+                                Download signed
+                              </a>
+                            )}
+                          </div>
                         </div>
                       </div>
-                    </div>
-                  );
-                })}
-              </div>
-            )}
+                    );
+                  })}
+                </div>
+              )}
+            </div>
           </section>
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
