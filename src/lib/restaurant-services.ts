import {
  type InventoryItem,
  type MenuItem,
  type Order,
  type Payment,
  type SalesReport,
  type Shift,
  type Table,
  type User,
  mockInventory,
  mockMenuItems,
  mockOrders,
  mockPayments,
  mockSalesData,
  mockShifts,
  mockTables,
  mockUsers,
} from "./mock-data";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class RestaurantService {
  // Orders
  static async getOrders(): Promise<Order[]> {
    await delay(300);
    // Return orders sorted by creation time (newest first)
    return [...mockOrders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  static async createOrder(
    order: Omit<Order, "id" | "createdAt">,
  ): Promise<Order> {
    await delay(500);
    const newOrder: Order = {
      ...order,
      id: `ORD-${String(mockOrders.length + 1).padStart(3, "0")}`,
      createdAt: new Date(),
    };
    mockOrders.push(newOrder);

    // Notify kitchen staff about new order
    fetch("http://localhost:4001/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "New Order",
        message: `Order ${newOrder.id} created`,
        role: "Kitchen Staff",
      }),
    }).catch(() => {
      /* ignore network errors in mock environment */
    });

    return newOrder;
  }

  static async updateOrderStatus(
    orderId: string,
    status: Order["status"],
  ): Promise<Order> {
    await delay(300);
    const orderIndex = mockOrders.findIndex((order) => order.id === orderId);
    if (orderIndex !== -1) {
      mockOrders[orderIndex].status = status;
      return mockOrders[orderIndex];
    }
    throw new Error("Order not found");
  }

  // Menu
  static async getMenuItems(): Promise<MenuItem[]> {
    await delay(200);
    return [...mockMenuItems];
  }

  static async createMenuItem(item: Omit<MenuItem, "id">): Promise<MenuItem> {
    await delay(400);
    const newItem: MenuItem = {
      ...item,
      id: String(mockMenuItems.length + 1),
    };
    mockMenuItems.push(newItem);
    return newItem;
  }

  static async updateMenuItem(
    id: string,
    updates: Partial<MenuItem>,
  ): Promise<MenuItem> {
    await delay(300);
    const itemIndex = mockMenuItems.findIndex((item) => item.id === id);
    if (itemIndex !== -1) {
      mockMenuItems[itemIndex] = { ...mockMenuItems[itemIndex], ...updates };
      return mockMenuItems[itemIndex];
    }
    throw new Error("Menu item not found");
  }

  static async deleteMenuItem(id: string): Promise<void> {
    await delay(300);
    const itemIndex = mockMenuItems.findIndex((item) => item.id === id);
    if (itemIndex !== -1) {
      mockMenuItems.splice(itemIndex, 1);
    } else {
      throw new Error("Menu item not found");
    }
  }

  // Tables
  static async getTables(): Promise<Table[]> {
    await delay(200);
    return [...mockTables];
  }

  static async updateTableStatus(
    id: string,
    status: Table["status"],
    currentOrder?: string,
  ): Promise<Table> {
    await delay(300);
    const tableIndex = mockTables.findIndex((table) => table.id === id);
    if (tableIndex !== -1) {
      mockTables[tableIndex].status = status;
      if (currentOrder !== undefined) {
        mockTables[tableIndex].currentOrder = currentOrder;
      }
      return mockTables[tableIndex];
    }
    throw new Error("Table not found");
  }

  // Inventory
  static async getInventory(): Promise<InventoryItem[]> {
    await delay(250);
    return [...mockInventory];
  }

  static async updateInventoryStock(
    id: string,
    newStock: number,
  ): Promise<InventoryItem> {
    await delay(300);
    const itemIndex = mockInventory.findIndex((item) => item.id === id);
    if (itemIndex !== -1) {
      mockInventory[itemIndex].currentStock = newStock;
      mockInventory[itemIndex].lastRestocked = new Date();

      if (
        mockInventory[itemIndex].currentStock <=
        mockInventory[itemIndex].minStock
      ) {
        fetch("http://localhost:4001/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "Low Stock",
            message: `${mockInventory[itemIndex].name} is low on stock`,
            role: "Manager",
          }),
        }).catch(() => {
          /* ignore network errors in mock environment */
        });
      }

      return mockInventory[itemIndex];
    }
    throw new Error("Inventory item not found");
  }

  static async addInventoryItem(
    item: Omit<InventoryItem, "id">,
  ): Promise<InventoryItem> {
    await delay(400);
    const newItem: InventoryItem = {
      ...item,
      id: String(mockInventory.length + 1),
    };
    mockInventory.push(newItem);
    return newItem;
  }

  // Users
  static async getUsers(): Promise<User[]> {
    await delay(200);
    return [...mockUsers];
  }

  static async createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
    await delay(400);
    const newUser: User = {
      ...user,
      id: String(mockUsers.length + 1),
      createdAt: new Date(),
    };
    mockUsers.push(newUser);
    return newUser;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await delay(300);
    const userIndex = mockUsers.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      return mockUsers[userIndex];
    }
    throw new Error("User not found");
  }

  // Reports
  static async getSalesReports(): Promise<SalesReport[]> {
    await delay(400);
    return [...mockSalesData];
  }

  static async getDashboardStats() {
    await delay(300);
    const activeOrders = mockOrders.filter((order) =>
      ["pending", "preparing", "ready"].includes(order.status),
    ).length;

    const occupiedTables = mockTables.filter(
      (table) => table.status === "occupied",
    ).length;

    const lowStockItems = mockInventory.filter(
      (item) => item.currentStock <= item.minStock,
    ).length;

    const todaySales = mockSalesData[0]?.totalSales || 0;

    return {
      activeOrders,
      occupiedTables,
      totalTables: mockTables.length,
      lowStockItems,
      todaySales,
      totalRevenue: mockSalesData.reduce((sum, day) => sum + day.totalSales, 0),
    };
  }

  // Payments
  static async getPayments(): Promise<Payment[]> {
    await delay(200);
    return [...mockPayments];
  }

  static async processPayment(
    paymentData: Omit<Payment, "id" | "processedAt" | "receiptNumber">,
  ): Promise<Payment> {
    await delay(1500); // Simulate payment processing time

    const payment: Payment = {
      ...paymentData,
      id: `PAY-${String(mockPayments.length + 1).padStart(3, "0")}`,
      processedAt: new Date(),
      receiptNumber: `RCP-${String(mockPayments.length + 1).padStart(3, "0")}`,
    };

    mockPayments.push(payment);

    // Update order status to paid
    const orderIndex = mockOrders.findIndex(
      (order) => order.id === paymentData.orderId,
    );
    if (orderIndex !== -1) {
      mockOrders[orderIndex].status = "paid";
      mockOrders[orderIndex].isPaid = true;
      mockOrders[orderIndex].paymentId = payment.id;
    }

    return payment;
  }

  static async refundPayment(
    paymentId: string,
    refundAmount: number,
  ): Promise<Payment> {
    await delay(800);

    const paymentIndex = mockPayments.findIndex(
      (payment) => payment.id === paymentId,
    );
    if (paymentIndex === -1) {
      throw new Error("Payment not found");
    }

    // Create refund payment record
    const refundPayment: Payment = {
      id: `REF-${String(mockPayments.length + 1).padStart(3, "0")}`,
      orderId: mockPayments[paymentIndex].orderId,
      amount: -refundAmount,
      paymentMethod: mockPayments[paymentIndex].paymentMethod,
      status: "completed",
      processedAt: new Date(),
      processedBy: mockPayments[paymentIndex].processedBy,
      receiptNumber: `RFD-${String(mockPayments.length + 1).padStart(3, "0")}`,
    };

    mockPayments.push(refundPayment);

    // Update original payment status
    mockPayments[paymentIndex].status = "refunded";

    return refundPayment;
  }

  static async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    await delay(200);
    return mockPayments.find((payment) => payment.orderId === orderId) || null;
  }

  // Shifts
  static async getShifts(): Promise<Shift[]> {
    await delay(200);
    return [...mockShifts].sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );
  }

  static async createShift(shift: Omit<Shift, "id">): Promise<Shift> {
    await delay(300);
    const newShift: Shift = {
      ...shift,
      id: `SHIFT-${String(mockShifts.length + 1).padStart(3, "0")}`,
    };
    mockShifts.push(newShift);
    return newShift;
  }

  static async updateShift(
    id: string,
    updates: Partial<Shift>,
  ): Promise<Shift> {
    await delay(300);
    const idx = mockShifts.findIndex((s) => s.id === id);
    if (idx !== -1) {
      mockShifts[idx] = { ...mockShifts[idx], ...updates };
      return mockShifts[idx];
    }
    throw new Error("Shift not found");
  }

  static async deleteShift(id: string): Promise<void> {
    await delay(200);
    const idx = mockShifts.findIndex((s) => s.id === id);
    if (idx !== -1) {
      mockShifts.splice(idx, 1);
    } else {
      throw new Error("Shift not found");
    }
  }
}

export default RestaurantService;
