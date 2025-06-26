import { useEffect, useState } from "react";

import { CalendarCheck2, Plus } from "lucide-react";

import { PermissionGuard } from "@/components/restaurant/PermissionGuard";
import { RestaurantLayout } from "@/components/restaurant/RestaurantLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader as DialogHead,
  DialogTitle as DialogTit,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLog } from "@/contexts/AuditLogContext";
import { Shift, User } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";

export default function Schedule() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ userId: "", start: "", end: "" });
  const { recordAction } = useAuditLog();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shiftData, userData] = await Promise.all([
          RestaurantService.getShifts(),
          RestaurantService.getUsers(),
        ]);
        setShifts(shiftData);
        setUsers(userData.filter((u) => u.active));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addShift = async () => {
    const user = users.find((u) => u.id === formData.userId);
    if (!user) return;
    await RestaurantService.createShift({
      userId: user.id,
      role: user.role,
      start: new Date(formData.start),
      end: new Date(formData.end),
    });
    recordAction("Created shift", "schedule");
    setFormData({ userId: "", start: "", end: "" });
    setIsAddOpen(false);
    const data = await RestaurantService.getShifts();
    setShifts(data);
  };

  if (loading) {
    return (
      <RestaurantLayout>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </RestaurantLayout>
    );
  }

  return (
    <RestaurantLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6" /> Staff Schedule
          </h1>
          <PermissionGuard page="schedule" action="create">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Shift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHead>
                  <DialogTit>New Shift</DialogTit>
                </DialogHead>
                <div className="space-y-4 py-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Employee
                    </label>
                    <Select
                      value={formData.userId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, userId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.start}
                      onChange={(e) =>
                        setFormData({ ...formData, start: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.end}
                      onChange={(e) =>
                        setFormData({ ...formData, end: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addShift}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>
        <div className="grid gap-4">
          {shifts.map((shift) => {
            const user = users.find((u) => u.id === shift.userId);
            return (
              <Card
                key={shift.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle>{user ? user.name : shift.userId}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {new Date(shift.start).toLocaleString()} -{" "}
                    {new Date(shift.end).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </RestaurantLayout>
  );
}
