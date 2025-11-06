// src/pages/client/BillingPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../features/auth/AuthProvider';
import { Loader2, XCircle, CreditCard, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Database } from '../../lib/supabase/database.types';

type Invoice = Database['public']['Tables']['invoices']['Row'] & {
  client_projects: { title: string } | null; // Join for project name
};

// --- New Status Badge Component ---
const InvoiceStatusBadge: React.FC<{ status: string | null }> = ({ status }) => {
  let bgColor, textColor, text, Icon;
  switch (status) {
    case 'paid':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      text = 'Paid';
      Icon = CheckCircle;
      break;
    case 'overdue':
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      text = 'Overdue';
      Icon = AlertTriangle;
      break;
    case 'cancelled':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-700';
      text = 'Cancelled';
      Icon = XCircle;
      break;
    case 'pending':
    default:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
      text = 'Pending';
      Icon = Clock;
      break;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}>
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
};

// --- Main Billing Page ---
const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('invoices')
          .select('*, client_projects(title)') // Join to get project title
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setInvoices(data as Invoice[]);
      } catch (err: any)
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white shadow-sm rounded-lg p-10 text-center border border-red-200">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600">Error Fetching Invoices</h2>
          <p className="text-gray-500 mt-2">{error}</p>
        </div>
      );
    }

    if (invoices.length === 0) {
      return (
        <div className="bg-white shadow-sm rounded-lg p-10 flex items-center justify-center border border-dashed border-gray-300">
          <div className="text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">No Invoices Found</h2>
            <p className="text-gray-500 mt-2">
              Your invoices will appear here once they are issued.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {invoice.client_projects?.title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                      <button className="inline-flex items-center gap-1 rounded-md bg-[#FF5722] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#E64A19]">
                        <CreditCard className="h-4 w-4" />
                        Pay Now
                      </button>
                    ) : null}
                    {invoice.pdf_url ? (
                      <a
                        href={invoice.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-gray-800"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Billing / Invoices</h1>
        <p className="text-lg text-gray-600 mt-1">
          View and manage your payments and invoices.
        </p>
      </header>

      {renderContent()}
    </div>
  );
};

export default BillingPage;