import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  addNotification: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              pointer-events-auto min-w-[300px] max-w-md p-4 rounded-lg shadow-lg border flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-right
              ${
                notification.type === 'success' ? 'bg-white border-green-200 text-green-800' :
                notification.type === 'error' ? 'bg-white border-red-200 text-red-800' :
                'bg-white border-blue-200 text-blue-800'
              }
            `}
          >
            <div className="shrink-0 mt-0.5">
              {notification.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
              {notification.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
              {notification.type === 'info' && <Info size={20} className="text-blue-500" />}
            </div>
            <div className="flex-1 text-sm font-medium">{notification.message}</div>
            <button 
              onClick={() => removeNotification(notification.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
