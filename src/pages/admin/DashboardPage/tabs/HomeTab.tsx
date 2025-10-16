import React from 'react';
import { Users, SquareUser as UserSquare2, FileText, Package, LucideProps } from 'lucide-react';
import Card from '../components/Card';

// A reusable chart component for our new dashboard
interface StatChartProps {
  title: string;
  value: string;
  icon: React.ElementType<LucideProps>;
  data: { label: string; value: number }[];
  color: string;
}

const StatChart: React.FC<StatChartProps> = ({ title, value, icon: Icon, data, color }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
      </div>
      <div className="flex-grow flex items-end gap-2 mt-4 pt-4 border-t">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full h-24 flex items-end justify-center">
              <div
                className="w-3/4 rounded-t-md transition-all duration-500"
                style={{ height: `${(item.value / maxValue) * 100}%`, backgroundColor: color }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};


// The main HomeTab component with the new charts
const HomeTab: React.FC = () => {
  // Mock data for the charts. We can connect this to your real database later.
  const clientData = [
    { label: 'VIP', value: 8 },
    { label: 'Regular', value: 24 },
    { label: 'Dormant', value: 5 },
  ];
  const teamData = [
    { label: 'Strategy', value: 4 },
    { label: 'Production', value: 9 },
    { label: 'Tech', value: 3 },
  ];
  const applicationData = [
    { label: 'Pending', value: 12 },
    { label: 'Interview', value: 4 },
    { label: 'Rejected', value: 28 },
  ];
  const equipmentData = [
    { label: 'Available', value: 25 },
    { label: 'Booked', value: 7 },
    { label: 'Maintenance', value: 2 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatChart 
        title="Total Clients"
        value="37"
        icon={Users}
        data={clientData}
        color="#3b82f6" // Blue
      />
      <StatChart 
        title="Team Members"
        value="16"
        icon={UserSquare2}
        data={teamData}
        color="#8b5cf6" // Violet
      />
      <StatChart 
        title="Job Applications"
        value="44"
        icon={FileText}
        data={applicationData}
        color="#f59e0b" // Amber
      />
      <StatChart 
        title="Equipment Items"
        value="34"
        icon={Package}
        data={equipmentData}
        color="#10b981" // Emerald
      />
    </div>
  );
};

export default HomeTab;