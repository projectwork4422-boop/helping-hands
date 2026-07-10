"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Shield, Wrench } from "lucide-react";
import ServiceModal from "@/components/admin/ServiceModal";
import { deleteService, toggleServiceStatus } from "@/actions/service";

type Category = { id: string; name: string };
type Service = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  iconUrl: string | null;
  isActive: boolean;
  categoryId: string | null;
  category: Category | null;
  estimatedTime: string | null;
};

export default function ServicesClient({ initialServices, categories }: { initialServices: Service[], categories: Category[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();

  const openAddModal = () => {
    setEditingService(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      const res = await deleteService(id);
      if (res.error) {
        alert(res.error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await toggleServiceStatus(id, currentStatus);
    if (res.error) {
      alert(res.error);
    }
  };

  // Group services by category
  const servicesByCategory = initialServices.reduce((acc, service) => {
    const catName = service.category?.name || "Uncategorized";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
          <p className="text-black/60 mt-1">Add, edit, and manage the services offered on the platform.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/90 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        {initialServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-black/20" />
            </div>
            <h3 className="text-lg font-bold">No services found</h3>
            <p className="text-black/60 mt-1">Get started by creating your first service.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(servicesByCategory).map(([categoryName, services]) => (
              <div key={categoryName}>
                <h2 className="text-lg font-bold mb-4 px-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black"></span>
                  {categoryName}
                </h2>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-black/40 uppercase bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 font-semibold rounded-tl-xl">Service</th>
                        <th className="px-6 py-4 font-semibold">Description</th>
                        <th className="px-6 py-4 font-semibold">Base Price</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right rounded-tr-xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {services.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg overflow-hidden">
                                {(service as any).images?.[0] ? (
                                  <img src={(service as any).images[0]} alt={service.name} className="w-full h-full object-cover" />
                                ) : (
                                  service.iconUrl || <Wrench className="w-5 h-5 text-black/50" />
                                )}
                              </div>
                              <div className="font-semibold">{service.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-[250px] truncate text-black/60">
                            {service.description || "-"}
                          </td>
                          <td className="px-6 py-4 font-medium">
                            ${service.basePrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleToggleStatus(service.id, service.isActive)}
                              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                                service.isActive 
                                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              {service.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openEditModal(service)}
                                className="p-2 text-black/40 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(service.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <ServiceModal 
          service={editingService} 
          categories={categories}
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
