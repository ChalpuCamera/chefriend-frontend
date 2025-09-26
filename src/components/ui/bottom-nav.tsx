"use client";

import { Home, ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === "/";

  const handleHomeClick = () => {
    router.push("/");
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="max-w-[430px] mx-auto">
        <div className="flex h-16 items-center justify-around px-4">
          {/* 뒤로가기 버튼 */}
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBackClick}
            className="flex-1 h-full rounded-none flex flex-col gap-1 hover:bg-muted/50"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-xs">뒤로</span>
          </Button>

          {/* 홈 버튼 */}
          <Button
            variant="ghost"
            size="lg"
            onClick={handleHomeClick}
            className={`flex-1 h-full rounded-none flex flex-col gap-1 hover:bg-muted/50 ${
              isHome ? "text-primary" : ""
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">홈</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
