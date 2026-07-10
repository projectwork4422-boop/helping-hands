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

    const { name, isActive, townId } = await req.json();

    if (!name || !townId) {
      return NextResponse.json({ error: "City name and townId are required" }, { status: 400 });
    }

    // Check if exists
    const existing = await prisma.city.findUnique({
      where: { 
        name_townId: {
          name: name.trim(),
          townId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "A city with this name already exists in this town" }, { status: 400 });
    }

    const city = await prisma.city.create({
      data: {
        name: name.trim(),
        townId,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ city });
  } catch (error) {
    console.error("Error creating city:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
