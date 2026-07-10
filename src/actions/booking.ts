"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { validateCoupon } from "./coupon";

export async function createBooking(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "CLIENT") {
    return { error: "Unauthorized. Please log in as a client." };
  }

  const serviceId = formData.get("serviceId") as string;
  const dateStr = formData.get("date") as string;
  const timeSlot = formData.get("timeSlot") as string;
  const address = formData.get("address") as string;
  const couponId = formData.get("couponId") as string | null;

  if (!serviceId || !dateStr || !timeSlot || !address) {
    return { error: "Missing required fields" };
  }

  try {
    // In a real app, we verify the serviceId against DB, here we mock it if missing
    let service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      service = await prisma.service.create({
        data: {
          id: serviceId,
          name: "Selected Service",
          basePrice: 50.0,
        }
      });
    }

    let finalPrice = service.basePrice;
    let appliedCouponId = null;
    let appliedDiscountAmount = null;

    if (couponId) {
      const validationResult = await validateCoupon(couponId, service.basePrice);
      if (validationResult.error) {
        return { error: validationResult.error };
      }
      if (validationResult.success && validationResult.coupon) {
        appliedCouponId = validationResult.coupon.id;
        appliedDiscountAmount = validationResult.coupon.discountAmount;
        finalPrice -= appliedDiscountAmount;
        if (finalPrice < 0) finalPrice = 0;

        // Increment usage count
        await prisma.coupon.update({
          where: { id: appliedCouponId },
          data: { currentUsageCount: { increment: 1 } }
        });
      }
    }

    let settings = await prisma.paymentSettings.findFirst();
    if (!settings) {
      settings = await prisma.paymentSettings.create({
        data: { adminShare: 30, employeeShare: 70 }
      });
    }

    const adminShareAmount = parseFloat((finalPrice * (settings.adminShare / 100)).toFixed(2));
    const employeeShareAmount = parseFloat((finalPrice * (settings.employeeShare / 100)).toFixed(2));

    const booking = await prisma.booking.create({
      data: {
        clientId: session.user.id,
        serviceId: service.id,
        date: new Date(dateStr),
        timeSlot,
        address,
        status: "PENDING",
        paymentStatus: "COMPLETED", // Mocking success
        couponId: appliedCouponId,
        discountAmount: appliedDiscountAmount,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: finalPrice,
        adminShareAmount,
        employeeShareAmount,
        gateway: "RAZORPAY",
        status: "COMPLETED",
        transactionId: "pay_" + Math.random().toString(36).substring(7),
      }
    });

    // Trigger Notification
    const { sendEmail } = await import("@/lib/email");
    const userEmail = session.user.email || "client@example.com";
    await sendEmail({
      to: userEmail,
      subject: "Booking Confirmed - Helping Hands",
      body: `Hi ${session.user.name},\n\nYour booking for ${service.name} on ${dateStr} at ${timeSlot} has been confirmed. Payment of $${finalPrice} was successful.\nWe will assign a professional to you shortly.\n\nBest,\nHelping Hands Team`
    });

    revalidatePath("/client/dashboard");
    revalidatePath("/admin/bookings");
    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { error: "Failed to create booking" };
  }
}

export async function cancelBooking(bookingId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "CLIENT") {
    return { error: "Unauthorized. Please log in as a client." };
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, clientId: session.user.id },
      include: { employee: true, service: true }
    });

    if (!booking) {
      return { error: "Booking not found or unauthorized." };
    }

    if (booking.status === "CANCELLED") {
      return { error: "Booking is already cancelled." };
    }

    const twoHoursInMs = 2 * 60 * 60 * 1000;
    const now = new Date();
    const timeElapsed = now.getTime() - new Date(booking.createdAt).getTime();

    if (timeElapsed > twoHoursInMs) {
      return { error: "The cancellation period has expired. This booking can no longer be cancelled." };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });

    if (booking.employee) {
      const { sendEmail } = await import("@/lib/email");
      const employeeEmail = booking.employee.email || "employee@example.com";
      await sendEmail({
        to: employeeEmail,
        subject: "Booking Cancelled - Helping Hands",
        body: `Hi ${booking.employee.name},\n\nThe booking for ${booking.service.name} on ${booking.date.toLocaleDateString()} at ${booking.timeSlot} has been cancelled by the client.\n\nBest,\nHelping Hands Team`
      });
    }

    revalidatePath("/client/dashboard");
    revalidatePath(`/client/booking/${bookingId}`);
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return { error: "Failed to cancel booking" };
  }
}
