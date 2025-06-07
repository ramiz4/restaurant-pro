import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Lock, Mail, Users, Shield, UserCheck } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate authentication
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  const demoUsers = [
    {
      role: "Admin",
      email: "emma@restaurant.com",
      icon: Shield,
      color: "text-red-500",
    },
    {
      role: "Manager",
      email: "carol@restaurant.com",
      icon: UserCheck,
      color: "text-blue-500",
    },
    {
      role: "Server",
      email: "alice@restaurant.com",
      icon: Users,
      color: "text-green-500",
    },
    {
      role: "Kitchen",
      email: "david@restaurant.com",
      icon: ChefHat,
      color: "text-orange-500",
    },
  ];

  const loginAsDemo = (email: string) => {
    setFormData({ email, password: "demo123" });
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ChefHat className="h-12 w-12 text-orange-600" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              RestaurantPro
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Restaurant Management System
          </p>
        </div>
        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your restaurant dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demo Accounts</CardTitle>
            <CardDescription>
              Try the system with different user roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {demoUsers.map((user) => {
                const IconComponent = user.icon;
                return (
                  <Button
                    key={user.email}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => loginAsDemo(user.email)}
                    disabled={loading}
                  >
                    <IconComponent className={`h-6 w-6 ${user.color}`} />
                    <div className="text-center">
                      <div className="font-medium text-sm">{user.role}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Alert>
          <AlertDescription>
            <strong>Demo Mode:</strong> This is a demonstration of the
            Restaurant Management System. All data is simulated and changes are
            not persisted. Click any demo account above to explore different
            user roles and permissions.
          </AlertDescription>
        </Alert>

        {/* Features */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <h3 className="font-semibold">System Features</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Badge variant="outline" className="justify-center">
                Order Management
              </Badge>
              <Badge variant="outline" className="justify-center">
                Menu Control
              </Badge>
              <Badge variant="outline" className="justify-center">
                Table Management
              </Badge>
              <Badge variant="outline" className="justify-center">
                Inventory Tracking
              </Badge>
              <Badge variant="outline" className="justify-center">
                User Management
              </Badge>
              <Badge variant="outline" className="justify-center">
                Sales Reports
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
