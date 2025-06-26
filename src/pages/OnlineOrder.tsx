import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/restaurant/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MenuItem } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";

interface CartItem {
  item: MenuItem;
  quantity: number;
}

export default function OnlineOrder() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);

  useEffect(() => {
    RestaurantService.getMenuItems().then((items) =>
      setMenuItems(items.filter((i) => i.available)),
    );
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== id));
  };

  const changeQty = (id: string, qty: number) => {
    setCart((prev) =>
      prev.map((c) =>
        c.item.id === id ? { ...c, quantity: Math.max(1, qty) } : c,
      ),
    );
  };

  const total = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    const orderData = {
      tableNumber: 0,
      serverName: "Online",
      items: cart.map((c, i) => ({
        id: `item-${i + 1}`,
        menuItemId: c.item.id,
        menuItem: c.item,
        quantity: c.quantity,
      })),
      status: "pending" as const,
      total,
    };

    const order = await RestaurantService.createOrder(orderData);
    setCart([]);
    setOrderPlaced(order.id);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>
      <h1 className="text-2xl font-bold mb-4 text-center">Online Ordering</h1>
      {orderPlaced && (
        <div className="mb-4 text-green-600 text-center">
          Order {orderPlaced} placed successfully!
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card key={item.id} className="flex flex-col">
            <CardContent className="flex-1 p-4 space-y-2">
              <CardTitle>{item.name}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
              <p className="font-medium">${item.price.toFixed(2)}</p>
              <Button onClick={() => addToCart(item)}>Add to Order</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {cart.length > 0 && (
        <div className="mt-8 max-w-xl mx-auto space-y-4">
          <h2 className="text-xl font-semibold">Your Order</h2>
          {cart.map((c) => (
            <div key={c.item.id} className="flex items-center space-x-2">
              <span className="flex-1">
                {c.item.name} (${c.item.price.toFixed(2)})
              </span>
              <Input
                type="number"
                min="1"
                value={c.quantity}
                onChange={(e) =>
                  changeQty(c.item.id, parseInt(e.target.value) || 1)
                }
                className="w-20"
              />
              <Button
                variant="outline"
                onClick={() => removeFromCart(c.item.id)}
              >
                Remove
              </Button>
            </div>
          ))}
          <div className="font-semibold text-right">
            Total: ${total.toFixed(2)}
          </div>
          <Button className="w-full" onClick={submitOrder}>
            Submit Order
          </Button>
        </div>
      )}
    </div>
  );
}
