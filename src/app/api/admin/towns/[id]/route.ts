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

    const existingTown = await prisma.town.findUnique({ where: { id } });
    if (!existingTown) {
      return NextResponse.json({ error: "Town not found" }, { status: 404 });
    }

    if (name && name.trim() !== existingTown.name) {
      const duplicate = await prisma.town.findUnique({
        where: {
          name_districtId: {
            name: name.trim(),
            districtId: existingTown.districtId
          }
        }
      });
      if (duplicate) {
        return NextResponse.json({ error: "A town with this name already exists in this district" }, { status: 400 });
      }
    }

    const updated = await prisma.town.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(isActive !== undefined && { isActive }),
      }
    });

    return NextResponse.json({ town: updated });
  } catch (error) {
    console.error("Error updating town:", error);
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

    await prisma.town.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting town:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
