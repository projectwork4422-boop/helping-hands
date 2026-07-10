"use client";

import { useState, useMemo } from "react";
import { Check, ShoppingCart, Star, X, Clock } from "lucide-react";
import { useCart, Service } from "@/context/CartContext";
import { useRouter } from "next/navigation";

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {suggestedServices.map((suggestedService) => {
              const suggestedReviews = getServiceReviews(suggestedService);
              const suggestedAvgRating = getAverageRating(suggestedReviews);
              return (
                <div 
                  key={`sugg-${suggestedService.id}`} 
                  onClick={() => router.push(`/client/services/${suggestedService.id}`)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer overflow-hidden"
                >
                  <div className="w-full h-28 bg-gray-50 relative overflow-hidden border-b border-gray-100">
                    {(suggestedService as any).images?.[0] ? (
                      <img src={(suggestedService as any).images[0]} alt={suggestedService.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-blue-50/30 group-hover:scale-105 transition-transform duration-500">
                        {suggestedService.iconUrl || "✨"}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-700 uppercase tracking-wider shadow-sm">
                      {suggestedService.category?.name || "General"}
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{suggestedService.name}</h3>
                      {suggestedReviews.length > 0 && (
                        <div className="flex items-center gap-1 shrink-0 bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-[10px] font-bold">{suggestedAvgRating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                      {suggestedService.description || "Top-rated professional service delivered by verified experts."}
                    </p>
                    
                    {suggestedService.estimatedTime && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 bg-gray-50 w-fit px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{suggestedService.estimatedTime}</span>
                      </div>
                    )}
                  
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Starts at</p>
                        <p className="text-sm font-bold text-gray-900">${suggestedService.basePrice.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isInCart(suggestedService.id)) removeFromCart(suggestedService.id);
                          else addToCart(suggestedService);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isInCart(suggestedService.id) 
                            ? "bg-red-50 text-red-600 hover:bg-red-100" 
                            : "bg-black text-white hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5"
                        }`}
                      >
                        {isInCart(suggestedService.id) ? <X className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300">
          <div className="container mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">Total Items</span>
                <span className="text-lg font-bold text-gray-900">{cart.length} {cart.length === 1 ? 'Service' : 'Services'}</span>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">Total Amount</span>
                <span className="text-xl font-black text-blue-600">${cartTotalAmount.toFixed(2)}</span>
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
                onClick={() => router.push('/client/cart')}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-black hover:bg-gray-900 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
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
