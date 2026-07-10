import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const districts = await prisma.district.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ districts });
  } catch (error) {
    console.error("Error fetching districts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
