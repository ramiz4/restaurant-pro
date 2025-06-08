import { ReactNode, useEffect, useState } from "react";

import {
  BarChart3,
  ChefHat,
  LayoutDashboard,
  LogOut,
  MenuIcon,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "./ThemeToggle";

interface RestaurantLayoutProps {
  children: ReactNode;
}

// Icon mapping for dynamic icon rendering
const iconMap = {
  LayoutDashboard,
  ShoppingCart,
  MenuIcon,
  ChefHat,
  Package,
  Users,
  BarChart3,
};

export function RestaurantLayout({ children }: RestaurantLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useUser();
  const { getNavigationItems } = usePermissions();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Get navigation items based on user role
  const navigation = getNavigationItems();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  // Format date and time for European Balkan format with English day names
  const formatDateTime = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = weekdays[date.getDay()];

    return `${dayName}, ${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                RestaurantPro
              </span>
            </div>
          </div>{" "}
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href === "/dashboard" && location.pathname === "/");

              const IconComponent = iconMap[item.icon as keyof typeof iconMap];

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                  )}
                >
                  <IconComponent className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          {/* User info */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {currentUser?.initials || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentUser?.name || "Unknown User"}
                </p>
                <p
                  className={cn(
                    "text-xs font-medium",
                    currentUser?.roleColor ||
                      "text-gray-500 dark:text-gray-400",
                  )}
                >
                  {currentUser?.role || "User"}
                </p>
              </div>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {navigation.find(
              (item) =>
                location.pathname === item.href ||
                (item.href === "/dashboard" && location.pathname === "/"),
            )?.name || "Dashboard"}
          </h1>

          <div className="flex items-center space-x-4">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            >
              Restaurant Open
            </Badge>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              {formatDateTime(currentDateTime)}
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
