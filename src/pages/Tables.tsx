import { useEffect, useState } from "react";

import { Calendar, CheckCircle, Sparkles, Users } from "lucide-react";

import { PermissionGuard } from "@/components/restaurant/PermissionGuard";
import { RestaurantLayout } from "@/components/restaurant/RestaurantLayout";
import { TableLayoutView } from "@/components/restaurant/TableLayoutView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { Table } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";
import { cn } from "@/lib/utils";

// Separate component for each table card to avoid hooks in map
interface TableCardProps {
  table: Table;
  onStatusChange: (tableId: string, status: Table["status"]) => Promise<void>;
  onReservation: (table: Table) => void;
  onSelect: (table: Table) => void;
}

function TableCard({
  table,
  onStatusChange,
  onReservation,
  onSelect,
}: TableCardProps) {
  const isMobile = useIsMobile();

  // Touch gestures for mobile
  const tableGestures = useTouchGestures({
    onSwipeLeft: () => {
      if (table.status === "available") {
        onStatusChange(table.id, "occupied");
      } else if (table.status === "occupied") {
        onStatusChange(table.id, "cleaning");
      }
    },
    onSwipeRight: () => {
      if (table.status === "occupied") {
        onStatusChange(table.id, "available");
      } else if (table.status === "cleaning") {
        onStatusChange(table.id, "available");
      }
    },
    onLongPress: () => {
      if (table.status === "available") {
        onReservation(table);
      }
    },
    onDoubleTap: () => {
      // Quick status toggle
      const nextStatus: Table["status"] =
        table.status === "available"
          ? "occupied"
          : table.status === "occupied"
            ? "available"
            : table.status === "reserved"
              ? "occupied"
              : "available";
      onStatusChange(table.id, nextStatus);
    },
  });

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "border-emerald-500/30 bg-emerald-50/50 hover:bg-emerald-100/70 dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40";
      case "occupied":
        return "border-red-500/30 bg-red-50/50 hover:bg-red-100/70 dark:border-red-500/40 dark:bg-red-950/30 dark:hover:bg-red-900/40";
      case "reserved":
        return "border-blue-500/30 bg-blue-50/50 hover:bg-blue-100/70 dark:border-blue-500/40 dark:bg-blue-950/30 dark:hover:bg-blue-900/40";
      case "cleaning":
        return "border-yellow-500/30 bg-yellow-50/50 hover:bg-yellow-100/70 dark:border-yellow-500/40 dark:bg-yellow-950/30 dark:hover:bg-yellow-900/40";
      default:
        return "border-gray-300 dark:border-gray-600";
    }
  };

  const getStatusIcon = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return (
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        );
      case "occupied":
        return <Users className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case "reserved":
        return (
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        );
      case "cleaning":
        return (
          <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        );
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "default" as const;
      case "occupied":
        return "destructive" as const;
      case "reserved":
        return "secondary" as const;
      case "cleaning":
        return "outline" as const;
      default:
        return "default" as const;
    }
  };

  return (
    <Card
      key={table.id}
      className={cn(
        "transition-all duration-200 cursor-pointer border-2",
        getStatusColor(table.status),
        isMobile && "active:scale-95 touch-manipulation",
      )}
      {...(isMobile ? tableGestures : {})}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-semibold leading-tight">
            Table {table.number}
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-2">
            {getStatusIcon(table.status)}
            <Badge
              variant={getStatusBadgeVariant(table.status)}
              className="text-xs capitalize"
            >
              {table.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Capacity:</span>
            <span className="font-medium">{table.capacity} people</span>
          </div>
          {table.currentOrder && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-medium">{table.currentOrder}</span>
              </div>
            </div>
          )}
          {table.reservedFor && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reserved:</span>
                <span className="font-medium">{table.reservedFor}</span>
              </div>
              {table.reservedAt && (
                <div className="text-xs text-muted-foreground">
                  {table.reservedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          )}
          <div className="pt-2 sm:pt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onSelect(table)}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [statusFilter, setStatusFilter] = useState<Table["status"][]>([]);
  const [loading, setLoading] = useState(true);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reservationData, setReservationData] = useState({
    customerName: "",
    reservationTime: "",
    notes: "",
  });

  const isMobile = useIsMobile();

  // Pull to refresh functionality
  const refreshTables = async () => {
    setIsRefreshing(true);
    try {
      const data = await RestaurantService.getTables();
      setTables(data);
    } catch (error) {
      console.error("Failed to refresh tables:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const pullToRefresh = usePullToRefresh({
    onRefresh: refreshTables,
    disabled: !isMobile,
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

  const handleReservation = (table: Table) => {
    setSelectedTable(table);
    setIsReservationDialogOpen(true);
  };

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    setIsDetailsDialogOpen(true);
  };

  const submitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;

    try {
      await handleStatusChange(selectedTable.id, "reserved");
      setIsReservationDialogOpen(false);
      setReservationData({
        customerName: "",
        reservationTime: "",
        notes: "",
      });
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

  const filteredTables =
    statusFilter.length === 0
      ? tables
      : tables.filter((table) => statusFilter.includes(table.status));

  const toggleStatusFilter = (status: Table["status"]) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  if (loading) {
    return (
      <RestaurantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </RestaurantLayout>
    );
  }

  return (
    <RestaurantLayout>
      <PermissionGuard page="tables">
        {/* Changed from requiredRole to page prop */}
        <div
          className="space-y-4 sm:space-y-6"
          {...(isMobile ? pullToRefresh : {})}
          style={
            isMobile
              ? {
                  transform: `translateY(${pullToRefresh.progress * 60}px)`,
                  transition: pullToRefresh.isRefreshing
                    ? "transform 0.3s ease-out"
                    : "none",
                }
              : undefined
          }
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Table Management
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Monitor and manage restaurant tables
              </p>
            </div>
          </div>

          {/* Pull to refresh indicator */}
          {isMobile && pullToRefresh.progress > 0 && (
            <div className="flex justify-center pb-4">
              <div
                className={cn(
                  "flex items-center space-x-2 text-sm text-muted-foreground transition-all duration-200",
                  pullToRefresh.shouldRefresh && "text-primary",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 border-2 border-current border-t-transparent rounded-full",
                    (pullToRefresh.isRefreshing ||
                      pullToRefresh.shouldRefresh) &&
                      "animate-spin",
                  )}
                />
                <span>
                  {pullToRefresh.isRefreshing
                    ? "Refreshing tables..."
                    : pullToRefresh.shouldRefresh
                      ? "Release to refresh"
                      : "Pull to refresh"}
                </span>
              </div>
            </div>
          )}

          {/* Status Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card
              className={cn(
                "cursor-pointer transition-colors border-2",
                statusFilter.includes("available")
                  ? "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-950/30"
                  : "hover:bg-muted/50",
              )}
              onClick={() => toggleStatusFilter("available")}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Available
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      {statusStats.available}
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer transition-colors border-2",
                statusFilter.includes("occupied")
                  ? "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-950/30"
                  : "hover:bg-muted/50",
              )}
              onClick={() => toggleStatusFilter("occupied")}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Occupied
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                      {statusStats.occupied}
                    </p>
                  </div>
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer transition-colors border-2",
                statusFilter.includes("reserved")
                  ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
                  : "hover:bg-muted/50",
              )}
              onClick={() => toggleStatusFilter("reserved")}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Reserved
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {statusStats.reserved}
                    </p>
                  </div>
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer transition-colors border-2",
                statusFilter.includes("cleaning")
                  ? "border-yellow-500 bg-yellow-50 dark:border-yellow-400 dark:bg-yellow-950/30"
                  : "hover:bg-muted/50",
              )}
              onClick={() => toggleStatusFilter("cleaning")}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Cleaning
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {statusStats.cleaning}
                    </p>
                  </div>
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Filters */}
          {statusFilter.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">
                Showing {filteredTables.length} tables filtered by:{" "}
                {statusFilter.join(", ")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter([])}
                className="h-6 text-xs"
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Table Grid */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isRefreshing && (
              <div className="col-span-full flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {filteredTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onStatusChange={handleStatusChange}
                onReservation={handleReservation}
                onSelect={handleSelectTable}
              />
            ))}
          </div>

          <div className="pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Table Layout</h2>
            <TableLayoutView />
          </div>
        </div>

        {/* Table Details Dialog */}
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px] mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>Table {selectedTable?.number} Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Capacity:</span>
                <span className="font-medium">
                  {selectedTable?.capacity} people
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">
                  {selectedTable?.status}
                </span>
              </div>
              {selectedTable?.currentOrder && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Order:</span>
                  <span className="font-medium">
                    {selectedTable.currentOrder}
                  </span>
                </div>
              )}
              {selectedTable?.reservedFor && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reserved For:</span>
                  <span className="font-medium">
                    {selectedTable.reservedFor}
                  </span>
                </div>
              )}
              {selectedTable?.reservedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reserved At:</span>
                  <span className="font-medium">
                    {selectedTable.reservedAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailsDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reservation Dialog */}
        <Dialog
          open={isReservationDialogOpen}
          onOpenChange={setIsReservationDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px] mx-4 sm:mx-0">
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
                    placeholder="Special requests or notes"
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReservationDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Create Reservation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PermissionGuard>
    </RestaurantLayout>
  );
}
