"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { MapPin, ChevronDown, Plus, Edit2, Trash2, X, Navigation } from "lucide-react";
import { useLocation, SavedLocation } from "@/context/LocationContext";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

export default function LocationSelector() {
  const { locations, activeLocation, setActiveLocation, isLoading, refreshLocations, locationWarning, clearLocationWarning } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50/80 rounded-full animate-pulse border border-gray-100">
        <MapPin className="w-4 h-4 text-gray-400" />
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all border ${
          isOpen ? "bg-white border-gray-300 shadow-sm" : "bg-gray-50/80 hover:bg-white border-transparent hover:border-gray-200 hover:shadow-sm"
        }`}
      >
        <MapPin className={`w-4 h-4 shrink-0 transition-colors ${isOpen ? "text-black" : "text-gray-500"}`} />
        <div className="flex flex-col items-start leading-none max-w-[80px] sm:max-w-[140px]">
          <span className="hidden sm:block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Delivering to</span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 truncate w-full text-left">
            {activeLocation ? activeLocation.label : "Location"}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-40 sm:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed sm:absolute bottom-0 sm:bottom-auto sm:top-full left-0 sm:mt-3 w-full sm:w-80 bg-white border border-gray-100 rounded-t-3xl sm:rounded-2xl shadow-xl z-50 py-4 sm:py-3 animate-in slide-in-from-bottom-full sm:slide-in-from-top-2 fade-in duration-300 sm:duration-200 max-h-[85vh] flex flex-col">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
            <div className="px-5 py-2 border-b border-gray-50 mb-2 shrink-0">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Saved Locations</span>
            </div>

          {locationWarning && (
            <div className="mx-4 mb-3 p-3 bg-red-50 border border-red-100 rounded-xl relative">
              <button 
                onClick={clearLocationWarning} 
                className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-xs font-bold text-red-600 pr-4 leading-tight">
                {locationWarning}
              </p>
            </div>
          )}
          
          {locations.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto custom-scrollbar px-2 space-y-1">
              {locations.map(loc => (
                <li key={loc.id}>
                  <button
                    onClick={() => {
                      setActiveLocation(loc);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-start gap-3 group ${
                      activeLocation?.id === loc.id 
                        ? "bg-black text-white shadow-md" 
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${
                      activeLocation?.id === loc.id ? "text-white" : "text-gray-400 group-hover:text-black"
                    }`} />
                    <div className="flex flex-col min-w-0">
                      <span className={`text-sm font-bold truncate ${
                        activeLocation?.id === loc.id ? "text-white" : "text-gray-900"
                      }`}>
                        {loc.label} {loc.isServiceable === false && <span className="ml-1 text-[10px] uppercase text-red-500 font-bold">(Unavailable)</span>}
                      </span>
                      <span className={`text-xs truncate ${
                        activeLocation?.id === loc.id ? "text-gray-300" : "text-gray-500"
                      }`}>
                        {[loc.city, loc.town, loc.district].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">No saved locations</p>
              <p className="text-xs text-gray-500">Add a location to see it here.</p>
            </div>
          )}
          
          <div className="px-4 pt-3 mt-2 border-t border-gray-50 shrink-0 mb-4 sm:mb-0">
            <button 
              onClick={() => {
                setIsOpen(false);
                setShowManager(true);
              }}
              className="w-full text-center px-4 py-2.5 text-sm font-bold text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100"
            >
              Manage Locations
            </button>
          </div>
        </div>
        </>
      )}

      {showManager && (
        <LocationManagerModal onClose={() => setShowManager(false)} />
      )}
    </div>
  );
}

