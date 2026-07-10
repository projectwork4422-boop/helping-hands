"use client";

import { useState, useEffect } from "react";
import { cancelBooking } from "@/actions/booking";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CancelBookingButtonProps {
  bookingId: string;
  createdAt: Date;
}

export default function CancelBookingButton({ bookingId, createdAt }: CancelBookingButtonProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const twoHoursInMs = 2 * 60 * 60 * 1000;
      const now = new Date();
      const bookingTime = new Date(createdAt);
      
      const timeElapsed = now.getTime() - bookingTime.getTime();
      const timeRemaining = twoHoursInMs - timeElapsed;

      if (timeRemaining <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
      } else {
        const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
        setTimeLeft({ hours, minutes });
        setIsExpired(false);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [createdAt]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setIsCancelling(true);
    setError(null);

    const result = await cancelBooking(bookingId);

    if (result.error) {
      setError(result.error);
      setIsCancelling(false);
    } else {
      router.refresh();
    }
  };

  if (isExpired) {
    return (
      <div className="mt-8 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          The cancellation period has expired. This booking can no longer be cancelled.
        </p>
      </div>
    );
  }

  if (!timeLeft) {
    return null; // Loading state
  }

  return (
    <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex flex-col items-center text-center">
      <h3 className="text-red-900 font-bold mb-2">Cancel Booking</h3>
      <p className="text-sm text-red-700 mb-4">
        You can cancel this booking within {timeLeft.hours > 0 ? `${timeLeft.hours} hour${timeLeft.hours > 1 ? 's' : ''} ` : ''}{timeLeft.minutes} minute{timeLeft.minutes !== 1 ? 's' : ''}.
      </p>
      
      {error && (
        <p className="text-sm text-red-600 mb-4 font-medium">{error}</p>
      )}

      <button
        onClick={handleCancel}
        disabled={isCancelling}
        className="px-6 py-2.5 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isCancelling ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Cancelling...
          </>
        ) : (
          "Cancel Booking"
        )}
      </button>
    </div>
  );
}
