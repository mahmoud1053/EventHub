import React, { createContext, useState, useContext, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  token: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    
    const fetchUser = async () => {
      if (storedToken) {
        try {
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
            credentials: "include",
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            // If token is invalid, clear it
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem("token");
        }
      }
      
      setIsLoading(false);
    };
    
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await response.json();
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const data = await response.json();
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.user.firstName}!`,
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please check your information and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
