import { useEffect, useState } from "react";

import { PermissionGuard } from "@/components/restaurant/PermissionGuard";
import { RestaurantLayout } from "@/components/restaurant/RestaurantLayout";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";
import { cn } from "@/lib/utils";

interface Position {
  x: number;
  y: number;
}

export default function TableLayout() {
  const [tables, setTables] = useState<Table[]>([]);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const data = await RestaurantService.getTables();
      setTables(data);
      const initial: Record<string, Position> = {};
      data.forEach((t, i) => {
        initial[t.id] = { x: (i % 5) * 120, y: Math.floor(i / 5) * 120 };
      });
      setPositions(initial);
    };
    fetchData();
  }, []);

  const handleDragEnd = (id: string, e: React.DragEvent<HTMLDivElement>) => {
    const container = (e.currentTarget.parentElement as HTMLDivElement) ?? null;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - 50;
    const y = e.clientY - rect.top - 50;
    setPositions((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const handlePointerDown =
    (id: string) => (e: React.PointerEvent<HTMLDivElement>) => {
      const container =
        (e.currentTarget.parentElement as HTMLDivElement) ?? null;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - (positions[id]?.x ?? 0);
      const offsetY = e.clientY - rect.top - (positions[id]?.y ?? 0);
      setDragOffset({ x: offsetX, y: offsetY });
      setDragging(id);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    setPositions((prev) => ({ ...prev, [dragging]: { x, y } }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    }
    setDragging(null);
  };

  const statusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "border-green-600 bg-green-50";
      case "occupied":
        return "border-red-600 bg-red-50";
      case "reserved":
        return "border-blue-600 bg-blue-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  return (
    <RestaurantLayout>
      <PermissionGuard page="table-layout">
        <h1 className="text-2xl font-bold mb-4">Table Layout</h1>
        <div
          className="relative w-full h-[600px] rounded-md border bg-white dark:bg-gray-800"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {tables.map((t) => (
            <div
              key={t.id}
              draggable
              onDragEnd={(e) => handleDragEnd(t.id, e)}
              onPointerDown={handlePointerDown(t.id)}
              className={cn(
                "absolute w-24 h-24 flex flex-col items-center justify-center rounded-md border-2 cursor-move select-none",
                statusColor(t.status),
              )}
              style={{
                left: positions[t.id]?.x ?? 0,
                top: positions[t.id]?.y ?? 0,
              }}
            >
              <span className="font-medium">Table {t.number}</span>
              <Badge variant="outline" className="text-xs capitalize mt-1">
                {t.status === "available" ? "open" : t.status}
              </Badge>
            </div>
          ))}
        </div>
      </PermissionGuard>
    </RestaurantLayout>
  );
}
