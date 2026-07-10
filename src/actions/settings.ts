"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPaymentSettings() {
  let settings = await prisma.paymentSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.paymentSettings.create({
      data: {
        adminShare: 30,
        employeeShare: 70
      }
    });
  }
  
  return settings;
}

export async function updatePaymentSettings(formData: FormData) {
  try {
    const adminShare = parseInt(formData.get("adminShare") as string);
    const employeeShare = parseInt(formData.get("employeeShare") as string);

    if (isNaN(adminShare) || isNaN(employeeShare)) {
      return { error: "Invalid share values provided." };
    }

    if (adminShare + employeeShare !== 100) {
      return { error: "Admin Share and Employee Share must total 100%." };
    }

    const settings = await prisma.paymentSettings.findFirst();

    if (settings) {
      await prisma.paymentSettings.update({
        where: { id: settings.id },
        data: { adminShare, employeeShare }
      });
    } else {
      await prisma.paymentSettings.create({
        data: { adminShare, employeeShare }
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    console.error("UPDATE PAYMENT SETTINGS ERROR:", error);
    return { error: "Failed to update payment settings." };
  }
}
