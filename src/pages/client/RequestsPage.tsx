// src/pages/client/RequestsPage.tsx
/**
 * src/pages/client/RequestsPage.tsx
 *
 * Client-facing page to view service requests,
 * featuring mobile-first design and month-based filtering.
 */
import React, { useState, useMemo } from 'react'; // Correct imports
import { Link } from 'react-router-dom';
import { useClientMock } from './useClientMock';
import StatusBadge from './StatusBadge';
import { Filter, Plus } from 'lucide-react';

// --- Constants ---
const ALL_MONTHS_VALUE = 'all';

// --- Helper Functions ---
const getYearMonth = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.warn(`Invalid date string encountered: ${dateString}`);
        return 'invalid-date';
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  } catch (e) {
      console.error(`Error parsing date string: ${dateString}`, e);
      return 'invalid-date';
  }
};

const formatMonthYear = (yearMonth: string): string => {
  if (yearMonth === ALL_MONTHS_VALUE || yearMonth === 'invalid-date') return "All Months";
  try {
      const [year, month] = yearMonth.split('-');
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
          return "Invalid Date";
      }
      const date = new Date(yearNum, monthNum - 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  } catch (e) {
      console.error(`Error formatting month year: ${yearMonth}`, e);
      return "Invalid Date";
  }
};

// --- Component ---
const RequestsPage: React.FC = () => {
  const { requests } = useClientMock();
  const [selectedMonth, setSelectedMonth] = useState<string>(ALL_MONTHS_VALUE);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    requests.forEach(req => {
        const ym = getYearMonth(req.createdAt);
        if (ym !== 'invalid-date') {
            months.add(ym);
        }
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [requests]);

  const filteredAndSortedRequests = useMemo(() => {
    const filtered = selectedMonth === ALL_MONTHS_VALUE
      ? requests
      : requests.filter(req => getYearMonth(req.createdAt) === selectedMonth);
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requests, selectedMonth]);

  const groupedRequests = useMemo(() => {
    if (selectedMonth !== ALL_MONTHS_VALUE) {
      return { [selectedMonth]: filteredAndSortedRequests };
    }
    return filteredAndSortedRequests.reduce((acc, req) => {
      const monthKey = getYearMonth(req.createdAt);
      if(monthKey !== 'invalid-date') {
          if (!acc[monthKey]) {
            acc[monthKey] = [];
          }
          acc[monthKey].push(req);
      }
      return acc;
    }, {} as Record<string, typeof requests>);
  }, [filteredAndSortedRequests, selectedMonth]);

  const sortedMonthKeys = useMemo(() => {
     return Object.keys(groupedRequests).sort((a, b) => b.localeCompare(a));
  }, [groupedRequests]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-shrink-0">My Requests</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Month Filter */}
            <div className="relative w-full sm:w-auto">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select
                id="month-filter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF5722] focus:border-transparent appearance-none bg-white cursor-pointer"
                aria-label="Filter requests by month"
              >
                <option value={ALL_MONTHS_VALUE}>All Months</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {formatMonthYear(month)}
                  </option>
                ))}
              </select>
               <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            {/* New Request Button */}
            <Link
              to="/client/new"
              className="flex items-center justify-center gap-2 bg-[#FF5722] text-white px-4 py-2.5 rounded-lg hover:bg-[#E64A19] transition text-sm font-semibold whitespace-nowrap"
            >
              <Plus size={16} />
              New Request
            </Link>
          </div>
        </div>

        {/* Request List Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="font-medium">No requests yet.</p>
              <p className="text-sm mt-1">Create your first request to get started!</p>
            </div>
          ) : filteredAndSortedRequests.length === 0 ? (
             <div className="p-12 text-center text-gray-500">
              <p className="font-medium">No requests found for {formatMonthYear(selectedMonth)}.</p>
             </div>
          ) : (
             <div>
                {sortedMonthKeys.map((monthKey) => (
                  <section key={monthKey} aria-labelledby={`month-header-${monthKey}`}>
                    {selectedMonth === ALL_MONTHS_VALUE && (
                       <h2
                         id={`month-header-${monthKey}`}
                         className="bg-gray-50 px-4 sm:px-6 py-2 text-sm font-semibold text-gray-700 border-b border-t border-gray-200 sticky top-0 z-[1]"
                       >
                         {formatMonthYear(monthKey)}
                       </h2>
                    )}
                     <ul className="divide-y divide-gray-100">
                      {groupedRequests[monthKey].map((request) => (
                        <li key={request.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                          <Link to={`/client/requests/${request.id}`} className="block px-4 sm:px-6 py-4 focus:outline-none focus:bg-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 leading-tight truncate">{request.projectTitle}</h3>
                                <p className="text-sm text-gray-500 mt-0.5 truncate">{request.serviceType}</p>
                              </div>
                              <div className="mt-1 sm:mt-0 flex-shrink-0">
                                <StatusBadge status={request.status} />
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                              <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                               {request.timeline && <span className="hidden sm:inline">Timeline: {request.timeline}</span>}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;