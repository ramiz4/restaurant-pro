import { useState } from "react";

import { RestaurantLayout } from "@/components/restaurant/RestaurantLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLog } from "@/contexts/AuditLogContext";

export default function AuditLog() {
  const { logs } = useAuditLog();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = Array.from(new Set(logs.map((l) => l.category)));

  const filteredLogs = logs.filter((log) => {
    const matchesCategory =
      selectedCategory === "all" || log.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchesTerm =
      log.action.toLowerCase().includes(term) ||
      log.user.toLowerCase().includes(term);
    return matchesCategory && matchesTerm;
  });

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "audit-log.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RestaurantLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Audit Log</h1>

        {logs.length > 0 && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:space-x-4">
            <div className="relative w-full md:w-auto">
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-[250px]"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExport}>Export</Button>
          </div>
        )}

        {filteredLogs.length === 0 ? (
          <p>No actions recorded.</p>
        ) : (
          <ul className="space-y-2">
            {filteredLogs
              .slice()
              .reverse()
              .map((log, idx) => (
                <li key={idx} className="border rounded-md p-2">
                  <div className="font-medium">{log.action}</div>
                  <div className="text-sm text-gray-500">
                    {log.user} - {new Date(log.timestamp).toLocaleString()} (
                    {log.category})
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </RestaurantLayout>
  );
}
