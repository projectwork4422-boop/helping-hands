import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, isActive } = await req.json();

    if (name) {
      const existing = await prisma.district.findUnique({
        where: { name: name.trim() }
      });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "A district with this name already exists" }, { status: 400 });
      }
    }

    const district = await prisma.district.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ district });
  } catch (error) {
    console.error("Error updating district:", error);
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

    await prisma.district.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting district:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
