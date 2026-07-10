export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientProfileMenu from "@/components/client/ClientProfileMenu";
import CartIcon from "@/components/client/CartIcon";
import { Bell, CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PaymentHistoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "CLIENT") {
    redirect("/login/client");
  }

  const payments = await prisma.payment.findMany({
    where: { booking: { clientId: session.user.id } },
    include: { booking: { include: { service: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-12 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/client/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xl font-bold tracking-tight">Payment History</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><Bell className="w-5 h-5" /></button>
          <CartIcon />
          <ClientProfileMenu userName={session.user.name || "Client"} />
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-4">
              <CreditCard className="w-10 h-10 text-black/30" />
              Payment History
            </h1>
            <p className="text-black/60 text-lg mt-2">View your past transactions and billing details.</p>
          </div>

          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Payments Found</h3>
                <p className="text-black/60">You haven't made any payments yet.</p>
              </div>
            ) : (
              payments.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-bold text-xl">{p.booking.service.name}</h3>
                    <p className="text-black/60 text-sm mt-1">Transaction ID: {p.id}</p>
                    <p className="text-black/50 text-sm mt-1">{p.createdAt.toLocaleDateString()} • {p.createdAt.toLocaleTimeString()}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-2xl font-bold text-black">${p.amount.toFixed(2)}</p>
                    <span className="inline-block mt-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold uppercase tracking-wider">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
