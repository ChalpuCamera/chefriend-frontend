"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import {
  getAndClearRedirectUrl,
  parseOAuthCode,
  exchangeCodeForToken,
} from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { storeApi } from "@/lib/api/owner/store";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center p-5">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">로그인 처리 중...</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">잠시만 기다려주세요</p>
      </CardContent>
    </Card>
  </div>
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center p-5">
    <Card className="w-full max-w-md">
      <CardContent className="pt-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </CardContent>
    </Card>
  </div>
);

function OAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      const { code, error, errorDescription } = parseOAuthCode(searchParams);

      // Handle error from OAuth provider
      if (error) {
        toast.error(`로그인 실패: ${errorDescription || error}`);
        router.push("/");
        return;
      }

      // Check if code exists
      if (!code) {
        toast.error("인증 코드가 없습니다.");
        router.push("/");
        return;
      }

      try {
        const {
          accessToken,
          refreshToken,
          role,
          user: userData,
        } = await exchangeCodeForToken(code);

        // Create user object with role information
        const user = userData
          ? { ...userData, role }
          : { id: "", role, email: undefined, name: undefined };

        if (!user) {
          toast.error("사용자 정보를 가져올 수 없습니다.");
          router.push("/");
          return;
        }

        setAuth(accessToken, refreshToken, user);

        toast.success("로그인 성공!");

        // Check if user has any stores
        try {
          const storesResponse = await storeApi.getMyStores({
            page: 0,
            size: 1,
          });
          const hasStore = storesResponse.result.totalElements > 0;

          // Check for redirect URL or determine destination based on store existence
          const redirectUrl = getAndClearRedirectUrl();
          if (redirectUrl) {
            router.push(redirectUrl);
          } else if (hasStore) {
            router.push("/home");
          } else {
            router.push("/welcome");
          }
        } catch (storeError) {
          console.error("Failed to check stores:", storeError);
          const redirectUrl = getAndClearRedirectUrl();
          router.push(redirectUrl || "/home");
        }
      } catch (error) {
        console.error("OAuth token exchange error:", error);
        toast.error("로그인 처리 중 오류가 발생했습니다.");
        router.push("/");
      }
    };

    handleOAuthSuccess();
  }, [searchParams, router, setAuth]);

  return <LoadingSpinner />;
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OAuthSuccessContent />
    </Suspense>
  );
}
