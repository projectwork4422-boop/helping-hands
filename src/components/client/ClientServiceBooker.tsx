"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  Star,
  Bell,
  Filter,
  X,
  SlidersHorizontal,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { useCart, Service } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import ClientProfileMenu from "@/components/client/ClientProfileMenu";
import CartIcon from "@/components/client/CartIcon";
import LocationSelector from "@/components/client/LocationSelector";
import { useLocation } from "@/context/LocationContext";

export default function ClientServiceBooker({
  services,
  userName,
  isGuest = false,
  activeHierarchy = [],
}: {
  services: Service[];
  userName: string;
  isGuest?: boolean;
  activeHierarchy?: any[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);

  const [categoryServiceIndex, setCategoryServiceIndex] = useState<
    Record<string, number>
  >({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [viewAllCategory, setViewAllCategory] = useState<string | null>(null);

  const { cart, addToCart, removeFromCart, isInCart, clearCart } = useCart();
  const router = useRouter();
  const { activeLocation, isLoading } = useLocation();

  const cartTotalAmount = useMemo(
    () => cart.reduce((acc, s) => acc + s.basePrice, 0),
    [cart],
  );

  // Check if location is serviceable
  const isServiceable = useMemo(() => {
    if (isGuest) return true; // Guests can browse all services
    if (!activeLocation) return false;
    
    // Find the district
    const district = activeHierarchy.find(
      d => d.name.trim().toLowerCase() === activeLocation.district.trim().toLowerCase()
    );
    if (!district) return false;

    const clientTown = activeLocation.town?.trim().toLowerCase();
    const clientCity = activeLocation.city?.trim().toLowerCase();

    // If client hasn't provided either town or city, it might be a legacy location.
    // We will attempt to match the address against active towns/cities as a fallback.
    const isLegacy = !clientTown && !clientCity;

    let townEnabled = false;
    let cityEnabled = false;

    if (clientTown) {
      townEnabled = district.towns.some((t: any) => t.name.trim().toLowerCase() === clientTown && t.isActive);
    } else if (isLegacy && activeLocation.address) {
      const addr = activeLocation.address.toLowerCase();
      townEnabled = district.towns.some((t: any) => t.isActive && addr.includes(t.name.trim().toLowerCase()));
    }

    if (clientCity) {
      cityEnabled = district.towns.some((t: any) => 
        t.cities.some((c: any) => c.name.trim().toLowerCase() === clientCity && c.isActive)
      );
    } else if (isLegacy && !townEnabled && activeLocation.address) {
      const addr = activeLocation.address.toLowerCase();
      cityEnabled = district.towns.some((t: any) => 
        t.cities.some((c: any) => c.isActive && addr.includes(c.name.trim().toLowerCase()))
      );
    }

    // If it's a legacy location and we couldn't match any active town or city from the address,
    // or if it's a new location and neither the selected town nor city is enabled.
    return townEnabled || cityEnabled;
  }, [isGuest, activeLocation, activeHierarchy]);

  // Categories list for filter
  const allCategories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category?.name || "Other"));
    return Array.from(cats);
  }, [services]);

  useEffect(() => {
    // Randomize 5 featured services on mount (to avoid hydration mismatch, do it in useEffect)
    const shuffled = [...services].sort(() => 0.5 - Math.random());
    setFeaturedServices(shuffled.slice(0, 5));
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      // 1. Search Query
      const term = searchQuery.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(term) ||
        (s.category?.name || "").toLowerCase().includes(term);

      // 2. Category Filter
      const catName = s.category?.name || "Other";
      const matchesCat =
        selectedCategories.length === 0 || selectedCategories.includes(catName);

      // 3. Price Filter
      const min = priceRange.min ? parseFloat(priceRange.min) : 0;
      const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const matchesPrice = s.basePrice >= min && s.basePrice <= max;

      return matchesSearch && matchesCat && matchesPrice;
    });
  }, [services, searchQuery, selectedCategories, priceRange]);

  // Reset pagination when filters change
  useEffect(() => {
    setCategoryServiceIndex({});
  }, [searchQuery, selectedCategories, priceRange]);

  // Group services by category
  const groupedServices = useMemo(() => {
    return filteredServices.reduce(
      (acc, service) => {
        const catName = service.category?.name || "Other Services";
        if (!acc[catName]) acc[catName] = [];
        acc[catName].push(service);
        return acc;
      },
      {} as Record<string, Service[]>,
    );
  }, [filteredServices]);

  const getServiceReviews = (service: Service) => {
    if (!service.bookings) return [];
    return service.bookings
      .filter((b: any) => b.review)
      .map((b: any) => b.review);
  };

  const getAverageRating = (reviews: any[]) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
    setSearchQuery("");
  };

  const renderServiceCard = (service: Service) => {
    const reviews = getServiceReviews(service);
    const avgRating = getAverageRating(reviews);
    return (
      <div
        key={`service-${service.id}`}
        onClick={() => router.push(`/client/services/${service.id}`)}
        className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer overflow-hidden"
      >
        {/* Top Image Cover */}
        <div className="w-full h-40 sm:h-32 bg-gray-50 relative overflow-hidden border-b border-gray-100 shrink-0">
          {(service as any).images?.[0] ? (
            <img
              src={(service as any).images[0]}
              alt={service.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-blue-50/30 group-hover:scale-105 transition-transform duration-500">
              {service.iconUrl || "✨"}
            </div>
          )}
          {/* Category Badge on Image */}
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-700 uppercase tracking-wider shadow-sm">
            {service.category?.name || "General"}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-1.5 gap-2">
            <h3 className="text-base sm:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {service.name}
            </h3>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1 shrink-0 bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700">
                <Star className="w-3.5 h-3.5 sm:w-3 sm:h-3 fill-yellow-500 text-yellow-500" />
                <span className="text-[11px] sm:text-[10px] font-bold">{avgRating}</span>
              </div>
            )}
          </div>

          <p className="text-gray-500 text-sm sm:text-xs mb-3 line-clamp-2 leading-relaxed">
            {service.description ||
              "Top-rated professional service delivered by verified experts."}
          </p>

          {service.estimatedTime && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 bg-gray-50 w-fit px-2 py-1.5 rounded-md">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">{service.estimatedTime}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
            <div>
              <p className="text-[10px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                Starts at
              </p>
              <p className="text-lg sm:text-sm font-black text-gray-900">
                ${service.basePrice.toFixed(2)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isInCart(service.id)) removeFromCart(service.id);
                else addToCart(service);
              }}
              className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                isInCart(service.id)
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-black text-white hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {isInCart(service.id) ? (
                <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              ) : (
                <ShoppingCart className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Navbar */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 fixed top-0 w-full z-50">
        <div className="flex items-center gap-4 shrink-0">
          <span
            className="text-xl font-black tracking-tight cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Client Portal
          </span>
        </div>

        {/* Search & Filter - Right aligned in navbar */}
        <div className="flex-1 flex items-center justify-end gap-3 mx-4">
          {!isGuest && (
            <div className="hidden sm:block">
              <LocationSelector />
            </div>
          )}

          <div className="relative max-w-sm w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 transition-all text-sm"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full border transition-all flex items-center justify-center ${showFilters || selectedCategories.length > 0 || priceRange.min || priceRange.max ? "bg-black text-white border-black shadow-md" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            title="Filter Services"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {!isGuest && (
            <button className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 hidden sm:flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </button>
          )}
          <CartIcon />
          {!isGuest && <ClientProfileMenu userName={userName} />}
        </div>
      </header>

      {/* Main Content (padded for fixed header and optional cart summary) */}
      <div
        className={`flex-1 mt-16 p-4 md:p-8 max-w-7xl mx-auto w-full flex gap-8 ${cart.length > 0 ? "mb-24" : ""}`}
      >
        {/* Main Area */}
        <div className="flex-1 min-w-0">
          {viewAllCategory ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => setViewAllCategory(null)}
                className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to all categories
              </button>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center text-xl font-black">
                    {viewAllCategory.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">
                      {viewAllCategory}
                    </h2>
                    <p className="text-gray-500">
                      {groupedServices[viewAllCategory]?.length || 0} services
                      available
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {groupedServices[viewAllCategory]?.map((service) =>
                  renderServiceCard(service),
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                {!isGuest ? (
                  <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Welcome back, {userName.split(" ")[0]} 👋
                  </h1>
                ) : (
                  <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Explore Our Services
                  </h1>
                )}
                <p className="text-gray-500 text-base">
                  Browse our highly-rated professional services and book an
                  expert in minutes.
                </p>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-pulse">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin mb-4"></div>
                  <p className="text-sm font-bold">Loading your location preferences...</p>
                </div>
              ) : !isServiceable ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Service not available
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Service is currently not available in this area. Please
                    select a different location from the top menu to view
                    available services.
                  </p>
                </div>
              ) : (
                <>
                  {/* Featured Services */}
                  {!searchQuery &&
                    selectedCategories.length === 0 &&
                    !priceRange.min &&
                    !priceRange.max &&
                    featuredServices.length > 0 && (
                      <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <h2 className="text-2xl font-bold">
                            Featured Services
                          </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {featuredServices.map((service) =>
                            renderServiceCard(service),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Categorized Services */}
                  <div className="space-y-10">
                    {(searchQuery ||
                      selectedCategories.length > 0 ||
                      priceRange.min ||
                      priceRange.max) && (
                      <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                        Search Results
                        <span className="bg-gray-100 text-gray-600 text-sm py-0.5 px-2.5 rounded-full font-medium">
                          {filteredServices.length} found
                        </span>
                      </h2>
                    )}

                    {Object.entries(groupedServices).length === 0 ? (
                      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          No services found
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                          We couldn't find any services matching your criteria.
                        </p>
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-12">
                        {Object.entries(groupedServices).map(
                          ([categoryName, categoryServices]) => {
                            const visibleServices = categoryServices.slice(
                              0,
                              5,
                            );
                            const hasMore = categoryServices.length > 5;

                            return (
                              <div
                                key={categoryName}
                                className="scroll-mt-24 mb-12"
                              >
                                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
                                  <h2 className="text-xl font-bold flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold">
                                      {categoryName.charAt(0)}
                                    </span>
                                    {categoryName}
                                  </h2>
                                  {hasMore && (
                                    <button
                                      onClick={() =>
                                        setViewAllCategory(categoryName)
                                      }
                                      className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                                    >
                                      View All{" "}
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                  {visibleServices.map((service) =>
                                    renderServiceCard(service),
                                  )}
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Filter Sidebar */}
        {showFilters && (
          <>
            {/* Mobile Backdrop */}
            <div className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setShowFilters(false)} />
            
            {/* Sidebar container */}
            <div className="fixed inset-y-0 right-0 z-[70] w-[85%] sm:w-96 bg-white shadow-2xl lg:static lg:w-72 lg:shrink-0 lg:rounded-3xl lg:border lg:border-gray-200 lg:shadow-sm lg:self-start lg:sticky lg:top-24 lg:z-auto lg:h-auto h-full overflow-hidden animate-in slide-in-from-right-full lg:slide-in-from-right-4 duration-300 flex flex-col">
              
              <div className="p-6 pb-4 border-b border-gray-100 lg:border-none lg:pb-0">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Filter className="w-5 h-5" /> Filters
                  </h3>
                  <div className="flex items-center gap-3">
                    {(selectedCategories.length > 0 ||
                      priceRange.min ||
                      priceRange.max ||
                      searchQuery) && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                      >
                        Clear All
                      </button>
                    )}
                    <button onClick={() => setShowFilters(false)} className="lg:hidden p-2 -mr-2 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 pt-2 lg:pt-0 pb-24 lg:pb-6 space-y-6">
                <div className="md:hidden">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 lg:py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 block">
                    Categories
                  </label>
                  <div className="space-y-3 lg:space-y-2">
                    {allCategories.map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-3 cursor-pointer group py-1 lg:py-0"
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="peer sr-only"
                          />
                          <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:border-black peer-checked:bg-black transition-colors"></div>
                          <svg
                            className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                            viewBox="0 0 14 10"
                            fill="none"
                          >
                            <path
                              d="M1 5L5 9L13 1"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 block">
                    Price Range ($)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                      }
                      className="w-full p-3 lg:p-2 bg-gray-50 border border-gray-200 rounded-xl lg:rounded-lg text-sm text-center focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                    <span className="text-gray-400 font-medium">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                      }
                      className="w-full p-3 lg:p-2 bg-gray-50 border border-gray-200 rounded-xl lg:rounded-lg text-sm text-center focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:hidden p-4 border-t border-gray-100 bg-white mt-auto">
                <button onClick={() => setShowFilters(false)} className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3.5 rounded-xl transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky Cart Summary Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300">
          <div className="container mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">
                  Total Items
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {cart.length} {cart.length === 1 ? "Service" : "Services"}
                </span>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">
                  Total Amount
                </span>
                <span className="text-xl font-black text-blue-600">
                  ${cartTotalAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push("/client/cart")}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-black hover:bg-gray-900 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                View Cart <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Cart</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to clear your cart? All items will be
              removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                No
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowCancelConfirm(false);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
