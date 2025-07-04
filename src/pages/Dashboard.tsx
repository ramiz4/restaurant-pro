import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import { PermissionGuard } from "@/components/restaurant/PermissionGuard";
import { RestaurantLayout } from "@/components/restaurant/RestaurantLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { mockInventory, mockOrders } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";
import { cn } from "@/lib/utils";

interface DashboardStats {
  activeOrders: number;
  occupiedTables: number;
  totalTables: number;
  lowStockItems: number;
  todaySales: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  // Initialize pull-to-refresh for mobile devices
  const handleRefresh = async () => {
    try {
      const dashboardStats = await RestaurantService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error("Failed to refresh dashboard stats:", error);
    }
  };

  const pullToRefresh = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    disabled: !isMobile,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await RestaurantService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <RestaurantLayout>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </RestaurantLayout>
    );
  }

  const recentOrders = [...mockOrders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);
  const lowStockItems = mockInventory.filter(
    (item) => item.currentStock <= item.minStock,
  );

  const handleOrderClick = (orderId: string) => {
    // Navigate to orders page with search parameter to filter by order ID
    navigate(`/orders?search=${encodeURIComponent(orderId)}`);
  };

  const handleViewAllOrders = () => {
    navigate("/orders");
  };

  const handleNewOrder = () => {
    navigate("/orders");
  };

  const handleManageTables = () => {
    navigate("/tables");
  };

  const handleUpdateInventory = () => {
    navigate("/inventory");
  };

  const handleViewReports = () => {
    navigate("/reports");
  };

  const handleRestockLowItems = () => {
    // Navigate to inventory page with focus on low stock items
    navigate("/inventory");
  };

  const handleViewPendingOrders = () => {
    // Navigate to orders page with pending filter
    navigate("/orders");
  };

  return (
    <RestaurantLayout>
      <div
        className={cn(
          "space-y-4 lg:space-y-6 transition-transform duration-200",
          pullToRefresh.isPulling && "transform-gpu",
        )}
        style={{
          transform: pullToRefresh.isPulling
            ? `translateY(${Math.min(pullToRefresh.pullDistance * 0.5, 40)}px)`
            : undefined,
        }}
      >
        {/* Pull-to-refresh indicator */}
        {isMobile && pullToRefresh.isPulling && (
          <div className="flex justify-center pb-2">
            <div
              className={cn(
                "flex items-center space-x-2 text-sm text-muted-foreground transition-opacity",
                pullToRefresh.shouldRefresh ? "text-primary" : "",
              )}
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  pullToRefresh.isRefreshing && "animate-spin",
                  pullToRefresh.shouldRefresh && "rotate-180",
                )}
              />
              <span>
                {pullToRefresh.isRefreshing
                  ? "Refreshing..."
                  : pullToRefresh.shouldRefresh
                    ? "Release to refresh"
                    : "Pull to refresh"}
              </span>
            </div>
          </div>
        )}
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                ${stats?.todaySales.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {stats?.activeOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                Orders being processed
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Table Occupancy
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {stats?.occupiedTables}/{stats?.totalTables}
              </div>
              <Progress
                value={
                  ((stats?.occupiedTables || 0) / (stats?.totalTables || 1)) *
                  100
                }
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Stock Items
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {stats?.lowStockItems}
              </div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-2">
          {/* Recent Orders */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <CardDescription>
                  Latest orders from the kitchen
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllOrders}
                className="flex items-center space-x-1 w-full sm:w-auto"
              >
                <span>View All</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                    className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md group"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {order.status === "preparing" && (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        {order.status === "ready" && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {order.status === "pending" && (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        {order.status === "served" && (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                          {order.id}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Table {order.tableNumber} • {order.serverName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge
                        variant={
                          order.status === "preparing"
                            ? "default"
                            : order.status === "ready"
                              ? "secondary"
                              : order.status === "served"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        ${order.total.toFixed(2)}
                      </span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Inventory Alerts</span>
              </CardTitle>
              <CardDescription>Items running low on stock</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    All items are well stocked!
                  </p>
                ) : (
                  lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Current: {item.currentStock} {item.unit} (Min:{" "}
                          {item.minStock})
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Restock
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <PermissionGuard page="orders" action="create">
                <Button
                  className="h-20 flex-col space-y-2"
                  onClick={handleNewOrder}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>Manage Orders</span>
                </Button>
              </PermissionGuard>

              <PermissionGuard page="tables">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={handleManageTables}
                >
                  <Users className="h-6 w-6" />
                  <span>Manage Tables</span>
                </Button>
              </PermissionGuard>

              <PermissionGuard page="inventory" action="edit">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={handleUpdateInventory}
                >
                  <Package className="h-6 w-6" />
                  <span>Update Inventory</span>
                </Button>
              </PermissionGuard>

              <PermissionGuard page="reports">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={handleViewReports}
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>View Reports</span>
                </Button>
              </PermissionGuard>
            </div>

            {/* Contextual Quick Actions */}
            {(lowStockItems.length > 0 ||
              (stats?.activeOrders && stats.activeOrders > 0)) && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Urgent Actions
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {lowStockItems.length > 0 && (
                    <PermissionGuard page="inventory" action="restock">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRestockLowItems}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Restock {lowStockItems.length} Low Items</span>
                        </div>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </PermissionGuard>
                  )}

                  {stats?.activeOrders && stats.activeOrders > 0 && (
                    <PermissionGuard page="orders" action="view">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewPendingOrders}
                        className="flex items-center justify-between border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Check {stats.activeOrders} Active Orders</span>
                        </div>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </PermissionGuard>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RestaurantLayout>
  );
}
