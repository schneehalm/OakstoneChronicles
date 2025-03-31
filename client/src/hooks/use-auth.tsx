import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define the basic types we need
type LoginData = {
  username: string;
  password: string;
};

// Define what our auth context will provide
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: LoginData) => Promise<void>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component that wraps the application
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/user", {
          credentials: "include"
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, []);

  // Login function
  const login = async (credentials: LoginData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest("POST", "/api/login", credentials);
      const userData = await response.json();
      
      setUser(userData);
      toast({
        title: "Login erfolgreich",
        description: `Willkommen zurück, ${userData.username}!`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen");
      toast({
        title: "Login fehlgeschlagen",
        description: err instanceof Error ? err.message : "Unbekannter Fehler",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (credentials: LoginData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest("POST", "/api/register", credentials);
      const userData = await response.json();
      
      setUser(userData);
      toast({
        title: "Registrierung erfolgreich",
        description: `Willkommen, ${userData.username}!`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen");
      toast({
        title: "Registrierung fehlgeschlagen",
        description: err instanceof Error ? err.message : "Unbekannter Fehler",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await apiRequest("POST", "/api/logout");
      
      setUser(null);
      toast({
        title: "Abmeldung erfolgreich",
        description: "Du wurdest erfolgreich abgemeldet.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Abmeldung fehlgeschlagen");
      toast({
        title: "Abmeldung fehlgeschlagen",
        description: err instanceof Error ? err.message : "Unbekannter Fehler",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Create the context value object
  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    register
  };

  // Provide the context to children
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}