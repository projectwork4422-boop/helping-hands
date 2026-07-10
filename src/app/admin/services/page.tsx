import { prisma } from "@/lib/prisma";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true }
  });

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { createdAt: "desc" }
  });

  return <ServicesClient initialServices={services} categories={categories} />;
}
