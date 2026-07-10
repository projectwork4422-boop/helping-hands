import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const locations = await prisma.savedLocation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ locations, userId: session.user.id });
  } catch (error) {
    console.error("Error fetching saved locations:", error);
    return NextResponse.json({ error: "Failed to fetch saved locations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { label, address, district, town, city, phone } = await req.json();

    if (!label || !address || !district || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Phone number must be exactly 10 digits" }, { status: 400 });
    }

    if (!town && !city) {
      return NextResponse.json({ error: "Please select either a Town or a City" }, { status: 400 });
    }

    // Check location count
    const count = await prisma.savedLocation.count({
      where: { userId: session.user.id }
    });

    if (count >= 4) {
      return NextResponse.json({ error: "Maximum of 4 saved locations allowed." }, { status: 400 });
    }

    const newLocation = await prisma.savedLocation.create({
      data: {
        userId: session.user.id,
        label,
        address,
        district,
        town,
        city,
        phone
      },
    });

    return NextResponse.json({ location: newLocation }, { status: 201 });
  } catch (error) {
    console.error("Error creating saved location:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create saved location";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
