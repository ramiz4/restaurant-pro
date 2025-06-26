import { useEffect, useState } from "react";

import { useSearchParams } from "react-router-dom";

import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Minus,
  Plus,
  Receipt,
  Search,
  Utensils,
  X,
} from "lucide-react";

import { PaymentDialog } from "@/components/restaurant/PaymentDialog";
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
import { SwipeToAction } from "@/components/ui/swipe-to-action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuditLog } from "@/contexts/AuditLogContext";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { MenuItem, Order, Payment, Table, User } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";
import { cn } from "@/lib/utils";

interface NewOrderItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export default function Orders() {
  const { currentUser } = useUser();
  const { recordAction } = useAuditLog();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // Pull-to-refresh functionality
  const refreshOrders = async () => {
    try {
      const [ordersData, menuData, tablesData, usersData] = await Promise.all([
        RestaurantService.getOrders(),
        RestaurantService.getMenuItems(),
        RestaurantService.getTables(),
        RestaurantService.getUsers(),
      ]);

      const sortedOrders = [...ordersData].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setOrders(sortedOrders);
      setMenuItems(menuData.filter((item) => item.available));
      setTables(
        tablesData.filter(
          (table) =>
            table.status === "available" || table.status === "occupied",
        ),
      );

      const activeServers = usersData.filter(
        (user) => user.role === "server" && user.active,
      );
      setUsers(activeServers);
    } catch (error) {
      console.error("Failed to refresh orders:", error);
    }
  };

  const {
    isRefreshing,
    progress,
    pullDistance: _pullDistance,
  } = usePullToRefresh({
    onRefresh: refreshOrders,
    disabled: !isMobile,
  });

  // Helper function to get next status for swipe gestures
  const getNextStatus = (currentStatus: Order["status"]): Order["status"] => {
    const statusFlow = {
      pending: "preparing",
      preparing: "ready",
      ready: "served",
      served: "completed",
      completed: "paid",
      paid: "paid", // No change if already paid
    } as const;

    return statusFlow[currentStatus] || currentStatus;
  };

  const getPreviousStatus = (
    currentStatus: Order["status"],
  ): Order["status"] => {
    const statusFlow = {
      preparing: "pending",
      ready: "preparing",
      served: "ready",
      completed: "served",
      paid: "served", // Can revert from paid to served if needed
    } as const;

    return statusFlow[currentStatus] || currentStatus;
  };

