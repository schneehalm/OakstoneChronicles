import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, loginSchema, registerSchema } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import logoPath from "@assets/OSC_Logo.png";

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [_location, navigate] = useLocation();

  // Wenn der Benutzer bereits eingeloggt ist, zur Startseite weiterleiten
  if (user) {
    navigate("/");
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Formular-Bereich */}
      <div className="w-full md:w-1/2 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md border-2 border-border/50 bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gold font-display">
              {activeTab === "login" ? "Willkommen zurück" : "Neues Konto erstellen"}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {activeTab === "login" 
                ? "Melde dich an, um deine Helden zu verwalten." 
                : "Erstelle ein Konto, um deine Helden zu speichern und über alle Geräte zu synchronisieren."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Anmelden</TabsTrigger>
                <TabsTrigger value="register">Registrieren</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm isLoading={loginMutation.isPending} onSubmit={values => loginMutation.mutate(values)} />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm isLoading={registerMutation.isPending} onSubmit={values => registerMutation.mutate(values)} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Hero-Bereich */}
      <div className="w-full md:w-1/2 bg-[#1a1a2e] p-6 flex flex-col items-center justify-center">
        <div className="max-w-lg text-center">
          <h1 className="text-4xl md:text-5xl font-display text-gold mb-8">Oakstone Chronicles</h1>
          <div className="mb-8">
            <img 
              src={logoPath} 
              alt="Oakstone Chronicles Logo" 
              className="w-32 h-32 mx-auto" 
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-display text-purple-400 mb-6">
            Dokumentiere deine heroischen Abenteuer
          </h2>
          <p className="text-muted-foreground mb-8">
            Erschaffe und verwalte deine Helden, verfolge Quests, 
            dokumentiere Sitzungen und halte wichtige NPCs in einem 
            übersichtlichen und leicht zugänglichen Format fest.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-card/20 backdrop-blur-sm p-3 rounded-lg border border-border/50">
              <span className="block text-purple-400 font-medium mb-1">Profile</span>
              Detaillierte Heldenprofile für jedes Rollenspiel-System
            </div>
            <div className="bg-card/20 backdrop-blur-sm p-3 rounded-lg border border-border/50">
              <span className="block text-purple-400 font-medium mb-1">NPCs</span>
              Verwalte wichtige Charaktere aus deinen Abenteuern
            </div>
            <div className="bg-card/20 backdrop-blur-sm p-3 rounded-lg border border-border/50">
              <span className="block text-purple-400 font-medium mb-1">Quests</span>
              Dokumentiere und verfolge deine aktiven und abgeschlossenen Aufträge
            </div>
            <div className="bg-card/20 backdrop-blur-sm p-3 rounded-lg border border-border/50">
              <span className="block text-purple-400 font-medium mb-1">Sessions</span>
              Halte Sitzungsnotizen und wichtige Ereignisse fest
            </div>
            <div className="bg-card/20 backdrop-blur-sm p-3 rounded-lg border border-border/50">
              <span className="block text-purple-400 font-medium mb-1">Cloud-Speicher</span>
              Greife von überall auf deine Daten zu
            </div>
            <div className="bg-card/20 backdrop-blur-sm p-3 rounded-lg border border-border/50">
              <span className="block text-purple-400 font-medium mb-1">Export/Import</span>
              Teile und sichere deine Helden mit anderen Spielern
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Login-Formular-Komponente
function LoginForm({ 
  isLoading, 
  onSubmit 
}: { 
  isLoading: boolean; 
  onSubmit: (values: LoginValues) => void; 
}) {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Benutzername</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  autoComplete="username" 
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="password" 
                  autoComplete="current-password" 
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-purple-600 hover:bg-purple-700" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Anmelden...
            </>
          ) : (
            "Anmelden"
          )}
        </Button>
      </form>
    </Form>
  );
}

// Registrierungs-Formular-Komponente
function RegisterForm({ 
  isLoading, 
  onSubmit 
}: { 
  isLoading: boolean; 
  onSubmit: (values: RegisterValues) => void; 
}) {
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Benutzername</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  autoComplete="username" 
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="email" 
                  autoComplete="email" 
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="password" 
                  autoComplete="new-password" 
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort bestätigen</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="password" 
                  autoComplete="new-password" 
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-gold hover:bg-amber-600 text-black" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrieren...
            </>
          ) : (
            "Registrieren"
          )}
        </Button>
      </form>
    </Form>
  );
}