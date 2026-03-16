import useAuth from "@/Hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // user object shape from endpoint: { id, email, isAdmin, isBlocked, ... }
  if (user && (user).isAdmin) {
    return <>{children}</>;
  }

  return <Navigate to="/" state={{ from: location }} replace />;
}
