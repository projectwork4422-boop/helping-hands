export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Bell } from "lucide-react";
import ClientProfileMenu from "@/components/client/ClientProfileMenu";
import CartIcon from "@/components/client/CartIcon";
import ClientServiceBooker from "@/components/client/ClientServiceBooker";

export default async function ExploreServices() {
  const session = await getServerSession(authOptions);
  const isClient = session?.user?.role === "CLIENT";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 overflow-auto">
        <ClientServiceBooker 
          services={services} 
          userName={session?.user?.name || "Guest"} 
          isGuest={!isClient} 
          activeHierarchy={activeHierarchy}
        />
      </main>
    </div>
  );
}
