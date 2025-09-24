import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const token = getAuthToken();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!token,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/auth/me");
      return response.json();
    },
  });

  useEffect(() => {
    if (!token || error) {
      setLocation("/login");
    }
  }, [token, error, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
