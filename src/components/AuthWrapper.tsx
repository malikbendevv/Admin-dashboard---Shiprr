"use client";

import { refreshTokenClientSide } from "@/lib/clientAuth";
import { useEffect, useState } from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  serverAuthResult?: { needsRefresh?: boolean; email?: string } | null; // Result from server-side requireAuth()
}

export default function AuthWrapper({
  children,
  fallback,
  serverAuthResult,
}: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  useEffect(() => {
    // If server auth was successful, we're good
    if (serverAuthResult && !serverAuthResult.needsRefresh) {
      setIsAuthenticated(true);
      return;
    }

    // If server says we need refresh and we haven't tried yet
    if (serverAuthResult?.needsRefresh && !refreshAttempted) {
      handleTokenRefresh();
    } else if (serverAuthResult?.needsRefresh && refreshAttempted) {
      // We already tried refresh but still getting needsRefresh
      // This means refresh failed or backend isn't setting cookies properly
      console.error("Token refresh failed or backend issue");
      window.location.href = "/auth";
    }
  }, [serverAuthResult, refreshAttempted]);

  const handleTokenRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setRefreshAttempted(true);

    try {
      const refreshSuccess = await refreshTokenClientSide();

      if (refreshSuccess) {
        // Add a small delay to ensure cookies are set
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        // Refresh failed, redirect to login
        window.location.href = "/auth";
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      window.location.href = "/auth";
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isAuthenticated === null || isRefreshing) {
    return fallback || <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to /auth
  }

  return <>{children}</>;
}
