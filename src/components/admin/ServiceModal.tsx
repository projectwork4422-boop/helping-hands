"use client";

import { useState, useRef, useEffect } from "react";
import { createService, updateService, createServiceCategory } from "@/actions/service";
import { ChevronDown, Search, Plus, Upload, X, Image as ImageIcon, Video, Trash2 } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  iconUrl: string | null;
  isActive: boolean;
  categoryId: string | null;
  estimatedTime: string | null;
  images?: string[];
  videos?: string[];
};

type Category = { id: string; name: string };

export default function ServiceModal({
  service,
  categories,
  onClose,
}: {
  service?: Service;
  categories: Category[];
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Custom Combobox State
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(service?.categoryId || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Media State
  const [existingImages, setExistingImages] = useState<string[]>(service?.images || []);
  const [existingVideos, setExistingVideos] = useState<string[]>(service?.videos || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newVideos, setNewVideos] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = localCategories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCategory = localCategories.find(c => c.id === selectedCategoryId);

  async function handleCreateCategory() {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("name", searchQuery.trim());
    const res = await createServiceCategory(fd);
    if (res.error) {
      setError(res.error);
    } else if (res.category) {
      setLocalCategories(prev => [...prev, res.category]);
      setSelectedCategoryId(res.category.id);
      setSearchQuery("");
      setIsDropdownOpen(false);
    }
    setLoading(false);
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024); // 5MB max
      if (validFiles.length < files.length) {
        alert("Some images were too large and were ignored. Max size is 5MB.");
      }
      setNewImages(prev => [...prev, ...validFiles]);
    }
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(f => f.size <= 50 * 1024 * 1024); // 50MB max
      if (validFiles.length < files.length) {
        alert("Some videos were too large and were ignored. Max size is 50MB.");
      }
      setNewVideos(prev => [...prev, ...validFiles]);
    }
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return [];
    const fd = new FormData();
    files.forEach(f => fd.append("files", f));
    
    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to upload files");
    return data.urls as string[];
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = document.getElementById("serviceForm") as HTMLFormElement;
      const formData = new FormData(form);
      const adminShare = parseInt(formData.get("adminShare") as string) || 0;
      const employeeShare = parseInt(formData.get("employeeShare") as string) || 0;
      
      if (adminShare + employeeShare !== 100) {
        setError("Admin Share and Employee Share must total 100%.");
        setLoading(false);
        return;
      }

      // Upload new media first
      const uploadedImageUrls = await uploadFiles(newImages);
      const uploadedVideoUrls = await uploadFiles(newVideos);
      
      const allImages = [...existingImages, ...uploadedImageUrls];
      const allVideos = [...existingVideos, ...uploadedVideoUrls];

      formData.append("images", JSON.stringify(allImages));
      formData.append("videos", JSON.stringify(allVideos));
      
      let res;
      if (service) {
        res = await updateService(service.id, formData);
      } else {
        res = await createService(formData);
      }

      if (res.error) {
        setError(res.error);
      } else {
        alert(service ? "Service updated successfully." : "Service added successfully.");
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during save.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">{service ? "Edit Service" : "Add New Service"}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form id="serviceForm" onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                <input type="hidden" name="categoryId" value={selectedCategoryId} required />
                
                <div className="relative" ref={dropdownRef}>
                  <div 
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-black/5"
                    onClick={() => setIsDropdownOpen(true)}
                  >
                    {isDropdownOpen ? (
                      <div className="flex items-center w-full gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          autoFocus
                          className="w-full outline-none bg-transparent"
                          placeholder="Search or type to create..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    ) : (
                      <span className={selectedCategory ? "text-black font-medium" : "text-gray-400"}>
                        {selectedCategory ? selectedCategory.name : "Select a category"}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-auto z-10 animate-in fade-in zoom-in-95">
                      {filteredCategories.map(c => (
                        <div 
                          key={c.id} 
                          className={`p-3 hover:bg-gray-50 cursor-pointer text-sm ${selectedCategoryId === c.id ? "bg-gray-50 font-medium" : ""}`}
                          onClick={() => {
                            setSelectedCategoryId(c.id);
                            setIsDropdownOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          {c.name}
                        </div>
                      ))}
                      
                      {searchQuery.trim() && !filteredCategories.find(c => c.name.toLowerCase() === searchQuery.toLowerCase()) && (
                        <div 
                          className="p-3 hover:bg-black hover:text-white cursor-pointer text-sm font-medium flex items-center gap-2 border-t border-gray-50 transition-colors"
                          onClick={handleCreateCategory}
                        >
                          <Plus className="w-4 h-4" />
                          Create "{searchQuery.trim()}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Service Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={service?.name}
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="e.g. Full House Cleaning"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description (Optional)</label>
                <textarea 
                  name="description" 
                  defaultValue={service?.description || ""}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none h-24"
                  placeholder="Brief description of what this service entails"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Base Price ($)</label>
                <input 
                  type="number" 
                  name="basePrice" 
                  defaultValue={service?.basePrice || 0}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Estimated Service Time</label>
                <input 
                  type="text" 
                  name="estimatedTime"
                  defaultValue={service?.estimatedTime || ""}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="e.g. 30 Minutes, 1 Hour, Half Day"
                  list="estimatedTimeOptions"
                />
                <datalist id="estimatedTimeOptions">
                  <option value="30 Minutes" />
                  <option value="1 Hour" />
                  <option value="2 Hours" />
                  <option value="3 Hours" />
                  <option value="Half Day" />
                  <option value="Full Day" />
                </datalist>
              </div>

              {/* Media Upload Section */}
              <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Media Gallery</h3>
                
                <div className="space-y-6">
                  {/* Images */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        Service Images
                      </label>
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-3 h-3" /> Upload Images
                      </button>
                      <input 
                        type="file" 
                        ref={imageInputRef} 
                        onChange={handleImageSelect}
                        accept="image/png, image/jpeg, image/webp" 
                        multiple 
                        className="hidden" 
                      />
                    </div>
                    
                    {(existingImages.length > 0 || newImages.length > 0) ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {existingImages.map((url, i) => (
                          <div key={`existing-img-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                            <img src={url} alt={`Existing ${i}`} className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {newImages.map((file, i) => (
                          <div key={`new-img-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-blue-200 group bg-blue-50/30">
                            <img src={URL.createObjectURL(file)} alt={`New ${i}`} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">NEW</div>
                            <button 
                              type="button" 
                              onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                        <p className="text-xs text-gray-500">No images added. Max 5MB per image.</p>
                      </div>
                    )}
                  </div>

                  {/* Videos */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Video className="w-4 h-4 text-purple-500" />
                        Service Videos
                      </label>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-3 h-3" /> Upload Videos
                      </button>
                      <input 
                        type="file" 
                        ref={videoInputRef} 
                        onChange={handleVideoSelect}
                        accept="video/mp4, video/webm, video/quicktime" 
                        multiple 
                        className="hidden" 
                      />
                    </div>
                    
                    {(existingVideos.length > 0 || newVideos.length > 0) ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {existingVideos.map((url, i) => (
                          <div key={`existing-vid-${i}`} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 group bg-black">
                            <video src={url} className="w-full h-full object-cover opacity-80" />
                            <button 
                              type="button" 
                              onClick={() => setExistingVideos(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {newVideos.map((file, i) => (
                          <div key={`new-vid-${i}`} className="relative aspect-video rounded-xl overflow-hidden border border-purple-200 group bg-black">
                            <video src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute top-2 left-2 bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">NEW</div>
                            <button 
                              type="button" 
                              onClick={() => setNewVideos(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                        <p className="text-xs text-gray-500">No videos added. Max 50MB per video.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 pb-2 border-t border-gray-100">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  id="isActive"
                  defaultChecked={service ? service.isActive : true}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">
                  Active (Visible to users)
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 text-black/60 font-bold hover:text-black hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="serviceForm"
            disabled={loading}
            className="px-8 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : "Save Service"}
          </button>
        </div>
      </div>
    </div>
  );
}
