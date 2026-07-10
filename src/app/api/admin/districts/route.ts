import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "ALL"; // ALL, ACTIVE, INACTIVE

    const where: any = {
      name: { contains: search, mode: "insensitive" }
    };

    if (filter === "ACTIVE") {
      where.isActive = true;
    } else if (filter === "INACTIVE") {
      where.isActive = false;
    }

    const districts = await prisma.district.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        towns: {
          include: { cities: true },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    return NextResponse.json({ districts });
  } catch (error) {
    console.error("Error fetching districts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, isActive } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "District name is required" }, { status: 400 });
    }

    // Check if exists
    const existing = await prisma.district.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      return NextResponse.json({ error: "A district with this name already exists" }, { status: 400 });
    }

    const district = await prisma.district.create({
      data: {
        name: name.trim(),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ district });
  } catch (error) {
    console.error("Error creating district:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
