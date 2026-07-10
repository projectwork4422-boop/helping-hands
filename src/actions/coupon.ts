"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createCoupon(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const discountType = formData.get("discountType") as "PERCENTAGE" | "FIXED";
    const discountValue = parseFloat(formData.get("discountValue") as string) || 0;
    const minBookingAmountStr = formData.get("minBookingAmount") as string;
    const minBookingAmount = minBookingAmountStr ? parseFloat(minBookingAmountStr) : null;
    const maxDiscountAmountStr = formData.get("maxDiscountAmount") as string;
    const maxDiscountAmount = maxDiscountAmountStr ? parseFloat(maxDiscountAmountStr) : null;
    const usageLimitPerClientStr = formData.get("usageLimitPerClient") as string;
    const usageLimitPerClient = usageLimitPerClientStr ? parseInt(usageLimitPerClientStr, 10) : null;
    const totalUsageLimitStr = formData.get("totalUsageLimit") as string;
    const totalUsageLimit = totalUsageLimitStr ? parseInt(totalUsageLimitStr, 10) : null;
    const startDate = new Date(formData.get("startDate") as string);
    const expiryDate = new Date(formData.get("expiryDate") as string);
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";
    const description = formData.get("description") as string || null;

    if (!name || !discountType || discountValue <= 0) {
      return { error: "Missing required fields or invalid discount value." };
    }

    if (isNaN(startDate.getTime()) || isNaN(expiryDate.getTime())) {
      return { error: "Invalid start or expiry date." };
    }

    if (startDate >= expiryDate) {
      return { error: "Start date must be before expiry date." };
    }

    await prisma.coupon.create({
      data: {
        name,
        discountType,
        discountValue,
        minBookingAmount,
        maxDiscountAmount,
        usageLimitPerClient,
        totalUsageLimit,
        startDate,
        expiryDate,
        isActive,
        description,
      }
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    console.error("CREATE COUPON ERROR:", error);
    return { error: error.message || "Failed to create coupon" };
  }
}

export async function updateCoupon(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const discountType = formData.get("discountType") as "PERCENTAGE" | "FIXED";
    const discountValue = parseFloat(formData.get("discountValue") as string) || 0;
    const minBookingAmountStr = formData.get("minBookingAmount") as string;
    const minBookingAmount = minBookingAmountStr ? parseFloat(minBookingAmountStr) : null;
    const maxDiscountAmountStr = formData.get("maxDiscountAmount") as string;
    const maxDiscountAmount = maxDiscountAmountStr ? parseFloat(maxDiscountAmountStr) : null;
    const usageLimitPerClientStr = formData.get("usageLimitPerClient") as string;
    const usageLimitPerClient = usageLimitPerClientStr ? parseInt(usageLimitPerClientStr, 10) : null;
    const totalUsageLimitStr = formData.get("totalUsageLimit") as string;
    const totalUsageLimit = totalUsageLimitStr ? parseInt(totalUsageLimitStr, 10) : null;
    const startDate = new Date(formData.get("startDate") as string);
    const expiryDate = new Date(formData.get("expiryDate") as string);
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";
    const description = formData.get("description") as string || null;

    if (!name || !discountType || discountValue <= 0) {
      return { error: "Missing required fields or invalid discount value." };
    }

    if (!name || !discountType || discountValue <= 0) {
      return { error: "Missing required fields or invalid discount value." };
    }

    await prisma.coupon.update({
      where: { id },
      data: {
        name,
        discountType,
        discountValue,
        minBookingAmount,
        maxDiscountAmount,
        usageLimitPerClient,
        totalUsageLimit,
        startDate,
        expiryDate,
        isActive,
        description,
      }
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    console.error("UPDATE COUPON ERROR:", error);
    return { error: error.message || "Failed to update coupon" };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete coupon. It may be linked to existing bookings." };
  }
}

export async function toggleCouponStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.coupon.update({
      where: { id },
      data: { isActive: !currentStatus }
    });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    return { error: "Failed to toggle status" };
  }
}

export async function validateCoupon(couponId: string, bookingAmount: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { error: "You must be logged in to apply a coupon." };
    }
    const clientId = session.user.id;

    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });

    if (!coupon) {
      return { error: "Invalid coupon." };
    }

    if (!coupon.isActive) {
      return { error: "This coupon is no longer active." };
    }

    const now = new Date();
    if (now < coupon.startDate) {
      return { error: "This coupon is not valid yet." };
    }
    
    // Set expiry date to the end of the day to ensure it's valid throughout the entire expiry day
    const expiryDateEnd = new Date(coupon.expiryDate);
    expiryDateEnd.setUTCHours(23, 59, 59, 999);
    
    if (now > expiryDateEnd) {
      return { error: "This coupon has expired." };
    }

    if (coupon.minBookingAmount && bookingAmount < coupon.minBookingAmount) {
      return { error: `Minimum booking amount of $${coupon.minBookingAmount} required.` };
    }

    if (coupon.totalUsageLimit && coupon.currentUsageCount >= coupon.totalUsageLimit) {
      return { error: "This coupon has reached its usage limit." };
    }

    if (coupon.usageLimitPerClient) {
      const clientUsage = await prisma.booking.count({
        where: {
          clientId,
          couponId: coupon.id,
          status: { not: "CANCELLED" }
        }
      });
      if (clientUsage >= coupon.usageLimitPerClient) {
        return { error: "You have reached the maximum usage limit for this coupon." };
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === "FIXED") {
      discountAmount = Math.min(coupon.discountValue, bookingAmount);
    } else { // PERCENTAGE
      discountAmount = bookingAmount * (coupon.discountValue / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    }

    return { 
      success: true, 
      coupon: {
        id: coupon.id,
        name: coupon.name,
        discountAmount: discountAmount
      }
    };

  } catch (error: any) {
    console.error("VALIDATE COUPON ERROR:", error);
    return { error: "An error occurred while validating the coupon." };
  }
}

export async function getAvailableCoupons() {
  try {
    const now = new Date();
    
    // We want coupons that are active, have started, and haven't expired
    // We adjust expiry to the end of the day just like in validateCoupon
    
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
      },
      orderBy: { createdAt: "desc" }
    });

    // Filter out expired ones using the 23:59:59 logic
    const validCoupons = coupons.filter((coupon) => {
      const expiryDateEnd = new Date(coupon.expiryDate);
      expiryDateEnd.setUTCHours(23, 59, 59, 999);
      return now <= expiryDateEnd;
    });

    return { success: true, coupons: validCoupons };
  } catch (error: any) {
    console.error("GET AVAILABLE COUPONS ERROR:", error);
    return { error: "Failed to fetch available coupons" };
  }
}
