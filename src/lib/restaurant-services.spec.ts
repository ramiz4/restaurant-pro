import { beforeEach, describe, expect, it } from "vitest";

import { mockOrders, mockTables } from "./mock-data";
import RestaurantService from "./restaurant-services";

const originalOrders = JSON.parse(JSON.stringify(mockOrders));
const originalTables = JSON.parse(JSON.stringify(mockTables));

beforeEach(() => {
  mockOrders.splice(
    0,
    mockOrders.length,
    ...JSON.parse(JSON.stringify(originalOrders)),
  );
  mockTables.splice(
    0,
    mockTables.length,
    ...JSON.parse(JSON.stringify(originalTables)),
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
  });
});

describe("table utilities", () => {
  it("creates a table", async () => {
    const originalLength = mockTables.length;
    const newTable = await RestaurantService.createTable({
      number: 99,
      capacity: 4,
      status: "available",
    });

    expect(mockTables.length).toBe(originalLength + 1);
    expect(mockTables.find((t) => t.id === newTable.id)).toBeDefined();
  });

  it("deletes a table", async () => {
    const tableId = mockTables[0].id;
    const originalLength = mockTables.length;

    await RestaurantService.deleteTable(tableId);

    expect(mockTables.length).toBe(originalLength - 1);
    expect(mockTables.find((t) => t.id === tableId)).toBeUndefined();
  });
});
