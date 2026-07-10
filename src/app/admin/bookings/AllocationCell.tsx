"use client";

import { useState, useRef, useEffect } from "react";
import { getQualifiedEmployees, allocateEmployee } from "@/actions/allocation";
import { ChevronDown } from "lucide-react";

interface Employee {
  id: string;
  name: string | null;
  isAvailable?: boolean;
}

interface AllocationCellProps {
  bookingId: string;
  serviceName: string;
  currentEmployeeId: string | null;
  currentEmployeeName: string | null;
  status: string;
  date: string;
  timeSlot: string;
}

export default function AllocationCell({
  bookingId,
  serviceName,
  currentEmployeeId,
  currentEmployeeName,
  status,
  date,
  timeSlot
}: AllocationCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCompleted = status === "COMPLETED";
  const isCancelled = status === "CANCELLED";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    }
    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing]);

  const handleEditClick = async () => {
    setIsEditing(true);
    setLoading(true);
    setError(null);
    try {
      const data = await getQualifiedEmployees(serviceName, date, timeSlot, bookingId);
      setEmployees(data);
    } catch (err) {
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (selectedId: string) => {
    if (!selectedId || selectedId === currentEmployeeId) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await allocateEmployee(bookingId, selectedId);
      if (res.error) {
        setError(res.error);
        // keep editing open so user can see error
      } else {
        setIsEditing(false);
      }
    } catch (err) {
      setError("Allocation failed");
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (isCompleted || isCancelled) {
    return (
      <span className="font-medium text-black">
        {currentEmployeeName || "Unassigned"}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className="relative min-w-[200px]" ref={dropdownRef}>
        <div className="flex items-center justify-between border border-gray-300 rounded-lg p-2 bg-white shadow-sm cursor-default">
          <span className="text-sm text-gray-700">{saving ? 'Saving...' : 'Select Professional'}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
        
        {!saving && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
            {loading ? (
              <div className="p-4 text-sm text-center text-gray-500">Loading professionals...</div>
            ) : employees.length === 0 ? (
              <div className="p-4 text-sm text-center text-gray-500">No qualified professionals found.</div>
            ) : (
              <ul className="max-h-60 overflow-y-auto">
                {employees.map(emp => (
                  <li 
                    key={emp.id} 
                    className={`px-4 py-3 flex flex-col gap-1 border-b border-gray-50 last:border-0 transition-colors ${emp.isAvailable ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-70 cursor-not-allowed bg-red-50/30'}`}
                    onClick={() => emp.isAvailable && handleAllocate(emp.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 text-sm">{emp.name} {emp.id === currentEmployeeId && "(Current)"}</span>
                      {emp.isAvailable ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                          Booked
                        </span>
                      )}
                    </div>
                    {!emp.isAvailable && (
                      <p className="text-xs text-red-600/80 mt-0.5">
                        Already assigned to another booking from this time.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {error && <span className="text-xs text-red-500 absolute -bottom-6 left-0 whitespace-nowrap bg-white px-2 py-0.5 rounded shadow-sm">{error}</span>}
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between min-w-[150px]">
      {currentEmployeeId ? (
        <span className="font-medium text-black">{currentEmployeeName}</span>
      ) : (
        <span className="text-black/40 italic">Unassigned</span>
      )}
      
      <button
        onClick={handleEditClick}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-gray-100 hover:bg-gray-200 text-black px-2 py-1 rounded"
        title="Allocate/Change Professional"
      >
        {currentEmployeeId ? "Change" : "Allocate"}
      </button>
    </div>
  );
}
