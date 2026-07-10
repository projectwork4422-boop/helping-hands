import { prisma } from "@/lib/prisma";
import CouponsClient from "./CouponsClient";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { bookings: true }
      }
    }
  });

  return <CouponsClient initialCoupons={coupons} />;
}
