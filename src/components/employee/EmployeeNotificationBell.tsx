import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Bell } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function EmployeeNotificationBell() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "EMPLOYEE") {
    return null;
  }

  const unreadCount = await prisma.employeeNotification.count({
    where: { 
      employeeId: session.user.id,
      isRead: false 
    }
  });

  return (
    <Link 
      href="/employee/notifications" 
      className="relative p-2 sm:p-2.5 text-gray-500 hover:text-black bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-black/5 flex items-center justify-center"
    >
      <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[20px] sm:h-[20px] bg-red-500 text-white text-[8px] sm:text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
