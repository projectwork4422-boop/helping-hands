export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientProfileMenu from "@/components/client/ClientProfileMenu";
import CartIcon from "@/components/client/CartIcon";
import { Bell, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import BookingHistoryList from "./BookingHistoryList";

export default async function BookingHistoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "CLIENT") {
    redirect("/login/client");
  }

  const pastBookings = await prisma.booking.findMany({
    where: { clientId: session.user.id, status: { in: ["COMPLETED", "CANCELLED"] } },
    include: { 
      service: true,
      review: true
    },
    orderBy: { date: "desc" }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-12 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/client/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xl font-bold tracking-tight">Booking History</span>
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
              <Star className="w-10 h-10 text-black/30" />
              Booking History & Feedback
            </h1>
            <p className="text-black/60 text-lg mt-2">View your past service requests and leave reviews.</p>
          </div>

          <BookingHistoryList bookings={pastBookings} clientId={session.user.id} />
        </div>
      </main>
    </div>
  );
}
