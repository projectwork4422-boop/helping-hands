import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
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

    // Verify ownership
    const existing = await prisma.savedLocation.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Location not found or unauthorized" }, { status: 404 });
    }

    const updated = await prisma.savedLocation.update({
      where: { id },
      data: { label, address, district, town, city, phone },
    });

    return NextResponse.json({ location: updated });
  } catch (error) {
    console.error("Error updating saved location:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update saved location";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;

    // Verify ownership
    const existing = await prisma.savedLocation.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Location not found or unauthorized" }, { status: 404 });
    }

    await prisma.savedLocation.delete({ where: { id } });

    return NextResponse.json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting saved location:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete saved location";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
