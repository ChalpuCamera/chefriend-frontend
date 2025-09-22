"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import {
  useFood,
  useDeleteFood,
  useUpdateThumbnail,
} from "@/lib/hooks/useFood";
import { usePhotosByFoodItem } from "@/lib/hooks/usePhoto";
import { useJARAnalysis } from "@/lib/hooks/useJAR";
import {
  useFoodReviews,
  getFlattenedReviews,
} from "@/lib/hooks/useFoodReviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Page({
  params,
}: {
  params: Promise<{ foodId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const foodId = parseInt(resolvedParams.foodId);
  const observerTarget = useRef<HTMLDivElement>(null);

  // API 데이터 가져오기
  const { data: menuData, isLoading } = useFood(foodId);
  const { data: photos = [] } = usePhotosByFoodItem(foodId);
  const { data: jarData } = useJARAnalysis(foodId);
  const {
    data: reviewsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFoodReviews(foodId);

  const deleteFood = useDeleteFood();
  const updateThumbnail = useUpdateThumbnail();

  // 이미지 배열 구성 (thumbnail + photos)
  const allImages = [
    ...(menuData?.thumbnailUrl
      ? [{ url: menuData.thumbnailUrl, id: "thumbnail" }]
      : []),
    ...photos
      .filter((photo) => photo.imageUrl !== menuData?.thumbnailUrl) // 중복 썸네일 제거
      .map((photo) => ({ url: photo.imageUrl, id: photo.photoId })),
  ].slice(0, 3); // 최대 3개까지만

  const reviews = getFlattenedReviews(reviewsData);

  // 무한 스크롤 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/menu/${resolvedParams.foodId}/edit`);
  };

  const handleDelete = async () => {
    if (confirm("정말 이 메뉴를 삭제하시겠습니까?")) {
      try {
        await deleteFood.mutateAsync(foodId);
        router.push("/menu");
      } catch (error) {
        console.error("Failed to delete food:", error);
      }
    }
  };

  const handleSetThumbnail = async () => {
    const currentImage = allImages[selectedImageIndex];
    if (currentImage && currentImage.id !== "thumbnail") {
      try {
        await updateThumbnail.mutateAsync({
          foodId,
          photoUrl: currentImage.url,
        });
        // 대표 사진 설정 후 선택 커서를 첫 번째(대표 사진)로 이동
        setSelectedImageIndex(0);
      } catch (error) {
        console.error("Failed to update thumbnail:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full mx-auto bg-white flex items-center justify-center">
        <p className="text-gray-500">로딩중...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full mx-auto bg-white">
      {/* Header - 유지 */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="flex items-center justify-between h-11 px-3.5">
          <button
            onClick={handleBack}
            className="flex items-center justify-center"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <button className="flex items-center justify-center">
            <Image
              src="/setting_icon.png"
              alt="settings"
              width={20}
              height={20}
            />
          </button>
        </div>

        {/* Title and Actions */}
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-title-2 text-gray-800">메뉴 리포트</h1>
          <div className="flex gap-1">
            <button
              onClick={handleDelete}
              className="px-2 py-1 text-gray-800 text-body-r"
            >
              삭제
            </button>
            <button
              onClick={handleEdit}
              className="pl-2 py-1 text-gray-800 text-body-r"
            >
              수정
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - pt 추가하여 헤더 공간 확보 */}
      <div className="pt-[104px] pb-6">
        {/* Main Image */}
        <div className="w-full h-[220px]">
          {allImages.length > 0 ? (
            <Image
              src={allImages[selectedImageIndex]?.url || "/kimchi.png"}
              alt={menuData?.foodName || "메뉴 이미지"}
              width={375}
              height={220}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <p className="text-gray-500">이미지 없음</p>
            </div>
          )}
        </div>

        {/* Thumbnail Indicator with Set as Thumbnail Button */}
        <div className="bg-white px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(allImages.length > 0
                ? allImages
                : [{ url: "/kimchi.png", id: "default" }]
              ).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className="flex flex-col items-center"
                >
                  <div className="w-[38px] h-[38px] rounded-md overflow-hidden">
                    <Image
                      src={image.url}
                      alt={`메뉴 이미지 ${index + 1}`}
                      width={38}
                      height={38}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedImageIndex === index && (
                    <div className="h-1 bg-gray-500 rounded-md w-[26px] mt-1" />
                  )}
                </button>
              ))}
            </div>
            {/* 대표 사진 설정 버튼 - 선택된 이미지가 thumbnail이 아닐 때만 표시 */}
            {allImages.length > 0 &&
              selectedImageIndex < allImages.length &&
              allImages[selectedImageIndex].id !== "thumbnail" && (
                <Button
                  onClick={handleSetThumbnail}
                  className="text-xs h-7 px-2 bg-primary text-white rounded-md"
                  disabled={updateThumbnail.isPending}
                >
                  대표 사진 설정
                </Button>
              )}
          </div>
        </div>

        {/* Menu Info */}
        <div className="px-4 py-4 flex items-center justify-between">
          <h2 className="text-sub-title-m text-gray-800">
            {menuData?.foodName}
          </h2>
          <span className="text-headline-b text-gray-900">
            {menuData?.price?.toLocaleString()}원
          </span>
        </div>

        {/* Description */}
        <div className="px-4 mb-6">
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-body-r text-gray-800 text-center whitespace-pre-line leading-relaxed">
              {menuData?.description}
            </p>
          </div>
        </div>

        {/* Menu Stats */}
        <div className="px-4 mb-4">
          <h3 className="text-sub-title-b text-gray-800 mb-4">
            메뉴 평가 리포트
          </h3>
          <div className="flex gap-2">
            <div className="relative flex-1 h-22 bg-white border border-gray-300 rounded-lg p-3 flex flex-col justify-between overflow-hidden">
              <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-[#1386FF] to-[#0B5099] -top-15 -right-15" />
              <div className="relative z-10">
                <p className="text-sub-body-r text-gray-700">평가 수</p>
                <p className="text-title-2 text-gray-800">
                  {jarData?.npsScore?.totalResponses || 23}
                </p>
              </div>
            </div>
            <div className="relative flex-1 h-22 bg-white border border-gray-300 rounded-lg p-3 flex flex-col justify-between overflow-hidden">
              <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-[#1386FF] to-[#0B5099] -top-15 -right-15" />
              <div className="relative z-10">
                <p className="text-sub-body-r text-gray-700">평점</p>
                <p className="text-title-2 text-gray-800">
                  {jarData?.results && jarData.results.length > 0
                    ? (() => {
                        const avgScore =
                          jarData.results.reduce(
                            (sum, item) => sum + item.overallMeanScore,
                            0
                          ) / jarData.results.length;
                        return (avgScore / 2).toFixed(1);
                      })()
                    : 4.4}
                </p>
              </div>
            </div>
            <div className="relative flex-1 h-22 bg-white border border-gray-300 rounded-lg p-3 flex flex-col justify-between overflow-hidden">
              <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-[#1386FF] to-[#0B5099] -top-15 -right-15" />
              <div className="relative z-10">
                <p className="text-sub-body-r text-gray-700">재주문률</p>
                <p className="text-title-2 text-gray-800">
                  {jarData?.npsScore?.promoterRate
                    ? `${Math.round(jarData.npsScore.promoterRate)}%`
                    : "87%"}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* 그래프 Section */}
        <div className="px-4 py-6 flex flex-col gap-4">
          {/* 그래프 추가 예정 */}
          <Card className="flex items-center justify-center h-50 rounded-lg border border-gray-300">
            <CardContent>
              <p className="text-sub-body-r text-gray-600">그래프 추가 예정</p>
            </CardContent>
          </Card>
          <Card className="flex items-center justify-center h-50 rounded-lg border border-gray-300">
            <CardContent>
              <p className="text-sub-body-r text-gray-600">그래프 추가 예정</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews Section */}
        <div className="px-4 py-6">
          <h2 className="text-sub-title-b text-gray-800 mb-5">
            손님의 솔직한 평가
          </h2>

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
                className="w-27 h-9 bg-purple-700 text-sub-body-sb text-white rounded-[8px]"
              >
                문의하기
              </Button>
            </div>
          ) : (
            // Review Items
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="py-4">
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
                    <p className="text-body-r text-gray-700 whitespace-pre-line">
                      {review.reviewText}
                    </p>
                  </div>
                </div>
              ))}

              {/* 무한 스크롤 Observer Target */}
              {hasNextPage && (
                <div ref={observerTarget} className="py-4 text-center">
                  {isFetchingNextPage ? (
                    <p className="text-gray-500">더 불러오는 중...</p>
                  ) : (
                    <p className="text-gray-400">스크롤하여 더 보기</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
