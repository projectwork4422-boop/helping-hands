"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

export type SavedLocation = {
  id: string;
  label: string;
  address: string;
  district: string;
  town?: string | null;
  city?: string | null;
  phone: string;
  isServiceable?: boolean;
};

type LocationContextType = {
  locations: SavedLocation[];
  activeLocation: SavedLocation | null;
  setActiveLocation: (loc: SavedLocation | null) => void;
  isLoading: boolean;
  refreshLocations: () => Promise<void>;
  locationWarning: string | null;
  clearLocationWarning: () => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [activeLocationState, setActiveLocationState] = useState<SavedLocation | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);

  const setActiveLocation = (loc: SavedLocation | null) => {
    setActiveLocationState(loc);
    if (userId) {
      if (loc) {
        localStorage.setItem(`activeLocationId_${userId}`, loc.id);
      } else {
        localStorage.removeItem(`activeLocationId_${userId}`);
      }
    }
  };

  const clearLocationWarning = () => setLocationWarning(null);

  const refreshLocations = async () => {
    try {
      setIsLoading(true);
      const [res, activeRes] = await Promise.all([
        fetch("/api/client/locations"),
        fetch("/api/client/locations/active")
      ]);

      if (res.ok && activeRes.ok) {
        const data = await res.json();
        const activeData = await activeRes.json();
        const activeDistricts = activeData.districts || [];
        
        const fetchedUserId = data.userId;
        if (fetchedUserId) setUserId(fetchedUserId);

        const checkServiceable = (loc: SavedLocation) => {
          const d = activeDistricts.find((ad: any) => ad.name === loc.district);
          if (!d) return false;
          
          if (loc.town && loc.city) {
            const t = d.towns.find((at: any) => at.name === loc.town);
            if (!t) return false;
            return t.cities.some((ac: any) => ac.name === loc.city);
          } else if (loc.town) {
            return d.towns.some((at: any) => at.name === loc.town);
          } else if (loc.city) {
            return d.towns.some((at: any) => at.cities.some((ac: any) => ac.name === loc.city));
          }
          return true; // if neither town nor city, just district is active
        };

        const locs = (data.locations || []).map((l: SavedLocation) => ({
          ...l,
          isServiceable: checkServiceable(l)
        }));
        
        setLocations(locs);
        
        if (locs.length > 0) {
          let selectedLoc = null;
          if (fetchedUserId) {
            const savedId = localStorage.getItem(`activeLocationId_${fetchedUserId}`);
            if (savedId) {
              selectedLoc = locs.find((l: SavedLocation) => l.id === savedId);
            }
          }

          if (selectedLoc) {
            if (!selectedLoc.isServiceable) {
              setLocationWarning("Your previously selected location is no longer serviceable. Please choose a new location.");
              // Don't auto-select it if it's not serviceable, or we can select it but show warning.
              // Actually, better to select the first serviceable one, or null.
              const firstServiceable = locs.find((l: SavedLocation) => l.isServiceable);
              setActiveLocation(firstServiceable || null);
            } else {
              setActiveLocation(selectedLoc);
            }
          } else {
            // No saved pref, check current activeLocationState or fallback
            setActiveLocationState(prev => {
              if (prev && locs.find((l: SavedLocation) => l.id === prev.id && l.isServiceable)) {
                return locs.find((l: SavedLocation) => l.id === prev.id) || null;
              }
              const firstServiceable = locs.find((l: SavedLocation) => l.isServiceable);
              return firstServiceable || null;
            });
          }
        } else {
          setActiveLocation(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch locations", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshLocations();
  }, [pathname]);

  return (
    <LocationContext.Provider value={{ 
      locations, 
      activeLocation: activeLocationState, 
      setActiveLocation, 
      isLoading, 
      refreshLocations,
      locationWarning,
      clearLocationWarning
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
