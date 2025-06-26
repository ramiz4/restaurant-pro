import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useUser } from "@/contexts/UserContext";

export interface AuditLogEntry {
  action: string;
  user: string;
  timestamp: string;
}

interface AuditLogContextType {
  logs: AuditLogEntry[];
  recordAction: (action: string) => void;
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(
  undefined,
);

export function AuditLogProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUser();
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => {
    const stored = localStorage.getItem("auditLogs");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("auditLogs", JSON.stringify(logs));
  }, [logs]);

  const recordAction = (action: string) => {
    if (!currentUser) return;
    const entry: AuditLogEntry = {
      action,
      user: currentUser.name,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [...prev, entry]);
  };

  return (
    <AuditLogContext.Provider value={{ logs, recordAction }}>
      {children}
    </AuditLogContext.Provider>
  );
}

export function useAuditLog() {
  const context = useContext(AuditLogContext);
  if (!context) {
    throw new Error("useAuditLog must be used within an AuditLogProvider");
  }
  return context;
}
