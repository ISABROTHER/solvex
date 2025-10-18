// src/pages/client/RequestsPage.tsx
/**
 * src/pages/client/RequestsPage.tsx
 *
 * Client-facing page to view service requests,
 * featuring mobile-first design and month-based filtering.
 */
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClientMock } from './useClientMock'; // Using mock data hook
import StatusBadge from './StatusBadge';
import { Filter, Plus } from 'lucide-react'; // Added Plus icon

// --- Constants ---
const ALL_MONTHS_VALUE = 'all';

// --- Helper Functions (Top 1% - Keep utility functions pure and reusable) ---

/**
 * Extracts the year and month (YYYY-MM) from an ISO date string.
 * @param dateString - ISO date string (e.g., from createdAt).
 * @returns Formatted string 'YYYY-MM'.
 */
const getYearMonth = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    //Defensive check for invalid dates
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

/**
 * Formats a 'YYYY-MM' string into a user-friendly "Month Year" format.
 * @param yearMonth - String in 'YYYY-MM' format.
 * @returns Formatted string like "October 2025".
 */
const formatMonthYear = (yearMonth: string): string => {
  if (yearMonth === ALL_MONTHS_VALUE || yearMonth === 'invalid-date') return "All Months";
  try {
      const [year, month] = yearMonth.split('-');
      // Ensure year and month are valid numbers before creating Date
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
  const [selectedMonth, setSelectedMonth] = useState<string>(ALL_MONTHS_VALUE); // 'all' or 'YYYY-MM'

  // Memoized calculation for available months (Performance)
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    requests.forEach(req => {
        const ym = getYearMonth(req.createdAt);
        if (ym !== 'invalid-date') { // Filter out invalid dates
            months.add(ym);
        }
    });
    // Sort descending (newest month first)
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [requests]);

  // Memoized filtering and sorting (Performance)
  const filteredAndSortedRequests = useMemo(() => {
    const filtered = selectedMonth === ALL_MONTHS_VALUE
      ? requests
      : requests.filter(req => getYearMonth(req.createdAt) === selectedMonth);

    // Sort by createdAt date, newest first (Chronological Order)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requests, selectedMonth]);

  // Memoized grouping for display when 'All Months' is selected (Readability)
  const groupedRequests = useMemo(() => {
    // Only group if showing all months
    if (selectedMonth !== ALL_MONTHS_VALUE) {
      return { [selectedMonth]: filteredAndSortedRequests };
    }
    // Group all valid requests by month
    return filteredAndSortedRequests.reduce((acc, req) => {
      const monthKey = getYearMonth(req.createdAt);
       // Only include requests with valid dates in groups
      if(monthKey !== 'invalid-date') {
          if (!acc[monthKey]) {
            acc[monthKey] = [];
          }
          acc[monthKey].push(req);
      }
      return acc;
    }, {} as Record<string, typeof requests>);
  }, [filteredAndSortedRequests, selectedMonth]);

  // Get sorted month keys for rendering groups in order
  const sortedMonthKeys = useMemo(() => {
     return Object.keys(groupedRequests).sort((a, b) => b.localeCompare(a)); // Sort descending
  }, [groupedRequests]);

  return (
    // Mobile-first padding
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header: Stacks on mobile, row on sm+ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-shrink-0">My Requests</h1>
          {/* Controls grouped together */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
             {/* Month Filter Dropdown - Full width on mobile */}
            <div className="relative w-full sm:w-auto">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select
                id="month-filter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                // Mobile-first styles, adjusted for sm+
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
               {/* Chevron icon */}
               <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            {/* New Request Button */}
            <Link
              to="/client/new"
              // Mobile-first styles, adjusted for sm+
              className="flex items-center justify-center gap-2 bg-[#FF5722] text-white px-4 py-2.5 rounded-lg hover:bg-[#E64A19] transition text-sm font-semibold whitespace-nowrap"
            >
              <Plus size={16} /> {/* Added icon */}
              New Request
            </Link>
          </div>
        </div>

        {/* Request List Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
          {requests.length === 0 ? (
            // Overall empty state (Robustness)
            <div className="p-12 text-center text-gray-500">
              <p className="font-medium">No requests yet.</p>
              <p className="text-sm mt-1">Create your first request to get started!</p>
            </div>
          ) : filteredAndSortedRequests.length === 0 ? (
             // Empty state for the selected filter (Robustness)
             <div className="p-12 text-center text-gray-500">
              <p className="font-medium">No requests found for {formatMonthYear(selectedMonth)}.</p>
             </div>
          ) : (
            // Display requests, grouped by month if 'All Months' is selected
             <div>
                {sortedMonthKeys.map((monthKey) => (
                  <section key={monthKey} aria-labelledby={`month-header-${monthKey}`}>
                    {/* Month Header (only shown when viewing all) */}
                    {selectedMonth === ALL_MONTHS_VALUE && (
                       <h2
                         id={`month-header-${monthKey}`}
                         className="bg-gray-50 px-4 sm:px-6 py-2 text-sm font-semibold text-gray-700 border-b border-t border-gray-200 sticky top-0 z-[1]" // Made sticky for better context when scrolling
                       >
                         {formatMonthYear(monthKey)}
                       </h2>
                    )}
                     <ul className="divide-y divide-gray-100">
                      {groupedRequests[monthKey].map((request) => (
                        <li key={request.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                          {/* Link wraps the entire item for larger tap target */}
                          <Link to={`/client/requests/${request.id}`} className="block px-4 sm:px-6 py-4 focus:outline-none focus:bg-gray-100">
                            {/* Mobile-first layout: stack, then row */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              {/* Request title and type */}
                              <div className="flex-1 min-w-0"> {/* Prevents text overflow issues */}
                                <h3 className="text-base font-semibold text-gray-900 leading-tight truncate">{request.projectTitle}</h3>
                                <p className="text-sm text-gray-500 mt-0.5 truncate">{request.serviceType}</p>
                              </div>
                              {/* Status Badge */}
                              <div className="mt-1 sm:mt-0 flex-shrink-0">
                                <StatusBadge status={request.status} />
                              </div>
                            </div>
                            {/* Metadata */}
                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                              <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                               {request.timeline && <span className="hidden sm:inline">Timeline: {request.timeline}</span>} {/* Hide timeline on extra small screens */}
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