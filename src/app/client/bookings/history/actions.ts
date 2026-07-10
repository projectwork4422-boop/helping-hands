"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitReview(
  bookingId: string,
  clientId: string,
  employeeId: string,
  rating: number,
  comment: string
) {
  try {
    await prisma.review.create({
      data: {
        bookingId,
        clientId,
        employeeId,
        rating,
        comment: comment || null,
      }
    });

    revalidatePath("/client/bookings/history");
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { success: false, error: "Failed to submit review." };
  }
}
