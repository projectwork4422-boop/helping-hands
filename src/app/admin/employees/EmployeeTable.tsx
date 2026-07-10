"use client";

import { useState, useMemo, useEffect } from "react";
import { Clock, CheckCircle, XCircle, X, Search, Filter, XCircle as CloseIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { suspendEmployee } from "./actions";

export default function EmployeeTable({ employees, categories = [] }: { employees: any[], categories?: any[] }) {
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedService, itemsPerPage]);

  const handleSuspend = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setIsSuspending(true);
      await suspendEmployee(id);
      setSelectedEmployee(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSuspending(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedService("");
  };

  // Filter employees based on search, category, and service
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = (emp.user?.name || "").toLowerCase();
        const email = (emp.user?.email || "").toLowerCase();
        const phone = (emp.user?.phone || "").toLowerCase();
        const id = emp.id.toLowerCase();

        if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !id.includes(q)) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory) {
        const category = categories?.find(c => c.id === selectedCategory);
        if (category) {
          // Employee must have at least one service that belongs to this category
          const categoryServiceNames = category.services.map((s: any) => s.name);
          const hasCategoryService = emp.services?.some((s: string) => categoryServiceNames.includes(s));
          if (!hasCategoryService) return false;
        }
      }

      // 3. Service Filter
      if (selectedService) {
        if (!emp.services?.includes(selectedService)) {
          return false;
        }
      }

      return true;
    });
  }, [employees, searchQuery, selectedCategory, selectedService, categories]);

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // Dynamically populate available services based on selected category
  const availableServices = selectedCategory 
    ? categories?.find(c => c.id === selectedCategory)?.services || []
    : categories?.flatMap(c => c.services) || [];

  return (
    <>
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by Name, ID, Email, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="text-gray-400 w-4 h-4 hidden sm:block" />
              <select 
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedService(""); // Reset service when category changes
                }}
                className="w-full sm:w-48 py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <select 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full sm:w-48 py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm bg-white"
              >
                <option value="">All Services</option>
                {availableServices.map((srv: any) => (
                  <option key={srv.id} value={srv.name}>{srv.name}</option>
                ))}
              </select>
            </div>

            {(searchQuery || selectedCategory || selectedService) && (
              <button 
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
              >
                <CloseIcon className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-black/60">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-black/60">
                    No employees found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedEmployee(emp)}
                  >
                    <td className="px-6 py-4 font-medium text-black">
                      {emp.user.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      {emp.user.email}
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      {new Date(emp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        emp.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        emp.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {emp.status === 'APPROVED' && <CheckCircle className="w-3.5 h-3.5" />}
                        {emp.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                        {emp.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => handleSuspend(emp.id, e)}
                        disabled={isSuspending}
                        className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {filteredEmployees.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Show</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="py-1 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-500">
                entries ({(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length})
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1 mx-2">
                {generatePageNumbers().map((page, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={page === '...'}
                    className={`min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm transition-colors ${
                      page === currentPage 
                        ? 'bg-black text-white font-medium' 
                        : page === '...'
                        ? 'text-gray-400 cursor-default'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Employee Details</h2>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Header Info */}
              <div className="flex items-start gap-6">
                {selectedEmployee.photoUrl ? (
                  <img 
                    src={selectedEmployee.photoUrl} 
                    alt={selectedEmployee.user.name || "Employee"} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-50 shadow-sm">
                    <span className="text-3xl font-bold text-gray-300">
                      {(selectedEmployee.user.name || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedEmployee.user.name || "Unknown"}</h3>
                  <p className="text-gray-500 font-medium">{selectedEmployee.user.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      ID: {selectedEmployee.id}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedEmployee.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      selectedEmployee.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Status: {selectedEmployee.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <dt className="text-gray-500">Phone</dt>
                      <dd className="font-medium text-gray-900">{selectedEmployee.user.phone || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <dt className="text-gray-500">Gender</dt>
                      <dd className="font-medium text-gray-900">{selectedEmployee.gender || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <dt className="text-gray-500">Date of Birth</dt>
                      <dd className="font-medium text-gray-900">
                        {selectedEmployee.dob ? new Date(selectedEmployee.dob).toLocaleDateString() : "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <dt className="text-gray-500">Joined Date</dt>
                      <dd className="font-medium text-gray-900">
                        {new Date(selectedEmployee.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Professional</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex flex-col border-b border-gray-50 pb-2">
                      <dt className="text-gray-500 mb-1">Address</dt>
                      <dd className="font-medium text-gray-900">{selectedEmployee.address || "N/A"}</dd>
                    </div>
                    <div className="flex flex-col border-b border-gray-50 pb-2">
                      <dt className="text-gray-500 mb-1">Registered Services</dt>
                      <dd className="font-medium text-gray-900 flex flex-wrap gap-1 mt-1">
                        {selectedEmployee.services && selectedEmployee.services.length > 0 ? (
                          selectedEmployee.services.map((service: string, idx: number) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                              {service}
                            </span>
                          ))
                        ) : (
                          "N/A"
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                    <p className="text-xs font-medium text-gray-500 mb-2">Aadhaar Front</p>
                    {selectedEmployee.aadhaarFrontUrl ? (
                      <img 
                        src={selectedEmployee.aadhaarFrontUrl} 
                        alt="Aadhaar Front" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        No image provided
                      </div>
                    )}
                  </div>
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                    <p className="text-xs font-medium text-gray-500 mb-2">Aadhaar Back</p>
                    {selectedEmployee.aadhaarBackUrl ? (
                      <img 
                        src={selectedEmployee.aadhaarBackUrl} 
                        alt="Aadhaar Back" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        No image provided
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 p-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedEmployee.status !== 'SUSPENDED' && (
                <button 
                  onClick={() => handleSuspend(selectedEmployee.id)}
                  disabled={isSuspending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSuspending ? "Suspending..." : "Suspend Account"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
