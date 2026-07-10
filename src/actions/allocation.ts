"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getQualifiedEmployees(serviceName: string, targetDateIso: string, targetTimeSlot: string, currentBookingId?: string) {
  try {
    const targetDate = new Date(targetDateIso);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23,59,59,999);

    const employees = await prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
        employeeProfile: {
          status: "APPROVED",
          services: {
            has: serviceName
          }
        }
      },
      select: {
        id: true,
        name: true,
        assignedJobs: {
          where: {
            id: currentBookingId ? { not: currentBookingId } : undefined,
            date: {
              gte: startOfDay,
              lte: endOfDay
            },
            timeSlot: targetTimeSlot,
            status: {
              notIn: ["COMPLETED", "CANCELLED"]
            }
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });
    
    return employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      isAvailable: emp.assignedJobs.length === 0
    }));
  } catch (error) {
    console.error("Error fetching qualified employees:", error);
    return [];
  }
}

export async function allocateEmployee(bookingId: string, employeeId: string) {
  try {
    const targetBooking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!targetBooking) return { error: "Booking not found" };

    const startOfDay = new Date(targetBooking.date);
    startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(targetBooking.date);
    endOfDay.setUTCHours(23,59,59,999);

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        employeeId: employeeId,
        date: { gte: startOfDay, lte: endOfDay },
        timeSlot: targetBooking.timeSlot,
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        id: { not: bookingId }
      }
    });

    if (conflictingBooking) {
      return { error: "Employee is already booked for this date and time." };
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        employeeId: employeeId,
        status: "ASSIGNED"
      },
      include: {
        employee: true,
        client: true,
        service: true
      }
    });

    // Send a notification email to the client if needed (optional)
    const { sendEmail } = await import("@/lib/email");
    if (booking.client.email && booking.employee) {
      await sendEmail({
        to: booking.client.email,
        subject: "Professional Assigned - Helping Hands",
        body: `Hi ${booking.client.name},\n\nWe have assigned ${booking.employee.name} to your ${booking.service.name} booking on ${new Date(booking.date).toLocaleDateString()} at ${booking.timeSlot}.\n\nBest,\nHelping Hands Team`
      });
    }

    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error) {
    console.error("Error allocating employee:", error);
    return { error: "Failed to allocate employee" };
  }
}
