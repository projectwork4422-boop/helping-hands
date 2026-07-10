import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, CreditCard, MapPin, Star, User, Wrench, FileText, Phone, Mail, AlertTriangle, Printer, Download } from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function BookingDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const bookingId = params.id;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      client: {
        include: { savedLocations: true }
      },
      employee: {
        include: { employeeProfile: true }
      },
      service: {
        include: { category: true }
      },
      review: true,
      payment: true,
    }
  });

  if (!booking) redirect("/admin/bookings");

  const settings = await prisma.paymentSettings.findFirst() || { employeeShare: 70, adminShare: 30 };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'ON_THE_WAY': return 'bg-purple-100 text-purple-800';
      case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const steps = [
    { id: 'PENDING', label: 'Booking Confirmed', date: booking.createdAt },
    { id: 'ASSIGNED', label: 'Employee Assigned', date: booking.status !== 'PENDING' ? booking.updatedAt : null },
    { id: 'ON_THE_WAY', label: 'On the Way', date: (booking.status === 'ON_THE_WAY' || booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED') ? booking.updatedAt : null },
    { id: 'IN_PROGRESS', label: 'Service Started', date: (booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED') ? booking.updatedAt : null },
    { id: 'COMPLETED', label: 'Completed', date: booking.status === 'COMPLETED' ? booking.updatedAt : null },
  ];

  if (booking.status === 'CANCELLED') {
    steps.push({ id: 'CANCELLED', label: 'Cancelled', date: booking.updatedAt });
  }

  const currentStatusIndex = steps.findIndex(s => s.id === booking.status);

  let clientLocation = null;
  if (booking.client.savedLocations.length > 0) {
    clientLocation = booking.client.savedLocations.find(loc => loc.address === booking.address) || booking.client.savedLocations[0];
  }

  const totalAmount = booking.payment?.amount || booking.service.basePrice;
  const adminEarnings = booking.payment?.adminShareAmount;
  const employeeShare = booking.payment?.employeeShareAmount;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/bookings" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Booking Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm">
            <Printer className="w-4 h-4" /> Print Booking
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm shadow-sm">
            <Download className="w-4 h-4" /> Download Invoice
          </button>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Booking ID</p>
            <p className="font-mono text-gray-900 font-medium">{booking.id}</p>
          </div>
          <div className="h-10 w-px bg-gray-100 hidden md:block"></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${getStatusBadge(booking.status)}`}>
              {booking.status}
            </span>
          </div>
          <div className="h-10 w-px bg-gray-100 hidden md:block"></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Payment</p>
            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${
              booking.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              booking.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {booking.paymentStatus}
            </span>
          </div>
          <div className="h-10 w-px bg-gray-100 hidden md:block"></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Date & Time</p>
            <p className="font-semibold text-gray-900">{new Date(booking.date).toLocaleDateString()} • {booking.timeSlot}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="h-10 w-px bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Admin</p>
            <p className="text-lg font-bold text-green-600">{adminEarnings ? formatCurrency(adminEarnings) : 'Pending'}</p>
          </div>
          <div className="h-10 w-px bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Employee</p>
            <p className="text-lg font-bold text-blue-600">{employeeShare ? formatCurrency(employeeShare) : 'Pending'}</p>
          </div>
        </div>
      </div>

      {/* Row 1: Client and Employee Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Client Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-50 pb-4">
            <User className="w-5 h-5 text-blue-500" /> Client Details
          </h2>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl shrink-0">
              {booking.client.name?.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <p className="font-bold text-gray-900 text-lg">{booking.client.name}</p>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-2">
                <p className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4 text-gray-400" /> {booking.client.phone || 'N/A'}</p>
                <p className="flex items-center gap-2 text-sm text-gray-600"><Mail className="w-4 h-4 text-gray-400" /> {booking.client.email}</p>
                <div className="flex items-start gap-2 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-900">{booking.address}</p>
                    {clientLocation && (
                      <p className="text-xs text-gray-500 mt-1">
                        {clientLocation.city}, {clientLocation.town}, {clientLocation.district}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-50 pb-4">
            <Wrench className="w-5 h-5 text-orange-500" /> Employee Details
          </h2>
          {booking.employee ? (
            <div className="flex items-start gap-4">
              {booking.employee.employeeProfile?.photoUrl ? (
                <div className="w-14 h-14 relative rounded-full overflow-hidden shrink-0 border border-gray-200">
                  <Image src={booking.employee.employeeProfile.photoUrl} alt={booking.employee.name || ''} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-xl shrink-0">
                  {booking.employee.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="space-y-2 flex-1">
                <div>
                  <p className="font-bold text-gray-900 text-lg">{booking.employee.name}</p>
                  <p className="text-xs text-gray-500">ID: {booking.employee.id}</p>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <p className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4 text-gray-400" /> {booking.employee.phone || 'N/A'}</p>
                  <p className="flex items-center gap-2 text-sm text-gray-600"><Mail className="w-4 h-4 text-gray-400" /> {booking.employee.email}</p>
                  <div className="mt-2 bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-center justify-between">
                    <span className="text-xs text-orange-800 font-semibold uppercase">Assigned Date</span>
                    <span className="text-sm font-medium text-orange-900">{booking.status !== 'PENDING' ? booking.updatedAt.toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
              <User className="w-10 h-10 mb-3 opacity-20" />
              <p>No professional assigned yet.</p>
            </div>
          )}
        </div>

      </div>

      {/* Row 2: Service Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-50 pb-4">
          <FileText className="w-5 h-5 text-purple-500" /> Service Details
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          {booking.service.images && booking.service.images.length > 0 ? (
            <div className="w-full md:w-64 h-40 relative rounded-xl overflow-hidden shrink-0 border border-gray-200">
              <Image src={booking.service.images[0]} alt={booking.service.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-full md:w-64 h-40 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
          )}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{booking.service.name}</h3>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 mt-2">
                  {booking.service.category?.name || 'Uncategorized'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(booking.service.basePrice)}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1 justify-end"><Clock className="w-4 h-4" /> {booking.service.estimatedTime || 'N/A'}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
              {booking.service.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Booking Progress Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" /> Booking Progress Timeline
        </h2>
        
        {booking.status === 'CANCELLED' ? (
           <div className="bg-red-50 rounded-2xl border border-red-100 shadow-sm p-6 text-center">
             <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
             <h3 className="text-lg font-bold text-red-800 mb-1">Booking Cancelled</h3>
             <p className="text-sm text-red-600">This booking was cancelled on {booking.updatedAt.toLocaleString()}.</p>
           </div>
        ) : (
          <div className="relative flex justify-between px-4 md:px-12">
            {/* Background Line */}
            <div className="absolute top-4 left-12 right-12 h-0.5 bg-gray-100 -z-10" />
            
            {steps.filter(s => s.id !== 'CANCELLED').map((step, index) => {
              let isCompleted = currentStatusIndex > index || (booking.status === 'COMPLETED' && step.id === 'COMPLETED');
              let isCurrent = currentStatusIndex === index;
              const isLast = index === steps.filter(s => s.id !== 'CANCELLED').length - 1;
              const isLineGreen = currentStatusIndex > index;

              return (
                <div key={step.id} className="relative flex flex-col items-center text-center flex-1">
                  {!isLast && (
                    <div className={`absolute top-4 left-[50%] right-[-50%] h-0.5 -z-10 transition-colors duration-500 ${isLineGreen ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-3 transition-colors duration-500 ${
                    isCompleted 
                      ? 'border-green-500 bg-green-500 text-white' 
                      : isCurrent 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md shadow-indigo-200'
                        : 'border-gray-200 bg-white text-gray-300'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                  </div>
                  <p className={`font-semibold text-sm ${isCompleted ? 'text-green-700' : isCurrent ? 'text-indigo-700' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-xs text-gray-500 mt-1 hidden md:block">{new Date(step.date).toLocaleString()}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Row 4: Payment Details and Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Payment Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-50 pb-4">
            <CreditCard className="w-5 h-5 text-green-500" /> Payment Distribution
          </h2>
          {booking.payment ? (
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 mb-2">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Booking Amount</span>
                <span className="font-bold text-xl text-gray-900">{formatCurrency(booking.payment.amount)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 text-center">
                  <p className="text-xs text-green-800 font-bold uppercase tracking-wider mb-2">Admin Share ({settings.adminShare}%)</p>
                  <p className="font-bold text-xl text-green-600">{booking.payment.adminShareAmount ? formatCurrency(booking.payment.adminShareAmount) : formatCurrency((booking.payment.amount * settings.adminShare) / 100)}</p>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                  <p className="text-xs text-blue-800 font-bold uppercase tracking-wider mb-2">Employee Share ({settings.employeeShare}%)</p>
                  <p className="font-bold text-xl text-blue-600">{booking.payment.employeeShareAmount ? formatCurrency(booking.payment.employeeShareAmount) : formatCurrency((booking.payment.amount * settings.employeeShare) / 100)}</p>
                </div>
              </div>
              <div className="pt-4 space-y-3 mt-4 border-t border-gray-50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Payment Status</span>
                  <span className={`font-bold ${booking.payment.status === 'COMPLETED' ? 'text-green-600 bg-green-50 px-2 py-0.5 rounded-md' : 'text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md'}`}>
                    {booking.payment.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Payment Method</span>
                  <span className="font-bold text-gray-900">{booking.payment.gateway}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Transaction ID</span>
                  <span className="font-mono text-gray-900 font-medium">{booking.payment.transactionId || 'N/A'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
              <CreditCard className="w-10 h-10 mb-3 opacity-20 text-green-500" />
              <p className="font-medium text-gray-500">No payment record found.</p>
            </div>
          )}
        </div>

        {/* Customer Feedback */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-50 pb-4">
            <Star className="w-5 h-5 text-yellow-500" /> Customer Feedback
          </h2>
          {booking.review ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-6 h-6 ${star <= booking.review!.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-50'}`} />
                  ))}
                </div>
                <span className="font-bold text-xl text-gray-900">{booking.review.rating}/5</span>
              </div>
              {booking.review.comment ? (
                <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 text-gray-700 italic flex-1 flex items-center">
                  "{booking.review.comment}"
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 italic">
                  No written review provided.
                </div>
              )}
              <div className="mt-4 text-right">
                <p className="text-xs text-gray-400">
                  Submitted on {new Date(booking.review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
              <Star className="w-8 h-8 mb-2 opacity-20" />
              <p>No feedback available</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
