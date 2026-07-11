"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Get the current landing page stats
export async function getLandingStats() {
  try {
    let stats = await prisma.landingPageStats.findUnique({
      where: { id: "default" },
    });

    if (!stats) {
      stats = await prisma.landingPageStats.create({
        data: {
          id: "default",
        },
      });
    }
    
    return { success: true, data: stats };
  } catch (error: any) {
    console.error("Error fetching landing stats:", error);
    return { success: false, error: "Failed to fetch landing stats." };
  }
}

// Update the landing page stats
export async function updateLandingStats(data: {
  happyClients?: string;
  verifiedPros?: string;
  servicesOffered?: string;
  citiesServed?: string;
  totalCustomers?: string;
  servicesCompleted?: string;
  activeProviders?: string;
  averageRating?: string;
}) {
  try {
    const stats = await prisma.landingPageStats.upsert({
      where: { id: "default" },
      update: data,
      create: {
        id: "default",
        ...data,
      },
    });

    // Revalidate the landing page to show updated stats immediately
    revalidatePath("/");

    return { success: true, data: stats };
  } catch (error: any) {
    console.error("Error updating landing stats:", error);
    return { success: false, error: "Failed to update landing stats." };
  }
}
