import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

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
import { mockInventory, mockOrders } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";

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

  return (
    <RestaurantLayout>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.todaySales.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeOrders}</div>
              <p className="text-xs text-muted-foreground">
                Orders being processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Table Occupancy
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Stock Items
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats?.lowStockItems}
              </div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest orders from the kitchen
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllOrders}
                className="flex items-center space-x-1"
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
                    <div className="flex items-center space-x-3">
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
                      <div>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                          {order.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Table {order.tableNumber} • {order.serverName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
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
              <Button className="h-20 flex-col space-y-2">
                <ShoppingCart className="h-6 w-6" />
                <span>New Order</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Users className="h-6 w-6" />
                <span>Manage Tables</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Package className="h-6 w-6" />
                <span>Update Inventory</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span>View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RestaurantLayout>
  );
}
