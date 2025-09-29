"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Store,
  ChevronRight,
  MessageCircle,
  FileText,
  Shield,
  AlertCircle,
  Utensils,
  Plus,
  ChefHat,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { storeApi } from "@/lib/api/owner/store";
import { useQuery } from "@tanstack/react-query";
import { CustomHeader } from "@/components/ui/custom-header";
import { apiClient } from "@/lib/api/client";

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
  const totalStores = stores.length;

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
      icon: MessageCircle,
      label: "고객센터",
      description: "도움이 필요하신가요?",
      onClick: () => window.open("https://open.kakao.com/o/sCpB58Hh", "_blank"),
      color: "text-purple-600",
    },
    {
      icon: FileText,
      label: "운영약관",
      description: "서비스 운영 정책",
      onClick: () => window.open("https://chefriend.kr/operation", "_blank"),
      color: "text-blue-600",
    },
    {
      icon: FileText,
      label: "이용약관",
      description: "서비스 이용 약관",
      onClick: () => window.open("https://chefriend.kr/term", "_blank"),
      color: "text-blue-600",
    },
    {
      icon: Shield,
      label: "개인정보 처리방침",
      description: "고객님의 정보를 안전하게",
      onClick: () => window.open("https://chefriend.kr/privacy", "_blank"),
      color: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      {/* Header with brand color */}
      <CustomHeader handleBack={() => router.back()} title="마이페이지" />

      <div className="px-5 py-6 space-y-6 max-w-md mx-auto pt-30">
        {/* Profile Section with Chef Theme */}
        <div className="relative">
          <div className="absolute -top-3 -right-3 w-32 h-32 bg-purple-200 rounded-full opacity-30 blur-3xl"></div>
          <Card className="overflow-hidden border-0 shadow-xl bg-white">
            <CardHeader className="pb-4 bg-gradient-to-b from-purple-50/50 to-white">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br bg-purple-700 flex items-center justify-center shadow-xl">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {user?.name || "사장님"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {user?.email || "owner@chefriend.com"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {totalStores > 0 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {totalStores}개 매장
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Menu Management Button */}
        <button
          onClick={() => router.push("/menu")}
          className="w-full bg-gradient-to-r bg-purple-700 rounded-xl p-4 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">메뉴 관리</p>
                <p className="text-white/80 text-xs">
                  메뉴를 추가하고 관리하세요
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/80" />
          </div>
        </button>

        {/* My Store Section - MVP 단일 가게 */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-gray-200 pb-3 pt-0 mb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Store className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900">내 가게</h3>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {stores.length > 0 ? (
              <button className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-purple-50 transition-all duration-200 group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-sm">
                    <Utensils className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      {stores[0].storeName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stores[0].address || "주소 정보 없음"}
                    </p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <Store className="h-10 w-10 text-purple-500" />
                </div>
                <p className="text-gray-600 font-medium mb-1">
                  아직 등록된 가게가 없어요
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  가게를 등록해보세요!
                </p>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                  onClick={() => router.push("/store/add")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  가게 등록하기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Menu */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 group shadow-sm hover:shadow-md"
              onClick={item.onClick}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors`}
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500">{item.description}</p>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </button>
          ))}
        </div>

        {/* Account Actions */}
        <div className="space-y-3 pt-4">
          <LogoutButton
            variant="outline"
            className="w-full border-purple-200 hover:border-purple-400 hover:bg-purple-50"
            showIcon={true}
            showText={true}
          />

          <button
            className="w-full py-3 text-sm text-red-600 transition-colors"
            onClick={() => setShowWithdrawDialog(true)}
          >
            회원 탈퇴
          </button>
        </div>

        {/* App Info */}
        <div className="text-center space-y-2 pt-8 pb-4">
          <Image
            src="/chefriend_logo.png"
            alt="Chefriend"
            width={100}
            height={30}
            className="mx-auto opacity-60"
          />
          <p className="text-xs text-gray-400">버전 1.0.0 | © 2024 Chefriend</p>
        </div>
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
                  셰프랜드와 함께한 모든 정보가 삭제됩니다
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
  );
}
