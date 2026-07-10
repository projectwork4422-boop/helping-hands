export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientServiceBooker from "@/components/client/ClientServiceBooker";

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "CLIENT") {
    redirect("/login/client");
  }

  const services = await prisma.service.findMany({
    where: { isActive: true },
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
    },
    orderBy: [
      { categoryId: 'asc' },
      { name: 'asc' }
    ]
  });

  const activeHierarchy = await prisma.district.findMany({
    where: { isActive: true },
    include: {
      towns: {
        include: {
          cities: true
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <main className="flex-1 overflow-auto">
        <ClientServiceBooker 
          services={services} 
          userName={session.user.name || "Client"} 
          activeHierarchy={activeHierarchy}
        />
      </main>
    </div>
  );
}
