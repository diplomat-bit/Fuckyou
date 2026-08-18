import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// --- API Configuration ---
const API_BASE_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io';

// --- 1. Interfaces and Types ---

// Expanded severity types to handle both local UI messages and API alerts
export type NotificationSeverity = 'critical' | 'high' | 'medium' | 'low' | 'success' | 'error' | 'warning' | 'info' | 'default';

// Interface for notifications displayed in the UI
export interface Notification {
  id: string;
  title?: string;
  message: string;
  severity: NotificationSeverity;
  timestamp: Date;
  duration?: number; // in milliseconds, 0 for sticky
  actionableLink?: string;
}

// Interface for the raw data coming from the API endpoint /notifications/me
interface ApiNotification {
  id: string;
  type: string; // e.g., 'security', 'financial_insight'
  title: string;
  message: string;
  severity: string; // API severity: 'critical', 'high', 'medium', 'low'
  timestamp: string; // ISO date string
  read: boolean;
  actionableLink?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  // Allow severity to be optional for local calls, defaulting to 'default'
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'severity'> & { severity?: NotificationSeverity }) => void;
  removeNotification: (id: string) => void;
}

// --- API Helpers ---

const mapApiSeverity = (apiSeverity: string): NotificationSeverity => {
  switch (apiSeverity?.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
};

const mapApiToLocalNotification = (apiNotif: ApiNotification): Notification => {
  return {
    id: apiNotif.id,
    title: apiNotif.title || apiNotif.type,
    message: apiNotif.message,
    severity: mapApiSeverity(apiNotif.severity),
    timestamp: new Date(apiNotif.timestamp),
    duration: 10000, // API notifications are important, default 10s duration
    actionableLink: apiNotif.actionableLink,
  };
};

const fetchNotifications = async (): Promise<ApiNotification[]> => {
  try {
    // Fetch only unread notifications, limit 5, using the provided mock API
    const response = await fetch(`${API_BASE_URL}/notifications/me?status=unread&limit=5`);
    if (!response.ok) {
      console.error('Failed to fetch notifications:', response.statusText);
      return [];
    }
    const data: { data: ApiNotification[] } = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};


// --- 2. Notification Context ---

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// --- 3. Custom Hook for Notification Management ---

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// --- 4. Notification Provider Component ---

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationIdCounter = useRef(0); // Simple counter for unique local IDs
  // Set to track IDs of API notifications currently displayed to prevent re-adding on poll
  const activeApiNotificationIds = useRef(new Set<string>()); 

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'severity'> & { severity?: NotificationSeverity }) => {
    const newId = `local-notification-${notificationIdCounter.current++}`;
    const newNotification: Notification = {
      ...notification,
      id: newId,
      severity: notification.severity || 'default', // Default severity
      timestamp: new Date(),
      duration: notification.duration ?? 5000, // Default duration 5 seconds
    } as Notification;
    setNotifications((prev) => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    // If removing an API notification, remove its ID from the tracking set
    if (activeApiNotificationIds.current.has(id)) {
        activeApiNotificationIds.current.delete(id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Effect for API Polling (The "bad ass" feature)
  useEffect(() => {
    const syncNotifications = async () => {
        const apiNotifications = await fetchNotifications();

        setNotifications(prevNotifications => {
            const newNotifications: Notification[] = [];
            const updatedActiveIds = new Set(activeApiNotificationIds.current);

            // 1. Process new API notifications
            apiNotifications.forEach(apiNotif => {
                if (!updatedActiveIds.has(apiNotif.id)) {
                    const localNotif = mapApiToLocalNotification(apiNotif);
                    newNotifications.push(localNotif);
                    updatedActiveIds.add(apiNotif.id);
                }
            });

            activeApiNotificationIds.current = updatedActiveIds;

            // 2. Keep only local notifications and add new API ones
            // Local notifications start with 'local-notification-'
            const localOnly = prevNotifications.filter(n => n.id.startsWith('local-notification-'));

            // We combine local notifications with the newly fetched API notifications
            return [...localOnly, ...newNotifications];
        });
    };

    // Initial fetch and polling setup
    syncNotifications();
    const interval = setInterval(syncNotifications, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);


  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// --- 5. Individual Notification Toast Component ---

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const { id, severity, title, message, duration, actionableLink } = notification;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (duration && duration > 0) {
      timerRef.current = setTimeout(() => {
        onClose(id);
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [id, duration, onClose]);

  const getColors = (notificationSeverity: NotificationSeverity) => {
    switch (notificationSeverity) {
      case 'success':
        return 'bg-green-600/80 border-green-700';
      case 'error':
      case 'critical':
      case 'high':
        return 'bg-red-600/80 border-red-700';
      case 'warning':
      case 'medium':
        return 'bg-yellow-600/80 border-yellow-700';
      case 'info':
      case 'low':
        return 'bg-blue-600/80 border-blue-700';
      case 'default':
      default:
        return 'bg-gray-700/80 border-gray-800';
    }
  };

  const typeColors = getColors(severity);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`relative p-4 rounded-lg shadow-lg flex items-start gap-3 text-white backdrop-blur-sm border ${typeColors} pointer-events-auto`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex-grow">
        {title && <h3 className="font-semibold text-lg mb-1">{title}</h3>}
        <p className="text-sm">{message}</p>
        {actionableLink && (
            <a 
                href={actionableLink} 
                className="mt-2 inline-block text-xs font-medium underline hover:text-white/90"
                onClick={() => onClose(id)} // Close notification when link is clicked
            >
                View Details &rarr;
            </a>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="absolute top-2 right-2 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

// --- 6. Main Notification Center Component ---

export const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-[9999] w-full max-w-sm space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// --- Example Usage (for demonstration, typically in App.tsx or layout) ---
/*
import React from 'react';
import { NotificationProvider, NotificationCenter, useNotification } from './components/common/NotificationCenter';

const MyComponent = () => {
  const { addNotification } = useNotification();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">App Content</h1>
      <button
        onClick={() => addNotification({ severity: 'success', title: 'Local Success!', message: 'Your local operation was successful.', duration: 3000 })}
        className="bg-green-500 text-white px-4 py-2 rounded mr-2"
      >
        Show Local Success
      </button>
      <button
        onClick={() => addNotification({ severity: 'error', title: 'Local Error!', message: 'Something went wrong locally.', duration: 0 })}
        className="bg-red-500 text-white px-4 py-2 rounded mr-2"
      >
        Show Local Error (Sticky)
      </button>
      <button
        onClick={() => addNotification({ severity: 'info', message: 'Here is some local information for you.' })}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        Show Local Info
      </button>
      <button
        onClick={() => addNotification({ severity: 'warning', title: 'Local Warning!', message: 'This action might have consequences.', duration: 7000 })}
        className="bg-yellow-500 text-white px-4 py-2 rounded"
      >
        Show Local Warning
      </button>
      <p className="mt-4 text-sm text-gray-500">
        API notifications (e.g., security alerts, budget alerts) will appear automatically every 30 seconds if new unread items are available from the mock API.
      </p>
    </div>
  );
};

function App() {
  return (
    <NotificationProvider>
      <MyComponent />
      <NotificationCenter />
    </NotificationProvider>
  );
}

export default App;
*/