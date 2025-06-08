import { useEffect, useState } from "react";

import { Calendar, CheckCircle, Sparkles, Users } from "lucide-react";

import { PermissionGuard } from "@/components/restaurant/PermissionGuard";
import { RestaurantLayout } from "@/components/restaurant/RestaurantLayout";
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

export default function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [statusFilter, setStatusFilter] = useState<Table["status"][]>([]);
  const [loading, setLoading] = useState(true);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
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

  const getStatusIcon = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "occupied":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "reserved":
        return <Calendar className="h-4 w-4 text-yellow-600" />;
      case "cleaning":
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "secondary" as const;
      case "occupied":
        return "default" as const;
      case "reserved":
        return "outline" as const;
      case "cleaning":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "border-green-200 bg-green-50 hover:bg-green-100";
      case "occupied":
        return "border-blue-200 bg-blue-50 hover:bg-blue-100";
      case "reserved":
        return "border-yellow-200 bg-yellow-50 hover:bg-yellow-100";
      case "cleaning":
        return "border-purple-200 bg-purple-50 hover:bg-purple-100";
      default:
        return "border-gray-200 bg-gray-50 hover:bg-gray-100";
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

          {/* Pull to Refresh Indicator */}
          {pullToRefresh.isPulling && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full transition-transform duration-200"
                  style={{
                    transform: `rotate(${pullToRefresh.progress * 360}deg)`,
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {pullToRefresh.shouldRefresh
                    ? "Release to refresh"
                    : "Pull to refresh"}
                </p>
              </div>
            </div>
          )}

          {pullToRefresh.isRefreshing && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-xs text-muted-foreground mt-2">
                  Refreshing tables...
                </p>
              </div>
            </div>
          )}

          {/* Status Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card
              className={cn(
                "cursor-pointer transition-colors border-2",
                statusFilter.includes("available")
                  ? "border-green-500 bg-green-50"
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
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      {statusStats.available}
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer transition-colors border-2",
                statusFilter.includes("occupied")
                  ? "border-blue-500 bg-blue-50"
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
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                      {statusStats.occupied}
                    </p>
                  </div>
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer transition-colors border-2",
                statusFilter.includes("reserved")
                  ? "border-yellow-500 bg-yellow-50"
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
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                      {statusStats.reserved}
                    </p>
                  </div>
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer transition-colors border-2",
                statusFilter.includes("cleaning")
                  ? "border-purple-500 bg-purple-50"
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
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">
                      {statusStats.cleaning}
                    </p>
                  </div>
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
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

            {filteredTables.map((table) => {
              // Touch gestures for mobile
              const tableGestures = useTouchGestures({
                onSwipeLeft: () => {
                  if (table.status === "available") {
                    handleStatusChange(table.id, "occupied");
                  } else if (table.status === "occupied") {
                    handleStatusChange(table.id, "cleaning");
                  }
                },
                onSwipeRight: () => {
                  if (table.status === "occupied") {
                    handleStatusChange(table.id, "available");
                  } else if (table.status === "cleaning") {
                    handleStatusChange(table.id, "available");
                  }
                },
                onLongPress: () => {
                  if (table.status === "available") {
                    handleReservation(table);
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
                  handleStatusChange(table.id, nextStatus);
                },
              });

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

                  <CardContent className="flex flex-col h-full p-3 sm:p-6">
                    <div className="flex-1 space-y-2 sm:space-y-3">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Capacity: {table.capacity} people
                      </div>
                      {table.reservedFor && (
                        <div className="text-xs sm:text-sm">
                          <span className="font-medium">Reserved for:</span>{" "}
                          {table.reservedFor}
                        </div>
                      )}
                      {table.currentOrder && (
                        <div className="text-xs sm:text-sm">
                          <span className="font-medium">Order:</span>{" "}
                          {table.currentOrder}
                        </div>
                      )}
                      {table.reservedAt && (
                        <div className="text-xs sm:text-sm">
                          <span className="font-medium">Reserved:</span>{" "}
                          {table.reservedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1 sm:gap-2 mt-3 sm:mt-4">
                      {table.status === "available" && (
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            className="flex-1 text-xs h-8 sm:h-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(table.id, "occupied");
                            }}
                          >
                            Seat Guests
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs h-8 sm:h-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReservation(table);
                            }}
                          >
                            Reserve
                          </Button>
                        </div>
                      )}

                      {table.status === "occupied" && (
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs h-8 sm:h-9"
                          >
                            View Order
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 text-xs h-8 sm:h-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(table.id, "cleaning");
                            }}
                          >
                            Clear Table
                          </Button>
                        </div>
                      )}

                      {table.status === "reserved" && (
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 sm:h-9"
                          >
                            View Reservation
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 text-xs h-8 sm:h-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(table.id, "available");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}

                      {table.status === "cleaning" && (
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            className="flex-1 text-xs h-8 sm:h-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(table.id, "occupied");
                            }}
                          >
                            Seat Guests
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs h-8 sm:h-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(table.id, "available");
                            }}
                          >
                            Mark Clean
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

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
