export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "served" | "completed" | "paid";
  total: number;
  createdAt: Date;
  serverName: string;
  paymentId?: string;
  isPaid?: boolean;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  currentOrder?: string;
  reservedFor?: string;
  reservedAt?: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  lastRestocked: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "server" | "kitchen";
  active: boolean;
  createdAt: Date;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: "cash" | "card" | "mobile";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  processedAt: Date;
  processedBy: string;
  tip?: number;
  change?: number;
  cardLast4?: string;
  receiptNumber: string;
}

export interface SalesReport {
  date: string;
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  topItems: { item: string; quantity: number; revenue: number }[];
}

// Mock Data
export const mockMenuItems: MenuItem[] = [
  // Appetizers
  {
    id: "1",
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with parmesan and croutons",
    price: 12.99,
    category: "Appetizer",
    available: true,
  },
  {
    id: "2",
    name: "Bruschetta Trio",
    description: "Toasted bread with tomato, olive tapenade, and goat cheese",
    price: 9.99,
    category: "Appetizer",
    available: true,
  },
  {
    id: "3",
    name: "Calamari Rings",
    description: "Crispy fried squid with marinara sauce",
    price: 11.99,
    category: "Appetizer",
    available: true,
  },
  {
    id: "4",
    name: "Shrimp Cocktail",
    description: "Chilled jumbo shrimp with cocktail sauce",
    price: 14.99,
    category: "Appetizer",
    available: true,
  },
  {
    id: "5",
    name: "Buffalo Wings",
    description: "Spicy chicken wings with celery and blue cheese",
    price: 10.99,
    category: "Appetizer",
    available: true,
  },
  {
    id: "6",
    name: "Spinach Artichoke Dip",
    description: "Creamy dip served with tortilla chips",
    price: 8.99,
    category: "Appetizer",
    available: true,
  },

  // Soups
  {
    id: "7",
    name: "French Onion Soup",
    description: "Classic onion soup with gruyere cheese and croutons",
    price: 7.99,
    category: "Soup",
    available: true,
  },
  {
    id: "8",
    name: "Tomato Basil Soup",
    description: "Creamy tomato soup with fresh basil",
    price: 6.99,
    category: "Soup",
    available: true,
  },
  {
    id: "9",
    name: "Clam Chowder",
    description: "New England style with tender clams and potatoes",
    price: 8.99,
    category: "Soup",
    available: true,
  },

  // Salads
  {
    id: "10",
    name: "Greek Salad",
    description: "Mixed greens with olives, feta, and Greek dressing",
    price: 11.99,
    category: "Salad",
    available: true,
  },
  {
    id: "11",
    name: "Arugula Salad",
    description: "Peppery arugula with pears, walnuts, and balsamic",
    price: 10.99,
    category: "Salad",
    available: true,
  },
  {
    id: "12",
    name: "Cobb Salad",
    description: "Mixed greens with bacon, egg, blue cheese, and chicken",
    price: 14.99,
    category: "Salad",
    available: true,
  },

  // Main Courses - Seafood
  {
    id: "13",
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with lemon herbs",
    price: 24.99,
    category: "Main Course",
    available: true,
  },
  {
    id: "14",
    name: "Pan-Seared Halibut",
    description: "Fresh halibut with roasted vegetables and butter sauce",
    price: 28.99,
    category: "Main Course",
    available: true,
  },
  {
    id: "15",
    name: "Lobster Risotto",
    description: "Creamy arborio rice with fresh lobster and herbs",
    price: 34.99,
    category: "Main Course",
    available: true,
  },
  {
    id: "16",
    name: "Fish & Chips",
    description: "Beer-battered cod with fries and tartar sauce",
    price: 18.99,
    category: "Main Course",
    available: true,
  },

  // Main Courses - Meat
  {
    id: "17",
    name: "Beef Tenderloin",
    description: "Premium cut with roasted vegetables",
    price: 32.99,
    category: "Main Course",
    available: true,
  },
  {
    id: "18",
    name: "Ribeye Steak",
    description: "16oz prime ribeye with garlic mashed potatoes",
    price: 36.99,
    category: "Main Course",
    available: true,
  },
  {
    id: "19",
    name: "Rack of Lamb",
    description: "Herb-crusted lamb with rosemary jus",
    price: 29.99,
    category: "Main Course",
    available: true,
  },
  {
    id: "20",
    name: "BBQ Ribs",
    description: "Fall-off-the-bone ribs with coleslaw",
    price: 22.99,
    category: "Main Course",
    available: true,
  },
  {
    id: "21",
    name: "Grilled Chicken Breast",
    description: "Herb-marinated chicken with seasonal vegetables",
    price: 19.99,
    category: "Main Course",
    available: true,
  },

  // Pasta & Pizza
  {
    id: "22",
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomato sauce, and basil",
    price: 16.99,
    category: "Pizza",
    available: false,
  },
  {
    id: "23",
    name: "Pepperoni Pizza",
    description: "Classic pepperoni with mozzarella cheese",
    price: 18.99,
    category: "Pizza",
    available: true,
  },
  {
    id: "24",
    name: "Quattro Formaggi Pizza",
    description: "Four cheese pizza with truffle oil",
    price: 21.99,
    category: "Pizza",
    available: true,
  },
  {
    id: "25",
    name: "Spaghetti Carbonara",
    description: "Classic Italian pasta with pancetta and parmesan",
    price: 17.99,
    category: "Pasta",
    available: true,
  },
  {
    id: "26",
    name: "Fettuccine Alfredo",
    description: "Creamy parmesan sauce with fresh fettuccine",
    price: 16.99,
    category: "Pasta",
    available: true,
  },
  {
    id: "27",
    name: "Penne Arrabbiata",
    description: "Spicy tomato sauce with garlic and red peppers",
    price: 15.99,
    category: "Pasta",
    available: true,
  },
  {
    id: "28",
    name: "Seafood Linguine",
    description: "Mixed seafood with garlic white wine sauce",
    price: 23.99,
    category: "Pasta",
    available: true,
  },

  // Vegetarian/Vegan
  {
    id: "29",
    name: "Quinoa Power Bowl",
    description: "Quinoa with roasted vegetables and tahini dressing",
    price: 14.99,
    category: "Vegetarian",
    available: true,
  },
  {
    id: "30",
    name: "Eggplant Parmesan",
    description: "Breaded eggplant with marinara and mozzarella",
    price: 16.99,
    category: "Vegetarian",
    available: true,
  },
  {
    id: "31",
    name: "Mushroom Burger",
    description: "Portobello mushroom with avocado and sprouts",
    price: 13.99,
    category: "Vegetarian",
    available: true,
  },

  // Desserts
  {
    id: "32",
    name: "Chocolate Cake",
    description: "Rich chocolate cake with vanilla ice cream",
    price: 8.99,
    category: "Dessert",
    available: true,
  },
  {
    id: "33",
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee and mascarpone",
    price: 9.99,
    category: "Dessert",
    available: true,
  },
  {
    id: "34",
    name: "Crème Brûlée",
    description: "Vanilla custard with caramelized sugar crust",
    price: 8.99,
    category: "Dessert",
    available: true,
  },
  {
    id: "35",
    name: "Cheesecake",
    description: "New York style with berry compote",
    price: 7.99,
    category: "Dessert",
    available: true,
  },
  {
    id: "36",
    name: "Gelato Trio",
    description: "Three scoops of artisanal gelato",
    price: 6.99,
    category: "Dessert",
    available: true,
  },
  {
    id: "37",
    name: "Apple Tart",
    description: "French apple tart with cinnamon ice cream",
    price: 8.99,
    category: "Dessert",
    available: true,
  },

  // Beverages
  {
    id: "38",
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 4.99,
    category: "Beverage",
    available: true,
  },
  {
    id: "39",
    name: "Craft Beer Selection",
    description: "Ask server for today's selection",
    price: 6.99,
    category: "Beverage",
    available: true,
  },
  {
    id: "40",
    name: "House Wine",
    description: "Red or white wine by the glass",
    price: 8.99,
    category: "Beverage",
    available: true,
  },
  {
    id: "41",
    name: "Espresso",
    description: "Double shot Italian espresso",
    price: 3.99,
    category: "Beverage",
    available: true,
  },
  {
    id: "42",
    name: "Cappuccino",
    description: "Espresso with steamed milk foam",
    price: 4.99,
    category: "Beverage",
    available: true,
  },

  // Kids Menu
  {
    id: "43",
    name: "Kids Chicken Tenders",
    description: "Crispy chicken tenders with fries",
    price: 8.99,
    category: "Kids",
    available: true,
  },
  {
    id: "44",
    name: "Kids Mac & Cheese",
    description: "Creamy macaroni and cheese",
    price: 7.99,
    category: "Kids",
    available: true,
  },
  {
    id: "45",
    name: "Kids Mini Pizza",
    description: "Personal cheese pizza",
    price: 9.99,
    category: "Kids",
    available: true,
  },
];

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    tableNumber: 5,
    items: [
      {
        id: "1",
        menuItemId: "1",
        menuItem: mockMenuItems[0],
        quantity: 2,
        specialInstructions: "Medium rare",
      },
      {
        id: "2",
        menuItemId: "2",
        menuItem: mockMenuItems[1],
        quantity: 1,
      },
    ],
    status: "preparing",
    total: 62.97,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    serverName: "Alice Johnson",
  },
  {
    id: "ORD-002",
    tableNumber: 12,
    items: [
      {
        id: "3",
        menuItemId: "3",
        menuItem: mockMenuItems[2],
        quantity: 1,
      },
    ],
    status: "pending",
    total: 32.99,
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    serverName: "Bob Smith",
  },
  {
    id: "ORD-003",
    tableNumber: 8,
    items: [
      {
        id: "4",
        menuItemId: "4",
        menuItem: mockMenuItems[3],
        quantity: 3,
      },
    ],
    status: "ready",
    total: 26.97,
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    serverName: "Carol Davis",
  },
  {
    id: "ORD-004",
    tableNumber: 3,
    items: [
      {
        id: "5",
        menuItemId: "1",
        menuItem: mockMenuItems[0],
        quantity: 1,
      },
      {
        id: "6",
        menuItemId: "4",
        menuItem: mockMenuItems[3],
        quantity: 2,
      },
    ],
    status: "served",
    total: 42.97,
    createdAt: new Date(Date.now() - 120 * 60 * 1000),
    serverName: "Alice Johnson",
  },
  {
    id: "ORD-005",
    tableNumber: 7,
    items: [
      {
        id: "7",
        menuItemId: "2",
        menuItem: mockMenuItems[1],
        quantity: 2,
        specialInstructions: "No croutons",
      },
      {
        id: "8",
        menuItemId: "3",
        menuItem: mockMenuItems[2],
        quantity: 1,
        specialInstructions: "Well done",
      },
    ],
    status: "completed",
    total: 58.97,
    createdAt: new Date(Date.now() - 180 * 60 * 1000),
    serverName: "Bob Smith",
    isPaid: true,
    paymentId: "PAY-002",
  },
  {
    id: "ORD-006",
    tableNumber: 15,
    items: [
      {
        id: "9",
        menuItemId: "1",
        menuItem: mockMenuItems[0],
        quantity: 3,
      },
    ],
    status: "paid",
    total: 74.97,
    createdAt: new Date(Date.now() - 240 * 60 * 1000),
    serverName: "Carol Davis",
    isPaid: true,
    paymentId: "PAY-003",
  },
  {
    id: "ORD-007",
    tableNumber: 2,
    items: [
      {
        id: "10",
        menuItemId: "2",
        menuItem: mockMenuItems[1],
        quantity: 1,
      },
    ],
    status: "pending",
    total: 12.99,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    serverName: "Alice Johnson",
  },
  {
    id: "ORD-008",
    tableNumber: 9,
    items: [
      {
        id: "11",
        menuItemId: "3",
        menuItem: mockMenuItems[2],
        quantity: 2,
      },
      {
        id: "12",
        menuItemId: "4",
        menuItem: mockMenuItems[3],
        quantity: 1,
      },
    ],
    status: "preparing",
    total: 74.97,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    serverName: "David Wilson",
  },
  {
    id: "ORD-009",
    tableNumber: 11,
    items: [
      {
        id: "13",
        menuItemId: "1",
        menuItem: mockMenuItems[0],
        quantity: 1,
        specialInstructions: "Extra lemon",
      },
      {
        id: "14",
        menuItemId: "2",
        menuItem: mockMenuItems[1],
        quantity: 2,
      },
    ],
    status: "ready",
    total: 50.97,
    createdAt: new Date(Date.now() - 35 * 60 * 1000),
    serverName: "Emma Brown",
  },
  {
    id: "ORD-010",
    tableNumber: 6,
    items: [
      {
        id: "15",
        menuItemId: "4",
        menuItem: mockMenuItems[3],
        quantity: 4,
      },
    ],
    status: "served",
    total: 35.96,
    createdAt: new Date(Date.now() - 90 * 60 * 1000),
    serverName: "Bob Smith",
  },
  {
    id: "ORD-011",
    tableNumber: 14,
    items: [
      {
        id: "16",
        menuItemId: "1",
        menuItem: mockMenuItems[0],
        quantity: 2,
      },
      {
        id: "17",
        menuItemId: "3",
        menuItem: mockMenuItems[2],
        quantity: 1,
      },
    ],
    status: "completed",
    total: 82.97,
    createdAt: new Date(Date.now() - 300 * 60 * 1000),
    serverName: "Carol Davis",
  },
  {
    id: "ORD-012",
    tableNumber: 1,
    items: [
      {
        id: "18",
        menuItemId: "2",
        menuItem: mockMenuItems[1],
        quantity: 3,
        specialInstructions: "Extra dressing",
      },
    ],
    status: "paid",
    total: 38.97,
    createdAt: new Date(Date.now() - 360 * 60 * 1000),
    serverName: "Alice Johnson",
    isPaid: true,
    paymentId: "PAY-004",
  },
  {
    id: "ORD-013",
    tableNumber: 10,
    items: [
      {
        id: "19",
        menuItemId: "3",
        menuItem: mockMenuItems[2],
        quantity: 1,
        specialInstructions: "Medium",
      },
      {
        id: "20",
        menuItemId: "4",
        menuItem: mockMenuItems[3],
        quantity: 2,
      },
    ],
    status: "pending",
    total: 50.97,
    createdAt: new Date(Date.now() - 8 * 60 * 1000),
    serverName: "David Wilson",
  },
  {
    id: "ORD-014",
    tableNumber: 4,
    items: [
      {
        id: "21",
        menuItemId: "1",
        menuItem: mockMenuItems[0],
        quantity: 1,
      },
    ],
    status: "preparing",
    total: 24.99,
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    serverName: "Emma Brown",
  },
  {
    id: "ORD-015",
    tableNumber: 13,
    items: [
      {
        id: "22",
        menuItemId: "2",
        menuItem: mockMenuItems[1],
        quantity: 1,
      },
      {
        id: "23",
        menuItemId: "3",
        menuItem: mockMenuItems[2],
        quantity: 2,
      },
    ],
    status: "ready",
    total: 78.97,
    createdAt: new Date(Date.now() - 55 * 60 * 1000),
    serverName: "Bob Smith",
  },
  {
    id: "ORD-016",
    tableNumber: 16,
    items: [
      {
        id: "24",
        menuItemId: "4",
        menuItem: mockMenuItems[3],
        quantity: 5,
      },
    ],
    status: "served",
    total: 44.95,
    createdAt: new Date(Date.now() - 150 * 60 * 1000),
    serverName: "Carol Davis",
  },
  {
    id: "ORD-017",
    tableNumber: 17,
    items: [
      {
        id: "25",
        menuItemId: "1",
        menuItem: mockMenuItems[0],
        quantity: 3,
        specialInstructions: "No herbs",
      },
      {
        id: "26",
        menuItemId: "2",
        menuItem: mockMenuItems[1],
        quantity: 1,
      },
    ],
    status: "completed",
    total: 87.96,
    createdAt: new Date(Date.now() - 420 * 60 * 1000),
    serverName: "Alice Johnson",
    isPaid: true,
    paymentId: "PAY-005",
  },
  {
    id: "ORD-018",
    tableNumber: 18,
    items: [
      {
        id: "27",
        menuItemId: "3",
        menuItem: mockMenuItems[2],
        quantity: 1,
      },
    ],
    status: "paid",
    total: 32.99,
    createdAt: new Date(Date.now() - 480 * 60 * 1000),
    serverName: "David Wilson",
    isPaid: true,
    paymentId: "PAY-006",
  },
  {
    id: "ORD-019",
    tableNumber: 19,
    items: [
      {
        id: "28",
        menuItemId: "2",
        menuItem: mockMenuItems[1],
        quantity: 2,
      },
      {
        id: "29",
        menuItemId: "4",
        menuItem: mockMenuItems[3],
        quantity: 3,
      },
    ],
    status: "pending",
    total: 52.95,
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    serverName: "Emma Brown",
  },
  {
    id: "ORD-020",
    tableNumber: 20,
    items: [
      {
        id: "30",
        menuItemId: "1",
        menuItem: mockMenuItems[0],
        quantity: 1,
      },
      {
        id: "31",
        menuItemId: "3",
        menuItem: mockMenuItems[2],
        quantity: 1,
      },
    ],
    status: "preparing",
    total: 57.98,
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
    serverName: "Bob Smith",
  },
  {
    id: "ORD-021",
    tableNumber: 21,
    items: [
      {
        id: "32",
        menuItemId: "4",
        menuItem: mockMenuItems[3],
        quantity: 1,
      },
    ],
    status: "ready",
    total: 8.99,
    createdAt: new Date(Date.now() - 40 * 60 * 1000),
    serverName: "Carol Davis",
  },
  {
    id: "ORD-022",
    tableNumber: 22,
    items: [
      {
        id: "33",
        menuItemId: "2",
        menuItem: mockMenuItems[1],
        quantity: 4,
        specialInstructions: "Light dressing",
      },
    ],
    status: "served",
    total: 51.96,
    createdAt: new Date(Date.now() - 135 * 60 * 1000),
    serverName: "Alice Johnson",
  },
  {
    id: "ORD-023",
    tableNumber: 23,
    items: [
      {
        id: "34",
        menuItemId: "1",
        menuItem: mockMenuItems[0],
        quantity: 2,
      },
      {
        id: "35",
        menuItemId: "4",
        menuItem: mockMenuItems[3],
        quantity: 1,
      },
    ],
    status: "completed",
    total: 58.97,
    createdAt: new Date(Date.now() - 390 * 60 * 1000),
    serverName: "David Wilson",
  },
  {
    id: "ORD-024",
    tableNumber: 24,
    items: [
      {
        id: "36",
        menuItemId: "3",
        menuItem: mockMenuItems[2],
        quantity: 3,
        specialInstructions: "Rare",
      },
    ],
    status: "paid",
    total: 98.97,
    createdAt: new Date(Date.now() - 510 * 60 * 1000),
    serverName: "Emma Brown",
    isPaid: true,
    paymentId: "PAY-007",
  },
  {
    id: "ORD-025",
    tableNumber: 25,
    items: [
      {
        id: "37",
        menuItemId: "2",
        menuItem: mockMenuItems[1],
        quantity: 1,
      },
      {
        id: "38",
        menuItemId: "3",
        menuItem: mockMenuItems[2],
        quantity: 1,
      },
      {
        id: "39",
        menuItemId: "4",
        menuItem: mockMenuItems[3],
        quantity: 2,
      },
    ],
    status: "pending",
    total: 63.96,
    createdAt: new Date(Date.now() - 1 * 60 * 1000),
    serverName: "Bob Smith",
  },
  {
    id: "ORD-026",
    tableNumber: 26,
    items: [
      {
        id: "40",
        menuItemId: "1",
        menuItem: mockMenuItems[0],
        quantity: 4,
        specialInstructions: "Extra sauce",
      },
    ],
    status: "preparing",
    total: 99.96,
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
    serverName: "Carol Davis",
  },
  {
    id: "ORD-027",
    tableNumber: 27,
    items: [
      {
        id: "41",
        menuItemId: "4",
        menuItem: mockMenuItems[3],
        quantity: 6,
      },
    ],
    status: "ready",
    total: 53.94,
    createdAt: new Date(Date.now() - 65 * 60 * 1000),
    serverName: "Alice Johnson",
  },
  {
    id: "ORD-028",
    tableNumber: 28,
    items: [
      {
        id: "42",
        menuItemId: "2",
        menuItem: mockMenuItems[1],
        quantity: 3,
      },
      {
        id: "43",
        menuItemId: "3",
        menuItem: mockMenuItems[2],
        quantity: 2,
      },
    ],
    status: "served",
    total: 104.95,
    createdAt: new Date(Date.now() - 210 * 60 * 1000),
    serverName: "David Wilson",
  },
];

