"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

function OAuthFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  useEffect(() => {
    // Log error for debugging
    console.error("OAuth failure:", { error, errorDescription });
  }, [error, errorDescription]);

  const handleRetry = () => {
    router.push("/");
  };

  const handleSupport = () => {
    window.open("https://open.kakao.com/o/sCpB58Hh", "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive" />
            <CardTitle className="text-center">로그인 실패</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              로그인 과정에서 문제가 발생했습니다.
            </p>
            {errorDescription && (
              <p className="text-xs text-muted-foreground">
                오류 내용: {errorDescription}
              </p>
            )}
          </div>

          <div className="flex flex-col w-full gap-3">
            <Button onClick={handleRetry} className="w-full">
              다시 시도하기
            </Button>
            <Button
              variant="outline"
              onClick={handleSupport}
              className="w-full"
            >
              문의하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OAuthFailurePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-5">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <OAuthFailureContent />
    </Suspense>
  );
}
