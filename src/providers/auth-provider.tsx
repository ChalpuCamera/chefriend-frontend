"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { usePathname, useRouter } from "next/navigation";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check auth on mount and when pathname changes
    const verifyAuth = async () => {
      const isValid = await checkAuth();

      if (!isValid) {
        // If not authenticated and trying to access protected route
        if (pathname.includes("/home") || pathname.includes("/mypage")) {
          router.push("/");
        }
      } else if (user) {
        // User is authenticated - no role validation needed
      }
    };

    verifyAuth();
  }, [pathname, checkAuth, router, user]);

  // Set up token refresh interval
  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh token every 50 minutes (assuming 1 hour token validity)
    const interval = setInterval(async () => {
      const store = useAuthStore.getState();
      if (store.token) {
        await store.refreshAccessToken();
      }
    }, 50 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Handle visibility change (refresh token when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        await checkAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAuthenticated, checkAuth]);

  return <>{children}</>;
}
