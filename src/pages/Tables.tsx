import { useEffect, useState } from "react";
import { RestaurantLayout } from "@/components/restaurant/RestaurantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RestaurantService from "@/lib/restaurant-services";
import { Table } from "@/lib/mock-data";
import {
  Users,
  Clock,
  CheckCircle,
  Sparkles,
  Calendar,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);

  // Reservation form state
  const [reservationData, setReservationData] = useState({
    customerName: "",
    reservationTime: "",
    notes: "",
  });

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await RestaurantService.getTables();
        setTables(data);
      } catch (error) {
        console.error("Failed to fetch tables:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleStatusChange = async (
    tableId: string,
    newStatus: Table["status"],
  ) => {
    try {
      const updatedTable = await RestaurantService.updateTableStatus(
        tableId,
        newStatus,
      );
      setTables((prev) =>
        prev.map((table) => (table.id === tableId ? updatedTable : table)),
      );
    } catch (error) {
      console.error("Failed to update table status:", error);
    }
  };

  const getStatusIcon = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "occupied":
        return <Users className="h-5 w-5 text-blue-500" />;
      case "reserved":
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case "cleaning":
        return <Sparkles className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "secondary";
      case "occupied":
        return "default";
      case "reserved":
        return "outline";
      case "cleaning":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
      case "occupied":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
      case "reserved":
        return "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950";
      case "cleaning":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950";
      default:
        return "border-gray-200 dark:border-gray-800";
    }
  };

  const handleReservation = (table: Table) => {
    setSelectedTable(table);
    setIsReservationDialogOpen(true);
  };

  const submitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;

    try {
      // In a real app, you'd create a reservation record
      await handleStatusChange(selectedTable.id, "reserved");

      // Reset form
      setReservationData({
        customerName: "",
        reservationTime: "",
        notes: "",
      });
      setIsReservationDialogOpen(false);
      setSelectedTable(null);
    } catch (error) {
      console.error("Failed to create reservation:", error);
    }
  };

  const statusStats = {
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    cleaning: tables.filter((t) => t.status === "cleaning").length,
  };

  if (loading) {
    return (
      <RestaurantLayout>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg"
              ></div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </RestaurantLayout>
    );
  }

  return (
    <RestaurantLayout>
      <div className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{statusStats.available}</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{statusStats.occupied}</p>
                  <p className="text-sm text-muted-foreground">Occupied</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{statusStats.reserved}</p>
                  <p className="text-sm text-muted-foreground">Reserved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{statusStats.cleaning}</p>
                  <p className="text-sm text-muted-foreground">Cleaning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => (
            <Card
              key={table.id}
              className={cn(
                "overflow-hidden transition-all duration-200 hover:shadow-md min-w-0",
                getStatusColor(table.status),
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold leading-tight">
                    Table {table.number}
                  </CardTitle>
                  <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                    {getStatusIcon(table.status)}
                    <Badge
                      variant={getStatusBadgeVariant(table.status)}
                      className="text-xs"
                    >
                      {table.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <div className="space-y-3 flex-grow">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Capacity: {table.capacity} guests</span>
                  </div>

                  {table.currentOrder && (
                    <div className="text-sm">
                      <span className="font-medium">Current Order: </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {table.currentOrder}
                      </span>
                    </div>
                  )}

                  {table.reservedFor && (
                    <div className="text-sm">
                      <span className="font-medium">Reserved for: </span>
                      <span className="text-purple-600 dark:text-purple-400">
                        {table.reservedFor}
                      </span>
                      {table.reservedAt && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(table.reservedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons - Always at Bottom */}
                <div className="pt-4 mt-auto">
                  {table.status === "available" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={() => handleStatusChange(table.id, "occupied")}
                      >
                        Seat Guests
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleReservation(table)}
                      >
                        Reserve
                      </Button>
                    </div>
                  )}

                  {table.status === "occupied" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleStatusChange(table.id, "cleaning")}
                      >
                        Clear Table
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Order
                      </Button>
                    </div>
                  )}

                  {table.status === "cleaning" && (
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleStatusChange(table.id, "available")}
                    >
                      Mark Clean
                    </Button>
                  )}

                  {table.status === "reserved" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={() => handleStatusChange(table.id, "occupied")}
                      >
                        Check In
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() =>
                          handleStatusChange(table.id, "available")
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reservation Dialog */}
        <Dialog
          open={isReservationDialogOpen}
          onOpenChange={setIsReservationDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Make Reservation</DialogTitle>
              <DialogDescription>
                Create a reservation for Table {selectedTable?.number}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submitReservation}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={reservationData.customerName}
                    onChange={(e) =>
                      setReservationData((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reservationTime">Reservation Time</Label>
                  <Input
                    id="reservationTime"
                    type="datetime-local"
                    value={reservationData.reservationTime}
                    onChange={(e) =>
                      setReservationData((prev) => ({
                        ...prev,
                        reservationTime: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={reservationData.notes}
                    onChange={(e) =>
                      setReservationData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Special requests, dietary restrictions, etc."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReservationDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Reservation</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RestaurantLayout>
  );
}
