import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClientMock } from './useClientMock';
import StatusBadge from './StatusBadge';
import { Filter } from 'lucide-react'; // Import Filter icon

// Helper function to format date to "YYYY-MM"
const getYearMonth = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Format: YYYY-MM
};

// Helper function to format "YYYY-MM" to "Month Year" (e.g., "October 2025")
const formatMonthYear = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const RequestsPage: React.FC = () => {
  const { requests } = useClientMock();
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or 'YYYY-MM'

  // 1. Get unique months from request data and sort them chronologically (newest first)
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    requests.forEach(req => months.add(getYearMonth(req.createdAt)));
    return Array.from(months).sort((a, b) => b.localeCompare(a)); // Sort descending (newest month first)
  }, [requests]);

  // 2. Filter requests based on selected month, always sort by creation date descending
  const filteredAndSortedRequests = useMemo(() => {
    const filtered = selectedMonth === 'all'
      ? requests
      : requests.filter(req => getYearMonth(req.createdAt) === selectedMonth);

    // Sort by createdAt date, newest first
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requests, selectedMonth]);

  // 3. Group requests by month for rendering (only needed if visually grouping)
  const groupedRequests = useMemo(() => {
    if (selectedMonth !== 'all') {
      // If a specific month is selected, no need to group further
      return { [selectedMonth]: filteredAndSortedRequests };
    }
    // Group all requests by month if 'all' is selected
    return filteredAndSortedRequests.reduce((acc, req) => {
      const monthKey = getYearMonth(req.createdAt);
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(req);
      return acc;
    }, {} as Record<string, typeof requests>);
  }, [filteredAndSortedRequests, selectedMonth]);

  // Get sorted month keys for rendering groups in order
  const sortedMonthKeys = useMemo(() => {
     return Object.keys(groupedRequests).sort((a, b) => b.localeCompare(a)); // Sort descending
  }, [groupedRequests]);


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Requests</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
             {/* Month Filter Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                id="month-filter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF5722] focus:border-transparent appearance-none bg-white"
                aria-label="Filter requests by month"
              >
                <option value="all">All Months</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {formatMonthYear(month)}
                  </option>
                ))}
              </select>
               <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            <Link
              to="/client/new"
              className="bg-[#FF5722] text-white px-4 py-2 rounded-lg hover:bg-[#E64A19] transition text-sm font-semibold whitespace-nowrap"
            >
              New Request
            </Link>
          </div>
        </div>

        {/* Request List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {requests.length === 0 ? (
            // Overall empty state
            <div className="p-12 text-center text-gray-500">
              <p>No requests yet. Create your first request to get started!</p>
            </div>
          ) : filteredAndSortedRequests.length === 0 ? (
             // Empty state for the selected filter
             <div className="p-12 text-center text-gray-500">
              <p>No requests found for {formatMonthYear(selectedMonth)}.</p>
             </div>
          ) : (
            // Display requests, grouped by month if 'All Months' is selected
             <div>
                {sortedMonthKeys.map((monthKey, groupIndex) => (
                  <div key={monthKey}>
                    {selectedMonth === 'all' && ( // Only show month header if viewing all
                       <h2 className="bg-gray-100 px-6 py-2 text-sm font-semibold text-gray-700 border-b border-t border-gray-200">
                         {formatMonthYear(monthKey)}
                       </h2>
                    )}
                     <ul className="divide-y divide-gray-200">
                      {groupedRequests[monthKey].map((request) => (
                        <li key={request.id} className="hover:bg-gray-50 transition duration-150">
                          <Link to={`/client/requests/${request.id}`} className="block px-6 py-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                              <div className="flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">{request.projectTitle}</h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">{request.serviceType}</p>
                              </div>
                              <div className="mt-1 sm:mt-0 flex-shrink-0">
                                <StatusBadge status={request.status} />
                              </div>
                            </div>
                            {/* Optional: Show brief preview */}
                             {/* <p className="text-sm text-gray-600 mt-2 line-clamp-2">{request.brief}</p> */}
                            <div className="mt-3 flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                              <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                               {request.timeline && <span>Timeline: {request.timeline}</span>}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;