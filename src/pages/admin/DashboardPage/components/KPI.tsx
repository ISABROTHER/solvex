import React from "react";
import { LucideProps } from "lucide-react";

interface KPIProps {
  label: string;
  value: string | number;
  icon: React.ElementType<LucideProps>;
  hint?: string;
  delta?: string;
  up?: boolean;
}

const KPI: React.FC<KPIProps> = ({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  up,
}) => {
  // Safety check to prevent crashing if an invalid icon is passed
  if (!Icon) {
    console.error(`KPI component received an undefined icon for label: "${label}"`);
    return (
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-xs uppercase text-gray-500">{label}</div>
        <div className="mt-1 text-3xl font-bold">{value}</div>
        <div className="mt-2 text-xs text-red-500">Icon Error</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
          <div className="mt-1 text-3xl font-bold text-gray-800">{value}</div>
        </div>
        <div className="rounded-full bg-gray-100 p-2">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-gray-500">{hint}</div>
        {delta && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              up ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
};

export default KPI;