import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<SelectUser, "password">, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<SelectUser, "password">, Error, RegisterData>;
  updateProfileMutation: UseMutationResult<Omit<SelectUser, "password">, Error, UpdateProfileData>;
};

// Erweiterte LoginData mit Validierung
const loginSchema = z.object({
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen lang sein"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
});

type LoginData = z.infer<typeof loginSchema>;

// Erweiterte RegisterData mit Validierung
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
  passwordConfirm: z.string(),
}).refine(data => data.password === data.passwordConfirm, {
  message: "Passwörter stimmen nicht überein",
  path: ["passwordConfirm"],
});

type RegisterData = z.infer<typeof registerSchema>;

// Update-Profildaten
const updateProfileSchema = z.object({
  email: z.string().email("Gültige E-Mail-Adresse erforderlich").optional(),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein").optional(),
  passwordConfirm: z.string().optional(),
}).refine(data => !data.password || !data.passwordConfirm || data.password === data.passwordConfirm, {
  message: "Passwörter stimmen nicht überein",
  path: ["passwordConfirm"],
});

type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60, // 1 Minute
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login fehlgeschlagen");
      }
      return await res.json();
    },
    onSuccess: (user: Omit<SelectUser, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login erfolgreich",
        description: `Willkommen zurück, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      // Entferne passwordConfirm vor dem Senden an den Server
      const { passwordConfirm, ...userData } = credentials;
      
      const res = await apiRequest("POST", "/api/register", userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Registrierung fehlgeschlagen");
      }
      return await res.json();
    },
    onSuccess: (user: Omit<SelectUser, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registrierung erfolgreich",
        description: `Willkommen bei Oakstone Chronicles, ${user.username}!`,
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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      // Invalidiere alle Abfragen, die Benutzerdaten enthalten
      queryClient.invalidateQueries({ predicate: query => query.queryKey.includes('/api/heroes') });
      toast({
        title: "Logout erfolgreich",
        description: "Du wurdest abgemeldet.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      // Entferne passwordConfirm vor dem Senden an den Server
      const { passwordConfirm, ...updateData } = data;
      
      const res = await apiRequest("PATCH", "/api/user", updateData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Profilaktualisierung fehlgeschlagen");
      }
      return await res.json();
    },
    onSuccess: (user: Omit<SelectUser, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Profil aktualisiert",
        description: "Dein Profil wurde erfolgreich aktualisiert.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Profilaktualisierung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateProfileMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth muss innerhalb eines AuthProviders verwendet werden");
  }
  return context;
}

// Validatoren exportieren für die Verwendung in Formularen
export { loginSchema, registerSchema, updateProfileSchema };