"use client";

import { useRouter } from "next/navigation";
import { Home, UtensilsCrossed, Store } from "lucide-react";

interface FloatingNavBarProps {
  currentTab: "home" | "menu" | "review";
}

export function FloatingNavBar({ currentTab }: FloatingNavBarProps) {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-[430px] mx-auto">
        <div className="bg-white border border-gray-200 flex overflow-hidden">
          {/* 홈페이지 관리 탭 */}
          <button
            onClick={() => router.push("/home")}
            className={`flex-1 flex flex-col items-center justify-center py-4 px-4 transition-all ${
              currentTab === "home"
                ? "bg-purple-700 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">홈페이지 관리</span>
          </button>

          {/* 메뉴 관리 탭 */}
          <button
            onClick={() => router.push("/menu")}
            className={`flex-1 flex flex-col items-center justify-center py-4 px-4 transition-all ${
              currentTab === "menu"
                ? "bg-purple-700 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <UtensilsCrossed className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">메뉴 관리</span>
          </button>

          {/* 가게 홍보 탭 */}
          <button
            onClick={() => router.push("/review")}
            className={`flex-1 flex flex-col items-center justify-center py-4 px-4 transition-all ${
              currentTab === "review"
                ? "bg-purple-700 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Store className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">가게 홍보</span>
          </button>
        </div>
      </div>
    </div>
  );
}
