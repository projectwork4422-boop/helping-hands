import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({ where: { role: 'CLIENT' }});
  const locations = await prisma.savedLocation.findMany({ where: { userId: users[0]?.id }});
  const activeHierarchy = await prisma.district.findMany({
    where: { isActive: true },
    include: {
      towns: {
        include: {
          cities: true
        }
      }
    }
  });
  return NextResponse.json({ locations, activeHierarchy });
}
