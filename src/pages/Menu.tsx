import { useEffect, useState } from "react";

import { DollarSign, Edit, Plus, Search, Trash2 } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { MenuItem } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";
import { cn } from "@/lib/utils";

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const isMobile = useIsMobile();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    available: true,
  });
  // Pull-to-refresh functionality
  const refreshMenuItems = async () => {
    try {
      const data = await RestaurantService.getMenuItems();
      setMenuItems(data);
    } catch (error) {
      console.error("Failed to refresh menu items:", error);
    }
  };
  const {
    isRefreshing,
    progress,
    pullDistance: _pullDistance,
  } = usePullToRefresh({
    onRefresh: refreshMenuItems,
    disabled: !isMobile,
  });

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const data = await RestaurantService.getMenuItems();
        setMenuItems(data);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const categories = Array.from(
    new Set(menuItems.map((item) => item.category)),
  );

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        available: formData.available,
      };

      if (editingItem) {
        // Update existing item
        const updatedItem = await RestaurantService.updateMenuItem(
          editingItem.id,
          itemData,
        );
        setMenuItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? updatedItem : item)),
        );
      } else {
        // Create new item
        const newItem = await RestaurantService.createMenuItem(itemData);
        setMenuItems((prev) => [...prev, newItem]);
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        available: true,
      });
      setEditingItem(null);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to save menu item:", error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available,
    });
    setEditingItem(item);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      try {
        await RestaurantService.deleteMenuItem(id);
        setMenuItems((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Failed to delete menu item:", error);
      }
    }
  };

  const handleAvailabilityToggle = async (id: string, available: boolean) => {
    try {
      const updatedItem = await RestaurantService.updateMenuItem(id, {
        available,
      });
      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item)),
      );
    } catch (error) {
      console.error("Failed to update availability:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      available: true,
    });
    setEditingItem(null);
  };

  if (loading) {
    return (
      <RestaurantLayout>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </RestaurantLayout>
    );
  }
  return (
    <RestaurantLayout>
      <div
        className={cn(
          "space-y-4 lg:space-y-6",
          isMobile && "touch-none select-none",
        )}
        {...(isMobile
          ? {
              onTouchStart: (_e: React.TouchEvent) => {
                // Handle touch start for pull-to-refresh manually if needed
              },
            }
          : {})}
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
                  "rounded-full border-2 border-current w-6 h-6 transition-transform duration-200",
                  isRefreshing && "animate-spin",
                  progress > 0.8 && "scale-110",
                )}
              >
                <div className="w-1 h-1 bg-current rounded-full m-auto mt-1.5" />
              </div>
              <span>
                {isRefreshing
                  ? "Refreshing menu..."
                  : progress > 0.8
                    ? "Release to refresh"
                    : "Pull to refresh"}
              </span>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-[300px]"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
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
          </div>

          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <PermissionGuard page="menu" action="create">
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
            </PermissionGuard>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? "Update the menu item details."
                    : "Fill in the details for the new menu item."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Enter item description"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="0.00"
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
                          <SelectItem value="Appetizer">Appetizer</SelectItem>
                          <SelectItem value="Main Course">
                            Main Course
                          </SelectItem>
                          <SelectItem value="Dessert">Dessert</SelectItem>
                          <SelectItem value="Beverage">Beverage</SelectItem>
                          <SelectItem value="Side">Side</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={formData.available}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, available: checked }))
                      }
                    />
                    <Label htmlFor="available">Available for ordering</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? "Update Item" : "Add Item"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Menu Items Grid */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => {
            const menuItemCard = (
              <Card
                key={item.id}
                className={cn(
                  "overflow-hidden hover:shadow-md transition-shadow",
                  !item.available && "opacity-60",
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg truncate">
                        {item.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                      <PermissionGuard page="menu" action="edit">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard page="menu" action="delete">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-4 text-sm line-clamp-2">
                    {item.description}
                  </CardDescription>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-lg sm:text-xl font-bold text-green-600">
                        {item.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.available}
                        onCheckedChange={(checked) =>
                          handleAvailabilityToggle(item.id, checked)
                        }
                      />
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            // On mobile, wrap with SwipeToAction for edit/delete gestures
            if (isMobile) {
              return (
                <SwipeToAction
                  key={item.id}
                  leftActions={[
                    {
                      id: "edit",
                      label: "Edit",
                      icon: <Edit className="h-4 w-4" />,
                      onAction: () => handleEdit(item),
                      color: "primary",
                    },
                  ]}
                  rightActions={[
                    {
                      id: "delete",
                      label: "Delete",
                      icon: <Trash2 className="h-4 w-4" />,
                      onAction: () => handleDelete(item.id),
                      color: "destructive",
                    },
                  ]}
                >
                  {menuItemCard}
                </SwipeToAction>
              );
            }

            return menuItemCard;
          })}
        </div>

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No menu items found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "Get started by adding your first menu item."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RestaurantLayout>
  );
}
