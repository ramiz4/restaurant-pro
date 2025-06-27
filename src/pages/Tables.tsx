import { PermissionGuard } from "@/components/restaurant/PermissionGuard";
import { RestaurantLayout } from "@/components/restaurant/RestaurantLayout";
import { TableLayoutView } from "@/components/restaurant/TableLayoutView";

export default function Tables() {
  return (
    <RestaurantLayout>
      <PermissionGuard page="tables">
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Table Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your restaurant's table layout.
            </p>
          </div>
          <TableLayoutView />
        </div>
      </PermissionGuard>
    </RestaurantLayout>
  );
}
