import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Minus, Plus, Trash2, Utensils } from "lucide-react";

import { RestaurantLayout } from "@/components/restaurant/RestaurantLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";
import { MenuItem } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";

interface OrderItemForm {
  item: MenuItem;
  quantity: number;
  notes: string;
}

export default function CreateOrder() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    RestaurantService.getMenuItems().then((items) =>
      setMenuItems(items.filter((i) => i.available)),
    );
  }, []);

  const addToOrder = () => {
    if (!selectedItem) return;
    const item = menuItems.find((m) => m.id === selectedItem);
    if (!item) return;

    const existing = orderItems.findIndex(
      (o) => o.item.id === item.id && o.notes === notes,
    );
    if (existing >= 0) {
      setOrderItems((prev) =>
        prev.map((o, i) =>
          i === existing ? { ...o, quantity: o.quantity + quantity } : o,
        ),
      );
    } else {
      setOrderItems((prev) => [...prev, { item, quantity, notes }]);
    }

    setSelectedItem("");
    setQuantity(1);
    setNotes("");
  };

  const updateQty = (index: number, qty: number) => {
    if (qty <= 0) {
      removeItem(index);
      return;
    }
    setOrderItems((prev) =>
      prev.map((o, i) => (i === index ? { ...o, quantity: qty } : o)),
    );
  };

  const removeItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = orderItems.reduce(
    (sum, o) => sum + o.item.price * o.quantity,
    0,
  );

  const submitOrder = async () => {
    if (orderItems.length === 0) return;
    setSubmitting(true);
    try {
      await RestaurantService.createOrder({
        tableNumber: 0,
        serverName: currentUser?.name || "Server",
        items: orderItems.map((o, i) => ({
          id: `item-${i + 1}`,
          menuItemId: o.item.id,
          menuItem: o.item,
          quantity: o.quantity,
          specialInstructions: o.notes || undefined,
        })),
        status: "pending",
        total,
      });
      navigate("/orders");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RestaurantLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Utensils className="h-6 w-6" /> Create Order
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Menu Item</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} - ${m.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-20 text-center"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-2">
              <Label>Modifiers / Notes</Label>
              <Input
                placeholder="e.g. No onions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button
              type="button"
              onClick={addToOrder}
              disabled={!selectedItem}
              className="w-full"
            >
              Add Item
            </Button>
          </div>
          <div>
            {orderItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orderItems.map((o, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{o.item.name}</p>
                        {o.notes && (
                          <p className="text-xs text-muted-foreground">
                            {o.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => updateQty(i, o.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center">{o.quantity}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => updateQty(i, o.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeItem(i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <span>${(o.item.price * o.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 text-right font-semibold">
                    Total: ${total.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={submitOrder}
            disabled={orderItems.length === 0 || submitting}
          >
            Submit Order
          </Button>
        </div>
      </div>
    </RestaurantLayout>
  );
}
