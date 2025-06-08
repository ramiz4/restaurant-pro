# RestaurantPro - Complete Restaurant Management System

A modern, full-featured restaurant management application built with React, TypeScript, and Tailwind CSS. This application provides comprehensive tools for managing all aspects of restaurant operations including orders, menu management, table reservations, inventory tracking, staff management, and analytics.

## 🚀 Features

### 📊 Dashboard
- Real-time overview of restaurant operations
- Key performance indicators (KPIs)
- Active orders tracking
- Table occupancy status
- Low stock alerts
- Quick action shortcuts

### 🍽️ Order Management
- Create and manage customer orders
- Real-time order status tracking (Pending → Preparing → Ready → Served → Completed → Paid)
- Menu item search and selection
- Special instructions support
- Order filtering and sorting
- Payment processing integration
- Order history and search

### 🍕 Menu Management
- Add, edit, and delete menu items
- Categorize items (Appetizer, Main Course, Dessert, Beverage, Side)
- Price management
- Availability toggle
- Item search and filtering
- Rich item descriptions

### 🪑 Table Management
- Visual table layout
- Real-time table status (Available, Occupied, Reserved, Cleaning)
- Table reservations system
- Capacity management
- Table assignment to orders

### 📦 Inventory Management
- Track stock levels for all ingredients and supplies
- Low stock alerts and notifications
- Restock functionality
- Supplier information
- Cost tracking
- Inventory categories
- Search and filtering

### 👥 User Management
- Staff member profiles
- Role-based access (Server, Manager, Chef, etc.)
- Active/inactive status tracking
- User creation and management

### 📈 Reports & Analytics
- Sales reports and trends
- Revenue analytics
- Top-selling items analysis
- Performance metrics
- Exportable data
- Time-based filtering (Week, Month, Quarter, Year)

### 🎨 Additional Features
- **Dark/Light Theme**: Complete theme switching support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live data synchronization
- **Search & Filtering**: Advanced search capabilities across all modules
- **Modern UI**: Clean, intuitive interface built with shadcn/ui components
- **Accessibility**: WCAG compliant design
- **Performance**: Optimized for speed and efficiency

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

### UI Components
- **shadcn/ui** - High-quality, accessible UI components
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful icon library
- **Recharts** - Composable charting library

### State Management & Data
- **React Query (TanStack Query)** - Server state management
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation

### Styling & Animation
- **Tailwind CSS** - Utility-first CSS
- **tailwindcss-animate** - Animation utilities
- **Framer Motion** - Advanced animations
- **next-themes** - Theme switching

### Development Tools
- **TypeScript** - Static type checking
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **SWC** - Fast TypeScript/JavaScript compiler

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── restaurant/     # Restaurant-specific components
│   │   ├── PaymentDialog.tsx
│   │   ├── RestaurantLayout.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── ThemeToggle.tsx
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts
│   └── UserContext.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utilities and services
│   ├── mock-data.ts    # Mock data for development
│   ├── restaurant-services.ts # API service layer
│   └── utils.ts        # Utility functions
└── pages/              # Page components
    ├── Dashboard.tsx
    ├── Orders.tsx
    ├── Menu.tsx
    ├── Tables.tsx
    ├── Inventory.tsx
    ├── Users.tsx
    ├── Reports.tsx
    ├── Login.tsx
    └── NotFound.tsx
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` to view the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run format.fix` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## 🎯 Usage Guide

### Getting Started
1. **Login**: Use the demo login page to access the system
2. **Dashboard**: Get an overview of your restaurant's current status
3. **Orders**: Create new orders, track existing ones, and process payments
4. **Menu**: Manage your restaurant's menu items and categories
5. **Tables**: Monitor table status and manage reservations
6. **Inventory**: Track stock levels and manage supplies
7. **Reports**: Analyze performance and sales data

### Key Workflows

#### Creating an Order
1. Navigate to the Orders page
2. Click "New Order"
3. Select table and server
4. Add menu items with quantities
5. Include special instructions if needed
6. Submit the order

#### Managing Menu Items
1. Go to Menu page
2. Click "Add Menu Item"
3. Fill in item details (name, description, price, category)
4. Set availability status
5. Save the item

#### Processing Payments
1. Find completed orders in the Orders page
2. Click "Process Payment"
3. Select payment method
4. Enter payment details
5. Complete the transaction

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory for any environment-specific configurations:

```env
VITE_API_URL=your_api_url_here
VITE_APP_TITLE=RestaurantPro
```

### Customization
- **Themes**: Modify theme colors in `tailwind.config.ts`
- **Components**: Customize UI components in `components/ui/`
- **Mock Data**: Update sample data in `lib/mock-data.ts`
- **Services**: Extend API services in `lib/restaurant-services.ts`

## 🧪 Testing

The project uses Vitest for testing. Run tests with:

```bash
npm run test
```

Test files should be placed alongside source files with `.test.ts` or `.spec.ts` extensions.

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1024px and above)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader optimized
- High contrast theme support
- Focus management

## 🔮 Future Enhancements

- Real-time notifications
- Advanced reporting features
- Integration with POS systems
- Multi-location support
- Customer feedback system
- Online ordering integration
- Staff scheduling module
- Supplier management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing issues for solutions

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Lucide](https://lucide.dev/) for the icon library
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework

---

**RestaurantPro** - Streamlining restaurant operations with modern technology. 🍽️✨
