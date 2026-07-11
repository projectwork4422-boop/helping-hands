import Link from "next/link";
import { LayoutDashboard, Users, Briefcase, CalendarCheck, Settings, UserPlus, Wrench, UserMinus, Tag, Ticket, MapPin, CreditCard, Globe } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import AdminHeader from "@/components/admin/AdminHeader";
import { Bell } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <span className="text-xl font-bold tracking-tight">Admin Portal</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" />
          <SidebarLink href="/admin/requests" icon={<UserPlus className="w-5 h-5" />} label="Requests" />
          <SidebarLink href="/admin/employees" icon={<Briefcase className="w-5 h-5" />} label="Employees" />
          <SidebarLink href="/admin/employees/suspended" icon={<UserMinus className="w-5 h-5" />} label="Suspended Employees" />
          <SidebarLink href="/admin/clients" icon={<Users className="w-5 h-5" />} label="Clients" />
          <SidebarLink href="/admin/categories" icon={<Tag className="w-5 h-5" />} label="Categories" />
          <SidebarLink href="/admin/services" icon={<Wrench className="w-5 h-5" />} label="Services" />
          <SidebarLink href="/admin/bookings" icon={<CalendarCheck className="w-5 h-5" />} label="Bookings" />
          <SidebarLink href="/admin/payments" icon={<CreditCard className="w-5 h-5" />} label="Payments" />
          <SidebarLink href="/admin/coupons" icon={<Ticket className="w-5 h-5" />} label="Coupons" />
          <SidebarLink href="/admin/districts" icon={<MapPin className="w-5 h-5" />} label="Location Access" />
          <SidebarLink href="/admin/notifications" icon={<Bell className="w-5 h-5" />} label="Notifications" />
          <SidebarLink href="/admin/landing-page" icon={<Globe className="w-5 h-5" />} label="Landing Page Update" />
          <SidebarLink href="/admin/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        <AdminHeader />
        
        <div className="p-6 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-black/70 hover:text-black hover:bg-gray-50 transition-colors font-medium"
    >
      {icon} {label}
    </Link>
  );
}
