// src/components/profile/EmployeeProfileCard.tsx
import React from 'react';
import { format } from 'date-fns'; // Already a dependency
import type { Profile } from '../../lib/supabase/operations';
import Card from '../../pages/admin/DashboardPage/components/Card';
import {
  User, Calendar, BadgePercent, Home, Phone, Banknote, Landmark, Key
} from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
}

const DetailItem: React.FC<{ label: string, value: React.ReactNode, icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="flex flex-col py-3">
    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      {label}
    </dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
      {value || <span className="text-gray-400">Not set</span>}
    </dd>
  </div>
);

const EmployeeProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const { user } = useAuth(); // Get user to check admin status
  const { profile: adminProfile } = useAuth();
  const isAdmin = adminProfile?.role === 'admin';

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'dd.MM.yyyy');
    } catch (e) {
      return dateString; // Fallback if date is invalid
    }
  };

  return (
    <Card title="Employee Details">
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 divide-y divide-gray-200">
        <DetailItem label="Full Name" value={profile.full_name} icon={User} />
        <DetailItem label="Position" value={profile.position} icon={BadgePercent} />
        <DetailItem label="Birth Date" value={formatDate(profile.birth_date)} icon={Calendar} />
        <DetailItem label="National ID" value={profile.national_id} icon={Key} />
        <DetailItem label="Start Date" value={formatDate(profile.start_date)} icon={Calendar} />
        <DetailItem label="End Date" value={formatDate(profile.end_date)} icon={Calendar} />
        <DetailItem label="Home Address" value={profile.home_address} icon={Home} />
        <DetailItem label="Phone" value={profile.phone} icon={Phone} />

        {/* Admin-Only Fields */}
        {isAdmin && (
          <>
            <DetailItem 
              label="Salary" 
              value={profile.salary ? `GhC ${Number(profile.salary).toFixed(2)}` : null} 
              icon={Banknote} 
            />
            <DetailItem label="Payday" value={profile.payday} icon={Calendar} />
            <DetailItem 
              label="Bank Account" 
              value={`${profile.bank_account || ''} (${profile.bank_name || 'N/A'})`}
              icon={Landmark}
            />
          </>
        )}
      </dl>
    </Card>
  );
};

export default EmployeeProfileCard;