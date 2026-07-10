import { prisma } from "@/lib/prisma";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { services: true }
      }
    }
  });

  return <CategoriesClient initialCategories={categories} />;
}
