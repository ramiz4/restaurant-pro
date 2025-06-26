import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { MenuItem } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function OnlineOrdering() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const items = await RestaurantService.getMenuItems();
        setMenuItems(items.filter((i) => i.available));
      } catch (e) {
        console.error("Failed to load menu", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const increaseQty = (id: string) => {
    setCart((prev) =>
      prev.map((c) =>
        c.menuItem.id === id ? { ...c, quantity: c.quantity + 1 } : c,
      ),
    );
  };

  const decreaseQty = (id: string) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItem.id === id ? { ...c, quantity: c.quantity - 1 } : c,
        )
        .filter((c) => c.quantity > 0),
    );
  };

  const calculateTotal = () =>
    cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast({ title: "Cart is empty" });
      return;
    }

    const orderData = {
      tableNumber: 0,
      serverName: "Online Order",
      items: cart.map((item, index) => ({
        id: `item-${index + 1}`,
        menuItemId: item.menuItem.id,
        menuItem: item.menuItem,
        quantity: item.quantity,
      })),
      status: "pending" as const,
      total: calculateTotal(),
    };

    try {
      const created = await RestaurantService.createOrder(orderData);
      toast({
        title: "Order Submitted",
        description: `Your order ${created.id} has been placed!`,
      });
      setCart([]);
    } catch (e) {
      console.error("Failed to submit order", e);
      toast({ title: "Error", description: "Failed to submit order" });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-center">Order Online</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading && <p>Loading menu...</p>}
        {!loading &&
          menuItems.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                </CardContent>
              </div>
              <CardFooter>
                <Button size="sm" onClick={() => addToCart(item)}>
                  Add to Order
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>

      <div className="border-t pt-4 space-y-4">
        <h2 className="text-xl font-semibold">Your Order</h2>
        {cart.length === 0 ? (
          <p className="text-muted-foreground">No items selected.</p>
        ) : (
          <div className="space-y-2">
            {cart.map((c) => (
              <div
                key={c.menuItem.id}
                className="flex items-center justify-between"
              >
                <span>
                  {c.menuItem.name} x {c.quantity}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => decreaseQty(c.menuItem.id)}
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => increaseQty(c.menuItem.id)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
            <div className="font-medium">
              Total: ${calculateTotal().toFixed(2)}
            </div>
            <Button onClick={placeOrder}>Submit Order</Button>
          </div>
        )}
      </div>
    </div>
  );
}
