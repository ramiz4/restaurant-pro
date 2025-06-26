import { beforeEach, describe, expect, it } from "vitest";

import { mockOrders } from "./mock-data";
import RestaurantService from "./restaurant-services";

const originalOrders = JSON.parse(JSON.stringify(mockOrders));

beforeEach(() => {
  mockOrders.splice(
    0,
    mockOrders.length,
    ...JSON.parse(JSON.stringify(originalOrders)),
  );
});

describe("order utilities", () => {
  it("splits an order", async () => {
    const orderId = mockOrders[0].id;
    const itemId = mockOrders[0].items[0].id;
    const originalLength = mockOrders.length;

    const newOrder = await RestaurantService.splitOrder(orderId, [itemId]);

    expect(mockOrders.length).toBe(originalLength + 1);
    const originalOrder = mockOrders.find((o) => o.id === orderId)!;
    expect(originalOrder.items.find((i) => i.id === itemId)).toBeUndefined();
    expect(newOrder.items.map((i) => i.id)).toContain(itemId);
    expect(originalOrder.total).toBeCloseTo(
      originalOrder.items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0,
      ),
    );
    expect(newOrder.total).toBeCloseTo(
      newOrder.items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0,
      ),
    );
  });

  it("merges two orders", async () => {
    const targetId = mockOrders[0].id;
    const sourceId = mockOrders[1].id;
    const originalLength = mockOrders.length;
    const sourceItems = mockOrders[1].items.length;

    const updated = await RestaurantService.mergeOrders(targetId, sourceId);

    expect(mockOrders.length).toBe(originalLength - 1);
    expect(updated.items.length).toBeGreaterThanOrEqual(sourceItems);
    expect(mockOrders.find((o) => o.id === sourceId)).toBeUndefined();
    expect(updated.total).toBeCloseTo(
      updated.items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0,
      ),
    );
  });
});
