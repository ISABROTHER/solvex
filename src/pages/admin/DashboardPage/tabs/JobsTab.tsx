// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { PlusCircle, Edit2, Trash2, Loader2, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllJobPositions,
  createJobPosition,
  updateJobPosition,
  deleteJobPosition,
  type JobPosition,
  type JobPositionInsert
} from '../../../../lib/supabase/operations';

interface GroupedPositions {
  [teamName: string]: JobPosition[];
}

interface EditFormData {
  title: string;
  team_name: string;
  description: string;
  requirements: string;
  status: 'open' | 'closed';
}

const JobsTab: React.FC = () => {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<JobPosition | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    title: '',
    team_name: '',
    description: '',
    requirements: '',
    status: 'open'
  });

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getAllJobPositions();
    if (fetchError) {
      setError('Failed to fetch job positions.');
      console.error('Failed to fetch positions:', fetchError);
    } else if (data) {
      setPositions(data);
    }
    setLoading(false);
  };

  const groupedPositions: GroupedPositions = positions.reduce((acc, pos) => {
    const teamName = pos.team_name || 'Uncategorized';
    if (!acc[teamName]) acc[teamName] = [];
    acc[teamName].push(pos);
    return acc;
  }, {} as GroupedPositions);

  const handleEdit = (position: JobPosition) => {
    setEditingPosition(position);
    setFormData({
      title: position.title,
      team_name: position.team_name || '',
      description: position.description || '',
      requirements: position.requirements || '',
      status: position.status as 'open' | 'closed'
    });
    setIsCreating(false);
  };

  const handleCreate = (teamName?: string) => {
    setEditingPosition(null);
    setFormData({
      title: '',
      team_name: teamName || '',
      description: '',
      requirements: '',
      status: 'open'
    });
    setIsCreating(true);
  };

  const handleCloseModal = () => {
    setEditingPosition(null);
    setIsCreating(false);
    setFormData({
      title: '',
      team_name: '',
      description: '',
      requirements: '',
      status: 'open'
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.team_name.trim()) {
      alert('Title and Team Name are required.');
      return;
    }

    setError(null);

    if (isCreating) {
      const newPosition: JobPositionInsert = {
        title: formData.title.trim(),
        team_name: formData.team_name.trim(),
        description: formData.description.trim() || null,
        requirements: formData.requirements.trim() || null,
        status: formData.status
      };

      const { data, error: createError } = await createJobPosition(newPosition);
      if (createError) {
        setError('Failed to create position.');
        console.error('Create error:', createError);
        return;
      }
      if (data) {
        setPositions(prev => [...prev, data]);
        handleCloseModal();
      }
    } else if (editingPosition) {
      const updates = {
        title: formData.title.trim(),
        team_name: formData.team_name.trim(),
        description: formData.description.trim() || null,
        requirements: formData.requirements.trim() || null,
        status: formData.status
      };

      const { data, error: updateError } = await updateJobPosition(editingPosition.id, updates);
      if (updateError) {
        setError('Failed to update position.');
        console.error('Update error:', updateError);
        return;
      }
      if (data) {
        setPositions(prev => prev.map(p => p.id === data.id ? data : p));
        handleCloseModal();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this position? All related applications will remain but be orphaned.')) return;

    const { error: deleteError } = await deleteJobPosition(id);
    if (deleteError) {
      setError('Failed to delete position.');
      console.error('Delete error:', deleteError);
      return;
    }

    setPositions(prev => prev.filter(p => p.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-end">
          <button
            onClick={() => handleCreate()}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19] transition-colors"
          >
            <PlusCircle size={18} />
            Add New Position
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {Object.keys(groupedPositions).length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No job positions have been created yet.</p>
          </Card>
        ) : (
          Object.entries(groupedPositions).map(([teamName, teamPositions]) => (
            <Card key={teamName} title={`${teamName} (${teamPositions.length} ${teamPositions.length === 1 ? 'position' : 'positions'})`} right={
              <button
                onClick={() => handleCreate(teamName)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition-colors"
              >
                <PlusCircle size={16} />
                Add Position
              </button>
            }>
              <div className="space-y-3">
                {teamPositions.map((pos) => (
                  <div key={pos.id} className="flex items-start justify-between p-4 rounded-lg bg-gray-50 border hover:border-gray-300 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{pos.title}</h4>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          pos.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pos.status}
                        </span>
                      </div>
                      {pos.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{pos.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Created {new Date(pos.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(pos)}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(pos.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      <AnimatePresence>
        {(isCreating || editingPosition) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex-shrink-0 p-6 flex justify-between items-center border-b">
                <h3 className="text-xl font-bold text-gray-900">
                  {isCreating ? 'Create New Position' : 'Edit Position'}
                </h3>
                <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position Title*</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Software Developer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Name*</label>
                  <input
                    type="text"
                    value={formData.team_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, team_name: e.target.value }))}
                    placeholder="e.g., Technology and Innovation Team"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the role and responsibilities..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF5722] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                    placeholder="List the key requirements and qualifications..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF5722] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'open' | 'closed' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex-shrink-0 p-6 border-t flex justify-end gap-3 bg-gray-50">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19] transition-colors"
                >
                  <Save size={16} />
                  {isCreating ? 'Create Position' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default JobsTab;
