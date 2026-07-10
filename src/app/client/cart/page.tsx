import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CartClient from "@/components/client/CartClient";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  
  const userName = session?.user?.role === "CLIENT" ? (session.user.name || null) : null;
  
  const districts = await prisma.district.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return <CartClient userName={userName} districts={districts} />;
}
