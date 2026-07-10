import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    include: {
      clientBookings: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Clients</h1>
        <p className="text-black/60">Manage all clients registered on the platform.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-black/60">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Total Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-black/60">
                    No clients found.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-black">
                      {client.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-medium">
                        {client.clientBookings.length}
                      </span>
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
