// @ts-nocheck
// src/pages/admin/DashboardPage/tabs/EquipmentTab.tsx

import React, { useState, useEffect, useCallback } from "react";
import Card from "../components/Card";
import { RefreshCw, Database, CircleAlert as AlertCircle, Loader2, Edit, Trash2 } from "lucide-react";
import { supabase } from "../../../../lib/supabase/client";
import { 
  getAllRentalEquipment, 
  onRentalGearChange, 
  updateRentalEquipment, 
  deleteRentalEquipment,
  RentalGear
} from "../../../../lib/supabase/operations"; 
import { useToast } from "../../../../contexts/ToastContext";

// Placeholder for the full edit modal (which is currently missing, but the action is set up)
const EditEquipmentModal = ({ isOpen, onClose, equipment, onSave }) => {
  const [formData, setFormData] = useState(equipment);

  useEffect(() => {
    setFormData(equipment);
  }, [equipment]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    // Basic validation check to ensure price is a number
    if (isNaN(parseFloat(formData.price_per_day))) {
      alert("Price must be a valid number.");
      return;
    }
    onSave(formData.id, formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-xl font-bold mb-4">Edit {equipment.name}</h3>
        <div className="space-y-4 text-sm">
          <div><label className="font-medium">Name</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" /></div>
          <div><label className="font-medium">Description</label><textarea rows={3} name="description" value={formData.description || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" /></div>
          <div><label className="font-medium">Category</label><input type="text" name="category" value={formData.category || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" /></div>
          <div><label className="font-medium">Price Per Day (GHS)</label><input type="number" name="price_per_day" value={formData.price_per_day || 0} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" /></div>
          <div><label className="font-medium">Image URL</label><input type="text" name="image_url" value={formData.image_url || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" /></div>
          <div><label className="font-medium">Video URL</label><input type="text" name="video_url" value={formData.video_url || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_available" name="is_available" checked={formData.is_available || false} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
            <label htmlFor="is_available" className="font-medium">Available for Rent</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 rounded-lg hover:bg-gray-100">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
};


const EquipmentTab: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<RentalGear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<RentalGear | null>(null);
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    setError(null);
    const { data, error: fetchError } = await getAllRentalEquipment();
    if (fetchError) {
      setError("Failed to fetch equipment data. Check Supabase RLS policies for 'rental_gear'.");
      console.error(fetchError);
    } else {
      setEquipmentList(data || []);
    }
    setLoading(false);
  }, []);

  // Initial fetch and Realtime Subscription
  useEffect(() => {
    fetchData();
    
    // Subscribe to live changes for immediate updates
    const channel = onRentalGearChange(() => {
      fetchData(); 
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);
  
  // Handlers for Admin actions
  const handleToggleAvailability = async (item: RentalGear) => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    const newAvailability = !item.is_available;
    // Optimistic update
    setEquipmentList(prev => prev.map(e => e.id === item.id ? { ...e, is_available: newAvailability } : e));
    
    // Real update
    const { error: updateError } = await updateRentalEquipment(item.id, { is_available: newAvailability });
    
    if (updateError) {
      addToast({ type: 'error', title: 'Update Failed', message: `Failed to update status: ${updateError.message}` });
      // Revert on failure
      setEquipmentList(prev => prev.map(e => e.id === item.id ? { ...e, is_available: item.is_available } : e));
    } else {
      addToast({ type: 'success', title: 'Status Updated', message: `${item.name} is now ${newAvailability ? 'Available' : 'Unavailable'}.` });
    }
    setIsUpdating(false);
  };
  
  const handleEdit = (item: RentalGear) => {
    setEditingEquipment(item);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (id: string, updates: Partial<RentalGear>) => {
    setIsUpdating(true);
    
    // Convert stringified number back to number for DB
    const cleanedUpdates = { 
        ...updates, 
        price_per_day: parseFloat(updates.price_per_day) 
    };

    // Optimistic update
    setEquipmentList(prev => prev.map(e => e.id === id ? { ...e, ...cleanedUpdates } : e));

    const { error: updateError } = await updateRentalEquipment(id, cleanedUpdates);
    
    if (updateError) {
      addToast({ type: 'error', title: 'Update Failed', message: `Failed to save changes: ${updateError.message}` });
      // Realtime listener handles revert
    } else {
      addToast({ type: 'success', title: 'Item Updated!', message: `${updates.name} has been updated.` });
    }
    setIsUpdating(false);
  };


  const handleDelete = async (item: RentalGear) => {
      if (!window.confirm(`Are you sure you want to delete ${item.name}? This action is irreversible.`)) return;
      
      const originalList = equipmentList;
      setEquipmentList(prev => prev.filter(e => e.id !== item.id)); // Optimistic delete
      
      const { error: deleteError } = await deleteRentalEquipment(item.id);
      
      if (deleteError) {
        addToast({ type: 'error', title: 'Delete Failed', message: deleteError.message });
        setEquipmentList(originalList); // Revert
      } else {
        addToast({ type: 'success', title: 'Item Deleted', message: `${item.name} has been removed.` });
      }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card title={`Rental Gear Inventory (${equipmentList.length})`} right={
        <button onClick={fetchData} disabled={loading} className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-50" title="Refresh">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      }>
        {error && <div className="text-center py-20 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error}</div>}
        
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Category</th>
                <th className="px-4 py-2 font-semibold">Price/Day</th>
                <th className="px-4 py-2 font-semibold text-center">Status</th>
                <th className="px-4 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {equipmentList.map((item) => {
                const isAvailable = item.is_available;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-gray-600">{item.category}</td>
                    <td className="px-4 py-3 text-gray-600">GHS {item.price_per_day ? parseFloat(item.price_per_day).toFixed(2) : 'N/A'}</td> 
                    <td className="px-4 py-3 text-center">
                        <button
                            onClick={() => handleToggleAvailability(item)}
                            disabled={isUpdating}
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-colors ${
                              isAvailable ? 'bg-green-100 text-green-800 ring-green-200 hover:bg-green-200' : 'bg-red-100 text-red-800 ring-red-200 hover:bg-red-200'
                            } disabled:opacity-50`}
                        >
                            {isUpdating && editingEquipment?.id === item.id ? 'Updating...' : (isAvailable ? 'Available' : 'Unavailable')}
                        </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-1 text-gray-500 hover:bg-gray-200 rounded-md" aria-label="Edit Item"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(item)} className="p-1 text-red-500 hover:bg-red-100 rounded-md" aria-label="Delete Item"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )})}
            </tbody>
            </table>
          {equipmentList.length === 0 && <p className="py-8 text-center text-gray-500">No equipment found. Please sync the database in Settings.</p>}
        </div>
      </Card>
      
      {/* Edit Modal (Placeholder with functional callbacks) */}
      {editingEquipment && (
        <EditEquipmentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          equipment={editingEquipment}
          onSave={handleSaveEdit}
        />
      )}

      <Card title="Database Sync Utility">
        <p className="text-sm text-gray-600 mb-4">The most common reason for **"Failed to Update"** is a missing **Row Level Security (RLS)** policy that grants the authenticated admin user write access. You should run the database sync to ensure the necessary policies are applied.</p>
        <button
            onClick={() => addToast({ type: 'info', title: 'Action Required', message: 'Please navigate to the Settings tab and click "Sync Now" to fix RLS permissions.' })}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Database className="w-4 h-4" /> Go to Settings Tab to Sync
        </button>
      </Card>
    </div>
  );
};

export default EquipmentTab;