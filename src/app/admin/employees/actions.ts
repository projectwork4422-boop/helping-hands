"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function suspendEmployee(id: string) {
  await prisma.employeeProfile.update({
    where: { id },
    data: { status: "SUSPENDED" }
  });
  revalidatePath("/admin/employees");
  revalidatePath("/admin/employees/suspended");
}
