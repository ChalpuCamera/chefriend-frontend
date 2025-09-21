"use client";

import React from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useFoodsByStore } from "@/lib/hooks/useFood";
import { useRecentReviews } from "@/lib/hooks/useFeedback";
import { useMyStores } from "@/lib/hooks/useStore";

// Mock image placeholder (using local asset instead of localhost)
const imgKimchi = "/kimchi.png";

// Mock data for menu items with real images (unused - kept for reference)
// const mockMenuData = [
//   { id: 1, name: "기영이 김...", image: imgKimchi, isNew: true },
//   { id: 2, name: "오믈렛", image: imgKimchi, isNew: true },
//   { id: 3, name: "김밥", image: imgKimchi, isNew: false },
//   { id: 4, name: "제육볶음", image: imgKimchi, isNew: false },
//   { id: 5, name: "오삼불고기", image: imgKimchi, isNew: false },
//   { id: 6, name: "제육볶음", image: imgKimchi, isNew: false },
//   { id: 7, name: "오삼불고기", image: imgKimchi, isNew: false },
//   { id: 8, name: "제육볶음", image: imgKimchi, isNew: false },
//   { id: 9, name: "오삼불고기", image: imgKimchi, isNew: false },
// ];

// Mock data for store profile
const mockStoreProfile = {
  name: "송파기영이분식",
  address: "서울시 송파구 송파동 123",
  phoneNumber: "02-1234-5678",
  businessNumber: "123-45-67890",
};

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

  // React Query hooks - only fetch if we have a valid storeId
  const { data: foodsData } = useFoodsByStore(
    storeId!,
    { size: 7 },
    { enabled: !!storeId }
  );
  const { data: reviewsData } = useRecentReviews(storeId!, 5, {
    enabled: !!storeId,
  });

  // 메뉴 데이터 처리 (최대 7개) - 서버 응답 필드명에 맞게 처리
  const menus =
    foodsData?.content?.slice(0, 7).map((food, index) => ({
      id: food.id || food.foodItemId, // 새 필드명 우선, 구 필드명 폴백
      name:
        (food.name || food.foodName || "").length > 6
          ? (food.name || food.foodName || "").substring(0, 5) + "..."
          : food.name || food.foodName || "",
      image: food.photoUrl || food.thumbnailUrl || imgKimchi, // 새 필드명 우선, 구 필드명 폴백
      isNew: index < 2, // 처음 2개만 New 표시 (임시 로직)
    })) || [];

  // 리뷰 데이터 (ReviewDisplayData 타입)
  const reviews = reviewsData || [];

  const handleMenuView = () => {
    router.push("/menu");
  };

  const handleSettings = () => {
    router.push("/mypage");
  };

  const handleMenuClick = (menuId: number) => {
    router.push(`/menu/${menuId}`);
  };

  return (
    <div className="bg-white w-full mx-auto py-3">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-full">
        <Image src="/logo_small.png" alt="Logo" width={88} height={27} />
        <button className="" onClick={handleSettings}>
          <Image src="/setting_icon.png" alt="setting" width={20} height={20} />
        </button>
      </div>

      {/* Store Profile Section */}
      <div className="px-4 py-5 h-21 mt-6 mb-5">
        <div className="flex items-center gap-3 h-full">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200">
            <Image
              src="/store_icon.png"
              alt="Profile"
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sub-title-b text-gray-800">
              {currentStore?.storeName || mockStoreProfile.name}
            </h2>
            <p className="text-sub-body-r text-gray-800 mt-1">
              안녕하세요 사장님 👨‍🌾
            </p>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="mb-6">
        <div className="flex items-center px-4 justify-between mb-5">
          <h2 className="text-sub-title-b text-gray-800">우리 가게 메뉴</h2>
          {menus.length > 0 && (
            <button className="p-1" onClick={handleMenuView}>
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          )}
        </div>

        {/* Menu Items Horizontal Scroll */}
        {menus.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center w-full h-24">
            <p className="text-sub-body-r mb-4">
              메뉴를 등록하면 손님이 평가할 수 있어요
            </p>
            <Button
              onClick={() => router.push("/menu/add")}
              className="w-27 h-9 bg-[#162456] text-sub-body-sb text-white rounded-[8px]"
            >
              메뉴 등록하기
            </Button>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex w-max overflow-x-auto">
              {/* Menu items with padding on first item */}
              {menus.slice(0, 7).map((menu, index) => (
                <div
                  key={menu.id}
                  className={`flex flex-col items-center cursor-pointer flex-shrink-0 w-[77px] ${
                    index === 0 ? "ml-4" : ""
                  } ${index < 6 ? "mr-2" : ""}`}
                  onClick={() => handleMenuClick(menu.id!)}
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        alt={menu.name}
                        className="w-full h-full object-cover"
                        src={menu.image}
                        width={64}
                        height={64}
                      />
                    </div>
                    {menu.isNew && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-caption-b">N</span>
                      </div>
                    )}
                  </div>
                  <p className="text-body-r text-gray-800 mt-2 text-center truncate w-full">
                    {menu.name}
                  </p>
                </div>
              ))}

              {/* Add button or More button */}
              {menus.length < 7 ? (
                // Add button
                <div
                  className="flex flex-col items-center cursor-pointer flex-shrink-0 w-[77px] mr-4 ml-2"
                  onClick={() => router.push("/menu/add")}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="w-7 h-7 text-gray-500" />
                  </div>
                  <p className="text-body-r text-gray-800 mt-2 text-center">
                    추가하기
                  </p>
                </div>
              ) : menus.length >= 7 ? (
                // More button (when there are 7 or more items)
                <div
                  className="flex flex-col items-center cursor-pointer flex-shrink-0 w-[77px] mr-4 ml-2"
                  onClick={handleMenuView}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Image
                      src="/rightarrow_icon.png"
                      alt="more"
                      width={28}
                      height={28}
                    />
                  </div>
                  <p className="text-body-r text-gray-800 mt-2 text-center">
                    목록보기
                  </p>
                </div>
              ) : null}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        )}
      </div>

      {/* 캠페인 Section */}
      <div className="px-4 py-6">
        <h2 className="text-sub-title-b text-gray-800 mb-5">진행중인 캠페인</h2>

        {/* 캠페인 추가 예정 */}
        <Card className="flex items-center justify-center h-50 rounded-lg border border-gray-300">
          <CardContent>
            <p className="text-sub-body-r text-gray-600">캠페인 추가 예정</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews Section */}
      <div className="px-4 py-6">
        <h2 className="text-sub-title-b text-gray-800 mb-5">최근 손님 평가</h2>

        {reviews.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center w-full h-24">
            <p className="text-sub-body-r mb-4">
              아직 손님이 진행한 평가가 없어요
            </p>
            <Button
              onClick={() => {
                window.open("https://open.kakao.com/o/sCpB58Hh", "_blank");
              }}
              className="w-27 h-9 bg-[#162456] text-sub-body-sb text-white rounded-[8px]"
            >
              문의하기
            </Button>
          </div>
        ) : (
          // Review Items
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div key={`review-${review.id || index}`} className="py-4">
                {/* Review Header */}
                <div className="flex items-start gap-3 mb-3">
                  <Image
                    src={review.avatar || "/user_profile.png"}
                    alt={review.userName}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sb text-gray-900">
                        {review.userName}
                      </span>
                      <span className="text-sub-body-r text-gray-500">
                        {review.date}
                      </span>
                    </div>
                    {/* 맛 프로필 */}
                    <div className="flex items-center gap-3 mt-2 text-body-r text-gray-700">
                      <div className="flex items-center gap-1">
                        <span>🍽️ {review.servings}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🌶️ {review.spiciness}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💰 {review.price}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="mt-4">
                  <h3 className="text-headline-b text-gray-800 mb-2">
                    {review.menuName}
                  </h3>
                  <p className="text-body-r text-gray-700 whitespace-pre-line">
                    {review.reviewText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
