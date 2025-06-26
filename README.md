# RestaurantPro - Complete Restaurant Management System

A modern, full-featured restaurant management application built with React, TypeScript, and Tailwind CSS. This application provides comprehensive tools for managing all aspects of restaurant operations including orders, menu management, table reservations, inventory tracking, staff management, and analytics.

**🔐 Now featuring comprehensive Role-Based Access Control (RBAC) with 4 distinct user roles!**

## 🚀 Live Demo

🌐 **[View Live Application](https://ramiz4.github.io/restaurant-pro/)**

## 🚀 Features

### 🔐 Role-Based Access Control (NEW!)

- **Four distinct user roles**: Administrator, Manager, Server, Kitchen Staff
- **Page-level access control**: Users only see pages they're authorized to access
- **Action-level permissions**: Fine-grained control over specific operations
- **Dynamic navigation**: Menu items filter based on user role
- **Secure authentication**: Role-based login system
- **Permission guards**: UI elements show/hide based on permissions

#### User Roles & Permissions:

- **Administrator**: Full access to all features and user management
- **Manager**: All features except user deletion permissions
- **Server**: Orders, tables, reservations + view-only menu/inventory
- **Kitchen Staff**: Order status updates + view-only menu/inventory

### 📊 Dashboard

- Real-time overview of restaurant operations
- Key performance indicators (KPIs)
- Active orders tracking
- Table occupancy status
- Low stock alerts
- Quick action shortcuts

### 🍽️ Order Management

- Create and manage customer orders with role-based permissions
- Real-time order status tracking (Pending → Preparing → Ready → Served → Completed → Paid)
- **Smart server assignment**: Automatically preselects current user as server for new orders
- Menu item search and selection
- Special instructions support
- Order filtering and sorting
- **Role-restricted payment processing**: Only authorized roles can process payments
- Order history and search
- **Kitchen staff workflow**: Specialized interface for order status updates
- **Online ordering interface**: Customers can place orders online and staff receive them in the orders view

### 🍕 Menu Management

- Add, edit, and delete menu items (role-based permissions)
- Categorize items (Appetizer, Main Course, Dessert, Beverage, Side)
- Price management
- Availability toggle
- Item search and filtering
- Rich item descriptions
- **View-only access** for Server and Kitchen Staff roles

### 🪑 Table Management

- Visual table layout with real-time status
- Table status management (Available, Occupied, Reserved, Cleaning)
- **Role-based table operations**: Servers and managers can modify table status
- Advanced reservation system with customer details
- Capacity management
- Table assignment to orders
- **Permission-controlled reservations**: Only authorized roles can create/modify reservations

### 📦 Inventory Management

- Track stock levels for all ingredients and supplies
- Low stock alerts and notifications
- **Role-controlled restocking**: Only managers and administrators can restock
- Supplier information
- Cost tracking
- Inventory categories
- Search and filtering
- **View-only access** for Server and Kitchen Staff roles

### 👥 User Management

- Staff member profiles with comprehensive role assignments
- **Four role types**: Administrator, Manager, Server, Kitchen Staff
- Active/inactive status tracking
- **Role-restricted user creation**: Only administrators can create/edit users
- **Permission-based deletion**: Only administrators can delete users
- User search and filtering capabilities

### 📈 Reports & Analytics

- Sales reports and trends analysis
- Revenue analytics and forecasting
- Top-selling items analysis
- Performance metrics dashboard
- **Role-restricted export functionality**: Only managers and administrators can export data
- Time-based filtering (Week, Month, Quarter, Year)
- **View-only access** for non-management roles

### 🎨 Additional Features

- **Role-Based Access Control (RBAC)**: Comprehensive permission system with 4 user roles
- **Dynamic UI**: Interface adapts based on user permissions
- **Smart Server Assignment**: Automatic user preselection for orders
- **Permission Guards**: Fine-grained control over UI elements and actions
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
│   │   ├── ProtectedRoute.tsx      # NEW: Route-level access control
│   │   ├── PermissionGuard.tsx     # NEW: Action-level permission guards
│   │   ├── ThemeProvider.tsx
│   │   └── ThemeToggle.tsx
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts
│   └── UserContext.tsx
├── hooks/              # Custom React hooks
│   └── use-permissions.tsx         # NEW: Permission checking hook
├── lib/                # Utilities and services
│   ├── mock-data.ts    # Mock data for development
│   ├── restaurant-services.ts # API service layer
│   ├── role-permissions.ts        # NEW: RBAC permission definitions
│   └── utils.ts        # Utility functions
└── pages/              # Page components (all now RBAC-protected)
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

### Demo Users (for RBAC Testing)

Test the role-based access control system with these demo users:

| Role              | Email                | Password | Access Level                              |
| ----------------- | -------------------- | -------- | ----------------------------------------- |
| **Administrator** | emma@restaurant.com  | password | Full system access                        |
| **Manager**       | carol@restaurant.com | password | All features except user deletion         |
| **Server**        | alice@restaurant.com | password | Orders, tables + view-only menu/inventory |
| **Kitchen Staff** | david@restaurant.com | password | Order updates + view-only menu/inventory  |

Each role demonstrates different permission levels and UI adaptations.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run format.fix` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## 🎯 Usage Guide

### Getting Started with RBAC

1. **Login**: Use the demo login page with role-based access
2. **Role Selection**: Choose from Administrator, Manager, Server, or Kitchen Staff
3. **Dashboard**: Interface adapts to show relevant information for your role
4. **Navigation**: Menu items filter automatically based on your permissions
5. **Features**: Access only the features authorized for your role

### Role-Specific Workflows

#### 👨‍💼 Administrator

- Full access to all features
- User management and role assignments
- System configuration and settings
- Complete reporting and analytics

#### 👩‍💼 Manager

- All operational features
- Staff scheduling and management
- Financial reporting and analytics
- Inventory and menu management

#### 🍽️ Server

- Create and manage orders (auto-assigned as server)
- Table management and reservations
- Customer service operations
- View-only access to menu and inventory

#### 👨‍🍳 Kitchen Staff

- Order status updates and kitchen workflow
- Menu item availability management
- View inventory for planning
- Focused kitchen operations interface

### Key Workflows

#### Creating an Order (Server/Manager/Admin)

1. Navigate to the Orders page
2. Click "New Order" (if authorized)
3. Table and server auto-populated based on role
4. Add menu items with quantities
5. Include special instructions if needed
6. Submit the order

#### Managing Menu Items (Manager/Admin)

1. Go to Menu page
2. Click "Add Menu Item" (if authorized)
3. Fill in item details (name, description, price, category)
4. Set availability status
5. Save the item

#### Processing Payments (Manager/Admin)

1. Find completed orders in the Orders page
2. Click "Process Payment" (if authorized)
3. Select payment method
4. Enter payment details
5. Complete the transaction

## 🔐 RBAC Implementation

The application features a comprehensive Role-Based Access Control system with:

### Permission System

- **Page-level access control**: Routes protected by role permissions
- **Action-level permissions**: Fine-grained control over specific operations
- **Dynamic UI**: Components show/hide based on user permissions
- **Secure routing**: Unauthorized access redirects to appropriate pages

### Implementation Files

- `role-permissions.ts` - Permission definitions for all roles
- `use-permissions.tsx` - Custom hook for permission checking
- `ProtectedRoute.tsx` - Route-level access control component
- `PermissionGuard.tsx` - Action-level permission guard component

### Testing RBAC

See `RBAC_IMPLEMENTATION.md` for comprehensive testing instructions and permission matrices.

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

## 📝 Linting

Check code quality with:

```bash
npm run lint
```

## 🏗️ Build

Create a production build with:

```bash
npm run build
```

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

- **Advanced RBAC Features**: Custom role creation, permission inheritance
- **Audit Logging**: Track user actions and permission changes
- **Multi-tenant Support**: Support for multiple restaurant locations
- **Real-time Notifications**: Push notifications for role-specific events
- **Advanced Reporting Features**: Role-based report customization
- **Integration with POS Systems**: Enterprise-grade point of sale integration
- **Customer Feedback System**: Role-based customer interaction management
- **Staff Scheduling Module**: Role-based schedule management
- **Supplier Management**: Vendor relationships with permission controls

## 🚀 Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

#### Setup Instructions:

1. **Push to GitHub**: Ensure your code is pushed to a GitHub repository
2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as the source
3. **Configure Repository Name**:
   - If your repository name is different from `restaurant-pro`, update the `base` path in `vite.config.ts`:
   ```typescript
   base: mode === 'production' ? '/restaurant-pro/' : '/',
   ```

#### Automatic Deployment:

- **Trigger**: Successful `CI` workflow on the `main` branch
- **Process**: CI builds and uploads artifacts → Deploy workflow publishes them
- **URL**: `https://ramiz4.github.io/restaurant-pro/`

#### Manual Deployment:

```bash
# Build the project
npm run build

# Preview locally
npm run preview
```

The deployment workflow includes:

- ✅ Downloading build artifacts from CI
- ✅ Automatic deployment to GitHub Pages

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
