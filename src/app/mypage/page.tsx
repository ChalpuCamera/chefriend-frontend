"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronRight,
  AlertCircle,
  Utensils,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { storeApi } from "@/lib/api/owner/store";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client"; 
import { CustomHeader } from "@/components/ui/custom-header";

export default function MyPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Fetch stores
  const { data: storesData } = useQuery({
    queryKey: ["my-stores"],
    queryFn: () => storeApi.getMyStores({ page: 0, size: 10 }),
    enabled: !!user,
  });

  const stores = storesData?.result?.content || [];

  // Hash function to generate consistent number from email
  const hashString = (str: string): number => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(hash);
  };

  // Generate consistent user number (100-999) based on email
  const getUserNumber = (email: string | undefined): number => {
    if (!email) return 100; // fallback for no email
    const hash = hashString(email);
    return (hash % 900) + 100; // 100-999 range
  };

  const userNickname = `사장님 #${getUserNumber(user?.email)}`;

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await apiClient.delete("/api/user/me");
      clearAuth();
      toast.success("회원 탈퇴가 완료되었습니다.");
      router.push("/");
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("회원 탈퇴 중 오류가 발생했습니다.");
    } finally {
      setIsWithdrawing(false);
      setShowWithdrawDialog(false);
    }
  };

  const menuItems = [
    {
      label: "고객센터",
      onClick: () => window.open("https://open.kakao.com/o/sCpB58Hh", "_blank"),
    },
    {
      label: "운영약관",
      onClick: () => window.open("https://chefriend.kr/operation", "_blank"),
    },
    {
      label: "이용약관",
      onClick: () => window.open("https://chefriend.kr/term", "_blank"),
    },
    {
      label: "개인정보 처리 방침",
      onClick: () => window.open("https://chefriend.kr/privacy", "_blank"),
    },
  ];

  const handleBack = () => {
    router.push("/home");
  };

  return (
    <div className="h-screen bg-white w-full mx-auto">
      {/* Header - Figma Design: Back button only */}
      <CustomHeader handleBack={handleBack} title="마이페이지" />

      <div className="px-4 pt-27">
      {/* Profile Section - Figma Design */}
      <div className="w-full bg-white mt-[24px]">
        <div className="flex items-center">
          <div className="w-[54px] h-[54px] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="/logo.png"
              alt="logo"
              width={54}
              height={54}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="ml-[20px] flex-1">
            <p className="text-sub-title-b text-gray-800">
              {userNickname}
            </p>
            <p className="text-sub-body-r text-gray-800">
              {user?.email || "owner@test.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Store Management Section Title */}
      <div className="w-full h-9 flex items-center mt-[40px]">
        <p className="text-sub-body-r text-gray-700">
          가게 관리
        </p>
      </div>

      {/* Store List - Figma Design (Single Store) */}
      <div className="w-full bg-white mt-[8px]">
        {stores.length > 0 ? (
          <div className="h-[70px] w-full bg-white">
            <div className="flex items-center h-full">
              {/* Store Image */}
              <div className="w-[42px] h-[42px] rounded-full overflow-hidden flex-shrink-0">
                {stores[0].thumbnailUrl ? (
                  <Image
                    src={stores[0].thumbnailUrl}
                    alt={stores[0].storeName}
                    width={42}
                    height={42}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Utensils className="w-[20px] h-[20px] text-gray-400" />
                  </div>
                )}
              </div>

              {/* Store Info */}
              <div className="ml-[13px] flex-1">
                <p className="text-body-sb text-gray-700">
                  {stores[0].storeName}
                </p>
                <p className="text-sub-body-r text-gray-600">
                  {stores[0].address || "주소 정보 없음"}
                </p>
              </div>

              {/* Menu Management Button */}
              <button
                onClick={() => router.push(`/menu`)}
                className="h-[25px] p-1.5 flex items-center justify-center rounded-[6px] border border-solid border-gray-800 flex-shrink-0"
              >
                <span className="text-sub-body-sb text-center text-gray-800">
                  메뉴관리
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="h-[70px] w-full bg-white flex items-center justify-center">
            <p className="text-sub-body-r text-gray-400">등록된 가게가 없습니다</p>
          </div>
        )}
      </div>

      {/* Other Info Section Title */}
      <div className="w-full h-[36px] flex items-center mt-[88px]">
        <p className="text-sub-body-r text-gray-700">
          기타 정보
        </p>
      </div>

      {/* Menu Items - Figma Design */}
      <div className="w-full bg-white mt-[8px]">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="h-[48px] w-full bg-white flex items-center justify-between"
          >
            <span className="text-body-sb text-gray-700">
              {item.label}
            </span>
            <ChevronRight className="w-[20px] h-[20px] text-gray-800 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Account Actions - Figma Design */}
      <div className="w-full bg-white mt-[32px]">
        {/* Logout */}
        <div className="h-[48px] w-full bg-white">
          <div className="flex items-center justify-center h-full">
            <LogoutButton
              variant="ghost"
              className="w-full h-full text-body-r text-gray-700"
              showIcon={false}
              showText={true}
            />
          </div>
        </div>

        {/* Withdraw */}
        <button
          onClick={() => setShowWithdrawDialog(true)}
          className="h-[48px] w-full bg-white flex items-center justify-center"
        >
          <span className="text-body-r text-red-400">
            회원탈퇴
          </span>
        </button>
      </div>

      {/* Withdrawal Dialog */}
      <AlertDialog
        open={showWithdrawDialog}
        onOpenChange={setShowWithdrawDialog}
      >
        <AlertDialogContent className="max-w-sm mx-4">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">
              정말 탈퇴하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-center space-y-3">
                <p className="text-sm">
                  셰프렌드와 함께한 모든 정보가 삭제됩니다
                </p>
                <div className="bg-gray-50 rounded-lg p-3 text-left space-y-1">
                  <p className="text-xs text-gray-600">
                    • 가게 정보 및 메뉴 데이터
                  </p>
                  <p className="text-xs text-gray-600">
                    • 고객 피드백 및 분석 데이터
                  </p>
                  <p className="text-xs text-gray-600">• 모든 서비스 이용 기록</p>
                </div>
                <p className="text-xs text-red-600 font-semibold">
                  ⚠️ 이 작업은 되돌릴 수 없습니다
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {isWithdrawing ? "처리 중..." : "탈퇴하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
