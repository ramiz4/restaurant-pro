import { ReactNode, useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { ChefHat, LogOut, Menu } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuditLog } from "@/contexts/AuditLogContext";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

import { MainMenu } from "./MainMenu";
import { ThemeToggle } from "./ThemeToggle";

interface RestaurantLayoutProps {
  children: ReactNode;
}

export function RestaurantLayout({ children }: RestaurantLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useUser();
  const { recordAction } = useAuditLog();
  const { getNavigationItems } = usePermissions();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

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
    recordAction("Logged out", "auth");
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

  // Sidebar content component to reuse between mobile and desktop
  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <ChefHat className="h-8 w-8 text-orange-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            RestaurantPro
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <MainMenu onNavigate={() => setSidebarOpen(false)} />
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
                currentUser?.roleColor || "text-gray-500 dark:text-gray-400",
              )}
            >
              {currentUser?.role || "User"}
            </p>
          </div>
          {!isMobile && <ThemeToggle />}
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
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar */}
      {isMobile ? (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <div className="flex">
            {/* Mobile Header */}
            <div className="fixed top-0 left-0 right-0 z-[60] flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4">
              <div className="flex items-center space-x-3">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <div className="flex items-center space-x-2">
                  <ChefHat className="h-6 w-6 text-orange-600" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    RestaurantPro
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="hidden sm:inline-flex bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                >
                  Restaurant Open
                </Badge>
                <ThemeToggle />
              </div>
            </div>

            <SheetContent
              side="left"
              className="w-80 bg-white dark:bg-gray-800 p-0"
            >
              <SidebarContent />
            </SheetContent>
          </div>

          {/* Mobile Main content */}
          <main className="pt-24 p-4 sm:p-6">{children}</main>
        </Sheet>
      ) : (
        /* Desktop Layout */
        <>
          {/* Desktop Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg">
            <SidebarContent />
          </div>

          {/* Desktop Main content */}
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
                <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {formatDateTime(currentDateTime)}
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Page content */}
            <main className="p-4 lg:p-6">{children}</main>
          </div>
        </>
      )}
    </div>
  );
}
