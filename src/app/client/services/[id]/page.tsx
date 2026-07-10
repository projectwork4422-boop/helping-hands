import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import ClientProfileMenu from "@/components/client/ClientProfileMenu";
import CartIcon from "@/components/client/CartIcon";
import { Bell, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ServiceDetailsClient from "./ServiceDetailsClient";

export const dynamic = 'force-dynamic';

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const isClient = session?.user?.role === "CLIENT";

  const resolvedParams = await params;

  const service = await prisma.service.findUnique({
    where: { id: resolvedParams.id },
    include: {
      category: true,
      bookings: {
        where: {
          review: { isNot: null }
        },
        include: {
          review: {
            include: {
              client: true
            }
          }
        }
      }
    }
  });

  if (!service) {
    notFound();
  }

  // Fetch suggested services
  let suggestedServices = await prisma.service.findMany({
    where: {
      isActive: true,
      categoryId: service.categoryId,
      id: { not: service.id }
    },
    take: 6,
    include: { category: true }
  });

  if (suggestedServices.length < 4) {
    const additionalServices = await prisma.service.findMany({
      where: {
        isActive: true,
        id: { notIn: [service.id, ...suggestedServices.map(s => s.id)] }
      },
      take: 6 - suggestedServices.length,
      include: { category: true }
    });
    suggestedServices = [...suggestedServices, ...additionalServices];
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
      <header className="fixed top-0 left-0 w-full z-50 h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-4">
          <Link href="/explore" className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xl font-bold tracking-tight">Service Details</span>
        </div>
        <div className="flex items-center gap-4">
          {isClient && (
            <button className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><Bell className="w-5 h-5" /></button>
          )}
          <CartIcon />
          {isClient && <ClientProfileMenu userName={session.user.name || "Client"} />}
        </div>
      </header>
      
      <main className="p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <ServiceDetailsClient service={service} suggestedServices={suggestedServices} />
        </div>
      </main>
    </div>
  );
}
