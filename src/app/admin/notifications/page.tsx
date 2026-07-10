import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NotificationsClient from "./NotificationsClient";

export default async function AdminNotificationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login/admin");
  }

  const notifications = await prisma.adminNotification.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return <NotificationsClient initialNotifications={notifications as any} />;
}
