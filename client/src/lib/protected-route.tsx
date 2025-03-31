import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { ComponentType } from "react";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: ComponentType<any>;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route
        path={path}
        component={() => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-[#7f5af0]" />
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