import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect, useState } from "react";
import logoImg from '@assets/OSC_Logo.png';
import loginHeroImg from '@assets/Login.webp';

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
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const { toast } = useToast();
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
      {/* Formular-Bereich mit CI-Farben */}
      <div className="flex-1 flex items-center justify-center p-4 bg-[#1e1e2f]">
        <Card className="w-full max-w-md border-[#d4af37]/30 bg-[#1e1e2f]/95 shadow-[0_0_15px_rgba(127,90,240,0.2)]">
          <CardContent className="pt-6">
            <div className="mb-6 text-center">
              <img 
                src={logoImg} 
                alt="Oakstone Chronicles Logo" 
                className="h-20 mx-auto mb-3" 
              />
              <h1 className="text-2xl font-['Cinzel_Decorative'] text-[#d4af37] mb-1">Oakstone Chronicles</h1>
              <p className="text-[#f5f5f5]/80">Dein Begleiter für epische Abenteuer</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-[#1e1e2f]/70 border border-[#d4af37]/30">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-[#7f5af0]/30 data-[state=active]:text-[#d4af37] data-[state=active]:shadow-none border-r border-[#d4af37]/30"
                >
                  Anmelden
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="data-[state=active]:bg-[#7f5af0]/30 data-[state=active]:text-[#d4af37] data-[state=active]:shadow-none"
                >
                  Registrieren
                </TabsTrigger>
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
                          <FormLabel className="text-[#f5f5f5]">Benutzername</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Dein Benutzername" 
                              className="bg-[#1e1e2f]/80 border-[#7f5af0]/30 focus:border-[#d4af37]/60 focus:ring-[#d4af37]/20 placeholder:text-[#f5f5f5]/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff5470]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#f5f5f5]">Passwort</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Dein Passwort" 
                              className="bg-[#1e1e2f]/80 border-[#7f5af0]/30 focus:border-[#d4af37]/60 focus:ring-[#d4af37]/20 placeholder:text-[#f5f5f5]/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff5470]" />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-br from-[#7f5af0] to-[#d4af37]/80 hover:from-[#d4af37] hover:to-[#7f5af0]/80 text-[#1e1e2f] font-medium border-none" 
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
                          <FormLabel className="text-[#f5f5f5]">Benutzername</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Wähle einen Benutzernamen" 
                              className="bg-[#1e1e2f]/80 border-[#7f5af0]/30 focus:border-[#d4af37]/60 focus:ring-[#d4af37]/20 placeholder:text-[#f5f5f5]/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff5470]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#f5f5f5]">Passwort</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Wähle ein sicheres Passwort" 
                              className="bg-[#1e1e2f]/80 border-[#7f5af0]/30 focus:border-[#d4af37]/60 focus:ring-[#d4af37]/20 placeholder:text-[#f5f5f5]/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff5470]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#f5f5f5]">Passwort bestätigen</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Passwort wiederholen" 
                              className="bg-[#1e1e2f]/80 border-[#7f5af0]/30 focus:border-[#d4af37]/60 focus:ring-[#d4af37]/20 placeholder:text-[#f5f5f5]/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff5470]" />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-br from-[#7f5af0] to-[#d4af37]/80 hover:from-[#d4af37] hover:to-[#7f5af0]/80 text-[#1e1e2f] font-medium border-none" 
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

      {/* Hero-Bereich mit Hintergrundbild */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Hintergrundbild */}
        <div className="absolute inset-0">
          <img 
            src={loginHeroImg} 
            alt="Fantasielandschaft mit Bergen und Fluss"
            className="h-full w-full object-cover"
          />
          {/* Overlay für bessere Lesbarkeit */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Inhalt */}
        <div className="relative z-10 flex flex-col justify-center px-12 max-w-xl">
          <h2 className="text-3xl font-['Cinzel_Decorative'] font-bold mb-4 text-[#d4af37]">Willkommen bei Oakstone Chronicles</h2>
          <p className="text-lg mb-6 text-white">
            Der ultimative Begleiter für deine Rollenspiel-Abenteuer. Dokumentiere deine Helden, verwalte NPCs und behalte den Überblick über deine epischen Quests.
          </p>
          <ul className="space-y-3 text-white">
            <li className="flex items-start">
              <div className="mr-2 mt-1 bg-[#d4af37]/30 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d4af37]">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span>Erstelle detaillierte Helden-Profile</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 bg-[#d4af37]/30 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d4af37]">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span>Verwalte NPCs und deren Beziehungen</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 bg-[#d4af37]/30 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d4af37]">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span>Dokumentiere Spielsitzungen</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 bg-[#d4af37]/30 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d4af37]">
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