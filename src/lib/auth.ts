import { useAuthStore } from "@/stores/auth.store";

// Development mode admin token (same as in auth.store.ts)
const DEV_ADMIN_TOKEN = "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI0IiwiZW1haWwiOiJvd25lckB0ZXN0LmNvbSIsInJvbGUiOiJST0xFX09XTkVSIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc1NzkyMzQxMSwiZXhwIjoyMDczMjgzNDExfQ.vkSzvy8BVc0VMMXu4j2-KVdTM363--A8e6QnoKzUvsbKCyYF_yhitvfkDUpgMzWM";

// Check if we're in development mode
export function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Get development token
export function getDevToken(): string | null {
  return isDevMode() ? DEV_ADMIN_TOKEN : null;
}

// Get authorization header
export function getAuthHeader():
  | { Authorization: string }
  | Record<string, never> {
  // In development mode, always use the dev token
  if (isDevMode()) {
    return { Authorization: `Bearer ${DEV_ADMIN_TOKEN}` };
  }

  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  // In development mode, always authenticated
  if (isDevMode()) {
    return true;
  }

  const state = useAuthStore.getState();
  return state.isAuthenticated && !!state.token;
}

// Storage keys
export const AUTH_STORAGE_KEY = "auth-storage";
export const REDIRECT_KEY = "auth-redirect";

// Cookie helper functions
export function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

// Get refresh token from cookie
export function getRefreshTokenFromCookie(): string | null {
  return getCookie("refreshToken") || getCookie("refresh_token");
}

// Save redirect URL before login
export function saveRedirectUrl(url: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(REDIRECT_KEY, url);
  }
}

// Get and clear redirect URL after login
export function getAndClearRedirectUrl(): string | null {
  if (typeof window === "undefined") return null;

  const url = sessionStorage.getItem(REDIRECT_KEY);
  if (url) {
    sessionStorage.removeItem(REDIRECT_KEY);
  }
  return url;
}

// Parse OAuth callback parameters
export function parseOAuthCallback(searchParams: URLSearchParams): {
  token?: string;
  refreshToken?: string;
  error?: string;
  errorDescription?: string;
} {
  return {
    token: searchParams.get("token") || undefined,
    refreshToken: searchParams.get("refreshToken") || undefined,
    error: searchParams.get("error") || undefined,
    errorDescription: searchParams.get("error_description") || undefined,
  };
}

// Parse OAuth code from success callback
export function parseOAuthCode(searchParams: URLSearchParams): {
  code?: string;
  error?: string;
  errorDescription?: string;
} {
  return {
    code: searchParams.get("code") || undefined,
    error: searchParams.get("error") || undefined,
    errorDescription: searchParams.get("error_description") || undefined,
  };
}

// Exchange OAuth code for tokens
export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  refreshToken: string; // RefreshToken from API response
  role: string; // Role from API response
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
}> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/token/exchange`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for refreshToken
      body: JSON.stringify({ code }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to exchange code for token");
  }

  const apiResponse = await response.json();

  // API 응답 구조: { code, message, result: { accessToken, role } }
  const { result } = apiResponse;

  // User info will be managed separately

  // Refresh token is now stored in httpOnly cookie by backend
  // No need to retrieve it here as it will be automatically sent with requests

  return {
    accessToken: result.accessToken,
    refreshToken: "", // Empty string as refresh token is in httpOnly cookie
    role: result.role, // Role from API response
    user: undefined, // User info managed separately
  };
}

// Format token for display (show first/last 4 chars)
export function formatTokenForDisplay(token: string): string {
  if (!token || token.length < 10) return "****";
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}
