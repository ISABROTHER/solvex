// src/pages/admin/DashboardPage/tabs/EmployeesTab.tsx

// ... (Existing Imports) ...
import { 
    // Assuming these operations are available in your lib/supabase/operations.ts
    // If not, you must define them there as shown in Section 1.
    deleteEmployeeAccount, 
    blockEmployeeAccess 
} from '../../../../lib/supabase/operations'; 
import { useToast } from '../../../../contexts/ToastContext'; // Assuming you use ToastContext

// Define the new 'blocked' role to make it selectable
const EMPLOYEE_ROLES = ['employee', 'admin', 'blocked', 'client']; // Ensure 'blocked' is included

const EmployeesTab: React.FC = () => {
    // ... (Existing State: employees, loading, error, isEditModalOpen, etc.) ...
    const { addToast } = useToast(); // Assuming ToastContext is accessible

    // New Handlers
    const handleBlockAccess = async (employeeId: string, currentRole: string) => {
        if (currentRole === 'admin') {
            addToast({ type: 'error', title: 'Action Denied', message: 'Cannot block an Admin through this panel.' });
            return;
        }

        const newRole = currentRole === 'blocked' ? 'employee' : 'blocked';
        
        if (confirm(`Are you sure you want to ${newRole === 'blocked' ? 'BLOCK' : 'UNBLOCK'} access for this employee?`)) {
            const { error } = await blockEmployeeAccess(employeeId);
            if (error) {
                addToast({ type: 'error', title: 'Block Failed', message: error.message });
            } else {
                addToast({ type: 'success', title: 'Access Updated', message: `Employee access successfully set to '${newRole}'.` });
                // Optimistically update UI or trigger a refetch
                fetchEmployees(); // Assuming this is your existing refetch function
            }
        }
    };

    const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
        if (confirm(`WARNING: Are you absolutely sure you want to PERMANENTLY DELETE ${employeeName}? This action is irreversible and will delete their AUTH account and PROFILE data.`)) {
            const { error } = await deleteEmployeeAccount(employeeId);
            if (error) {
                addToast({ type: 'error', title: 'Deletion Failed', message: error.message });
            } else {
                addToast({ type: 'success', title: 'Employee Deleted', message: `${employeeName} was permanently removed.` });
                fetchEmployees(); // Refresh list
            }
        }
    };


    // ... (Existing Employee Table Render Logic) ...

    return (
        <div className="space-y-6">
            {/* ... (Existing Filter/Search bar content) ... */}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* ... (Existing Headers) ... */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> {/* <-- Added Actions Header */}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map(employee => (
                            <tr key={employee.id}>
                                {/* ... (Existing Employee Data Cells) ... */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : employee.role === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {employee.role || 'employee'}
                                    </span>
                                </td>
                                
                                {/* NEW: Action Buttons */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button 
                                        onClick={() => handleBlockAccess(employee.id, employee.role)}
                                        className={`px-3 py-1 text-white text-xs rounded-lg transition-colors ${employee.role === 'blocked' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                                        disabled={employee.role === 'admin'}
                                    >
                                        {employee.role === 'blocked' ? 'Unblock Access' : 'Block Access'}
                                    </button>

                                    <button 
                                        onClick={() => handleDeleteEmployee(employee.id, `${employee.first_name} ${employee.last_name}`)}
                                        className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ... (Existing Pagination/Modals) ... */}
            <EmployeeEditModal 
                // ... (props) ... 
            />
        </div>
    );
}

export default EmployeesTab;