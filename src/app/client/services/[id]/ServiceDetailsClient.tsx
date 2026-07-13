"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ShoppingCart, Star, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart, Service } from "@/context/CartContext";
import { useRouter } from "next/navigation";

const HorizontalServiceCarousel = ({ services, renderCard }: { services: Service[], renderCard: (s: Service) => React.ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 5);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [services]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="relative group -mx-4 px-4 sm:mx-0 sm:px-0">
      {showLeft && (
        <button 
          onClick={() => scroll("left")} 
          className="absolute left-1 sm:-left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center text-black hover:bg-white transition-all md:hidden sm:group-hover:flex"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {showRight && (
        <button 
          onClick={() => scroll("right")} 
          className="absolute right-1 sm:-right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center text-black hover:bg-white transition-all md:hidden sm:group-hover:flex"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scrollbar-hide pb-4 sm:pb-0 w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {services.map(service => (
          <div key={service.id} className="w-[calc(50%-8px)] shrink-0 snap-start sm:w-auto h-full">
            {renderCard(service)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ServiceDetailsClient({ service, suggestedServices = [] }: { service: Service, suggestedServices?: Service[] }) {
  const { cart, addToCart, removeFromCart, isInCart, clearCart } = useCart();
  const router = useRouter();
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(5);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const cartTotalAmount = useMemo(() => cart.reduce((acc, s) => acc + s.basePrice, 0), [cart]);

  const getServiceReviews = (s: Service) => {
    if (!s.bookings) return [];
    return s.bookings
      .filter((b: any) => b.review)
      .map((b: any) => b.review);
  };

  const getAverageRating = (reviews: any[]) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  const reviews = getServiceReviews(service);
  const avgRating = getAverageRating(reviews);

  const renderServiceCard = (serviceToRender: Service) => {
    const sReviews = getServiceReviews(serviceToRender);
    const sAvgRating = getAverageRating(sReviews);
    return (
      <div
        key={`service-${serviceToRender.id}`}
        onClick={() => router.push(`/client/services/${serviceToRender.id}`)}
        className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer overflow-hidden min-w-0 h-[300px]"
      >
        {/* Top Image Cover */}
        <div className="w-full h-28 bg-gray-50 relative overflow-hidden border-b border-gray-100 shrink-0">
          {(serviceToRender as any).images?.[0] ? (
            <img
              src={(serviceToRender as any).images[0]}
              alt={serviceToRender.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-blue-50/30 group-hover:scale-105 transition-transform duration-500">
              {serviceToRender.iconUrl || "✨"}
            </div>
          )}
          {/* Category Badge on Image */}
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-700 uppercase tracking-wider shadow-sm">
            {serviceToRender.category?.name || "General"}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2 gap-2 h-[40px] overflow-hidden">
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {serviceToRender.name}
            </h3>
            {sReviews.length > 0 && (
              <div className="flex items-center gap-1 shrink-0 bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700 mt-0.5">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span className="text-[10px] font-bold">{sAvgRating}</span>
              </div>
            )}
          </div>

          <div className="mb-2 h-[28px] flex items-center shrink-0">
            <p className="text-lg font-black text-gray-900 truncate">
              ₹{serviceToRender.basePrice.toFixed(2)}
            </p>
          </div>

          <div className="mb-2 h-[28px] shrink-0">
            {serviceToRender.estimatedTime && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 w-fit px-2 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium truncate">{serviceToRender.estimatedTime}</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-2 border-t border-gray-50 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isInCart(serviceToRender.id)) removeFromCart(serviceToRender.id);
                else addToCart(serviceToRender);
              }}
              className={`w-full h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                isInCart(serviceToRender.id)
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-black text-white hover:bg-gray-800 hover:shadow-md"
              }`}
            >
              {isInCart(serviceToRender.id) ? (
                <>
                  <X className="w-3.5 h-3.5" /> Remove
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${cart.length > 0 ? 'mb-24' : ''}`}>
      {/* Service Info */}
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-4xl shrink-0 overflow-hidden">
            {(service as any).images?.[0] ? (
              <img src={(service as any).images[0]} alt={service.name} className="w-full h-full object-cover" />
            ) : (
              service.iconUrl || "🔧"
            )}
          </div>
          <div className="flex-1">
            <div className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold mb-3 uppercase tracking-wider">
              {service.category?.name || "Other"}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h1>
            <p className="text-gray-600 text-base leading-relaxed mb-6 max-w-3xl">
              {service.description || "Professional service delivered by our network of verified, experienced experts. Satisfaction guaranteed."}
            </p>
            
            {service.estimatedTime && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{service.estimatedTime}</span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Base Price</p>
                <p className="text-xl font-bold text-gray-900">${service.basePrice.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 flex items-center justify-center">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Availability</p>
                  <p className="text-base font-semibold text-green-600 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Available Now
                  </p>
                </div>
              </div>
            </div>

            {/* Media Gallery */}
            {((service as any).images?.length > 0 || (service as any).videos?.length > 0) && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Media Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {(service as any).images?.map((url: string, i: number) => (
                    <div key={`img-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                      <img src={url} alt={`${service.name} image ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                  {(service as any).videos?.map((url: string, i: number) => (
                    <div key={`vid-${i}`} className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden border border-gray-200 bg-black group col-span-2 sm:col-span-1">
                      <video src={url} controls className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4 py-5 border-y border-gray-100 mb-8">
          <button 
            onClick={() => {
              if (isInCart(service.id)) {
                removeFromCart(service.id);
              } else {
                addToCart(service);
              }
            }}
            className={`px-6 py-2.5 font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm ${
              isInCart(service.id) 
                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100" 
                : "bg-black text-white hover:bg-black/90"
            }`}
          >
            {isInCart(service.id) ? (
              <>
                Remove from Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>

      </div>

      {/* Suggested Services */}
      {suggestedServices.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <HorizontalServiceCarousel 
            services={suggestedServices} 
            renderCard={renderServiceCard} 
          />
        </div>
      )}

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          Customer Reviews
          {reviews.length > 0 && (
            <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
              {reviews.length}
            </span>
          )}
        </h2>
        
        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No reviews available for this service yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-[250px_1fr] gap-8">
            {/* Overall Rating */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 self-start text-center">
              <div className="text-5xl font-black text-gray-900 mb-3">{avgRating}</div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(Number(avgRating)))}
              </div>
              <p className="text-gray-500 text-sm font-medium">Based on {reviews.length} review{reviews.length !== 1 && 's'}</p>
            </div>

            {/* Review List */}
            <div className="space-y-4">
              {reviews.slice(0, visibleReviewsCount).map((review: any) => (
                <div key={review.id} className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 overflow-hidden border border-gray-200">
                        {review.client?.image ? (
                          <img src={review.client.image} alt={review.client?.name || "Client"} className="w-full h-full object-cover" />
                        ) : (
                          (review.client?.name || "A")[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">
                          {review.client?.name || "Anonymous User"}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.comment ? (
                    <p className="text-gray-600 text-sm leading-relaxed mt-4">"{review.comment}"</p>
                  ) : (
                    <p className="text-gray-400 text-sm italic mt-4">No comment provided.</p>
                  )}
                </div>
              ))}
              
              {visibleReviewsCount < reviews.length && (
                <div className="text-center pt-4">
                  <button 
                    onClick={() => setVisibleReviewsCount(prev => prev + 5)}
                    className="px-6 py-2 bg-gray-50 text-gray-700 font-bold rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
                  >
                    Load More Reviews
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Cart Summary Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2 max-w-7xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                </span>
                <span className="text-base font-black text-gray-900 leading-none mt-0.5">
                  ₹{cartTotalAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowCancelConfirm(true)}
                className="px-3 sm:px-5 py-2.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 text-xs sm:text-sm font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => router.push('/client/cart')}
                className="px-4 sm:px-6 py-2.5 bg-black hover:bg-gray-900 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                View Cart
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
            <p className="text-gray-500 mb-6">Are you sure you want to clear your cart? All items will be removed.</p>
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
