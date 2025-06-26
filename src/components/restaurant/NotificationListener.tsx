import { useEffect } from "react";

import { useNotifications } from "@/contexts/NotificationContext";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";

export function NotificationListener() {
  const { notifications } = useNotifications();
  const { currentUser } = useUser();

  useEffect(() => {
    if (!currentUser || notifications.length === 0) return;
    const latest = notifications[notifications.length - 1];
    if (!latest.role || latest.role === currentUser.role) {
      toast({ title: latest.type, description: latest.message });
    }
  }, [notifications, currentUser]);

  return null;
}
