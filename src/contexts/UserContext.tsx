import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { UserRole } from "../lib/role-permissions";

interface User {
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  roleColor: string;
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUsers = {
  "emma@restaurant.com": {
    name: "Emma Brown",
    email: "emma@restaurant.com",
    role: "Administrator",
    initials: "EB",
    roleColor: "text-red-500",
  },
  "carol@restaurant.com": {
    name: "Carol Davis",
    email: "carol@restaurant.com",
    role: "Manager",
    initials: "CD",
    roleColor: "text-blue-500",
  },
  "alice@restaurant.com": {
    name: "Alice Johnson",
    email: "alice@restaurant.com",
    role: "Server",
    initials: "AJ",
    roleColor: "text-green-500",
  },
  "david@restaurant.com": {
    name: "David Wilson",
    email: "david@restaurant.com",
    role: "Kitchen Staff",
    initials: "DW",
    roleColor: "text-orange-500",
  },
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage on app load
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const value = {
    currentUser,
    setCurrentUser: handleSetCurrentUser,
    logout,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Helper function to get user by email
export function getUserByEmail(email: string): User {
  return (
    defaultUsers[email as keyof typeof defaultUsers] || {
      name: "Unknown User",
      email: email,
      role: "Server",
      initials: "UU",
      roleColor: "text-gray-500",
    }
  );
}
