"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.adminNotification.update({
      where: { id },
      data: { isRead: true }
    });

    revalidatePath("/admin");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to update notification." };
  }
}

export async function deleteNotification(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.adminNotification.delete({
      where: { id }
    });

    revalidatePath("/admin");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "Failed to delete notification." };
  }
}

export async function clearAllNotifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.adminNotification.deleteMany({});

    revalidatePath("/admin");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return { success: false, error: "Failed to clear notifications." };
  }
}
