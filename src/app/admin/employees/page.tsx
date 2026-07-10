import { prisma } from "@/lib/prisma";
import EmployeeTable from "./EmployeeTable";

export const dynamic = 'force-dynamic';

export default async function AdminEmployeesPage() {
  const employees = await prisma.employeeProfile.findMany({
    where: {
      status: "APPROVED"
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const categories = await prisma.serviceCategory.findMany({
    include: {
      services: true
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Employees</h1>
        <p className="text-black/60">Manage all professionals registered on the platform.</p>
      </div>

      <EmployeeTable employees={employees} categories={categories} />
    </div>
  );
}
