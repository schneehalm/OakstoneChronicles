import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect, useState } from "react";
import logoImg from '@assets/OSC_Logo.png';

// Formular-Validierung für Login
const loginSchema = z.object({
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen haben"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
});

// Formular-Validierung für Registrierung
const registerSchema = z.object({
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen haben"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
  confirmPassword: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginPending, setLoginPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);
  const { toast } = useToast();
  
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/user', { credentials: 'include' });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
      return false;
    }
  };
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  // Simuliert die loginMutation.mutate Funktion
  const loginUser = async (data: { username: string; password: string }) => {
    try {
      setLoginPending(true);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        toast({
          title: "Anmeldung erfolgreich",
          description: `Willkommen zurück, ${userData.username}!`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Anmeldung fehlgeschlagen",
          description: error.message || "Bitte überprüfe deine Anmeldedaten.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setLoginPending(false);
    }
  };
  
  // Simuliert die registerMutation.mutate Funktion
  const registerUser = async (data: { username: string; password: string }) => {
    try {
      setRegisterPending(true);
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        toast({
          title: "Registrierung erfolgreich",
          description: `Willkommen, ${userData.username}!`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Registrierung fehlgeschlagen",
          description: error.message || "Bitte wähle einen anderen Benutzernamen.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setRegisterPending(false);
    }
  };
  
  // Vereinfachte Mock-Objekte für Mutation-Kompatibilität
  const loginMutation = { 
    isPending: loginPending, 
    mutate: loginUser 
  };
  
  const registerMutation = { 
    isPending: registerPending, 
    mutate: registerUser 
  };
  const [activeTab, setActiveTab] = useState<string>("login");

  // Formular für Login
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Formular für Registrierung
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Login-Formular absenden
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  // Registrierungs-Formular absenden
  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    const { username, password } = data;
    registerMutation.mutate({ username, password });
  };

  // Zurücksetzen der Formulare, wenn der Tab wechselt
  useEffect(() => {
    if (activeTab === "login") {
      registerForm.reset();
    } else {
      loginForm.reset();
    }
  }, [activeTab, loginForm, registerForm]);

  // Wenn der Benutzer bereits angemeldet ist, zur Hauptseite umleiten
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Formular-Bereich */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="mb-6 text-center">
              <img 
                src={logoImg} 
                alt="Oakstone Chronicles Logo" 
                className="h-16 mx-auto mb-2" 
              />
              <h1 className="text-2xl font-semibold">Oakstone Chronicles</h1>
              <p className="text-muted-foreground">Dein Begleiter für epische Abenteuer</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Anmelden</TabsTrigger>
                <TabsTrigger value="register">Registrieren</TabsTrigger>
              </TabsList>

              {/* Login-Formular */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Benutzername</FormLabel>
                          <FormControl>
                            <Input placeholder="Dein Benutzername" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passwort</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Dein Passwort" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Anmeldung..." : "Anmelden"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Registrierungs-Formular */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Benutzername</FormLabel>
                          <FormControl>
                            <Input placeholder="Wähle einen Benutzernamen" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passwort</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Wähle ein sicheres Passwort" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passwort bestätigen</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Passwort wiederholen" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Registrierung..." : "Registrieren"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Hero-Bereich */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 to-purple-900/20">
        <div className="flex flex-col justify-center px-12 max-w-xl">
          <h2 className="text-3xl font-bold mb-4">Willkommen bei Oakstone Chronicles</h2>
          <p className="text-lg mb-6">
            Der ultimative Begleiter für deine Rollenspiel-Abenteuer. Dokumentiere deine Helden, verwalte NPCs und behalte den Überblick über deine epischen Quests.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="mr-2 mt-1 bg-primary/20 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="text-primary">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span>Erstelle detaillierte Helden-Profile</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 bg-primary/20 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="text-primary">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span>Verwalte NPCs und deren Beziehungen</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 bg-primary/20 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="text-primary">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span>Dokumentiere Spielsitzungen</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 bg-primary/20 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="text-primary">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span>Behalte den Überblick über deine Quests</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}