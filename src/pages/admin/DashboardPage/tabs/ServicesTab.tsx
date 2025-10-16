import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import { Plus, Edit, Trash2, Send, Loader2, Database, RotateCcw, Trash, ArrowLeft } from 'lucide-react';
import {
  getServices,
  createService,
  updateService,
  softDeleteService,
  restoreService,
  getDeletedServices,
  onServicesChange,
  Service
} from '../../../../lib/supabase/operations';
import { useToast } from '../../../../contexts/ToastContext';
import { businessServicesData } from '../../../../data/business/services.data';
import { supabase } from '../../../../lib/supabase/client';

const emptyService: Partial<Service> = {
  title: "", summary: "", image_url: "", title_color: "text-sky-800",
  description: "", sub_services: [], outcome: "", status: 'draft',
  image_fit: 'cover', image_position: 'center', image_rotation: '0',
};

const ServicesTab: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [deletedServices, setDeletedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [view, setView] = useState<'active' | 'deleted'>('active');
  const { addToast } = useToast();

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const [servicesResult, deletedServicesResult] = await Promise.all([getServices(), getDeletedServices()]);
    
    if (servicesResult.error) addToast({ type: 'error', title: 'Error Fetching Services' });
    else setServices(servicesResult.data || []);
    
    if (deletedServicesResult.error) addToast({ type: 'error', title: 'Error Fetching Deleted Services' });
    else setDeletedServices(deletedServicesResult.data || []);
    
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchAllData();
    const channel = onServicesChange((payload) => {
      console.log('Realtime event received!', payload);
      fetchAllData();
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllData]);

  const handleAddNew = () => {
    setEditingService(emptyService);
    setIsFormOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };
  
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingService(null);
  }

  const handleSave = async () => {
    if (!editingService) return;
    const isUpdating = 'id' in editingService && editingService.id;

    setIsFormOpen(false);

    if (isUpdating) {
      const { error } = await updateService(editingService.id!, editingService);
      if (error) addToast({ type: 'error', title: 'Update Failed', message: error.message });
      else addToast({ type: 'success', title: 'Service Updated!' });
    } else {
      const { error } = await createService(editingService as any);
       if (error) addToast({ type: 'error', title: 'Creation Failed', message: error.message });
      else addToast({ type: 'success', title: 'Service Created!' });
    }
    setEditingService(null);
  };
  
  const handleDelete = async (service: Service) => {
    if (!window.confirm("Are you sure? This will move the service to the trash.")) return;
    const { error } = await softDeleteService(service.id);
    if (error) addToast({ type: 'error', title: 'Delete Failed', message: error.message });
    else addToast({ type: 'success', title: 'Service moved to trash' });
  }

  const handleRestore = async (service: Service) => {
    const { error } = await restoreService(service.id);
    if (error) addToast({ type: 'error', title: 'Restore Failed', message: error.message });
    else addToast({ type: 'success', title: 'Service Restored!' });
  }
  
  const handlePublish = async (service: Service) => {
    const newStatus = service.status === 'published' ? 'draft' : 'published';
    const { error } = await updateService(service.id, { status: newStatus });
    if (error) addToast({ type: 'error', title: 'Status update failed' });
    else addToast({ type: 'success', title: `Service status set to ${newStatus}` });
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm("This will add the original services to your database. Are you sure?")) return;
    const seedData = businessServicesData.map(s => ({
      title: s.title, summary: s.summary, image_url: s.imageUrl, title_color: s.titleColor,
      description: s.details.description, sub_services: s.details.subServices, outcome: s.details.outcome,
      status: 'draft' as 'draft' | 'published',
    }));
    // @ts-expect-error - Seed data structure doesn't include all fields
    const { error } = await supabase.from('services').insert(seedData);
    if (error) addToast({ type: 'error', title: 'Seeding failed', message: error.message });
    else addToast({ type: 'success', title: 'Database seeded!' });
  };

  if (isFormOpen && editingService) {
    return (
       <Card title={editingService.id ? "Edit Service" : "Add New Service"}>
        <div className="space-y-4 text-sm">
          <div><label className="font-medium">Title</label><input type="text" value={editingService.title || ''} onChange={e => setEditingService({...editingService, title: e.target.value})} className="mt-1 w-full p-2 border rounded-md" /></div>
          <div><label className="font-medium">Card Text (Summary)</label><textarea rows={3} value={editingService.summary || ''} onChange={e => setEditingService({...editingService, summary: e.target.value})} className="mt-1 w-full p-2 border rounded-md" /></div>
          
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-base mb-2">Image Settings</h4>
            <div><label className="font-medium">Image URL</label><input type="text" value={editingService.image_url || ''} onChange={e => setEditingService({...editingService, image_url: e.target.value})} className="mt-1 w-full p-2 border rounded-md" /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="font-medium">Image Fit</label>
                <select value={editingService.image_fit || 'cover'} onChange={e => setEditingService({...editingService, image_fit: e.target.value})} className="mt-1 w-full p-2 border rounded-md">
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                </select>
              </div>
              <div>
                <label className="font-medium">Image Position</label>
                <select value={editingService.image_position || 'center'} onChange={e => setEditingService({...editingService, image_position: e.target.value})} className="mt-1 w-full p-2 border rounded-md">
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="font-medium">Image Rotation</label>
                <select value={editingService.image_rotation || '0'} onChange={e => setEditingService({...editingService, image_rotation: e.target.value})} className="mt-1 w-full p-2 border rounded-md">
                  <option value="0">No rotation</option>
                  <option value="90">90 degrees</option>
                  <option value="180">180 degrees</option>
                  <option value="270">270 degrees</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t"><h4 className="font-semibold text-base mb-2">Details Page Content</h4>
             <div><label className="font-medium">Main Text (Description)</label><textarea rows={6} value={editingService.description || ''} onChange={e => setEditingService({...editingService, description: e.target.value})} className="mt-1 w-full p-2 border rounded-md" /></div>
             <div><label className="font-medium">Sub-Services (One per line)</label><textarea rows={5} value={(editingService.sub_services || []).join('\n')} onChange={e => setEditingService({...editingService, sub_services: e.target.value.split('\n')})} className="mt-1 w-full p-2 border rounded-md" /></div>
             <div><label className="font-medium">Outcome</label><input type="text" value={editingService.outcome || ''} onChange={e => setEditingService({...editingService, outcome: e.target.value})} className="mt-1 w-full p-2 border rounded-md" /></div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={handleCancel} className="px-4 py-2 font-semibold text-gray-700 rounded-lg hover:bg-gray-100">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Save</button>
        </div>
      </Card>
    );
  }

  const currentList = view === 'active' ? services : deletedServices;

  return (
    <Card title={view === 'active' ? "Manage Services" : "Deleted Services"} right={
      <div className="flex items-center gap-2">
        {view === 'active' ? (
          <button onClick={() => setView('deleted')} className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200">
            <Trash size={16} /> View Deleted ({deletedServices.length})
          </button>
        ) : (
          <button onClick={() => setView('active')} className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200">
            <ArrowLeft size={16} /> Back to Active
          </button>
        )}
        {view === 'active' && (
          <button onClick={handleAddNew} className="flex items-center gap-2 bg-[#FF5722] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#E64A19]">
            <Plus size={16} /> Add New
          </button>
        )}
      </div>
    }>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>{view === 'active' ? 'No active services found.' : 'The trash is empty.'}</p>
          {view === 'active' && services.length === 0 && deletedServices.length === 0 && (
             <button onClick={handleSeedDatabase} className="mt-4 flex items-center gap-2 mx-auto bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700">
               <Database size={16} /> Seed Initial Services
             </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map(service => (
            <div key={service.id} className={`flex items-center justify-between p-4 rounded-lg border ${view === 'deleted' ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <img src={service.image_url || 'https://via.placeholder.com/150'} alt={service.title} className="w-16 h-16 object-cover rounded-md bg-gray-200" style={{ objectFit: (service.image_fit || 'cover') as any, objectPosition: service.image_position || 'center', transform: `rotate(${service.image_rotation || 0}deg)` }} />
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-gray-800">{service.title}</h4>
                    {view === 'active' && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${service.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {service.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 max-w-md mt-1">{service.summary}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {view === 'active' ? (
                  <>
                    <button onClick={() => handlePublish(service)} className={`p-2 rounded-md ${service.status === 'published' ? 'text-gray-500 bg-gray-200 hover:bg-gray-300' : 'text-green-600 bg-green-100 hover:bg-green-200'}`} aria-label={service.status === 'published' ? `Unpublish ${service.title}` : `Publish ${service.title}`}>
                      <Send size={16} />
                    </button>
                    <button onClick={() => handleEdit(service)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" aria-label={`Edit ${service.title}`}><Edit size={16} /></button>
                    <button onClick={() => handleDelete(service)} className="p-2 text-red-500 hover:bg-red-100 rounded-md" aria-label={`Delete ${service.title}`}><Trash2 size={16} /></button>
                  </>
                ) : (
                   <button onClick={() => handleRestore(service)} className="flex items-center gap-2 text-blue-600 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-md text-sm font-semibold" aria-label={`Restore ${service.title}`}>
                    <RotateCcw size={16} /> Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ServicesTab;