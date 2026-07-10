"use client";

import { useState } from "react";
import { markNotificationAsRead, deleteNotification, clearAllNotifications } from "@/actions/admin-notifications";
import { Bell, Eye, Trash2, X, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  employeeId: string;
  message: string;
  diff: any;
  isRead: boolean;
  createdAt: Date;
  employee: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  const handleViewChanges = async (notif: Notification) => {
    setSelectedNotif(notif);
    if (!notif.isRead) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      await markNotificationAsRead(notif.id);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    await deleteNotification(id);
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
      await clearAllNotifications();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Stay updated on employee profile changes.</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="px-4 py-2 bg-white border border-gray-200 text-red-600 rounded-xl hover:bg-red-50 text-sm font-medium transition-colors self-start"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Bell className="w-12 h-12 text-gray-300 mb-3" />
            <p>You have no notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(notif => (
              <div 
                key={notif.id}
                className={`p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-colors ${notif.isRead ? 'bg-white' : 'bg-blue-50/50'}`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-blue-600'}`}></div>
                  <div>
                    <p className={`text-sm ${notif.isRead ? 'text-gray-700' : 'font-bold text-gray-900'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-medium">
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <Link href={`/admin/employees`} className="hover:text-black hover:underline transition-colors">
                        View Employee
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto ml-6 sm:ml-0">
                  <button 
                    onClick={() => handleViewChanges(notif)}
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Changes
                  </button>
                  <button 
                    onClick={(e) => handleDelete(notif.id, e)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Changes Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Profile Changes</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedNotif.employee.name} ({selectedNotif.employee.email})</p>
              </div>
              <button 
                onClick={() => setSelectedNotif(null)}
                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {selectedNotif.diff && Object.keys(selectedNotif.diff).map(key => {
                  const change = selectedNotif.diff[key];
                  return (
                    <div key={key} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{key === 'photoUrl' ? 'Profile Photo' : key}</h4>
                      
                      {key === 'photoUrl' ? (
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 bg-red-100 text-red-700 px-2 py-1 rounded">PREVIOUS</span>
                            {change.old && change.old !== 'None' ? (
                              <img src={change.old} alt="Old" className="w-20 h-20 object-cover rounded-full border-2 border-gray-200 opacity-70 grayscale" />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-xs text-gray-500">None</div>
                            )}
                          </div>
                          
                          <div className="text-gray-400 text-xl font-black">→</div>
                          
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">NEW</span>
                            {change.new && change.new !== 'None' ? (
                              <img src={change.new} alt="New" className="w-20 h-20 object-cover rounded-full border-2 border-green-500 shadow-md" />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-xs text-gray-500">None</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-4">
                            <div className="w-24 shrink-0 text-xs font-bold text-red-600 pt-1 text-right">PREVIOUS:</div>
                            <div className="flex-1 text-sm bg-red-50 text-red-900 p-3 rounded-lg border border-red-100 line-through opacity-70">
                              {change.old}
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="w-24 shrink-0 text-xs font-bold text-green-700 pt-1 text-right">NEW:</div>
                            <div className="flex-1 text-sm bg-green-50 text-green-900 p-3 rounded-lg border border-green-200 shadow-sm font-medium">
                              {change.new}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