export const mockTables: Table[] = [
  { id: "1", number: 1, capacity: 2, status: "available" },
  { id: "2", number: 2, capacity: 4, status: "available" },
  { id: "3", number: 3, capacity: 2, status: "cleaning" },
  { id: "4", number: 4, capacity: 6, status: "available" },
  {
    id: "5",
    number: 5,
    capacity: 4,
    status: "occupied",
    currentOrder: "ORD-001",
  },
  {
    id: "6",
    number: 6,
    capacity: 2,
    status: "reserved",
    reservedFor: "Johnson Party",
    reservedAt: new Date(Date.now() + 60 * 60 * 1000),
  },
  { id: "7", number: 7, capacity: 8, status: "available" },
  {
    id: "8",
    number: 8,
    capacity: 4,
    status: "occupied",
    currentOrder: "ORD-003",
  },
  { id: "9", number: 9, capacity: 2, status: "available" },
  { id: "10", number: 10, capacity: 4, status: "available" },
  { id: "11", number: 11, capacity: 6, status: "available" },
  {
    id: "12",
    number: 12,
    capacity: 4,
    status: "occupied",
    currentOrder: "ORD-002",
  },
];

export const mockInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Atlantic Salmon",
    category: "Protein",
    currentStock: 15,
    minStock: 10,
    unit: "lbs",
    costPerUnit: 12.5,
    supplier: "Ocean Fresh Seafood",
    lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "Romaine Lettuce",
    category: "Produce",
    currentStock: 5,
    minStock: 8,
    unit: "heads",
    costPerUnit: 2.25,
    supplier: "Green Valley Farms",
    lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    name: "Beef Tenderloin",
    category: "Protein",
    currentStock: 8,
    minStock: 5,
    unit: "lbs",
    costPerUnit: 18.75,
    supplier: "Premium Meats Co",
    lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    name: "Dark Chocolate",
    category: "Baking",
    currentStock: 3,
    minStock: 5,
    unit: "lbs",
    costPerUnit: 8.5,
    supplier: "Sweet Supply Co",
    lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

