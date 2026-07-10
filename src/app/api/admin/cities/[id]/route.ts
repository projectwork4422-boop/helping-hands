import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, isActive } = await req.json();

    const existingCity = await prisma.city.findUnique({ where: { id } });
    if (!existingCity) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    if (name && name.trim() !== existingCity.name) {
      const duplicate = await prisma.city.findUnique({
        where: {
          name_townId: {
            name: name.trim(),
            townId: existingCity.townId
          }
        }
      });
      if (duplicate) {
        return NextResponse.json({ error: "A city with this name already exists in this town" }, { status: 400 });
      }
    }

    const updated = await prisma.city.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(isActive !== undefined && { isActive }),
      }
    });

    return NextResponse.json({ city: updated });
  } catch (error) {
    console.error("Error updating city:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.city.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting city:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