  // Helper function to get default server name
  const getDefaultServerName = () => {
    return currentUser &&
      (currentUser.role === "Server" || currentUser.role === "server")
      ? currentUser.name
      : "";
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] =
    useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  // New order form state
  const [newOrder, setNewOrder] = useState({
    tableNumber: "",
    serverName: getDefaultServerName(),
    notes: "",
  });
  const [orderItems, setOrderItems] = useState<NewOrderItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");
  const [menuItemSearch, setMenuItemSearch] = useState("");
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, menuData, tablesData, usersData] = await Promise.all(
          [
            RestaurantService.getOrders(),
            RestaurantService.getMenuItems(),
            RestaurantService.getTables(),
            RestaurantService.getUsers(),
          ],
        );
        // Sort orders by creation time (newest first)
        const sortedOrders = [...ordersData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setOrders(sortedOrders);
        setMenuItems(menuData.filter((item) => item.available));
        setTables(
          tablesData.filter(
            (table) =>
              table.status === "available" || table.status === "occupied",
          ),
        );
        // Filter for active servers only
        const activeServers = usersData.filter(
          (user) => user.role === "server" && user.active,
        );
        setUsers(activeServers);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    try {
      await RestaurantService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handlePaymentComplete = (payment: Payment) => {
    // Update the order in the local state
    setOrders((prev) =>
      prev.map((order) =>
        order.id === payment.orderId
          ? {
              ...order,
              status: "paid" as const,
              isPaid: true,
              paymentId: payment.id,
            }
          : order,
      ),
    );
    setSelectedOrderForPayment(null);
  };

  const openPaymentDialog = (order: Order) => {
    setSelectedOrderForPayment(order);
    setIsPaymentDialogOpen(true);
  };

  const addItemToOrder = () => {
    if (!selectedMenuItem) return;

    const menuItem = menuItems.find((item) => item.id === selectedMenuItem);
    if (!menuItem) return;

    const existingItemIndex = orderItems.findIndex(
      (item) =>
        item.menuItem.id === selectedMenuItem &&
        item.specialInstructions === specialInstructions,
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      setOrderItems((prev) =>
        prev.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      );
    } else {
      // Add new item
      setOrderItems((prev) => [
        ...prev,
        {
          menuItem,
          quantity,
          specialInstructions: specialInstructions || undefined,
        },
      ]);
    }

    // Reset form
    setSelectedMenuItem("");
    setMenuItemSearch("");
    setShowMenuDropdown(false);
    setQuantity(1);
    setSpecialInstructions("");
  };

  const removeItemFromOrder = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(index);
      return;
    }
    setOrderItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0,
    );
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      alert("Please add at least one item to the order");
      return;
    }

    try {
      const orderData = {
        tableNumber: parseInt(newOrder.tableNumber),
        serverName: newOrder.serverName || "Unknown Server",
        items: orderItems.map((item, index) => ({
          id: `item-${index + 1}`,
          menuItemId: item.menuItem.id,
          menuItem: item.menuItem,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        status: "pending" as const,
        total: calculateTotal(),
      };

      const createdOrder = await RestaurantService.createOrder(orderData);
      setOrders((prev) => [createdOrder, ...prev]);
      recordAction(`Created order ${createdOrder.id}`, "orders");

      // Reset form
      setNewOrder({ tableNumber: "", serverName: "", notes: "" });
      setOrderItems([]);
      setIsNewOrderDialogOpen(false);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create order. Please try again.");
    }
  };
  const resetNewOrderForm = () => {
    // Preselect current user as server if they are a server
    setNewOrder({
      tableNumber: "",
      serverName: getDefaultServerName(),
      notes: "",
    });
    setOrderItems([]);
    setSelectedMenuItem("");
    setMenuItemSearch("");
    setShowMenuDropdown(false);
    setQuantity(1);
    setSpecialInstructions("");
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber.toString().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Sort orders based on selected sort option
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "highest-amount":
        return b.total - a.total;
      case "lowest-amount":
        return a.total - b.total;
      case "table-asc":
        return a.tableNumber - b.tableNumber;
      case "table-desc":
        return b.tableNumber - a.tableNumber;
      case "server-asc":
        return a.serverName.localeCompare(b.serverName);
      case "server-desc":
        return b.serverName.localeCompare(a.serverName);
      case "status-asc": {
        const statusOrder = [
          "pending",
          "preparing",
          "ready",
          "served",
          "completed",
          "paid",
        ];
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      }
      case "status-desc": {
        const statusOrderDesc = [
          "paid",
          "completed",
          "served",
          "ready",
          "preparing",
          "pending",
        ];
        return (
          statusOrderDesc.indexOf(a.status) - statusOrderDesc.indexOf(b.status)
        );
      }
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = sortedOrders.slice(
    startIndex,
    startIndex + ordersPerPage,
  );

  // Reset to first page when filters or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, sortBy]);

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(menuItemSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuItemSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(menuItemSearch.toLowerCase()),
  );

  // Handle menu item selection
  const handleMenuItemSelect = (item: MenuItem) => {
    setSelectedMenuItem(item.id);
    setMenuItemSearch(item.name);
    setShowMenuDropdown(false);
  };

  // Handle URL search parameter changes
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam && searchParam !== searchTerm) {
      setSearchTerm(searchParam);
      // Clear the URL parameter after setting the search term to keep URL clean
      setSearchParams({});
    }
  }, [searchParams, searchTerm, setSearchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenuDropdown && !(event.target as Element).closest(".relative")) {
        setShowMenuDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenuDropdown]);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "preparing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "served":
        return <Utensils className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case "paid":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "destructive";
      case "preparing":
        return "default";
      case "ready":
        return "secondary";
      case "served":
        return "outline";
      case "completed":
        return "secondary";
      case "paid":
        return "default";
      default:
        return "default";
    }
  };

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    served: orders.filter((o) => o.status === "served").length,
    completed: orders.filter((o) => o.status === "completed").length,
    paid: orders.filter((o) => o.status === "paid").length,
  };

  if (loading) {
    return (
      <RestaurantLayout>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </RestaurantLayout>
    );
  }
  return (
    <RestaurantLayout>
      <div
        className="space-y-6"
        style={
          isMobile
            ? {
                transform: `translateY(${progress * 60}px)`,
                transition: isRefreshing ? "transform 0.3s ease-out" : "none",
              }
            : undefined
        }
      >
        {/* Pull to refresh indicator */}
        {isMobile && progress > 0 && (
          <div className="flex justify-center pb-4">
            <div
              className={cn(
                "flex items-center space-x-2 text-sm text-muted-foreground transition-all duration-200",
                progress > 0.8 && "text-primary",
                isRefreshing && "animate-pulse",
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 border-2 border-current border-t-transparent rounded-full",
                  (isRefreshing || progress > 0.8) && "animate-spin",
                )}
              />
              <span>
                {isRefreshing
                  ? "Refreshing orders..."
                  : progress > 0.8
                    ? "Release to refresh"
                    : "Pull to refresh"}
              </span>
            </div>
          </div>
        )}
        {/* Header Actions */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search and Controls Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:flex-1 lg:w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Sort Control */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center">
                    <ArrowDown className="mr-2 h-3 w-3" />
                    Newest First
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center">
                    <ArrowUp className="mr-2 h-3 w-3" />
                    Oldest First
                  </div>
                </SelectItem>
                <SelectItem value="highest-amount">
                  <div className="flex items-center">
                    <ArrowDown className="mr-2 h-3 w-3" />
                    Highest Amount
                  </div>
                </SelectItem>
                <SelectItem value="lowest-amount">
                  <div className="flex items-center">
                    <ArrowUp className="mr-2 h-3 w-3" />
                    Lowest Amount
                  </div>
                </SelectItem>
                <SelectItem value="table-asc">
                  <div className="flex items-center">
                    <ArrowUp className="mr-2 h-3 w-3" />
                    Table Number (Low-High)
                  </div>
                </SelectItem>
                <SelectItem value="table-desc">
                  <div className="flex items-center">
                    <ArrowDown className="mr-2 h-3 w-3" />
                    Table Number (High-Low)
                  </div>
                </SelectItem>
                <SelectItem value="server-asc">
                  <div className="flex items-center">
                    <ArrowUp className="mr-2 h-3 w-3" />
                    Server Name (A-Z)
                  </div>
                </SelectItem>
                <SelectItem value="server-desc">
                  <div className="flex items-center">
                    <ArrowDown className="mr-2 h-3 w-3" />
                    Server Name (Z-A)
                  </div>
                </SelectItem>
                <SelectItem value="status-asc">
                  <div className="flex items-center">
                    <ArrowUp className="mr-2 h-3 w-3" />
                    Status (Pending First)
                  </div>
                </SelectItem>
                <SelectItem value="status-desc">
                  <div className="flex items-center">
                    <ArrowDown className="mr-2 h-3 w-3" />
                    Status (Paid First)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* New Order Button */}
          <Dialog
            open={isNewOrderDialogOpen}
            onOpenChange={(open) => {
              setIsNewOrderDialogOpen(open);
              if (!open) resetNewOrderForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto lg:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <PermissionGuard
                page="orders"
                action="create"
                fallback={
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground">
                      You don't have permission to create orders.
                    </p>
                  </div>
                }
              >
                <DialogHeader>
                  <DialogTitle>Create New Order</DialogTitle>
                  <DialogDescription>
                    Add a new order for a table. Select menu items and specify
                    quantities.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitOrder}>
                  <div className="grid gap-6 py-4">
                    {/* Order Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="table">Table Number</Label>
                        <Select
                          value={newOrder.tableNumber}
                          onValueChange={(value) =>
                            setNewOrder((prev) => ({
                              ...prev,
                              tableNumber: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select table" />
                          </SelectTrigger>
                          <SelectContent>
                            {tables.map((table) => (
                              <SelectItem
                                key={table.id}
                                value={table.number.toString()}
                              >
                                Table {table.number} (Capacity: {table.capacity}
                                )
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="server">Server Name</Label>
                        <Select
                          value={newOrder.serverName}
                          onValueChange={(value) =>
                            setNewOrder((prev) => ({
                              ...prev,
                              serverName: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                loading
                                  ? "Loading servers..."
                                  : users.length === 0
                                    ? "No servers available"
                                    : "Select server"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {users.length === 0 ? (
                              <SelectItem value="" disabled>
                                No active servers found
                              </SelectItem>
                            ) : (
                              users.map((user) => (
                                <SelectItem key={user.id} value={user.name}>
                                  {user.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Add Menu Items */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-4">Add Menu Items</h4>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Menu Item</Label>
                            <div className="relative">
                              <Input
                                placeholder="Search menu items..."
                                value={menuItemSearch}
                                onChange={(e) => {
                                  setMenuItemSearch(e.target.value);
                                  setShowMenuDropdown(true);
                                  if (!e.target.value) {
                                    setSelectedMenuItem("");
                                  }
                                }}
                                onFocus={() => setShowMenuDropdown(true)}
                                className="w-full"
                              />
                              {showMenuDropdown && menuItemSearch && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                                  {filteredMenuItems.length === 0 ? (
                                    <div className="p-3 text-sm text-muted-foreground">
                                      No menu items found.
                                    </div>
                                  ) : (
                                    filteredMenuItems.map((item) => (
                                      <div
                                        key={item.id}
                                        onClick={() =>
                                          handleMenuItemSelect(item)
                                        }
                                        className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex flex-col">
                                            <span className="font-medium text-sm">
                                              {item.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {item.category} •{" "}
                                              {item.description}
                                            </span>
                                          </div>
                                          <span className="font-semibold text-green-600 text-sm">
                                            ${item.price.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}{" "}
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label>Quantity</Label>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setQuantity(Math.max(1, quantity - 1))
                                }
                                disabled={quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) =>
                                  setQuantity(
                                    Math.max(1, parseInt(e.target.value) || 1),
                                  )
                                }
                                className="w-20 text-center"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setQuantity(quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Special Instructions (Optional)</Label>
                          <Input
                            value={specialInstructions}
                            onChange={(e) =>
                              setSpecialInstructions(e.target.value)
                            }
                            placeholder="e.g., No onions, extra spicy, etc."
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={addItemToOrder}
                          disabled={!selectedMenuItem}
                          className="w-full"
                        >
                          Add Item to Order
                        </Button>
                      </div>
                    </div>

                    {/* Order Items List */}
                    {orderItems.length > 0 && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-4">Order Items</h4>
                        <div className="space-y-3">
                          {orderItems.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-medium">
                                  {item.menuItem.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ${item.menuItem.price.toFixed(2)} each
                                </p>
                                {item.specialInstructions && (
                                  <p className="text-xs text-gray-500 italic">
                                    {item.specialInstructions}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateItemQuantity(index, item.quantity - 1)
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateItemQuantity(index, item.quantity + 1)
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItemFromOrder(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-right ml-4">
                                <p className="font-medium">
                                  $
                                  {(
                                    item.menuItem.price * item.quantity
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div className="border-t pt-3 text-right">
                            <p className="text-lg font-bold">
                              Total: ${calculateTotal().toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={newOrder.notes}
                        onChange={(e) =>
                          setNewOrder((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Additional notes for the order..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsNewOrderDialogOpen(false)}
                    >
                      Cancel
                    </Button>{" "}
                    <Button type="submit" disabled={orderItems.length === 0}>
                      Create Order
                    </Button>
                  </DialogFooter>
                </form>
              </PermissionGuard>
            </DialogContent>
          </Dialog>
        </div>{" "}
        {/* Status Filter - Mobile/Tablet Dropdown / Desktop Tabs */}
        <div className="space-y-4">
          {/* Mobile & Tablet: Dropdown (up to 1024px) */}
          <div className="lg:hidden">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Orders ({statusCounts.all})
                </SelectItem>
                <SelectItem value="pending">
                  Pending ({statusCounts.pending})
                </SelectItem>
                <SelectItem value="preparing">
                  Preparing ({statusCounts.preparing})
                </SelectItem>
                <SelectItem value="ready">
                  Ready ({statusCounts.ready})
                </SelectItem>
                <SelectItem value="served">
                  Served ({statusCounts.served})
                </SelectItem>
                <SelectItem value="completed">
                  Completed ({statusCounts.completed})
                </SelectItem>
                <SelectItem value="paid">Paid ({statusCounts.paid})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Tabs (1024px and above) */}
          <Tabs
            value={selectedStatus}
            onValueChange={setSelectedStatus}
            className="hidden lg:block"
          >
            <TabsList className="grid w-full grid-cols-7 gap-1">
              <TabsTrigger value="all" className="text-sm">
                All ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-sm">
                Pending ({statusCounts.pending})
              </TabsTrigger>
              <TabsTrigger value="preparing" className="text-sm">
                Preparing ({statusCounts.preparing})
              </TabsTrigger>
              <TabsTrigger value="ready" className="text-sm">
                Ready ({statusCounts.ready})
              </TabsTrigger>
              <TabsTrigger value="served" className="text-sm">
                Served ({statusCounts.served})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-sm">
                Completed ({statusCounts.completed})
              </TabsTrigger>
              <TabsTrigger value="paid" className="text-sm">
                Paid ({statusCounts.paid})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Content */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsContent value={selectedStatus} className="mt-6">
            {/* Pagination Info */}
            {sortedOrders.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + ordersPerPage, sortedOrders.length)} of{" "}
                  {sortedOrders.length} orders
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {sortedOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Utensils className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        No orders found
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchTerm
                          ? "Try adjusting your search criteria."
                          : "No orders match the selected filter."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                paginatedOrders.map((order) => {
                  const nextStatus = getNextStatus(order.status);
                  const prevStatus = getPreviousStatus(order.status);
                  const canAdvance =
                    nextStatus !== order.status && !order.isPaid;
                  const canRevert = prevStatus !== order.status;

                  const orderCard = (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(order.status)}
                            <div>
                              <CardTitle className="text-lg">
                                {order.id}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Table {order.tableNumber} • {order.serverName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge
                              variant={getStatusBadgeVariant(order.status)}
                            >
                              {order.status}
                            </Badge>
                            <span className="text-lg font-semibold">
                              ${order.total.toFixed(2)}
                            </span>
                            {order.isPaid && (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-600"
                              >
                                <Receipt className="h-3 w-3 mr-1" />
                                Paid
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>{" "}
                      <CardContent>
                        <div className="space-y-3">
                          {/* Order Items */}
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {item.quantity}x {item.menuItem.name}
                                  {item.specialInstructions && (
                                    <span className="text-muted-foreground ml-2">
                                      ({item.specialInstructions})
                                    </span>
                                  )}
                                </span>
                                <span>
                                  $
                                  {(
                                    item.menuItem.price * item.quantity
                                  ).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Order Time and Actions */}
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-xs text-muted-foreground">
                              Ordered{" "}
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                            {/* Status and Payment Actions */}
                            <div className="flex space-x-2">
                              {order.status === "pending" && (
                                <PermissionGuard page="orders" action="edit">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleStatusChange(order.id, "preparing")
                                    }
                                  >
                                    Start Preparing
                                  </Button>
                                </PermissionGuard>
                              )}
                              {order.status === "preparing" && (
                                <PermissionGuard page="orders" action="edit">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleStatusChange(order.id, "ready")
                                    }
                                  >
                                    Mark Ready
                                  </Button>
                                </PermissionGuard>
                              )}
                              {order.status === "ready" && (
                                <PermissionGuard page="orders" action="edit">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleStatusChange(order.id, "served")
                                    }
                                  >
                                    Mark Served
                                  </Button>
                                </PermissionGuard>
                              )}
                              {order.status === "served" && !order.isPaid && (
                                <>
                                  <PermissionGuard page="orders" action="edit">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleStatusChange(
                                          order.id,
                                          "completed",
                                        )
                                      }
                                    >
                                      Complete
                                    </Button>
                                  </PermissionGuard>
                                  <PermissionGuard
                                    page="orders"
                                    action="payment"
                                  >
                                    <Button
                                      size="sm"
                                      onClick={() => openPaymentDialog(order)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CreditCard className="h-4 w-4 mr-1" />
                                      Process Payment
                                    </Button>
                                  </PermissionGuard>
                                </>
                              )}
                              {order.status === "completed" &&
                                !order.isPaid && (
                                  <PermissionGuard
                                    page="orders"
                                    action="payment"
                                  >
                                    <Button
                                      size="sm"
                                      onClick={() => openPaymentDialog(order)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CreditCard className="h-4 w-4 mr-1" />
                                      Process Payment
                                    </Button>
                                  </PermissionGuard>
                                )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );

                  // Wrap with SwipeToAction on mobile
                  if (isMobile && (canAdvance || canRevert)) {
                    return (
                      <SwipeToAction
                        key={order.id}
                        leftActions={
                          canRevert
                            ? [
                                {
                                  id: "revert",
                                  icon: <ArrowLeft className="h-4 w-4" />,
                                  label: `Revert to ${prevStatus}`,
                                  color: "secondary",
                                  onAction: () =>
                                    handleStatusChange(order.id, prevStatus),
                                },
                              ]
                            : []
                        }
                        rightActions={
                          canAdvance
                            ? [
                                {
                                  id: "advance",
                                  icon: <ArrowRight className="h-4 w-4" />,
                                  label: `Advance to ${nextStatus}`,
                                  color: "success",
                                  onAction: () =>
                                    handleStatusChange(order.id, nextStatus),
                                },
                              ]
                            : []
                        }
                      >
                        {orderCard}
                      </SwipeToAction>
                    );
                  }

                  return orderCard;
                })
              )}
            </div>

            {/* Bottom Pagination */}
            {sortedOrders.length > ordersPerPage && (
              <div className="flex justify-center items-center mt-6 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        {/* Payment Dialog */}
        <PaymentDialog
          order={selectedOrderForPayment}
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setIsPaymentDialogOpen(false);
            setSelectedOrderForPayment(null);
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </RestaurantLayout>
  );
}
