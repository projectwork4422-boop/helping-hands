"use client";

import { useState } from "react";
import { CalendarClock, Star, X, Clock } from "lucide-react";
import { submitReview } from "./actions";

export default function BookingHistoryList({ bookings, clientId }: { bookings: any[], clientId: string }) {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewFeedbackBooking, setViewFeedbackBooking] = useState<any | null>(null);

  const handleOpenReviewModal = (booking: any) => {
    setSelectedBooking(booking);
    setRating(0);
    setHoveredRating(0);
    setComment("");
  };

  const handleCloseReviewModal = () => {
    setSelectedBooking(null);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await submitReview(
        selectedBooking.id,
        clientId,
        selectedBooking.employeeId,
        rating,
        comment
      );
      setSelectedBooking(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Past Bookings</h3>
            <p className="text-black/60">You don't have any completed or cancelled bookings yet.</p>
          </div>
        ) : (
          bookings.map(b => (
            <div key={b.id} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="font-bold text-xl">{b.service.name}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-black/60 flex items-center gap-2">
                    <CalendarClock className="w-4 h-4" /> {new Date(b.date).toLocaleDateString()}
                  </p>
                  {b.service.estimatedTime && (
                    <p className="text-gray-500 flex items-center gap-1.5 text-sm">
                      <Clock className="w-4 h-4" /> {b.service.estimatedTime}
                    </p>
                  )}
                </div>
                <div className={`mt-4 inline-flex px-3 py-1 rounded-lg text-sm font-semibold ${
                  b.status === "COMPLETED" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {b.status}
                </div>
              </div>
              {b.status === "COMPLETED" && (
                <div>
                  {!b.review ? (
                    <button 
                      onClick={() => handleOpenReviewModal(b)}
                      className="px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-black/90 transition-colors whitespace-nowrap"
                    >
                      Write Feedback
                    </button>
                  ) : (
                    <button 
                      onClick={() => setViewFeedbackBooking(b)}
                      className="px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-xl hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      View Feedback
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Write Feedback</h2>
              <button 
                onClick={handleCloseReviewModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <p className="font-medium text-gray-900 mb-1">{selectedBooking.service.name}</p>
                <p className="text-sm text-gray-500">How was your experience with this service?</p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        star <= (hoveredRating || rating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review/Comments (Optional)</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                  placeholder="Share details of your experience..."
                ></textarea>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button 
                onClick={handleSubmitReview}
                disabled={rating === 0 || isSubmitting}
                className="w-full px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {viewFeedbackBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Your Feedback</h2>
              <button 
                onClick={() => setViewFeedbackBooking(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <p className="font-medium text-gray-900 mb-3">{viewFeedbackBooking.service.name}</p>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`w-6 h-6 ${
                        star <= viewFeedbackBooking.review.rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                
                {viewFeedbackBooking.review.comment ? (
                  <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm border border-gray-100">
                    "{viewFeedbackBooking.review.comment}"
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No comment provided.</p>
                )}
                
                <p className="text-xs text-gray-400 mt-4">
                  Submitted on {new Date(viewFeedbackBooking.review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="p-6 pt-0">
              <button 
                onClick={() => setViewFeedbackBooking(null)}
                className="w-full px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