export const mockUsers: User[] = [
  // Servers
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@restaurant.com",
    role: "server",
    active: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@restaurant.com",
    role: "server",
    active: true,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: "6",
    name: "Sarah Martinez",
    email: "sarah@restaurant.com",
    role: "server",
    active: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: "7",
    name: "Mike Thompson",
    email: "mike@restaurant.com",
    role: "server",
    active: true,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
  {
    id: "8",
    name: "Jessica Lee",
    email: "jessica@restaurant.com",
    role: "server",
    active: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: "9",
    name: "James Wilson",
    email: "james@restaurant.com",
    role: "server",
    active: false, // Inactive server for testing filtering
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
  },

  // Management and other roles
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@restaurant.com",
    role: "manager",
    active: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david@restaurant.com",
    role: "kitchen",
    active: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    name: "Emma Brown",
    email: "emma@restaurant.com",
    role: "admin",
    active: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
];

export const mockPayments: Payment[] = [
  {
    id: "PAY-001",
    orderId: "ORD-003",
    amount: 26.97,
    paymentMethod: "card",
    status: "completed",
    transactionId: "TXN-ABC123",
    processedAt: new Date(Date.now() - 30 * 60 * 1000),
    processedBy: "Carol Davis",
    tip: 5.0,
    cardLast4: "4567",
    receiptNumber: "RCP-001",
  },
];

export const mockSalesData: SalesReport[] = [
  {
    date: "2024-01-15",
    totalSales: 2450.75,
    totalOrders: 45,
    avgOrderValue: 54.46,
    topItems: [
      { item: "Grilled Salmon", quantity: 12, revenue: 299.88 },
      { item: "Beef Tenderloin", quantity: 8, revenue: 263.92 },
      { item: "Caesar Salad", quantity: 15, revenue: 194.85 },
    ],
  },
  {
    date: "2024-01-14",
    totalSales: 2123.5,
    totalOrders: 38,
    avgOrderValue: 55.88,
    topItems: [
      { item: "Margherita Pizza", quantity: 14, revenue: 237.86 },
      { item: "Grilled Salmon", quantity: 10, revenue: 249.9 },
      { item: "Chocolate Cake", quantity: 18, revenue: 161.82 },
    ],
  },
];
