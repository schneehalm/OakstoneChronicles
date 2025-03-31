import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import HeroDetail from "@/pages/hero-detail";
import CreateHero from "@/pages/create-hero";
import EditHero from "@/pages/edit-hero";
import Npcs from "@/pages/npcs";
import Sessions from "@/pages/sessions";
import Quests from "@/pages/quests";
import Stats from "@/pages/stats";
import AuthPage from "@/pages/auth-page";
import SettingsPage from "@/pages/settings-page";
import Header from "@/components/layout/Header";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/hero/create" component={CreateHero} />
      <ProtectedRoute path="/hero/:id/edit" component={EditHero} />
      <ProtectedRoute path="/hero/:id/npcs" component={Npcs} />
      <ProtectedRoute path="/hero/:id/sessions" component={Sessions} />
      <ProtectedRoute path="/hero/:id/quests" component={Quests} />
      <ProtectedRoute path="/hero/:id/stats" component={Stats} />
      <ProtectedRoute path="/hero/:id" component={HeroDetail} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAuthPage = location === "/auth";
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-[#1e1e2f] text-[#f5f5f5] font-inter bg-[radial-gradient(circle_at_25%_25%,rgba(127,90,240,0.05)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(212,175,55,0.05)_0%,transparent_50%)]">
          {!isAuthPage && <Header />}
          
          <main className={`flex-grow ${!isAuthPage ? 'container mx-auto px-4 py-6' : ''}`}>
            <Router />
          </main>
          
          {!isAuthPage && !location.includes("/hero/create") && !location.includes("/edit") && (
            <MobileNavigation />
          )}
          
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
