import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { queryClient, getQueryFn, apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { User } from "@shared/schema";

// Login-Formular-Daten
type LoginData = {
  username: string;
  password: string;
}

// Registrierungsformular-Daten
type RegisterData = {
  username: string;
  password: string;
}

// Auth-Kontext-Typ
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

// Erstellen des Auth-Kontexts
export const AuthContext = createContext<AuthContextType | null>(null);

// Auth-Provider-Komponente
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Benutzerdaten abfragen
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Login-Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Anmeldung erfolgreich",
        description: `Willkommen zurück, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Registrierungs-Mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Registrierung erfolgreich",
        description: `Willkommen, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout-Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Abmeldung erfolgreich",
        description: "Du wurdest erfolgreich abgemeldet.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Abmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Auth-Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth muss innerhalb eines AuthProviders verwendet werden");
  }
  return context;
}