"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveEmployee(profileId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const profile = await prisma.employeeProfile.update({
      where: { id: profileId },
      data: { status: "APPROVED" },
      include: { user: true }
    });
    
    // Trigger Notification
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: profile.user.email,
      subject: "Profile Approved - Helping Hands",
      body: `Hi ${profile.user.name},\n\nGreat news! Your professional profile on Helping Hands has been approved. You can now log in and start receiving job assignments.\n\nBest,\nHelping Hands Team`
    });

    revalidatePath("/admin");
    revalidatePath("/admin/employees");
    revalidatePath("/admin/requests");
    return { success: true };
  } catch (error) {
    return { error: "Failed to approve employee" };
  }
}

export async function rejectEmployee(profileId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const profile = await prisma.employeeProfile.update({
      where: { id: profileId },
      data: { status: "REJECTED" },
      include: { user: true }
    });
    
    // Trigger Notification
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: profile.user.email,
      subject: "Profile Update - Helping Hands",
      body: `Hi ${profile.user.name},\n\nUnfortunately, your professional profile on Helping Hands has been rejected or suspended.\n\nBest,\nHelping Hands Team`
    });

    revalidatePath("/admin");
    revalidatePath("/admin/employees");
    revalidatePath("/admin/requests");
    return { success: true };
  } catch (error) {
    return { error: "Failed to reject employee" };
  }
}
export async function assignJob(bookingId: string, employeeId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        employeeId,
        status: "ASSIGNED",
      },
      include: { employee: true, client: true, service: true }
    });
    
    // Trigger Notification to Employee
    const { sendEmail } = await import("@/lib/email");
    if (booking.employee) {
      await sendEmail({
        to: booking.employee.email,
        subject: "New Job Assigned - Helping Hands",
        body: `Hi ${booking.employee.name},\n\nYou have been assigned a new job for ${booking.service.name}.\nClient: ${booking.client.name}\nDate: ${booking.date.toDateString()}\nTime: ${booking.timeSlot}\nLocation: ${booking.address}\n\nPlease check your dashboard for details.\n\nBest,\nHelping Hands Team`
      });

      // Create in-app notification for the employee
      await prisma.employeeNotification.create({
        data: {
          employeeId: booking.employeeId!,
          bookingId: booking.id,
          title: "New Service Assigned",
          message: `A new service has been assigned to you.
Client: ${booking.client.name}
Service: ${booking.service.name}
Booking ID: ${booking.id}
Location: ${booking.address}
Date & Time: ${booking.date.toLocaleDateString("en-US")} at ${booking.timeSlot}`
        }
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error) {
    return { error: "Failed to assign job" };
  }
}
