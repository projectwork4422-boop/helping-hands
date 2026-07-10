"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import path from "path";

export async function registerClient(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Missing required fields" };
  }

  try {
    const existingUser = await prisma.user.findFirst({ 
      where: { 
        email, 
        role: "CLIENT" 
      } 
    });
    if (existingUser) {
      return { error: "A client account with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "CLIENT",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error registering client:", error);
    return { error: "Something went wrong" };
  }
}

export async function registerEmployee(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const gender = formData.get("gender") as string;
  const dob = formData.get("dob") as string;
  const address = formData.get("address") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const services = formData.getAll("services") as string[];
  
  // File uploads would be handled here. We are mocking the URL.
  const aadhaarFile = formData.get("aadhaar") as File | null;
  const photoFile = formData.get("photo") as File | null;

  if (!name || !email || !password) {
    return { error: "Missing required fields" };
  }

  try {
    const existingUser = await prisma.user.findFirst({ 
      where: { 
        email, 
        role: "EMPLOYEE" 
      } 
    });
    if (existingUser) {
      return { error: "An employee account with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "EMPLOYEE",
      },
    });

    let aadhaarFrontUrl = null;
    let photoUrl = null;

    const fs = require("fs");
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (aadhaarFile && typeof aadhaarFile === "object" && "arrayBuffer" in aadhaarFile && aadhaarFile.name) {
      const buffer = Buffer.from(await aadhaarFile.arrayBuffer());
      if (buffer.length > 0) {
        const safeName = aadhaarFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `aadhaar-${Date.now()}-${safeName}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);
        aadhaarFrontUrl = `/uploads/${filename}`;
      }
    }

    if (photoFile && typeof photoFile === "object" && "arrayBuffer" in photoFile && photoFile.name) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      if (buffer.length > 0) {
        const safeName = photoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `photo-${Date.now()}-${safeName}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);
        photoUrl = `/uploads/${filename}`;
      }
    }

    await prisma.employeeProfile.create({
      data: {
        userId: user.id,
        gender,
        dob: dob ? new Date(dob) : null,
        address,
        aadhaarFrontUrl,
        photoUrl,
        services, // Save the selected services
        status: "PENDING",
      },
    });

    // Trigger Notification
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: email,
      subject: "Welcome to Helping Hands - Registration Submitted",
      body: `Hi ${name},\n\nYour registration as a professional has been successfully submitted. Our admin team will review your details (including uploaded documents) and notify you once your profile is approved.\n\nBest,\nHelping Hands Team`
    });

    revalidatePath("/admin", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Error registering employee:", error);
    return { error: error instanceof Error ? error.message : "Something went wrong" };
  }
}
