// src/components/profile/MyTasks.tsx
import React, { useState } from 'react';
import type { Task } from '../../lib/supabase/operations';
import { updateTaskStatus } from '../../lib/supabase/operations';
import Card from '../../pages/admin/DashboardPage/components/Card';
import { useToast } from '../../contexts/ToastContext';
// import { format } from 'date-fns'; // <-- REMOVED THIS IMPORT
import { Loader2 } from 'lucide-react';

interface MyTasksProps {
  tasks: Task[];
  onUpdate: () => void; // To trigger re-fetch
}

const MyTasks: React.FC<MyTasksProps> = ({ tasks, onUpdate }) => {
  const { addToast } = useToast();
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const handleStatusChange = async (task: Task, newStatus: 'pending' | 'in_progress' | 'done') => {
    if (task.status === newStatus) return;
    setLoadingTaskId(task.id);
    
    const { error } = await updateTaskStatus(task.id, newStatus);
    
    if (error) {
      addToast({ type: 'error', title: 'Update Failed', message: error.message });
    } else {
      addToast({ type: 'success', title: 'Task Updated' });
      onUpdate(); // Re-fetch tasks
    }
    setLoadingTaskId(null);
  };
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      // --- FIX: Use built-in date formatting ---
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }); // Formats as "Nov 04, 2025"
      // --- END FIX ---
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card title={`My Assignments (${tasks.length})`}>
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">You have no assignments.</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="p-4 border rounded-lg bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                {task.deadline && (
                  <p className="text-xs text-gray-500 mt-2">
                    Due: {formatDate(task.deadline)}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0">
                {loadingTaskId === task.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value as any)}
                    className={`text-sm font-medium border-none rounded-md p-2 ${statusColors[task.status] || 'bg-gray-100'}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default MyTasks;