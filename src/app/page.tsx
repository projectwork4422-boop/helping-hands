import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import LandingHero from "@/components/landing/LandingHero";
import { LandingAbout, LandingHowItWorks, LandingWhyChooseUs } from "@/components/landing/LandingSections1";
import { LandingStats, LandingSuccessStories, LandingFAQ, LandingCTA } from "@/components/landing/LandingSections2";
import { LandingProcess, LandingReviews, LandingFooter } from "@/components/landing/LandingSections3";
import { LandingServicesGrid } from "@/components/landing/LandingServicesGrid";

export default async function Home() {
  const activeServices = await prisma.service.findMany({
    where: { isActive: true },
    include: { category: true },
    take: 6, // Show top 6 services on landing page
    orderBy: { createdAt: 'desc' }
  });

  const landingStats = await prisma.landingPageStats.findUnique({
    where: { id: "default" }
  });

  const clientStats = landingStats ? {
    happyClients: landingStats.happyClients,
    verifiedPros: landingStats.verifiedPros,
    servicesOffered: landingStats.servicesOffered,
    citiesServed: landingStats.citiesServed,
  } : undefined;

  const serviceStats = landingStats ? {
    totalCustomers: landingStats.totalCustomers,
    servicesCompleted: landingStats.servicesCompleted,
    activeProviders: landingStats.activeProviders,
    averageRating: landingStats.averageRating,
  } : undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* 1. Hero Section */}
      <LandingHero clientStats={clientStats} />

      {/* 2. About Us */}
      <LandingAbout />

      {/* 3. How It Works */}
      <LandingHowItWorks />

      {/* 4. Our Services */}
      <LandingServicesGrid activeServices={activeServices} />

      {/* 5. Why Choose Us */}
      <LandingWhyChooseUs />

      {/* 6. Our Process */}
      <LandingProcess />

      {/* 7. Customer Statistics */}
      <LandingStats serviceStats={serviceStats} />

      {/* 8. Success Stories */}
      <LandingSuccessStories />

      {/* 9. Customer Reviews */}
      <LandingReviews />

      {/* 10. FAQ */}
      <LandingFAQ />

      {/* 11. CTA / Newsletter */}
      <LandingCTA />

      {/* 12. Enhanced Footer */}
      <LandingFooter />
    </div>
  );
}
