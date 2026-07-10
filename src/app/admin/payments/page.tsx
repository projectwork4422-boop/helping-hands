import { prisma } from "@/lib/prisma";
import { CheckCircle, Clock, CreditCard } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      booking: {
        include: {
          client: true,
          employee: true,
          service: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Payments & Revenue</h1>
          <p className="text-black/60">View all payments, their split between Admin and Employees, and transaction status.</p>
        </div>
        <a 
          href="/admin/payments/settings" 
          className="px-6 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-black/80 transition-colors"
        >
          Payment Settings
        </a>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-black/60">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Booking Details</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium text-right">Total Amount</th>
                <th className="px-6 py-4 font-medium text-right">Admin Share</th>
                <th className="px-6 py-4 font-medium text-right">Employee Share</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-black/60">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="w-12 h-12 text-gray-200 mb-3" />
                      <p>No payments found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-black">{payment.transactionId || 'N/A'}</div>
                      <div className="text-xs text-gray-400 mt-0.5">ID: {payment.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-black">{payment.booking.service.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Booking: {payment.booking.id}</div>
                      <div className="text-xs text-gray-500 font-semibold">{payment.booking.status}</div>
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      {payment.booking.client.name}
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      {payment.booking.employee?.name || <span className="text-gray-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-blue-600">
                      {typeof payment.adminShareAmount === 'number' ? `$${payment.adminShareAmount.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">
                      {typeof payment.employeeShareAmount === 'number' ? `$${payment.employeeShareAmount.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md uppercase tracking-wider">
                        {payment.gateway}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status === 'COMPLETED' && <CheckCircle className="w-3.5 h-3.5" />}
                        {payment.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-black/70 text-sm">
                      {payment.createdAt.toLocaleDateString()} {payment.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
