import { getLandingStats } from "@/actions/landingStats";
import LandingStatsForm from "./LandingStatsForm";
import { LayoutDashboard } from "lucide-react";

export default async function LandingPageUpdate() {
  const { data: stats } = await getLandingStats();

  // Handle case where fetch failed (though it shouldn't unless DB is down)
  if (!stats) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100">
          Failed to load landing page statistics. Please check database connection.
        </div>
      </div>
    );
  }

  // Format data to match form expectations (strip extra Prisma fields if any)
  const initialData = {
    happyClients: stats.happyClients,
    verifiedPros: stats.verifiedPros,
    servicesOffered: stats.servicesOffered,
    citiesServed: stats.citiesServed,
    totalCustomers: stats.totalCustomers,
    servicesCompleted: stats.servicesCompleted,
    activeProviders: stats.activeProviders,
    averageRating: stats.averageRating,
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Landing Page Update</h1>
          <p className="text-gray-500 text-sm">Update the statistics displayed on the public landing page.</p>
        </div>
      </div>

      <LandingStatsForm initialData={initialData} />
    </div>
  );
}
