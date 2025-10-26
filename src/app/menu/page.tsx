"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CustomButton } from "@/components/ui/custom-button";
import { CustomHeader } from "@/components/ui/custom-header";
import { useFoodsByStore } from "@/lib/hooks/useFood";
import { useMyStores } from "@/lib/hooks/useStore";
import { Home, UtensilsCrossed } from "lucide-react";

export default function Page() {
  const router = useRouter();

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
    {},
    { enabled: !!storeId }
  );

  const menuItems = foodsData?.content?.map((food) => ({
    id: food.id || food.foodItemId, // 새 필드명 우선, 구 필드명 폴백
    name: food.name || food.foodName || "", // 새 필드명 우선, 구 필드명 폴백
    price: food.price,
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
    router.push("/menu/add");
  };

  return (
    <div className="h-screen bg-white w-full mx-auto">
      {/* Header */}
      <CustomHeader handleBack={handleBack} title="우리 가게 메뉴" />

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
                  <div className="flex-1 flex flex-col justify-between h-full py-1">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-headline-b text-gray-800">
                        {item.name}
                      </div>
                      <button
                        className="px-3 py-1 text-sub-body-sb text-gray-800 border border-gray-800 rounded-[6px]"
                        onClick={() => router.push(`/menu/${item.id!}`)}
                      >
                        자세히
                      </button>
                    </div>

                    <div className="text-headline-m text-gray-600">
                      {item.price.toLocaleString()}원
                    </div>

                    <div className="flex items-center gap-0.5">
                      <span className="text-body-sb text-blue-700">
                        ✨{item.reviewCount}개
                      </span>
                      <span className="text-body-r text-gray-800">
                        의 평가가 있어요
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 메뉴 추가 버튼 - 플로팅 탭 위에 고정 */}
      <div className="fixed bottom-28 left-0 right-0 bg-transparent pointer-events-none">
        <div className="max-w-[430px] mx-auto pb-2 flex justify-center px-4 pointer-events-auto">
          <CustomButton onClick={handleAddMenu}>메뉴 추가하기</CustomButton>
        </div>
      </div>

      {/* 플로팅 탭 네비게이션 */}
      <div className="fixed bottom-6 left-0 right-0 z-50 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-full shadow-2xl border border-gray-200 flex overflow-hidden">
            {/* 홈페이지 관리 탭 */}
            <button
              onClick={() => router.push('/home')}
              className="flex-1 flex flex-col items-center justify-center py-4 px-4 text-gray-600 hover:bg-gray-50 transition-all"
            >
              <Home className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">홈페이지 관리</span>
            </button>

            {/* 메뉴 관리 탭 */}
            <button
              onClick={() => {/* 현재 페이지이므로 아무 동작 안함 */}}
              className="flex-1 flex flex-col items-center justify-center py-4 px-4 bg-purple-700 text-white transition-all"
            >
              <UtensilsCrossed className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">메뉴 관리</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
