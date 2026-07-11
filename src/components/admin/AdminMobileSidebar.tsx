"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, X, LayoutDashboard, Users, Briefcase, CalendarCheck, 
  Settings, UserPlus, Wrench, UserMinus, Tag, Ticket, MapPin, CreditCard, Bell, Globe
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default function AdminMobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 z-[110] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <span className="text-xl font-bold tracking-tight">Admin Portal</span>
          <button 
            onClick={closeSidebar}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/requests" icon={<UserPlus className="w-5 h-5" />} label="Requests" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/employees" icon={<Briefcase className="w-5 h-5" />} label="Employees" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/employees/suspended" icon={<UserMinus className="w-5 h-5" />} label="Suspended Employees" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/clients" icon={<Users className="w-5 h-5" />} label="Clients" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/categories" icon={<Tag className="w-5 h-5" />} label="Categories" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/services" icon={<Wrench className="w-5 h-5" />} label="Services" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/bookings" icon={<CalendarCheck className="w-5 h-5" />} label="Bookings" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/payments" icon={<CreditCard className="w-5 h-5" />} label="Payments" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/coupons" icon={<Ticket className="w-5 h-5" />} label="Coupons" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/districts" icon={<MapPin className="w-5 h-5" />} label="Location Access" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/notifications" icon={<Bell className="w-5 h-5" />} label="Notifications" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/landing-page" icon={<Globe className="w-5 h-5" />} label="Landing Page Update" pathname={pathname} onClick={closeSidebar} />
          <SidebarLink href="/admin/settings" icon={<Settings className="w-5 h-5" />} label="Settings" pathname={pathname} onClick={closeSidebar} />
        </nav>
        
        <div className="p-4 border-t border-gray-100 shrink-0">
          <LogoutButton />
        </div>
      </div>
    </>
  );
}

function SidebarLink({ href, icon, label, pathname, onClick }: { href: string; icon: React.ReactNode; label: string; pathname: string; onClick: () => void }) {
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
  
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
        isActive 
          ? "bg-black text-white" 
          : "text-black/70 hover:text-black hover:bg-gray-50"
      }`}
    >
      {icon} {label}
    </Link>
  );
}
