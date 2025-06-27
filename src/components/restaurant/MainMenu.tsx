import { Link, useLocation } from "react-router-dom";

import {
  BarChart3,
  CalendarCheck2,
  ChefHat,
  LayoutDashboard,
  ListChecks,
  MenuIcon,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

interface MainMenuProps {
  onNavigate?: () => void;
}

const iconMap = {
  LayoutDashboard,
  ShoppingCart,
  MenuIcon,
  ChefHat,
  Package,
  Users,
  BarChart3,
  ListChecks,
  CalendarCheck2,
};

export function MainMenu({ onNavigate }: MainMenuProps) {
  const location = useLocation();
  const { getNavigationItems } = usePermissions();
  const navigation = getNavigationItems();
  const isMobile = useIsMobile();

  return (
    <SidebarMenu>
      {navigation.map((item) => {
        const isActive =
          location.pathname === item.href ||
          (item.href === "/dashboard" && location.pathname === "/");
        const IconComponent = iconMap[item.icon as keyof typeof iconMap];

        return (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link
                to={item.href}
                onClick={() => {
                  if (isMobile) {
                    onNavigate?.();
                  }
                }}
                className={cn(
                  "flex items-center gap-2",
                  isActive && "font-medium",
                )}
              >
                <IconComponent className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
