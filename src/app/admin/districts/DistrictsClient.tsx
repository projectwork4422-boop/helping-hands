"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, MapPin, Search, Filter, ChevronRight, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { INDIAN_DISTRICTS } from "@/lib/indianDistricts";
import { useDebounce } from "use-debounce";

type City = { id: string; name: string; isActive: boolean; townId: string };
type Town = { id: string; name: string; isActive: boolean; districtId: string; cities: City[] };
type District = { id: string; name: string; isActive: boolean; towns: Town[] };

type Level = "DISTRICT" | "TOWN" | "CITY";

export default function DistrictsClient({ initialDistricts }: { initialDistricts: District[] }) {
  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [currentLevel, setCurrentLevel] = useState<Level>("DISTRICT");
  
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedTownId, setSelectedTownId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  
  // Autocomplete State
  const [nameInput, setNameInput] = useState("");
  const [debouncedName] = useDebounce(nameInput, 500);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [remoteSuggestions, setRemoteSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const selectedDistrict = useMemo(() => districts.find(d => d.id === selectedDistrictId), [districts, selectedDistrictId]);
  const selectedTown = useMemo(() => selectedDistrict?.towns.find(t => t.id === selectedTownId), [selectedDistrict, selectedTownId]);

  const currentItems = useMemo(() => {
    if (currentLevel === "DISTRICT") return districts;
    if (currentLevel === "TOWN") return selectedDistrict?.towns || [];
    if (currentLevel === "CITY") return selectedTown?.cities || [];
    return [];
  }, [districts, currentLevel, selectedDistrict, selectedTown]);

  const filteredItems = useMemo(() => {
    return currentItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "ALL" ? true : filterStatus === "ACTIVE" ? item.isActive : !item.isActive;
      return matchesSearch && matchesFilter;
    });
  }, [currentItems, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openAddModal = () => {
    setEditingItem(undefined);
    setNameInput("");
    setError("");
    setRemoteSuggestions([]);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setNameInput(item.name);
    setError("");
    setRemoteSuggestions([]);
    setIsModalOpen(true);
  };

  const handleNavigateDown = (item: any) => {
    if (currentLevel === "DISTRICT") {
      setSelectedDistrictId(item.id);
      setCurrentLevel("TOWN");
    } else if (currentLevel === "TOWN") {
      setSelectedTownId(item.id);
      setCurrentLevel("CITY");
    }
    setSearchQuery("");
    setCurrentPage(1);
  };

  const navigateUp = (level: Level) => {
    if (level === "DISTRICT") {
      setSelectedDistrictId(null);
      setSelectedTownId(null);
      setCurrentLevel("DISTRICT");
    } else if (level === "TOWN") {
      setSelectedTownId(null);
      setCurrentLevel("TOWN");
    }
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Autocomplete logic
  useEffect(() => {
    const fetchNominatim = async () => {
      if (!debouncedName.trim() || currentLevel === "DISTRICT") return;
      
      setIsFetchingSuggestions(true);
      try {
        let q = debouncedName.trim();
        // Do not append district or town to query because spelling mismatches cause Nominatim to fail or return roads
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=in&format=json&limit=8`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const names = Array.from(new Set(data.map((item: any) => item.name || item.display_name.split(',')[0].trim()))) as string[];
          setRemoteSuggestions(names.filter(Boolean));
        } else {
          setRemoteSuggestions([]);
        }
      } catch (err) {
        setRemoteSuggestions([]);
      } finally {
        setIsFetchingSuggestions(false);
      }
    };
    
    fetchNominatim();
  }, [debouncedName, currentLevel, selectedDistrict, selectedTown]);

  const nameSuggestions = useMemo(() => {
    if (!nameInput.trim()) return [];
    if (currentLevel === "DISTRICT") {
      return INDIAN_DISTRICTS
        .filter(name => name.toLowerCase().includes(nameInput.trim().toLowerCase()))
        .slice(0, 20);
    }
    // Return remote suggestions for Town and City, optionally filter them
    return remoteSuggestions;
  }, [nameInput, currentLevel, remoteSuggestions]);

  const isValidLocation = useMemo(() => {
    if (!nameInput.trim()) return false;
    
    if (currentLevel === "DISTRICT") {
      return INDIAN_DISTRICTS.some(d => d.toLowerCase() === nameInput.trim().toLowerCase());
    }
    
    // For Town and City, if they selected a suggestion, it's valid.
    // If they typed it manually, we can be a bit lenient or enforce it against remoteSuggestions.
    // Given the prompt: "containing only valid towns... Do not allow invalid or duplicate"
    // Since Nominatim might miss some, or formatted differently, if the user picks a suggestion, they will match exactly.
    // So we enforce that the name exists in remoteSuggestions OR it's already an editing item with the same name.
    if (editingItem && nameInput.trim().toLowerCase() === editingItem.name.toLowerCase()) return true;
    
    // Enforce selection from suggestions for strict validation
    return remoteSuggestions.some(r => r.toLowerCase() === nameInput.trim().toLowerCase());
  }, [nameInput, currentLevel, remoteSuggestions, editingItem]);

  const isDuplicate = useMemo(() => {
    return currentItems.some(item => item.name.toLowerCase() === nameInput.trim().toLowerCase() && item.id !== editingItem?.id);
  }, [currentItems, nameInput, editingItem]);

  const handleDelete = async (id: string) => {
    const typeLabel = currentLevel === "DISTRICT" ? "district" : currentLevel === "TOWN" ? "town" : "city";
    if (confirm(`Are you sure you want to delete this ${typeLabel}?`)) {
      try {
        let endpoint = `/api/admin/districts/${id}`;
        if (currentLevel === "TOWN") endpoint = `/api/admin/towns/${id}`;
        if (currentLevel === "CITY") endpoint = `/api/admin/cities/${id}`;
        
        const res = await fetch(endpoint, { method: "DELETE" });
        if (res.ok) {
          if (currentLevel === "DISTRICT") {
            setDistricts(prev => prev.filter(d => d.id !== id));
          } else if (currentLevel === "TOWN") {
            setDistricts(prev => prev.map(d => d.id === selectedDistrictId ? { ...d, towns: d.towns.filter(t => t.id !== id) } : d));
          } else if (currentLevel === "CITY") {
            setDistricts(prev => prev.map(d => d.id === selectedDistrictId ? {
              ...d, towns: d.towns.map(t => t.id === selectedTownId ? { ...t, cities: t.cities.filter(c => c.id !== id) } : t)
            } : d));
          }
        } else {
          const data = await res.json();
          alert(data.error || `Failed to delete ${typeLabel}`);
        }
      } catch (err) {
        alert("An error occurred");
      }
    }
  };

  const handleToggleStatus = async (item: any) => {
    try {
      let endpoint = `/api/admin/districts/${item.id}`;
      if (currentLevel === "TOWN") endpoint = `/api/admin/towns/${item.id}`;
      if (currentLevel === "CITY") endpoint = `/api/admin/cities/${item.id}`;

      const res = await fetch(endpoint, {
        method: "PUT", // PATCH is fine, but we built PUT for towns/cities
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      
      // Fallback for district since we used PATCH earlier
      if (res.status === 405 && currentLevel === "DISTRICT") {
          const resPatch = await fetch(endpoint, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !item.isActive }),
          });
          const data = await resPatch.json();
          setDistricts(prev => prev.map(d => d.id === item.id ? { ...data.district, towns: d.towns } : d));
          return;
      }
      
      if (res.ok) {
        const data = await res.json();
        
        if (currentLevel === "DISTRICT") {
          setDistricts(prev => prev.map(d => d.id === item.id ? { ...data.district, towns: d.towns } : d));
        } else if (currentLevel === "TOWN") {
          setDistricts(prev => prev.map(d => d.id === selectedDistrictId ? {
            ...d, towns: d.towns.map(t => t.id === item.id ? { ...data.town, cities: t.cities } : t)
          } : d));
        } else if (currentLevel === "CITY") {
          setDistricts(prev => prev.map(d => d.id === selectedDistrictId ? {
            ...d, towns: d.towns.map(t => t.id === selectedTownId ? {
              ...t, cities: t.cities.map(c => c.id === item.id ? data.city : c)
            } : t)
          } : d));
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("An error occurred");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = nameInput.trim();
    const isActive = formData.get("isActive") === "on";

    if (!isValidLocation) {
      setError(`Please select a valid ${currentLevel.toLowerCase()} from the suggestions.`);
      setLoading(false);
      return;
    }

    if (isDuplicate) {
      setError(`A ${currentLevel.toLowerCase()} with this name already exists`);
      setLoading(false);
      return;
    }

    try {
      let endpoint = `/api/admin/districts`;
      let payload: any = { name, isActive };
      
      if (currentLevel === "TOWN") {
        endpoint = `/api/admin/towns`;
        payload.districtId = selectedDistrictId;
      } else if (currentLevel === "CITY") {
        endpoint = `/api/admin/cities`;
        payload.townId = selectedTownId;
      }
      
      if (editingItem) {
        endpoint += `/${editingItem.id}`;
        let method = currentLevel === "DISTRICT" ? "PATCH" : "PUT";
        
        const res = await fetch(endpoint, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, isActive }),
        });
        const data = await res.json();

        if (res.ok) {
          if (currentLevel === "DISTRICT") {
            setDistricts(prev => prev.map(d => d.id === editingItem.id ? { ...data.district, towns: d.towns } : d));
          } else if (currentLevel === "TOWN") {
            setDistricts(prev => prev.map(d => d.id === selectedDistrictId ? {
              ...d, towns: d.towns.map(t => t.id === editingItem.id ? { ...data.town, cities: t.cities } : t)
            } : d));
          } else if (currentLevel === "CITY") {
            setDistricts(prev => prev.map(d => d.id === selectedDistrictId ? {
              ...d, towns: d.towns.map(t => t.id === selectedTownId ? {
                ...t, cities: t.cities.map(c => c.id === editingItem.id ? data.city : c)
              } : t)
            } : d));
          }
          setIsModalOpen(false);
        } else {
          setError(data.error || "Failed to save");
        }
      } else {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (res.ok) {
          if (currentLevel === "DISTRICT") {
            setDistricts(prev => [{ ...data.district, towns: [] }, ...prev]);
          } else if (currentLevel === "TOWN") {
            setDistricts(prev => prev.map(d => d.id === selectedDistrictId ? {
              ...d, towns: [{ ...data.town, cities: [] }, ...d.towns]
            } : d));
          } else if (currentLevel === "CITY") {
            setDistricts(prev => prev.map(d => d.id === selectedDistrictId ? {
              ...d, towns: d.towns.map(t => t.id === selectedTownId ? {
                ...t, cities: [data.city, ...t.cities]
              } : t)
            } : d));
          }
          setIsModalOpen(false);
        } else {
          setError(data.error || "Failed to save");
        }
      }
    } catch (err) {
      setError("An error occurred while saving");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 overflow-x-auto pb-2">
        <button 
          onClick={() => navigateUp("DISTRICT")}
          className={`flex items-center gap-1.5 hover:text-black transition-colors ${currentLevel === "DISTRICT" ? "text-black font-bold" : ""}`}
        >
          <Home className="w-4 h-4" /> Districts
        </button>
        
        {selectedDistrict && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => navigateUp("TOWN")}
              className={`hover:text-black transition-colors ${currentLevel === "TOWN" ? "text-black font-bold" : ""}`}
            >
              {selectedDistrict.name}
            </button>
          </>
        )}
        
        {selectedTown && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button className={`hover:text-black transition-colors ${currentLevel === "CITY" ? "text-black font-bold" : ""}`}>
              {selectedTown.name}
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentLevel === "DISTRICT" && "Manage Districts"}
            {currentLevel === "TOWN" && "Manage Towns"}
            {currentLevel === "CITY" && "Manage Cities"}
          </h1>
          <p className="text-black/60 mt-1">
            {currentLevel === "DISTRICT" && "Manage districts available for client bookings."}
            {currentLevel === "TOWN" && `Manage towns in ${selectedDistrict?.name}.`}
            {currentLevel === "CITY" && `Manage cities in ${selectedTown?.name}.`}
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/90 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add {currentLevel === "DISTRICT" ? "District" : currentLevel === "TOWN" ? "Town" : "City"}
        </button>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={`Search ${currentLevel.toLowerCase()}s...`} 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
          <select 
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full md:w-auto bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black font-medium"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Disabled Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        {paginatedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-black/20" />
            </div>
            <h3 className="text-lg font-bold">No {currentLevel.toLowerCase()}s found</h3>
            <p className="text-black/60 mt-1">Try adjusting your filters or add a new {currentLevel.toLowerCase()}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-black/40 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 font-semibold rounded-tl-xl">{currentLevel} Name</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 flex items-center gap-3">
                      <span 
                        onClick={() => currentLevel !== "CITY" ? handleNavigateDown(item) : null}
                        className={currentLevel !== "CITY" ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}
                      >
                        {item.name}
                      </span>
                      {currentLevel !== "CITY" && (
                        <button 
                          onClick={() => handleNavigateDown(item)}
                          className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 hover:bg-black hover:text-white rounded-md font-medium transition-colors"
                        >
                          View {currentLevel === "DISTRICT" ? "Towns" : "Cities"}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                          item.isActive 
                            ? "bg-green-100 text-green-700 hover:bg-green-200" 
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {item.isActive ? "ACTIVE" : "DISABLED"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-2 text-black/40 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
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
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of <span className="font-medium text-gray-900">{filteredItems.length}</span> results
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingItem ? "Edit" : "Add"} {currentLevel === "DISTRICT" ? "District" : currentLevel === "TOWN" ? "Town" : "City"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{currentLevel.charAt(0) + currentLevel.toLowerCase().slice(1)} Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="name" 
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    required
                    autoComplete="off"
                    className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 text-gray-900 font-medium transition-colors ${
                      (!isValidLocation && nameInput.trim().length > 0) || isDuplicate 
                        ? "border-red-300 focus:ring-red-200" 
                        : "border-gray-200 focus:ring-gray-900"
                    }`}
                    placeholder={`e.g. ${currentLevel === 'DISTRICT' ? 'Downtown' : 'Central'}`}
                  />
                  {isFetchingSuggestions && (
                    <div className="absolute right-3 top-3 text-xs text-gray-400">Loading...</div>
                  )}
                  {showSuggestions && nameSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      <ul className="py-1">
                        {nameSuggestions.map((suggestion, idx) => (
                          <li 
                            key={idx}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setNameInput(suggestion);
                              setShowSuggestions(false);
                            }}
                            className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors"
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {!isValidLocation && nameInput.trim().length > 0 && (
                  <p className="text-xs text-red-500 font-bold mt-2">
                    Please select a valid {currentLevel.toLowerCase()} from the suggestions.
                  </p>
                )}
                {isDuplicate && (
                  <p className="text-xs text-red-500 font-bold mt-2">
                    This {currentLevel.toLowerCase()} already exists.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    name="isActive"
                    defaultChecked={editingItem ? editingItem.isActive : true}
                    className="peer sr-only"
                    id="isActiveToggle"
                  />
                  <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:border-black peer-checked:bg-black transition-colors"></div>
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                    <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <label htmlFor="isActiveToggle" className="text-sm font-bold text-gray-700 cursor-pointer">
                  Enable bookings in this {currentLevel.toLowerCase()}
                </label>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="px-5 py-2.5 text-gray-500 font-bold hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || !isValidLocation || isDuplicate}
                  className="px-6 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
