import { prisma } from "@/lib/prisma";
import { XCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminSuspendedEmployeesPage() {
  const employees = await prisma.employeeProfile.findMany({
    where: {
      status: "SUSPENDED"
    },
    include: {
      user: true,
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Suspended Employees</h1>
        <p className="text-black/60">Manage employee accounts that have been suspended.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-black/60">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Services</th>
                <th className="px-6 py-4 font-medium">Suspended On</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-black/60">
                    No suspended employees found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-black">
                      {emp.user.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      {emp.user.email}
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      {emp.user.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {emp.services && emp.services.length > 0 
                          ? emp.services.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-black/5 rounded text-xs">{s}</span>
                            )) 
                          : <span className="text-gray-400">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-black/70" suppressHydrationWarning>
                      {new Date(emp.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        <XCircle className="w-3.5 h-3.5" />
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        "use server";
                        await prisma.employeeProfile.update({
                          where: { id: emp.id },
                          data: { status: "APPROVED" }
                        });
                        const { revalidatePath } = await import("next/cache");
                        revalidatePath("/admin/employees/suspended");
                        revalidatePath("/admin/employees");
                      }}>
                        <button className="text-xs font-bold px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                          Unsuspend
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
