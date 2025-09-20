"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { saveRedirectUrl } from "@/lib/auth";

interface UseAuthOptions {
  required?: boolean;
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { required = false, redirectTo } = options;
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (required && !isAuthenticated) {
      // Save current path for redirect after login
      saveRedirectUrl(pathname);

      // Redirect to login
      const loginPath = redirectTo || "/";
      router.push(loginPath);
    }
  }, [
    isAuthenticated,
    isLoading,
    required,
    user,
    router,
    pathname,
    redirectTo,
  ]);

  return {
    isAuthenticated,
    user,
    isLoading,
  };
}

// Hook for protected pages
export function useRequireAuth() {
  return useAuth({ required: true });
}

// Hook for getting current user
export function useCurrentUser() {
  const { user } = useAuthStore();
  return user;
}
