import { useEffect, useRef, useState } from "react";

import { Edit, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";
import { clamp, cn, pointsWithinDistance } from "@/lib/utils";

import { PermissionGuard } from "./PermissionGuard";

interface Position {
  x: number;
  y: number;
}

const TABLE_SIZE = 96;

export function TableLayoutView() {
  const [tables, setTables] = useState<Table[]>([]);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const dragStartRef = useRef<Position | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({ number: "", capacity: "" });

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

  const handlePointerDown =
    (id: string) => (e: React.PointerEvent<HTMLDivElement>) => {
      // Ignore drag start when interacting with a button inside the table
      if ((e.target as HTMLElement).closest("button")) return;
      const container =
        (e.currentTarget.parentElement as HTMLDivElement) ?? null;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - (positions[id]?.x ?? 0);
      const offsetY = e.clientY - rect.top - (positions[id]?.y ?? 0);
      setDragOffset({ x: offsetX, y: offsetY });
      dragStartRef.current = positions[id];
      setDragging(id);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const rawX = e.clientX - rect.left - dragOffset.x;
    const rawY = e.clientY - rect.top - dragOffset.y;
    const maxX = rect.width - TABLE_SIZE;
    const maxY = rect.height - TABLE_SIZE;
    const x = clamp(rawX, 0, maxX);
    const y = clamp(rawY, 0, maxY);
    setPositions((prev) => ({ ...prev, [dragging]: { x, y } }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      const currentPos = positions[dragging];
      const overlap = Object.entries(positions).some(([otherId, pos]) => {
        if (otherId === dragging) return false;
        return pointsWithinDistance(
          { x: pos.x + TABLE_SIZE / 2, y: pos.y + TABLE_SIZE / 2 },
          {
            x: currentPos.x + TABLE_SIZE / 2,
            y: currentPos.y + TABLE_SIZE / 2,
          },
          TABLE_SIZE,
        );
      });
      if (overlap && dragStartRef.current) {
        setPositions((prev) => ({
          ...prev,
          [dragging]: dragStartRef.current!,
        }));
      }
    }
    setDragging(null);
  };

  const openAddDialog = () => {
    setFormData({ number: "", capacity: "" });
    setEditingTable(null);
    setDialogOpen(true);
  };

  const openEditDialog = (table: Table) => {
    setFormData({
      number: String(table.number),
      capacity: String(table.capacity),
    });
    setEditingTable(table);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      number: parseInt(formData.number),
      capacity: parseInt(formData.capacity),
      status: "available" as const,
    };
    try {
      if (editingTable) {
        const updated = await RestaurantService.updateTable(
          editingTable.id,
          data,
        );
        setTables((prev) =>
          prev.map((t) => (t.id === editingTable.id ? updated : t)),
        );
      } else {
        const newTable = await RestaurantService.createTable(data);
        setTables((prev) => [...prev, newTable]);
        setPositions((prev) => ({ ...prev, [newTable.id]: { x: 0, y: 0 } }));
      }
    } catch (error) {
      console.error("Failed to save table", error);
    } finally {
      setDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table?")) return;
    try {
      await RestaurantService.deleteTable(id);
      setTables((prev) => prev.filter((t) => t.id !== id));
      setPositions((prev) => {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error("Failed to delete table", error);
    }
  };

  const statusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "border-green-600 bg-green-50 dark:border-green-400 dark:bg-green-950/30";
      case "occupied":
        return "border-red-600 bg-red-50 dark:border-red-400 dark:bg-red-950/30";
      case "reserved":
        return "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30";
      case "cleaning":
        return "border-yellow-600 bg-yellow-50 dark:border-yellow-400 dark:bg-yellow-950/30";
      default:
        return "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <PermissionGuard page="tables" action="create">
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Table
          </Button>
        </PermissionGuard>
      </div>
      <div
        className="relative w-[600px] h-[600px] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {tables.map((t) => (
          <div
            key={t.id}
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
            <div className="absolute top-1 right-1 flex space-x-1">
              <PermissionGuard page="tables" action="edit">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => openEditDialog(t)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </PermissionGuard>
              <PermissionGuard page="tables" action="delete">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </PermissionGuard>
            </div>
            <span className="font-medium">Table {t.number}</span>
            <Badge variant="outline" className="text-xs capitalize mt-1">
              {t.status === "available" ? "open" : t.status}
            </Badge>
          </div>
        ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingTable ? "Edit Table" : "Add New Table"}
            </DialogTitle>
            <DialogDescription>
              {editingTable
                ? "Update the table details."
                : "Enter details for the new table."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="number">Table Number</Label>
                <Input
                  id="number"
                  type="number"
                  min="1"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, number: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, capacity: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTable ? "Update Table" : "Add Table"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
