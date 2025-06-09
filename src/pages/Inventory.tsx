import { useEffect, useState } from "react";

import {
  AlertTriangle,
  Edit,
  Package,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Truck,
} from "lucide-react";

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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SwipeToAction } from "@/components/ui/swipe-to-action";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { InventoryItem } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";
import { cn } from "@/lib/utils";

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const isMobile = useIsMobile();

  // Form state for new items
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    currentStock: "",
    minStock: "",
    unit: "",
    costPerUnit: "",
    supplier: "",
  });

  // Restock form state
  const [restockData, setRestockData] = useState({
    quantity: "",
    cost: "",
  });

  // Pull-to-refresh functionality
  const refreshInventory = async () => {
    try {
      const data = await RestaurantService.getInventory();
      setInventory(data);
    } catch (error) {
      console.error("Failed to refresh inventory:", error);
    }
  };

  const {
    isRefreshing,
    progress,
    pullDistance: _pullDistance,
  } = usePullToRefresh({
    onRefresh: refreshInventory,
    disabled: !isMobile,
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await RestaurantService.getInventory();
        setInventory(data);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const categories = Array.from(
    new Set(inventory.map((item) => item.category)),
  );

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(
    (item) => item.currentStock <= item.minStock,
  );

  const getStockLevel = (item: InventoryItem) => {
    if (item.currentStock === 0) return "out";
    if (item.currentStock <= item.minStock) return "low";
    if (item.currentStock <= item.minStock * 2) return "medium";
    return "good";
  };

  const getStockBadgeVariant = (level: string) => {
    switch (level) {
      case "out":
        return "destructive";
      case "low":
        return "destructive";
      case "medium":
        return "default";
      case "good":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStockProgress = (item: InventoryItem) => {
    const maxStock = item.minStock * 3; // Assume max stock is 3x minimum
    return (item.currentStock / maxStock) * 100;
  };
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const itemData = {
        name: formData.name,
        category: formData.category,
        currentStock: parseInt(formData.currentStock),
        minStock: parseInt(formData.minStock),
        unit: formData.unit,
        costPerUnit: parseFloat(formData.costPerUnit),
        supplier: formData.supplier,
        lastRestocked: new Date(),
      };

      if (editingItem) {
        // Update existing item (simulate with replace in mock data)
        const updatedItem = { ...editingItem, ...itemData };
        setInventory((prev) =>
          prev.map((item) => (item.id === editingItem.id ? updatedItem : item)),
        );
      } else {
        // Add new item
        const newItem = await RestaurantService.addInventoryItem(itemData);
        setInventory((prev) => [...prev, newItem]);
      }

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to save inventory item:", error);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const newStock =
        selectedItem.currentStock + parseInt(restockData.quantity);
      const updatedItem = await RestaurantService.updateInventoryStock(
        selectedItem.id,
        newStock,
      );

      setInventory((prev) =>
        prev.map((item) => (item.id === selectedItem.id ? updatedItem : item)),
      );

      // Reset form
      setRestockData({ quantity: "", cost: "" });
      setIsRestockDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to restock item:", error);
    }
  };
  const openRestockDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsRestockDialogOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      unit: item.unit,
      costPerUnit: item.costPerUnit.toString(),
      supplier: item.supplier,
    });
    setIsAddDialogOpen(true);
  };
  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) {
      return;
    }

    try {
      // Simulate delete by removing from local state
      setInventory((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Failed to delete inventory item:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      currentStock: "",
      minStock: "",
      unit: "",
      costPerUnit: "",
      supplier: "",
    });
    setEditingItem(null);
  };

  if (loading) {
    return (
      <RestaurantLayout>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 sm:h-24 bg-gray-200 dark:bg-gray-800 rounded-lg"
              ></div>
            ))}
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 sm:h-40 bg-gray-200 dark:bg-gray-800 rounded-lg"
            ></div>
          ))}
        </div>
      </RestaurantLayout>
    );
  }
  return (
    <RestaurantLayout>
      <div
        className="space-y-4 sm:space-y-6"
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
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 border-2 border-current border-t-transparent rounded-full",
                  (isRefreshing || progress > 0.8) && "animate-spin",
                )}
              />
              <span>
                {isRefreshing
                  ? "Refreshing inventory..."
                  : progress > 0.8
                    ? "Release to refresh"
                    : "Pull to refresh"}
              </span>
            </div>
          </div>
        )}
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {inventory.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tracked inventory items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {lowStockItems.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Items need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                $
                {inventory
                  .reduce(
                    (sum, item) => sum + item.currentStock * item.costPerUnit,
                    0,
                  )
                  .toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Current inventory value
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Header Actions */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full lg:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full md:w-[300px]"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>{" "}
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            {" "}
            <DialogTrigger asChild>
              <PermissionGuard page="inventory" action="create">
                <Button className="w-full lg:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </PermissionGuard>
            </DialogTrigger>
            <DialogContent className="md:max-w-[500px] mx-4 md:mx-0">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? "Update the inventory item details below."
                    : "Add a new item to your inventory tracking system."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddItem}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Item Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Protein">Protein</SelectItem>
                          <SelectItem value="Produce">Produce</SelectItem>
                          <SelectItem value="Dairy">Dairy</SelectItem>
                          <SelectItem value="Pantry">Pantry</SelectItem>
                          <SelectItem value="Baking">Baking</SelectItem>
                          <SelectItem value="Beverage">Beverage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="currentStock">Current Stock</Label>
                      <Input
                        id="currentStock"
                        type="number"
                        value={formData.currentStock}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            currentStock: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="minStock">Min Stock</Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={formData.minStock}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            minStock: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            unit: e.target.value,
                          }))
                        }
                        placeholder="lbs, kg, units"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="costPerUnit">Cost per Unit</Label>
                      <Input
                        id="costPerUnit"
                        type="number"
                        step="0.01"
                        value={formData.costPerUnit}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            costPerUnit: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            supplier: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                </div>{" "}
                <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    {editingItem ? "Update Item" : "Add Item"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>{" "}
        {/* Inventory Items */}
        <div className="grid gap-3 sm:gap-4">
          {filteredItems.map((item) => {
            const stockLevel = getStockLevel(item);
            const ItemCard = () => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold">
                            {item.name}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm text-muted-foreground">
                            <Badge variant="outline">{item.category}</Badge>
                            <span className="hidden sm:inline">•</span>
                            <span>{item.supplier}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Current Stock
                          </p>
                          <p className="text-lg sm:text-xl font-bold">
                            {item.currentStock} {item.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Min Stock
                          </p>
                          <p className="text-sm sm:text-lg">
                            {item.minStock} {item.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Cost per Unit
                          </p>
                          <p className="text-sm sm:text-lg">
                            ${item.costPerUnit.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Total Value
                          </p>
                          <p className="text-sm sm:text-lg font-semibold">
                            ${(item.currentStock * item.costPerUnit).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Stock Level
                          </span>
                          <Badge variant={getStockBadgeVariant(stockLevel)}>
                            {stockLevel === "out"
                              ? "Out of Stock"
                              : stockLevel === "low"
                                ? "Low Stock"
                                : stockLevel === "medium"
                                  ? "Medium Stock"
                                  : "Good Stock"}
                          </Badge>
                        </div>
                        <Progress
                          value={getStockProgress(item)}
                          className={cn(
                            "h-2",
                            stockLevel === "out" && "bg-red-100",
                            stockLevel === "low" && "bg-red-100",
                          )}
                        />
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">
                        Last restocked:{" "}
                        {new Date(item.lastRestocked).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="lg:ml-6 mt-4 lg:mt-0">
                      <PermissionGuard page="inventory" action="restock">
                        <Button
                          onClick={() => openRestockDialog(item)}
                          className="flex items-center space-x-2 w-full lg:w-auto"
                        >
                          <Truck className="h-4 w-4" />
                          <span>Restock</span>
                        </Button>
                      </PermissionGuard>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            return isMobile ? (
              <SwipeToAction
                key={item.id}
                leftActions={[
                  {
                    id: "edit",
                    icon: <Edit className="h-4 w-4" />,
                    label: "Edit",
                    color: "primary",
                    onAction: () => handleEdit(item),
                  },
                ]}
                rightActions={[
                  {
                    id: "delete",
                    icon: <Trash2 className="h-4 w-4" />,
                    label: "Delete",
                    color: "destructive",
                    onAction: () => handleDelete(item.id),
                  },
                ]}
              >
                <ItemCard />
              </SwipeToAction>
            ) : (
              <ItemCard key={item.id} />
            );
          })}
        </div>
        {/* Restock Dialog */}
        <Dialog
          open={isRestockDialogOpen}
          onOpenChange={setIsRestockDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px] mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>Restock Item</DialogTitle>
              <DialogDescription>
                Add stock for {selectedItem?.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRestock}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity to Add</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={restockData.quantity}
                    onChange={(e) =>
                      setRestockData((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    placeholder={`Enter amount in ${selectedItem?.unit}`}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cost">Total Cost (Optional)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={restockData.cost}
                    onChange={(e) =>
                      setRestockData((prev) => ({
                        ...prev,
                        cost: e.target.value,
                      }))
                    }
                    placeholder="Enter total cost"
                  />
                </div>
                {selectedItem && (
                  <div className="text-sm text-muted-foreground">
                    Current stock: {selectedItem.currentStock}{" "}
                    {selectedItem.unit}
                    {restockData.quantity && (
                      <div>
                        New stock will be:{" "}
                        {selectedItem.currentStock +
                          parseInt(restockData.quantity || "0")}{" "}
                        {selectedItem.unit}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsRestockDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Restock Item
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>{" "}
        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No inventory items found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "Get started by adding your first inventory item."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RestaurantLayout>
  );
}
