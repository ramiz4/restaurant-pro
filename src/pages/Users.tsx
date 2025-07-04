import { useEffect, useState } from "react";

import {
  ChefHat,
  Edit,
  Plus,
  Search,
  Shield,
  UserCheck,
  Users as UsersIcon,
} from "lucide-react";

import { PermissionGuard } from "@/components/restaurant/PermissionGuard";
import { RestaurantLayout } from "@/components/restaurant/RestaurantLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuditLog } from "@/contexts/AuditLogContext";
import { User } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";
import { cn } from "@/lib/utils";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { recordAction } = useAuditLog();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "server" as User["role"],
    active: true,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await RestaurantService.getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "manager":
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case "server":
        return <UsersIcon className="h-4 w-4 text-green-500" />;
      case "kitchen":
        return <ChefHat className="h-4 w-4 text-orange-500" />;
      default:
        return <UsersIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      case "server":
        return "secondary";
      case "kitchen":
        return "outline";
      default:
        return "default";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Update existing user
        const updatedUser = await RestaurantService.updateUser(
          editingUser.id,
          formData,
        );
        setUsers((prev) =>
          prev.map((user) => (user.id === editingUser.id ? updatedUser : user)),
        );
        if (editingUser.role !== updatedUser.role) {
          recordAction(
            `Changed role for ${updatedUser.name} from ${editingUser.role} to ${updatedUser.role}`,
            "permission",
          );
        } else {
          recordAction(`Updated user ${updatedUser.name}`, "user");
        }
      } else {
        // Create new user
        const newUser = await RestaurantService.createUser(formData);
        setUsers((prev) => [...prev, newUser]);
        recordAction(`Created user ${newUser.name} (${newUser.role})`, "user");
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        role: "server",
        active: true,
      });
      setEditingUser(null);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    });
    setEditingUser(user);
    setIsAddDialogOpen(true);
  };

  const handleToggleActive = async (userId: string, active: boolean) => {
    try {
      const updatedUser = await RestaurantService.updateUser(userId, {
        active,
      });
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user)),
      );
      recordAction(
        `${active ? "Activated" : "Deactivated"} user ${updatedUser.name}`,
        "permission",
      );
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "server",
      active: true,
    });
    setEditingUser(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const roleStats = {
    admin: users.filter((u) => u.role === "admin").length,
    manager: users.filter((u) => u.role === "manager").length,
    server: users.filter((u) => u.role === "server").length,
    kitchen: users.filter((u) => u.role === "kitchen").length,
  };

  if (loading) {
    return (
      <RestaurantLayout>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </RestaurantLayout>
    );
  }

  return (
    <RestaurantLayout>
      <div className="space-y-6">
        {/* Role Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold">
                    {roleStats.admin}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Admins
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold">
                    {roleStats.manager}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Managers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold">
                    {roleStats.server}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Servers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold">
                    {roleStats.kitchen}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Kitchen Staff
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:space-y-0 md:space-x-4 w-full lg:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full md:w-[300px]"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="server">Server</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <PermissionGuard page="users" action="create">
                <Button className="w-full lg:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </PermissionGuard>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-0 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">
                  {editingUser ? "Edit User" : "Add New User"}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {editingUser
                    ? "Update user information and permissions."
                    : "Create a new user account for your restaurant staff."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: User["role"]) =>
                        setFormData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="server">Server</SelectItem>
                        <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, active: checked }))
                      }
                    />
                    <Label htmlFor="active" className="text-sm">
                      Active account
                    </Label>
                  </div>
                </div>
                <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    {editingUser ? "Update User" : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users List */}
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className={cn(
                "overflow-hidden hover:shadow-md transition-shadow",
                !user.active && "opacity-60",
              )}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                      <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:space-x-2">
                        <h3 className="text-base sm:text-lg font-semibold truncate">
                          {user.name}
                        </h3>
                        {!user.active && (
                          <Badge variant="outline" className="text-xs w-fit">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRoleIcon(user.role)}
                        <Badge
                          variant={getRoleBadgeVariant(user.role)}
                          className="text-xs"
                        >
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-end lg:space-y-0 lg:space-x-4 lg:ml-4">
                    <div className="text-left lg:text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Member since
                      </p>
                      <p className="text-xs sm:text-sm font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end space-x-2">
                      <span className="text-xs text-muted-foreground lg:hidden">
                        {user.active ? "Active" : "Inactive"}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.active}
                          onCheckedChange={(checked) =>
                            handleToggleActive(user.id, checked)
                          }
                        />
                        <PermissionGuard page="users" action="edit">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No users found
                </h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "Get started by adding your first team member."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RestaurantLayout>
  );
}