function LocationManagerModal({ onClose }: { onClose: () => void }) {
  const { locations, refreshLocations, activeLocation, setActiveLocation } = useLocation();
  const [isAdding, setIsAdding] = useState(false);
  const [editingLoc, setEditingLoc] = useState<SavedLocation | null>(null);

  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Hierarchy Data
  const [hierarchyData, setHierarchyData] = useState<any[]>([]);
  const [isHierarchyLoading, setIsHierarchyLoading] = useState(true);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await fetch("/api/client/locations/active");
        if (res.ok) {
          const data = await res.json();
          setHierarchyData(data.districts || []);
        }
      } catch (err) {
        console.error("Failed to load hierarchy", err);
      } finally {
        setIsHierarchyLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  const activeDistricts = hierarchyData.map(d => d.name);
  
  const availableTowns = useMemo(() => {
    if (!district) return [];
    const d = hierarchyData.find(d => d.name === district);
    return d ? d.towns.map((t: any) => t.name) : [];
  }, [district, hierarchyData]);
  
  const availableCities = useMemo(() => {
    if (!district) return [];
    const d = hierarchyData.find(d => d.name === district);
    if (!d) return [];
    if (town) {
      const t = d.towns.find((t: any) => t.name === town);
      return t ? t.cities.map((c: any) => c.name) : [];
    }
    return d.towns.flatMap((t: any) => t.cities.map((c: any) => c.name));
  }, [district, town, hierarchyData]);

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (district && !availableTowns.includes(town)) {
      setTown("");
      setCity("");
    }
  }, [district, availableTowns, town]);

  useEffect(() => {
    if ((town || district) && !availableCities.includes(city)) {
      setCity("");
    }
  }, [town, district, availableCities, city]);

  const handleEdit = (loc: SavedLocation) => {
    setEditingLoc(loc);
    setLabel(loc.label);
    setAddress(loc.address);
    setDistrict(loc.district);
    setTown(loc.town || "");
    setCity(loc.city || "");
    setPhone(loc.phone || "");
    setIsAdding(true);
    setSuccessMsg("");
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      await fetch(`/api/client/locations/${id}`, { method: "DELETE" });
      await refreshLocations();
    }
  };

  const getClosestMatch = (input: string, list: string[]) => {
    if (!input || !list.length) return "";
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
    const normInput = normalize(input);
    
    let exactMatch = list.find(item => normalize(item) === normInput);
    if (exactMatch) return exactMatch;

    // Very naive string matching
    for (const item of list) {
      if (normalize(item).includes(normInput) || normInput.includes(normalize(item))) {
        return item;
      }
    }
    return "";
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    
    setIsLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          if (data && data.address) {
            const addr = data.address;
            
            const possibleDistrict = addr.state_district || addr.county || "";
            const cleanDistrict = possibleDistrict.replace(/ district$/i, "").trim();
            const matchedDistrict = getClosestMatch(cleanDistrict, activeDistricts);
            
            if (matchedDistrict) {
              setDistrict(matchedDistrict);
              
              // Now we must match town from the available towns in matchedDistrict
              const d = hierarchyData.find(hd => hd.name === matchedDistrict);
              if (d) {
                const possibleTown = addr.city || addr.town || addr.village || addr.suburb || "";
                const matchedTown = getClosestMatch(possibleTown, d.towns.map((t: any) => t.name));
                if (matchedTown) {
                  setTown(matchedTown);
                  
                  // Now match city
                  const t = d.towns.find((td: any) => td.name === matchedTown);
                  if (t) {
                    const possibleCity = addr.neighbourhood || addr.suburb || addr.city_district || addr.residential || "";
                    const matchedCity = getClosestMatch(possibleCity, t.cities.map((c: any) => c.name));
                    if (matchedCity) setCity(matchedCity);
                  }
                }
              }
            } else {
                setError("Your detected district is not currently active for services.");
            }
            
            // Build Detailed Address
            const parts = [
              addr.house_number,
              addr.road,
              addr.suburb || addr.neighbourhood || addr.residential,
              addr.city || addr.town || addr.village,
              addr.state,
              addr.postcode
            ].filter(Boolean);
            
            const uniqueParts = Array.from(new Set(parts));
            setAddress(uniqueParts.join(", "));
            
            if (!label) {
              setLabel("Current Location");
            }
          } else {
            setError("Could not detect address from your location.");
          }
        } catch (err) {
          setError("Failed to fetch address details.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setError("Location access is required to detect your current location. Please enable location permission or enter your address manually.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!district || (!town && !city)) {
      setError("Please select a District, and either a Town or a City.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      let res;
      const payload = { label, address, district, town, city, phone };

      if (editingLoc) {
        res = await fetch(`/api/client/locations/${editingLoc.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`/api/client/locations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const responseData = await res.json();
        await refreshLocations();
        
        // If we are editing the currently active location, update it
        if (editingLoc && activeLocation?.id === editingLoc.id) {
          setActiveLocation(responseData.location);
        } else if (!editingLoc && !activeLocation) {
          // If adding a new location and no active location exists, set it
          setActiveLocation(responseData.location);
        }

        setIsAdding(false);
        setEditingLoc(null);
        setSuccessMsg("Location saved successfully.");
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save location");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
          <div className="p-6 md:px-8 border-b border-gray-100 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-900">
                {isAdding ? (editingLoc ? "Edit Location" : "Add New Location") : "Saved Locations"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isAdding ? "Enter the details for your address below." : "Manage your frequently used addresses."}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 bg-gray-50 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-black self-start -mt-2 -mr-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
            {!isAdding ? (
              <div className="space-y-6">
                {successMsg && (
                  <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-sm font-bold rounded-xl flex items-center gap-2 mb-4 animate-in fade-in">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}
                
                {locations.length > 0 ? (
                  <div className="grid gap-4">
                    {locations.map(loc => (
                      <div key={loc.id} className="p-5 border border-gray-100 rounded-2xl flex items-center justify-between hover:border-gray-300 transition-all bg-white shadow-sm hover:shadow-md group">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shrink-0 text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col pt-0.5">
                            <h4 className="font-bold text-gray-900 text-sm">{loc.label}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug pr-4">
                              {loc.address}, {[loc.city, loc.town, loc.district].filter(Boolean).join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            onClick={() => handleEdit(loc)} 
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(loc.id)} 
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <MapPin className="w-7 h-7 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No locations found</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">You haven't saved any addresses yet. Add one for a faster checkout.</p>
                  </div>
                )}

                {locations.length < 4 ? (
                  <button
                    onClick={() => {
                      setEditingLoc(null);
                      setLabel("");
                      setAddress("");
                      setDistrict("");
                      setTown("");
                      setCity("");
                      setPhone("");
                      setError("");
                      setSuccessMsg("");
                      setIsAdding(true);
                    }}
                    className="w-full py-4 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-900 font-bold transition-all flex items-center justify-center gap-2 hover:border-gray-400 group"
                  >
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" /> Add New Location
                  </button>
                ) : (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                    <p className="text-xs font-bold text-amber-800">You have reached the maximum limit of 4 saved locations.</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="w-full py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-blue-200 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isLocating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Detecting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      Use Current Location
                    </>
                  )}
                </button>

                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-px bg-gray-100"></div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">OR</span>
                  <div className="flex-1 h-px bg-gray-100"></div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Location Label</label>
                  <input 
                    type="text" 
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    placeholder="e.g. Home, Office, Parents' House"
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-gray-100 focus:border-gray-900 bg-white text-sm font-medium transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Contact Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(val);
                    }}
                    placeholder="10-digit mobile number"
                    pattern="\d{10}"
                    title="Please enter exactly 10 digits"
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-gray-100 focus:border-gray-900 bg-white text-sm font-medium transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">District</label>
                    <div className="relative">
                      <select 
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        required
                        disabled={isHierarchyLoading}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-gray-100 focus:border-gray-900 bg-white text-sm font-medium transition-all shadow-sm appearance-none"
                      >
                        <option value="" disabled>Select District</option>
                        {activeDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">
                      Town <span className="text-gray-400 font-normal normal-case text-[10px] ml-1">(Optional if City is provided)</span>
                    </label>
                    <div className="relative">
                      <select 
                        value={town}
                        onChange={e => setTown(e.target.value)}
                        disabled={!district || isHierarchyLoading}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-gray-100 focus:border-gray-900 bg-white text-sm font-medium transition-all shadow-sm appearance-none disabled:bg-gray-50 disabled:opacity-50"
                      >
                        <option value="">Select Town (Optional)</option>
                        {availableTowns.map((t: string) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">
                      City / Area <span className="text-gray-400 font-normal normal-case text-[10px] ml-1">(Optional if Town is provided)</span>
                    </label>
                    <div className="relative">
                      <select 
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        disabled={!district || isHierarchyLoading}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-gray-100 focus:border-gray-900 bg-white text-sm font-medium transition-all shadow-sm appearance-none disabled:bg-gray-50 disabled:opacity-50"
                      >
                        <option value="">Select City / Area (Optional)</option>
                        {availableCities.map((c: string) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Detailed Address</label>
                  <textarea 
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Enter full street address, apartment number, etc."
                    required
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-gray-100 focus:border-gray-900 bg-white text-sm font-medium transition-all shadow-sm resize-none leading-relaxed"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-gray-100 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)} 
                    className="w-full sm:w-1/3 py-3.5 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full sm:w-2/3 py-3.5 text-white font-bold bg-gray-900 hover:bg-black hover:shadow-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Location"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
