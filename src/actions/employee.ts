"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function updateEmployeeProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYEE") {
      return { success: false, error: "Unauthorized" };
    }

    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const photoUrl = formData.get("photoUrl") as string | null;
    const services = formData.getAll("services") as string[];

    if (!phone) {
      return { success: false, error: "Phone number is required." };
    }

    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      return { success: false, error: "Phone number must be exactly 10 digits." };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employeeProfile: true }
    });

    if (!currentUser || !currentUser.employeeProfile) {
      return { success: false, error: "User not found" };
    }

    const diff: any = {};
    if (currentUser.phone !== phone) {
      diff.phone = { old: currentUser.phone || "None", new: phone };
    }
    if (currentUser.employeeProfile.address !== (address || null)) {
      diff.address = { old: currentUser.employeeProfile.address || "None", new: address || "None" };
    }
    
    const oldServices = [...currentUser.employeeProfile.services].sort();
    const newServices = [...services].sort();
    if (JSON.stringify(oldServices) !== JSON.stringify(newServices)) {
      diff.services = { old: oldServices.join(', ') || "None", new: newServices.join(', ') || "None" };
    }

    if (photoUrl && currentUser.employeeProfile.photoUrl !== photoUrl) {
      diff.photoUrl = { old: currentUser.employeeProfile.photoUrl || "None", new: photoUrl };
    }

    const hasChanges = Object.keys(diff).length > 0;

    const txs: any[] = [
      prisma.user.update({
        where: { id: session.user.id },
        data: { phone }
      }),
      prisma.employeeProfile.update({
        where: { userId: session.user.id },
        data: { 
          address: address || null,
          services: services,
          ...(photoUrl ? { photoUrl } : {})
        }
      })
    ];

    if (hasChanges) {
      txs.push(
        prisma.adminNotification.create({
          data: {
            type: "PROFILE_UPDATE",
            employeeId: session.user.id,
            message: `Employee ${currentUser.name || 'Unknown'} has updated their profile.`,
            diff: diff
          }
        })
      );
    }

    await prisma.$transaction(txs);

    revalidatePath("/employee/profile");
    revalidatePath("/employee/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating employee profile:", error);
    return { success: false, error: "Failed to update profile. Please try again." };
  }
}

export async function updateEmployeePassword(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYEE") {
      return { success: false, error: "Unauthorized" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "All password fields are required." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New passwords do not match." };
    }

    if (newPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "User not found or using external provider." };
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, error: "Incorrect current password." };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash }
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, error: "Failed to update password. Please try again." };
  }
}
