"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";
import { createServiceCategory, updateServiceCategory, deleteServiceCategory } from "@/actions/service";

type Category = {
  id: string;
  name: string;
  _count: {
    services: number;
  };
};

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openAddModal = () => {
    setEditingCategory(undefined);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      alert("Cannot delete category because it has active services.");
      return;
    }
    if (confirm("Are you sure you want to delete this category?")) {
      const res = await deleteServiceCategory(id);
      if (res.error) alert(res.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    let res;
    
    if (editingCategory) {
      res = await updateServiceCategory(editingCategory.id, formData);
    } else {
      res = await createServiceCategory(formData);
    }

    if (res.error) {
      setError(res.error);
    } else {
      setIsModalOpen(false);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Categories</h1>
          <p className="text-black/60 mt-1">Manage categories used to group services.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/90 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        {initialCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-black/20" />
            </div>
            <h3 className="text-lg font-bold">No categories found</h3>
            <p className="text-black/60 mt-1">Get started by creating your first category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-black/40 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 font-semibold rounded-tl-xl">Category Name</th>
                  <th className="px-6 py-4 font-semibold">Total Services</th>
                  <th className="px-6 py-4 font-semibold text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {initialCategories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {category.name}
                    </td>
                    <td className="px-6 py-4">
                      {category._count.services}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(category)}
                          className="p-2 text-black/40 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id, category._count.services)}
                          className={`p-2 rounded-lg transition-colors ${category._count.services > 0 ? "text-gray-300 cursor-not-allowed" : "text-red-400 hover:text-red-600 hover:bg-red-50"}`}
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
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingCategory ? "Edit Category" : "Add Category"}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Category Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingCategory?.name}
                  required
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="e.g. Home Maintenance"
                />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="px-5 py-2.5 text-black/60 font-medium hover:text-black hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-black/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
