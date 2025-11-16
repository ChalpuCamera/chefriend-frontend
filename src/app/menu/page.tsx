"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useFoodsByStore, foodKeys } from "@/lib/hooks/useFood";
import { useMyStores } from "@/lib/hooks/useStore";
import { MenuAddMethodDialog } from "@/components/menu-add-method-dialog";
import { FloatingNavBar } from "@/components/floating-nav-bar";
import { MenuExtractionProgressDialog } from "@/components/menu-extraction-progress-dialog";
import { useMenuExtraction } from "@/lib/hooks/useMenuExtraction";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMethodDialogOpen, setIsMethodDialogOpen] = useState(false);

  // Get user's stores (첫 번째 가게 우선)
  const { data: storesData } = useMyStores({ size: 10 });
  const stores = storesData?.content || [];
  // storeId가 가장 작은 가게 (첫 번째 가게) 선택
  const currentStore =
    stores.length > 0
      ? stores.reduce((first, store) =>
          store.storeId < first.storeId ? store : first
        )
      : null;
  const storeId = currentStore?.storeId;

  const { data: foodsData, isLoading } = useFoodsByStore(
    storeId!,
    { size: 100 }, // 최대 100개까지 표시
    { enabled: !!storeId }
  );

  // 메뉴 추출 훅
  const { startExtraction, isExtracting, progress, currentStep } =
    useMenuExtraction(storeId!);

  const menuItems = foodsData?.content?.map((food) => ({
    id: food.id || food.foodItemId, // 새 필드명 우선, 구 필드명 폴백
    name: food.name || food.foodName || "", // 새 필드명 우선, 구 필드명 폴백
    price: food.price,
    description: food.description,
    reviewCount: 0, // TODO: 리뷰 수 API 추가 필요
    imageUrl: food.photoUrl || food.thumbnailUrl || undefined, // 새 필드명 우선, 구 필드명 폴백
  }));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>로딩중...</div>
      </div>
    );
  }

  const handleBack = () => {
    router.push("/home");
  };

  const handleAddMenu = () => {
    setIsMethodDialogOpen(true);
  };

  const handleSelectMethod = (method: "ai" | "manual") => {
    if (method === "ai") {
      // 이미지 선택 input 트리거
      fileInputRef.current?.click();
    } else {
      // 직접 추가 화면으로 이동
      router.push("/menu/add");
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // input 초기화
    e.target.value = "";

    if (!storeId) {
      toast.error("가게 정보를 불러올 수 없습니다");
      return;
    }

    try {
      await startExtraction(file);

      // 완료 시
      toast.success("메뉴가 추가되었습니다!");

      // 메뉴 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: foodKeys.listByStore(storeId),
      });
    } catch (error) {
      // 에러 처리
      const err = error as Error;
      if (err.message === "TIMEOUT") {
        toast.error("시간이 너무 오래 걸려요. 나중에 다시 시도해주세요");
      } else if (err.message.includes("메뉴 추출")) {
        toast.error(err.message);
      } else {
        toast.error("이미지 업로드에 실패했습니다");
      }
    }
  };

  return (
    <div className="h-screen bg-white w-full mx-auto">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <div className="max-w-[430px] mx-auto">
          <div className="flex items-center h-11 px-3.5">
            <button
              className="flex items-center justify-center"
              onClick={handleBack}
            >
              <ArrowLeft size={24} className="text-foreground" />
            </button>
          </div>

          {/* Title */}
          <div className="p-4 flex justify-between items-center">
            <div className="text-title-2 text-gray-800">우리 가게 메뉴</div>
            {/* 메뉴 추가 버튼 - 플로팅 탭 위에 고정 */}
            <button
              onClick={handleAddMenu}
              className="text-body-sb w-30 h-10 bg-[#7C3BC6] text-white rounded-[12px]"
            >
              메뉴 추가하기
            </button>
          </div>
        </div>
      </div>
      {/* Menu Items */}
      {menuItems && menuItems.length === 0 ? (
        <div className="fixed inset-0 pt-10 pb-60 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <Image src="/menu_icon.png" alt="no_menu" width={80} height={80} />
            <div className="text-center text-sub-body-r text-black">
              아직 등록된 메뉴가 없어요.
              <br />
              메뉴를 등록하고 솔직한 평가를 받아보세요.
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 pt-30 pb-40">
          {menuItems &&
            menuItems.map((item) => (
              <div key={item.id} className="px-4 py-2.5">
                <div className="flex items-center gap-4 h-25 w-full">
                  {/* Menu Image */}
                  <div className="w-25 h-25 bg-gray-100 border border-gray-200 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={98}
                        height={98}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Image
                        src="/menu_icon.png"
                        alt="준비중"
                        width={60}
                        height={60}
                        className="opacity-30"
                      />
                    )}
                  </div>

                  {/* Menu Info */}
                  <div className="flex-1 flex flex-col justify-between h-full py-1 min-w-0">
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="text-headline-b text-gray-800 truncate">
                        {item.name}
                      </div>
                      <button
                        className="min-w-16 px-3 py-1 text-sub-body-sb text-gray-800 border border-gray-800 rounded-[6px] flex-shrink-0"
                        onClick={() => router.push(`/menu/${item.id!}`)}
                      >
                        자세히
                      </button>
                    </div>
                    <div className="text-body-r text-gray-600 truncate pr-2">
                      {item.description}
                    </div>

                    <div className="text-headline-m text-gray-600">
                      {item.price.toLocaleString()}원
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 플로팅 탭 네비게이션 */}
      <FloatingNavBar currentTab="menu" />

      {/* 히든 파일 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* 메뉴 추가 방식 선택 Dialog */}
      <MenuAddMethodDialog
        open={isMethodDialogOpen}
        onOpenChange={setIsMethodDialogOpen}
        onSelectMethod={handleSelectMethod}
      />

      {/* 메뉴 추출 진행 Dialog */}
      <MenuExtractionProgressDialog
        open={isExtracting}
        progress={progress}
        currentStep={currentStep}
      />
    </div>
  );
}
