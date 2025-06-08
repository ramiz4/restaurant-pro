import { useEffect, useState } from "react";

import {
  Award,
  DollarSign,
  Download,
  ShoppingCart,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesReport } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";

const COLORS = [
  "#ff6b35",
  "#f7931e",
  "#ffd23f",
  "#06d6a0",
  "#118ab2",
  "#073b4c",
];

export default function Reports() {
  const [salesReports, setSalesReports] = useState<SalesReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await RestaurantService.getSalesReports();
        setSalesReports(data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <RestaurantLayout>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </RestaurantLayout>
    );
  }

  const totalRevenue = salesReports.reduce(
    (sum, report) => sum + report.totalSales,
    0,
  );
  const totalOrders = salesReports.reduce(
    (sum, report) => sum + report.totalOrders,
    0,
  );
  const avgOrderValue = totalRevenue / totalOrders;

  // Chart data
  const salesChartData = salesReports.map((report) => ({
    date: new Date(report.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    sales: report.totalSales,
    orders: report.totalOrders,
  }));

  // Top items across all reports
  const allTopItems = salesReports.flatMap((report) => report.topItems);
  const itemSales = allTopItems.reduce(
    (acc, item) => {
      if (acc[item.item]) {
        acc[item.item].quantity += item.quantity;
        acc[item.item].revenue += item.revenue;
      } else {
        acc[item.item] = { ...item };
      }
      return acc;
    },
    {} as Record<string, { item: string; quantity: number; revenue: number }>,
  );

  const topItemsData = Object.values(itemSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <RestaurantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Sales Reports & Analytics
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track your restaurant's performance and identify trends
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4 sm:gap-0">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <PermissionGuard page="reports" action="export">
              <Button className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                ${totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from last period
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.2%</span> from last period
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Order Value
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                ${avgOrderValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+4.1%</span> from last period
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Seller</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {topItemsData[0]?.item || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {topItemsData[0]?.quantity || 0} sold
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 sm:w-auto">
            <TabsTrigger value="sales" className="text-sm">
              Sales Overview
            </TabsTrigger>
            <TabsTrigger value="items" className="text-sm">
              Top Items
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-sm">
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Sales Chart */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Daily Sales
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Revenue and order trends over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        fontSize={12}
                        interval="preserveStartEnd"
                      />
                      <YAxis fontSize={12} />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "sales" ? `$${value}` : value,
                          name === "sales" ? "Sales" : "Orders",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#ff6b35"
                        strokeWidth={2}
                        name="sales"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders Chart */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Daily Orders
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Number of orders processed daily
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        fontSize={12}
                        interval="preserveStartEnd"
                      />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(value) => [value, "Orders"]} />
                      <Bar dataKey="orders" fill="#118ab2" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Top Items Chart */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Top Selling Items
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Revenue breakdown by menu item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={topItemsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ item, percent }) =>
                          `${item}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {topItemsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${value}`, "Revenue"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Items List */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Best Performers
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Top selling menu items by revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topItemsData.map((item, index) => (
                      <div
                        key={item.item}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {item.item}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} sold
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium">
                            ${item.revenue.toFixed(2)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Performance Metrics */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Key Performance Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-sm">Table Turnover Rate</span>
                    <Badge variant="secondary">3.2x/day</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-sm">Average Service Time</span>
                    <Badge variant="secondary">42 min</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-sm">Customer Satisfaction</span>
                    <Badge variant="secondary">4.8/5</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-sm">Food Cost %</span>
                    <Badge variant="secondary">28%</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Trends */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Revenue Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-sm">This Week</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">+12.5%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-sm">This Month</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">+8.3%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-sm">This Quarter</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">+15.7%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-sm">This Year</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">+22.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Goals */}
              <Card className="hover:shadow-md transition-shadow lg:col-span-2 xl:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Monthly Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Revenue Target</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Order Volume</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Customer Satisfaction</span>
                      <span className="font-medium">96%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: "96%" }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RestaurantLayout>
  );
}
