"use client";

import { useState } from "react";
import { markEmployeeNotificationAsRead } from "@/actions/employee-notifications";
import { Bell, Briefcase, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type EmployeeNotification = {
  id: string;
  employeeId: string;
  bookingId: string | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

export default function EmployeeNotificationsClient({ initialNotifications }: { initialNotifications: EmployeeNotification[] }) {
  const [notifications, setNotifications] = useState<EmployeeNotification[]>(initialNotifications);
  const router = useRouter();

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markEmployeeNotificationAsRead(id);
  };

  const handleViewDetails = async (notif: EmployeeNotification) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id);
    }
    router.push("/employee/dashboard");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <Bell className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">All caught up!</h3>
            <p>You have no notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(notif => (
              <div 
                key={notif.id}
                className={`p-6 transition-colors ${notif.isRead ? 'bg-white' : 'bg-blue-50/30'}`}
              >
                <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-blue-600'}`}></div>
                    <div>
                      <h4 className={`text-lg ${notif.isRead ? 'font-medium text-gray-800' : 'font-bold text-gray-900'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-gray-600 whitespace-pre-line mt-2 text-sm leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-3 font-medium">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 self-end sm:self-auto mt-4 sm:mt-0 ml-6 sm:ml-0">
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-600" /> Mark as Read
                      </button>
                    )}
                    <button 
                      onClick={() => handleViewDetails(notif)}
                      className="px-6 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md shadow-black/10 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
