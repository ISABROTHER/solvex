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
