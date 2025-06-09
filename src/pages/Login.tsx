import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  ChefHat,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

import { ThemeToggle } from "@/components/restaurant/ThemeToggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserByEmail, useUser } from "@/contexts/UserContext";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser, currentUser } = useUser();

  const from = location.state?.from?.pathname || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate authentication and set current user
    setTimeout(() => {
      const user = getUserByEmail(formData.email);
      setCurrentUser(user);
      setLoading(false);
      navigate(from, { replace: true });
    }, 1200);
  };

  const demoUsers = [
    {
      role: "Admin",
      email: "emma@restaurant.com",
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      description: "Full system access",
    },
    {
      role: "Manager",
      email: "carol@restaurant.com",
      icon: UserCheck,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      description: "Operations management",
    },
    {
      role: "Server",
      email: "alice@restaurant.com",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      description: "Order & table management",
    },
    {
      role: "Kitchen",
      email: "david@restaurant.com",
      icon: ChefHat,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      description: "Kitchen operations",
    },
  ];

  const loginAsDemo = (email: string) => {
    setFormData({ email, password: "demo123" });
    setLoading(true);
    setTimeout(() => {
      const user = getUserByEmail(email);
      setCurrentUser(user);
      setLoading(false);
      navigate(from, { replace: true });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg space-y-8 relative">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-2xl"></div>

        <div className="relative z-10 p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <ChefHat className="h-16 w-16 text-orange-600" />
                <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  RestaurantPro
                </h1>
                <p className="text-orange-600 dark:text-orange-400 font-medium">
                  Management System
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Welcome back! Please sign in to continue.
            </p>
          </div>

          {/* Login Form */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
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
                      className="pl-10 h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="pl-10 pr-10 h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                      autoComplete="current-password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-10 w-10 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-center text-gray-900 dark:text-white">
                Quick Demo Access
              </CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                Try different user roles instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoUsers.map((user) => {
                  const IconComponent = user.icon;
                  return (
                    <Button
                      key={user.email}
                      variant="outline"
                      className={`h-auto p-4 flex flex-col items-start space-y-2 text-left ${user.bgColor} border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200`}
                      onClick={() => loginAsDemo(user.email)}
                      disabled={loading}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <IconComponent className={`h-6 w-6 ${user.color}`} />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {user.role}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                        {user.email}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl mt-6">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Complete Restaurant Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Everything you need to run your restaurant efficiently
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                <Badge
                  variant="outline"
                  className="justify-center py-2 bg-white/50 dark:bg-gray-800/50"
                >
                  📋 Order Management
                </Badge>
                <Badge
                  variant="outline"
                  className="justify-center py-2 bg-white/50 dark:bg-gray-800/50"
                >
                  🍽️ Menu Control
                </Badge>
                <Badge
                  variant="outline"
                  className="justify-center py-2 bg-white/50 dark:bg-gray-800/50"
                >
                  🪑 Table Management
                </Badge>
                <Badge
                  variant="outline"
                  className="justify-center py-2 bg-white/50 dark:bg-gray-800/50"
                >
                  📦 Inventory Tracking
                </Badge>
                <Badge
                  variant="outline"
                  className="justify-center py-2 bg-white/50 dark:bg-gray-800/50"
                >
                  👥 User Management
                </Badge>
                <Badge
                  variant="outline"
                  className="justify-center py-2 bg-white/50 dark:bg-gray-800/50"
                >
                  📊 Sales Reports
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Demo Notice */}
          <Alert className="bg-blue-50/70 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Demo Mode:</strong> This is a complete demonstration of
              our Restaurant Management System. All data is simulated for
              showcase purposes. Choose any demo account above to explore the
              full feature set!
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
