import { prisma } from "@/lib/prisma";
import RegistrationRequestCard from "@/components/admin/RegistrationRequestCard";

export const dynamic = 'force-dynamic';

export default async function RegistrationRequestsPage() {
  const pendingEmployees = await prisma.employeeProfile.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Employee Registration Requests</h1>
        <p className="text-black/60">Review and manage pending registrations from new professionals.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        <div className="space-y-4">
          {pendingEmployees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black/60 text-lg">No pending registration requests at the moment.</p>
            </div>
          ) : (
            pendingEmployees.map((emp) => (
              <RegistrationRequestCard key={emp.id} emp={emp} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
