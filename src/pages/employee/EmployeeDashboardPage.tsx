diff --git a/src/pages/employee/EmployeeDashboardPage.tsx b/src/pages/employee/EmployeeDashboardPage.tsx
index adc5a2460991b525cb808e6dd1ffe0b9a6968a6a..30131e388ccdb3c0ce7d128cf8561e1ee43f9962 100644
--- a/src/pages/employee/EmployeeDashboardPage.tsx
+++ b/src/pages/employee/EmployeeDashboardPage.tsx
@@ -205,331 +205,455 @@ const EmployeeDashboardPage: React.FC = () => {
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
     switch (status) {
-      case 'completed': return { icon: CheckCircle, color: 'text-green-500', label: 'Completed' };
-      case 'in_progress': return { icon: Clock, color: 'text-blue-500', label: 'In Progress' };
-      case 'overdue': return { icon: AlertCircle, color: 'text-red-500', label: 'Overdue' };
-      default: return { icon: List, color: 'text-yellow-500', label: status };
+      case 'completed':
+        return {
+          icon: CheckCircle,
+          textClass: 'text-green-600',
+          badgeClass: 'bg-green-50 text-green-600 border border-green-200',
+          label: 'Completed'
+        };
+      case 'in_progress':
+        return {
+          icon: Clock,
+          textClass: 'text-blue-600',
+          badgeClass: 'bg-blue-50 text-blue-600 border border-blue-200',
+          label: 'In Progress'
+        };
+      case 'overdue':
+        return {
+          icon: AlertCircle,
+          textClass: 'text-red-600',
+          badgeClass: 'bg-red-50 text-red-600 border border-red-200',
+          label: 'Overdue'
+        };
+      default:
+        return {
+          icon: List,
+          textClass: 'text-amber-600',
+          badgeClass: 'bg-amber-50 text-amber-600 border border-amber-200',
+          label: status
+        };
     }
   };
 
   // Loading skeleton
   const LoadingSkeleton = () => (
-    <div className="flex h-screen bg-gray-100">
+    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
       <main className="flex-1 overflow-y-auto p-6 md:p-10">
-        <div className="max-w-4xl mx-auto">
-          <div className="h-8 bg-gray-300 rounded w-1/3 animate-pulse" />
-          <div className="h-4 bg-gray-200 rounded w-2/3 mt-2 animate-pulse" />
+        <div className="max-w-6xl mx-auto space-y-6">
+          <div className="h-10 bg-white/60 rounded-2xl w-1/3 animate-pulse" />
+          <div className="h-4 bg-white/40 rounded-2xl w-2/3 mt-2 animate-pulse" />
 
           <section className="mt-8">
-            <div className="h-6 bg-gray-300 rounded w-1/4 animate-pulse" />
-            <div className="mt-4 space-y-3">
-              {[1, 2, 3].map(i => (
-                <div key={i} className="w-full p-4 bg-white rounded-lg shadow-sm">
-                  <div className="h-5 bg-gray-300 rounded w-3/4 animate-pulse" />
-                  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2 animate-pulse" />
+            <div className="h-6 bg-white/60 rounded-xl w-1/4 animate-pulse" />
+            <div className="mt-4 grid gap-4 md:grid-cols-2">
+              {[1, 2, 3, 4].map(i => (
+                <div key={i} className="w-full p-5 bg-white/70 backdrop-blur rounded-2xl shadow-sm">
+                  <div className="h-5 bg-white/60 rounded-xl w-3/4 animate-pulse" />
+                  <div className="h-4 bg-white/40 rounded-xl w-1/2 mt-2 animate-pulse" />
                 </div>
               ))}
             </div>
           </section>
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
     <div className="flex items-start gap-3">
-      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
+      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-inner text-gray-500">
+        <Icon className="w-4 h-4" />
+      </div>
       <div>
-        <p className="text-xs text-gray-500">{label}</p>
-        <p className="font-medium text-gray-900">{value || 'N/A'}</p>
+        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
+        <p className="text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
       </div>
     </div>
   );
 
+  const completedAssignments = assignments.filter(assignment => assignment.status === 'completed').length;
+  const activeAssignments = assignments.filter(assignment => assignment.status === 'in_progress').length;
+  const overdueAssignments = assignments.filter(assignment => assignment.status === 'overdue').length;
+  const pendingSignatureDocs = documents.filter(doc => doc.requires_signing && !doc.signed_at).length;
+  const hasDocumentsAwaitingSignature = pendingSignatureDocs > 0;
+
   return (
-    <div className="flex h-screen bg-gray-100">
+    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
       {/* Main Content */}
       <main className="flex-1 overflow-y-auto p-6 md:p-10">
-        <div className="max-w-4xl mx-auto">
-          <div className="flex justify-between items-start mb-6">
-            <div>
-              <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.first_name || 'Employee'}</h1>
-              <p className="text-gray-600 mt-1">Here's what's on your plate. Let's get to work.</p>
+        <div className="mx-auto max-w-6xl space-y-8">
+          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF7043] via-[#FF5722] to-[#FF7043] p-6 md:p-10 text-white shadow-xl">
+            <div className="absolute -top-10 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
+            <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
+            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
+              <div className="space-y-3">
+                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
+                  <span className="h-2 w-2 rounded-full bg-emerald-300" /> Dashboard
+                </span>
+                <div>
+                  <h1 className="text-3xl font-bold md:text-4xl">Welcome back, {profile?.first_name || 'Team Member'} 👋</h1>
+                  <p className="mt-2 max-w-xl text-base text-white/80">Track your assignments, stay on top of documents, and keep your profile details polished—all in one place.</p>
+                </div>
+                {hasDocumentsAwaitingSignature && (
+                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white">
+                    <AlertTriangle size={16} className="text-amber-200" />
+                    {pendingSignatureDocs} document{pendingSignatureDocs > 1 ? 's' : ''} awaiting your signature
+                  </div>
+                )}
+              </div>
+              <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
+                {[{
+                  label: 'Active Assignments',
+                  value: activeAssignments,
+                  description: 'Currently in progress'
+                }, {
+                  label: 'Completed Tasks',
+                  value: completedAssignments,
+                  description: 'Nice job so far!'
+                }, {
+                  label: 'Overdue Items',
+                  value: overdueAssignments,
+                  description: overdueAssignments > 0 ? 'Needs your attention' : 'Nothing overdue'
+                }, {
+                  label: 'Pending Signatures',
+                  value: pendingSignatureDocs,
+                  description: pendingSignatureDocs > 0 ? 'Action required' : 'All documents signed'
+                }].map(stat => (
+                  <div key={stat.label} className="group rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur transition hover:border-white/40 hover:bg-white/20">
+                    <p className="text-xs uppercase tracking-wide text-white/70">{stat.label}</p>
+                    <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
+                    <p className="text-sm text-white/80">{stat.description}</p>
+                  </div>
+                ))}
+              </div>
             </div>
-          </div>
+          </section>
 
           {/* Profile Section */}
-          <section className="mb-8">
-            <div className="bg-white rounded-lg shadow-sm p-6">
-              <div className="flex justify-between items-center mb-4">
-                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
-                  <UserIcon className="text-gray-500" /> My Profile
+          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
+            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur">
+              <div className="flex flex-wrap items-center justify-between gap-4">
+                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
+                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFEBE0] text-[#FF5722]">
+                    <UserIcon size={18} />
+                  </span>
+                  My Profile
                 </h2>
                 {!isEditingProfile && (
                   <button
                     onClick={handleEditProfile}
-                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
+                    className="inline-flex items-center gap-2 rounded-full border border-[#FF8A50]/50 bg-white px-4 py-2 text-sm font-semibold text-[#FF5722] shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF7043] hover:bg-[#FFF3E8]"
                   >
-                    <Edit2 size={16} /> Edit Profile
+                    <Edit2 size={16} />
+                    Edit Profile
                   </button>
                 )}
               </div>
 
               {isEditingProfile ? (
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
+                <div className="mt-6 space-y-6">
+                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
+                    {[{
+                      label: 'First Name',
+                      value: profileForm.first_name,
+                      key: 'first_name'
+                    }, {
+                      label: 'Last Name',
+                      value: profileForm.last_name,
+                      key: 'last_name'
+                    }, {
+                      label: 'Phone',
+                      value: profileForm.phone,
+                      key: 'phone'
+                    }, {
+                      label: 'Home Address',
+                      value: profileForm.home_address,
+                      key: 'home_address'
+                    }].map(field => (
+                      <label key={field.key} className="space-y-2 text-sm font-medium text-gray-700">
+                        {field.label}
+                        <input
+                          type="text"
+                          value={field.value}
+                          onChange={(e) => setProfileForm({ ...profileForm, [field.key]: e.target.value })}
+                          className="w-full rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-[#FF7043] focus:outline-none focus:ring-2 focus:ring-[#FFCCBC]"
+                        />
+                      </label>
+                    ))}
                   </div>
-                  <div className="flex gap-2 justify-end">
+                  <div className="flex flex-wrap justify-end gap-3">
                     <button
                       onClick={() => setIsEditingProfile(false)}
-                      className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
+                      className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                     >
                       Cancel
                     </button>
                     <button
                       onClick={handleSaveProfile}
-                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#FF5722] text-white hover:bg-[#E64A19]"
+                      className="rounded-full bg-[#FF5722] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#E64A19]"
                     >
                       Save Changes
                     </button>
                   </div>
                 </div>
               ) : (
-                <div>
-                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
-                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
-                    <InfoRow icon={Mail} label="Email" value={profile?.email} />
-                    <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
-                    <InfoRow icon={MapPin} label="Address" value={profile?.home_address} />
-                    <InfoRow icon={Calendar} label="Birth Date" value={profile?.birth_date ? formatDate(profile.birth_date) : null} />
+                <div className="mt-6 space-y-8">
+                  <div>
+                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact Information</h3>
+                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
+                      <InfoRow icon={Mail} label="Email" value={profile?.email} />
+                      <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
+                      <InfoRow icon={MapPin} label="Address" value={profile?.home_address} />
+                      <InfoRow icon={Calendar} label="Birth Date" value={profile?.birth_date ? formatDate(profile.birth_date) : null} />
+                    </div>
                   </div>
 
-                  <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-6">Employment Details</h3>
-                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
-                    <InfoRow icon={Briefcase} label="Position" value={profile?.position} />
-                    <InfoRow icon={Hash} label="Employee #" value={profile?.employee_number} />
-                    <InfoRow icon={Calendar} label="Start Date" value={profile?.start_date ? formatDate(profile.start_date) : null} />
+                  <div>
+                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Employment Details</h3>
+                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
+                      <InfoRow icon={Briefcase} label="Position" value={profile?.position} />
+                      <InfoRow icon={Hash} label="Employee #" value={profile?.employee_number} />
+                      <InfoRow icon={Calendar} label="Start Date" value={profile?.start_date ? formatDate(profile.start_date) : null} />
+                    </div>
                   </div>
                 </div>
               )}
             </div>
+
+            <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur">
+              <div className="space-y-4">
+                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Quick Tips</h3>
+                <ul className="space-y-3 text-sm text-gray-600">
+                  <li className="flex items-start gap-3">
+                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFEBE0] text-xs font-semibold text-[#FF5722]">1</span>
+                    Update your contact info so your manager can reach you easily.
+                  </li>
+                  <li className="flex items-start gap-3">
+                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFEBE0] text-xs font-semibold text-[#FF5722]">2</span>
+                    Review assignments daily to stay ahead of due dates.
+                  </li>
+                  <li className="flex items-start gap-3">
+                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFEBE0] text-xs font-semibold text-[#FF5722]">3</span>
+                    Sign documents promptly to keep workflows moving.
+                  </li>
+                </ul>
+              </div>
+
+              <div className="rounded-2xl bg-gradient-to-br from-[#FF7043] to-[#FF5722] p-4 text-white shadow-lg">
+                <h4 className="text-sm font-semibold uppercase tracking-wide text-white/80">Need help?</h4>
+                <p className="mt-2 text-sm text-white/90">Reach out to your admin team if something looks off. We're here to help you succeed.</p>
+              </div>
+            </div>
           </section>
 
           {/* Assignments Section */}
-          <section>
-            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
-              <List className="text-gray-500" /> My Assignments
-            </h2>
+          <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur">
+            <div className="flex flex-wrap items-center justify-between gap-4">
+              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
+                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F5E9] text-[#2E7D32]">
+                  <List size={18} />
+                </span>
+                My Assignments
+              </h2>
+              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
+                {assignments.length} total
+              </span>
+            </div>
             {assignments.length === 0 ? (
-               <div className="text-center p-10 bg-white rounded-lg shadow-sm mt-4">
-                  <Inbox size={48} className="mx-auto text-gray-300" />
-                  <h3 className="mt-4 font-semibold text-gray-700">All caught up!</h3>
-                  <p className="text-sm text-gray-500">You have no active assignments.</p>
-                </div>
+              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white/70 p-10 text-center">
+                <Inbox size={48} className="mx-auto text-gray-300" />
+                <h3 className="mt-4 text-lg font-semibold text-gray-700">All caught up!</h3>
+                <p className="text-sm text-gray-500">You have no active assignments.</p>
+              </div>
             ) : (
-              <div className="mt-4 space-y-3">
+              <div className="mt-6 space-y-4">
                 {assignments.map(assignment => {
-                  const { icon: Icon, color, label } = getStatusProps(assignment.status);
+                  const { icon: Icon, textClass, badgeClass, label } = getStatusProps(assignment.status);
                   return (
                     <button
                       key={assignment.id}
                       onClick={() => handleAssignmentClick(assignment.id)}
-                      className={`w-full p-4 bg-white rounded-lg shadow-sm text-left transition-all ${
-                        selectedAssignment?.id === assignment.id ? 'ring-2 ring-[#FF5722]' : 'hover:shadow-md'
+                      className={`w-full rounded-2xl border bg-white/80 p-5 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#FFCCBC] focus:ring-offset-2 focus:ring-offset-white ${
+                        selectedAssignment?.id === assignment.id
+                          ? 'border-[#FF7043] shadow-lg ring-2 ring-[#FF7043]/30'
+                          : 'border-transparent hover:-translate-y-0.5 hover:shadow-lg'
                       }`}
                     >
-                      <div className="flex justify-between items-center">
-                        <span className="font-semibold text-gray-800">{assignment.title}</span>
-                        <span className={`flex items-center text-xs font-medium gap-1.5 ${color}`}>
-                          <Icon size={14} /> {label}
+                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
+                        <div>
+                          <span className="text-base font-semibold text-gray-900">{assignment.title}</span>
+                          <p className="mt-1 text-sm text-gray-500">Due {formatDate(assignment.due_date)}</p>
+                        </div>
+                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
+                          <Icon size={14} className={textClass} />
+                          <span className={textClass}>{label}</span>
                         </span>
                       </div>
-                      <p className="text-sm text-gray-500 mt-1">Due: {formatDate(assignment.due_date)}</p>
                     </button>
                   );
                 })}
               </div>
             )}
           </section>
 
           {/* Documents Section */}
-          <section className="mt-8">
-            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
-              <FileText className="text-gray-500" /> My Documents
-            </h2>
+          <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur">
+            <div className="flex flex-wrap items-center justify-between gap-4">
+              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
+                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF8E1] text-[#FF8F00]">
+                  <FileText size={18} />
+                </span>
+                My Documents
+              </h2>
+              {documents.length > 0 && (
+                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
+                  {documents.length} item{documents.length > 1 ? 's' : ''}
+                </span>
+              )}
+            </div>
             {documents.length === 0 ? (
-               <div className="text-center p-10 bg-white rounded-lg shadow-sm mt-4">
-                  <FileText size={48} className="mx-auto text-gray-300" />
-                  <h3 className="mt-4 font-semibold text-gray-700">No Documents</h3>
-                  <p className="text-sm text-gray-500">Your admin hasn't uploaded any documents for you yet.</p>
-                </div>
+              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white/70 p-10 text-center">
+                <FileText size={48} className="mx-auto text-gray-300" />
+                <h3 className="mt-4 text-lg font-semibold text-gray-700">No Documents</h3>
+                <p className="text-sm text-gray-500">Your admin hasn't uploaded any documents for you yet.</p>
+              </div>
             ) : (
-              <div className="mt-4 space-y-3">
+              <div className="mt-6 space-y-4">
                 {documents.map(doc => {
                   const needsSignature = doc.requires_signing && !doc.signed_at;
                   return (
-                    <div key={doc.id} className={`p-4 bg-white rounded-lg shadow-sm border ${
-                      needsSignature ? 'border-yellow-300' : 'border-gray-200'
-                    }`}>
-                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
-                        <div className="flex-1">
-                          <p className="font-semibold text-gray-800">{doc.document_name}</p>
+                    <div
+                      key={doc.id}
+                      className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
+                        needsSignature
+                          ? 'border-amber-200 bg-amber-50/70'
+                          : 'border-transparent bg-white/80'
+                      }`}
+                    >
+                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
+                        <div className="space-y-2">
+                          <p className="text-base font-semibold text-gray-900">{doc.document_name}</p>
                           {needsSignature && (
-                            <div className="flex items-center gap-1.5 text-xs text-yellow-600 font-medium mt-1">
-                              <AlertTriangle size={14} /> Pending Signature - Action Required
+                            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-amber-700">
+                              <AlertTriangle size={14} /> Pending Signature
                             </div>
                           )}
                           {doc.signed_at && (
-                            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mt-1">
+                            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                               <CheckCircle size={14} /> Signed on {formatDate(doc.signed_at)}
                             </div>
                           )}
                           {!doc.requires_signing && (
-                            <span className="text-xs text-gray-500 mt-1 block">View Only</span>
+                            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">View Only</span>
                           )}
                         </div>
-                        <div className="flex gap-2 flex-wrap">
+                        <div className="flex flex-wrap items-center gap-2">
                           <button
                             onClick={() => handleViewDocument(doc)}
-                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"
+                            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                           >
                             <Eye size={14} /> View
                           </button>
                           {needsSignature && (
-                            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF5722] text-white hover:bg-[#E64A19] cursor-pointer">
+                            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#FF5722] px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#E64A19]">
                               <FileSignature size={14} /> Sign Document
                               <input
                                 type="file"
                                 accept=".pdf"
                                 onChange={(e) => {
                                   const file = e.target.files?.[0];
                                   if (file) handleSignDocument(doc, file);
                                 }}
                                 className="hidden"
                               />
                             </label>
                           )}
                           {doc.signed_at && doc.signed_storage_url && (
                             <a
                               href={doc.signed_storage_url}
                               download
-                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
+                              className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 shadow-sm transition hover:bg-green-100"
                             >
                               <Download size={14} /> Download Signed
                             </a>
                           )}
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
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
       
       {/* PDF Viewer Modal */}
       <AnimatePresence>
