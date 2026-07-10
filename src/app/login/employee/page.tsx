import EmployeeLoginForm from "@/components/employee/EmployeeLoginForm";
import { prisma } from "@/lib/prisma";

export default async function EmployeeLoginPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, name: true, iconUrl: true, basePrice: true, category: true },
    orderBy: { name: 'asc' }
  });

  return <EmployeeLoginForm services={services} />;
}
