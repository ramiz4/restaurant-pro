import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Notification {
  type: string;
  message: string;
  role?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  sendNotification: (n: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const evtSource = new EventSource("http://localhost:4001/events");

    evtSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setNotifications((prev) => [...prev, data]);
      } catch (error) {
        console.error("Failed to parse notification", error);
      }
    };

    return () => {
      evtSource.close();
    };
  }, []);

  const sendNotification = (n: Notification) => {
    fetch("http://localhost:4001/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n),
    }).catch((err) => console.error("Failed to send notification", err));
  };

  return (
    <NotificationContext.Provider value={{ notifications, sendNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  return ctx;
}
