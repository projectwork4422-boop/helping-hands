"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markEmployeeNotificationAsRead(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYEE") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.employeeNotification.update({
      where: { 
        id,
        employeeId: session.user.id
      },
      data: { isRead: true }
    });

    revalidatePath("/employee/dashboard");
    revalidatePath("/employee/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error marking employee notification as read:", error);
    return { success: false, error: "Failed to update notification." };
  }
}
