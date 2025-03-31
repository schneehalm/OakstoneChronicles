import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteComponentProps } from "wouter";
import { ComponentType, useEffect, useState } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: ComponentType<any>;
}) {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <Route
        path={path}
        component={() => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      />
    );
  }

  if (!user) {
    return (
      <Route
        path={path}
        component={() => <Redirect to="/auth" />}
      />
    );
  }

  return <Route path={path} component={Component} />;
}