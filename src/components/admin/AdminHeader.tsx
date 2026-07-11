import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Bell } from "lucide-react";
import AdminMobileSidebar from "./AdminMobileSidebar";

export default async function AdminHeader() {
  const unreadCount = await prisma.adminNotification.count({
    where: { isRead: false }
  });

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-8">
      <div className="flex items-center gap-3">
        <AdminMobileSidebar />
        <span className="text-xl font-bold tracking-tight md:hidden">Admin Portal</span>
      </div>
      <div className="hidden md:block"></div> {/* Spacer for desktop */}
      
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/notifications" 
          className="relative p-2.5 text-gray-500 hover:text-black bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Link>
      </div>
    </header>
  );
}
