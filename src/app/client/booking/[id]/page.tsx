export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Check, Clock, Truck, CheckCircle, Wrench, CalendarClock, User, MapPin, Phone } from "lucide-react";
import CancelBookingButton from "@/components/client/CancelBookingButton";

export default async function BookingTrackingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "CLIENT") {
    redirect("/login/client");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id, clientId: session.user.id },
    include: { service: true, employee: true }
  });

  if (!booking) {
    redirect("/client/dashboard");
  }

  const steps = [
    { id: 'PENDING', label: 'Booking Confirmed', icon: Clock, description: 'Your booking has been received.' },
    { id: 'ASSIGNED', label: 'Professional Assigned', icon: User, description: 'A professional has been assigned.' },
    { id: 'ON_THE_WAY', label: 'On the Way', icon: Truck, description: 'Professional is traveling to your location.' },
    { id: 'IN_PROGRESS', label: 'Service In Progress', icon: Wrench, description: 'The service is currently being performed.' },
    { id: 'COMPLETED', label: 'Completed', icon: CheckCircle, description: 'Service has been completed successfully.' },
  ];

  const currentStatusIndex = steps.findIndex(s => s.id === booking.status);
  
  // If cancelled, just show cancelled
  if (booking.status === "CANCELLED") {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/client/dashboard" className="inline-flex items-center text-sm font-medium hover:text-black/70 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
            <h1 className="text-2xl font-bold mb-2">Booking Cancelled</h1>
            <p className="text-black/60">This booking was cancelled and is no longer active.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <Link href="/client/dashboard" className="inline-flex items-center text-sm font-medium hover:text-black/70 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{booking.service.name}</h1>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-black/60 flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" /> 
                  {booking.date.toLocaleDateString()} • {booking.timeSlot}
                </p>
                {booking.service.estimatedTime && (
                  <p className="text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {booking.service.estimatedTime}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-2 rounded-xl text-center border border-gray-100">
              <span className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Status</span>
              <span className="font-bold text-black">{steps[currentStatusIndex > -1 ? currentStatusIndex : 0].label}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-black/40" /> Location Details
              </h3>
              <p className="text-black/70">{booking.address}</p>
            </div>
            {booking.employee && (
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-black/40" /> Assigned Professional
                </h3>
                <p className="text-black/90 font-medium">{booking.employee.name}</p>
                {booking.employee.phone && (
                  <p className="text-black/60 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" /> {booking.employee.phone}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight mb-8">Tracking Progress</h2>
            <div className="relative flex flex-col">
              {steps.map((step, index) => {
                const isCompleted = currentStatusIndex > index || (currentStatusIndex === steps.length - 1 && index === steps.length - 1);
                const isCurrent = currentStatusIndex === index && currentStatusIndex !== steps.length - 1;
                const isLineGreen = currentStatusIndex > index;
                const Icon = step.icon;
                const isLast = index === steps.length - 1;
                
                return (
                  <div key={step.id} className={`relative flex gap-6 ${!isLast ? 'pb-10' : ''}`}>
                    {!isLast && (
                      <div className={`absolute left-6 top-12 bottom-0 w-0.5 -ml-[1px] transition-colors duration-500 ${
                        isLineGreen ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                    <div className={`relative z-10 w-12 h-12 shrink-0 flex items-center justify-center rounded-full border-4 shadow-sm transition-all duration-500 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isCurrent 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-white border-gray-200 text-gray-300'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                      )}
                    </div>
                    <div className="pt-2">
                      <h4 className={`font-bold text-lg transition-colors duration-300 ${
                        isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </h4>
                      <p className={`text-sm mt-1 transition-colors duration-300 ${
                        isCompleted ? 'text-green-600/80' : isCurrent ? 'text-blue-600/80' : 'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {booking.status !== "COMPLETED" && (
            <CancelBookingButton bookingId={booking.id} createdAt={booking.createdAt} />
          )}

        </div>
      </div>
    </div>
  );
}
