import { prisma } from "@/lib/prisma";
import DistrictsClient from "./DistrictsClient";

export const dynamic = "force-dynamic";

export default async function AdminDistrictsPage() {
  const districts = await prisma.district.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      towns: {
        include: { cities: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  return <DistrictsClient initialDistricts={districts} />;
}
