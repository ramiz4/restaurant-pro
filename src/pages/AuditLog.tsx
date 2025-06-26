import { RestaurantLayout } from "@/components/restaurant/RestaurantLayout";
import { useAuditLog } from "@/contexts/AuditLogContext";

export default function AuditLog() {
  const { logs } = useAuditLog();

  return (
    <RestaurantLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        {logs.length === 0 ? (
          <p>No actions recorded.</p>
        ) : (
          <ul className="space-y-2">
            {logs
              .slice()
              .reverse()
              .map((log, idx) => (
                <li key={idx} className="border rounded-md p-2">
                  <div className="font-medium">{log.action}</div>
                  <div className="text-sm text-gray-500">
                    {log.user} - {new Date(log.timestamp).toLocaleString()}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </RestaurantLayout>
  );
}
