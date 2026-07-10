"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const basePrice = parseFloat(formData.get("basePrice") as string) || 0;
    const iconUrl = formData.get("iconUrl") as string || null;
    const isActive = formData.get("isActive") === "on";
    const categoryId = formData.get("categoryId") as string || null;
    const estimatedTime = formData.get("estimatedTime") as string || null;
    const imagesRaw = formData.get("images") as string;
    const videosRaw = formData.get("videos") as string;
    
    let images: string[] = [];
    let videos: string[] = [];
    
    try {
      if (imagesRaw) images = JSON.parse(imagesRaw);
      if (videosRaw) videos = JSON.parse(videosRaw);
    } catch(e) {}

    if (!name) {
      return { error: "Service name is required" };
    }
    if (!categoryId) {
      return { error: "Category is required" };
    }

    await prisma.service.create({
      data: {
        name,
        description,
        basePrice,
        iconUrl,
        images,
        videos,
        isActive,
        estimatedTime,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
      }
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error: any) {
    console.error("CREATE SERVICE ERROR:", error);
    return { error: error.message || "Failed to create service" };
  }
}

export async function updateService(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const basePrice = parseFloat(formData.get("basePrice") as string) || 0;
    const iconUrl = formData.get("iconUrl") as string || null;
    const isActive = formData.get("isActive") === "on";
    const categoryId = formData.get("categoryId") as string || null;
    const estimatedTime = formData.get("estimatedTime") as string || null;
    const imagesRaw = formData.get("images") as string;
    const videosRaw = formData.get("videos") as string;
    
    let images: string[] = [];
    let videos: string[] = [];
    
    try {
      if (imagesRaw) images = JSON.parse(imagesRaw);
      if (videosRaw) videos = JSON.parse(videosRaw);
    } catch(e) {}

    if (!name) {
      return { error: "Service name is required" };
    }

    await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        basePrice,
        iconUrl,
        images,
        videos,
        isActive,
        estimatedTime,
        category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
      }
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error: any) {
    console.error("UPDATE SERVICE ERROR:", error);
    return { error: error.message || "Failed to update service" };
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.service.delete({
      where: { id }
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete service. It may be linked to existing bookings." };
  }
}

export async function toggleServiceStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.service.update({
      where: { id },
      data: { isActive: !currentStatus }
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    return { error: "Failed to toggle status" };
  }
}

export async function createServiceCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    if (!name) return { error: "Category name is required" };

    const newCategory = await prisma.serviceCategory.create({ data: { name } });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/services");
    return { success: true, category: newCategory };
  } catch (error: any) {
    return { error: error.message || "Failed to create category" };
  }
}

export async function updateServiceCategory(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    if (!name) return { error: "Category name is required" };

    await prisma.serviceCategory.update({ where: { id }, data: { name } });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to update category" };
  }
}

export async function deleteServiceCategory(id: string) {
  try {
    await prisma.serviceCategory.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to delete category. Ensure no services are linked." };
  }
}
