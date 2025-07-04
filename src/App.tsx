import { Suspense, lazy } from "react";

import { HashRouter, Route, Routes } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { NotificationListener } from "@/components/restaurant/NotificationListener";
import { ProtectedRoute } from "@/components/restaurant/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuditLogProvider } from "@/contexts/AuditLogContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { UserProvider } from "@/contexts/UserContext";

// Lazy load page components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Orders = lazy(() => import("./pages/Orders"));
const Menu = lazy(() => import("./pages/Menu"));
const Tables = lazy(() => import("./pages/Tables"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Users = lazy(() => import("./pages/Users"));
const Reports = lazy(() => import("./pages/Reports"));
const AuditLog = lazy(() => import("./pages/AuditLog"));
const OnlineOrder = lazy(() => import("./pages/OnlineOrder"));
const CreateOrder = lazy(() => import("./pages/CreateOrder"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for Suspense fallback
const PageLoading = () => (
  <div className="flex flex-col gap-4 p-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <AuditLogProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <NotificationListener />
            <HashRouter>
              <Suspense fallback={<PageLoading />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute requiredPage="dashboard">
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute requiredPage="dashboard">
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute requiredPage="orders">
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/menu"
                    element={
                      <ProtectedRoute requiredPage="menu">
                        <Menu />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tables"
                    element={
                      <ProtectedRoute requiredPage="tables">
                        <Tables />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute requiredPage="inventory">
                        <Inventory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute requiredPage="users">
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute requiredPage="reports">
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/schedule"
                    element={
                      <ProtectedRoute requiredPage="schedule">
                        <Schedule />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/audit-log"
                    element={
                      <ProtectedRoute requiredPage="audit-log">
                        <AuditLog />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create-order"
                    element={
                      <ProtectedRoute requiredPage="orders">
                        <CreateOrder />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/order" element={<OnlineOrder />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </HashRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuditLogProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
