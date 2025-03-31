import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, updateProfileSchema } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, KeyRound, Mail, ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export default function SettingsPage() {
  const { user, updateProfileMutation, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"account" | "security">("account");
  
  if (!user) {
    return null; // Geschützte Route sollte dies ohnehin verhindern
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </Link>
        <h1 className="text-2xl font-display text-gold">Einstellungen</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Seitenleiste */}
        <div className="md:col-span-1">
          <Card className="bg-card/50 backdrop-blur-sm border-purple-800/20">
            <CardContent className="p-4">
              <div className="space-y-1 mb-6">
                <h3 className="text-lg font-medium text-gold">
                  {user.username}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              
              <Tabs 
                orientation="vertical" 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as "account" | "security")}
                className="w-full"
              >
                <TabsList className="flex flex-col h-auto bg-transparent space-y-1">
                  <TabsTrigger 
                    value="account" 
                    className="w-full justify-start px-2 data-[state=active]:bg-purple-800/20"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Konto
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="w-full justify-start px-2 data-[state=active]:bg-purple-800/20"
                  >
                    <KeyRound className="h-4 w-4 mr-2" />
                    Sicherheit
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Separator className="my-4 bg-border/50" />
              
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Abmelden...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Hauptinhalt */}
        <div className="md:col-span-3">
          <Tabs value={activeTab} className="w-full hidden">
            <TabsContent value="account" className="mt-0">
              <AccountSettings />
            </TabsContent>
            <TabsContent value="security" className="mt-0">
              <SecuritySettings />
            </TabsContent>
          </Tabs>
          
          {activeTab === "account" && <AccountSettings />}
          {activeTab === "security" && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}

function AccountSettings() {
  const { user, updateProfileMutation } = useAuth();
  
  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });
  
  function onSubmit(values: UpdateProfileValues) {
    // Nur senden, wenn sich etwas geändert hat
    if (values.email !== user?.email) {
      updateProfileMutation.mutate(values);
    }
  }
  
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-purple-800/20">
      <CardHeader>
        <CardTitle className="text-xl text-gold">Konto-Einstellungen</CardTitle>
        <CardDescription>
          Verwalte deine Kontoinformationen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Mail</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        <Mail className="h-4 w-4" />
                      </span>
                      <Input
                        {...field}
                        type="email"
                        className="rounded-l-none"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Dies ist die E-Mail-Adresse, die mit deinem Konto verknüpft ist.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending || !form.formState.isDirty}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  "Speichern"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  const { updateProfileMutation } = useAuth();
  
  // Erweitertes Schema für Passwortänderung
  const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, "Aktuelles Passwort ist erforderlich"),
    password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
    passwordConfirm: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
  }).refine(data => data.password === data.passwordConfirm, {
    message: "Passwörter stimmen nicht überein",
    path: ["passwordConfirm"],
  });
  
  type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
  
  const form = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      passwordConfirm: "",
    },
  });
  
  function onSubmit(values: PasswordChangeValues) {
    // Wir senden nicht das currentPassword an die API
    const { currentPassword, ...passwordData } = values;
    updateProfileMutation.mutate(passwordData);
    
    // Formular zurücksetzen nach dem Absenden
    if (!updateProfileMutation.isPending) {
      form.reset();
    }
  }
  
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-purple-800/20">
      <CardHeader>
        <CardTitle className="text-xl text-gold">Sicherheits-Einstellungen</CardTitle>
        <CardDescription>
          Verwalte dein Passwort und die Sicherheitseinstellungen deines Kontos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-purple-800/10 border-purple-800/30">
          <ShieldAlert className="h-4 w-4 text-purple-400" />
          <AlertTitle className="text-purple-400">Sicherheitshinweis</AlertTitle>
          <AlertDescription>
            Wähle ein sicheres Passwort und verwende es nicht für andere Dienste.
          </AlertDescription>
        </Alert>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aktuelles Passwort</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        <KeyRound className="h-4 w-4" />
                      </span>
                      <Input
                        {...field}
                        type="password"
                        className="rounded-l-none"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
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
                  <FormLabel>Neues Passwort</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      disabled={updateProfileMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Mindestens 6 Zeichen
                  </FormDescription>
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
                      disabled={updateProfileMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending || !form.formState.isDirty}
                className="bg-gold hover:bg-amber-600 text-black"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Passwort ändern...
                  </>
                ) : (
                  "Passwort ändern"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}