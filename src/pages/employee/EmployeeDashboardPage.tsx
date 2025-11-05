// src/pages/employee/EmployeeDashboardPage.tsx (Relevant Snippets)

// ... (other code)

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left Column: Assignments & Documents ... */}
            
            {/* Right Column: Profile Details */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">My Profile</h2>
                <div className="space-y-2">
                  <InfoRow icon={Mail} label="Email" value={profile?.email} />
                  <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                  <InfoRow icon={MapPin} label="Address" value={profile?.home_address} />
                  <InfoRow icon={Calendar} label="Birth Date" value={formatDate(profile?.birth_date)} />
                </div>
              </div>
              
               {/* Employment Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Employment Details</h2>
                <div className="space-y-2">
                  <InfoRow icon={Briefcase} label="Position" value={profile?.position} />
                  <InfoRow icon={Hash} label="Employee #" value={profile?.employee_number} />
                  <InfoRow icon={Calendar} label="Start Date" value={formatDate(profile?.start_date)} />
                  <InfoRow icon={FileText} label="National ID" value={profile?.national_id} />
                  <InfoRow icon={DollarSign} label="Salary" value={profile?.salary ? `GHS ${profile?.salary}` : 'N/A'} />
                  <InfoRow icon={Building} label="Bank" value={profile?.bank_name} />
                  <InfoRow icon={CreditCard} label="Account #" value={profile?.bank_account} />
                </div>
              </div>
            </aside>
            
          </div>
        </div>
      </main>
// ... (rest of the code)