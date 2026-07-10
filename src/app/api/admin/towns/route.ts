import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, isActive, districtId } = await req.json();

    if (!name || !districtId) {
      return NextResponse.json({ error: "Town name and districtId are required" }, { status: 400 });
    }

    // Check if exists
    const existing = await prisma.town.findUnique({
      where: { 
        name_districtId: {
          name: name.trim(),
          districtId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "A town with this name already exists in this district" }, { status: 400 });
    }

    const town = await prisma.town.create({
      data: {
        name: name.trim(),
        districtId,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ town });
  } catch (error) {
    console.error("Error creating town:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
