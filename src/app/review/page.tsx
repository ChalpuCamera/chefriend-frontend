"use client";

import { useRouter } from "next/navigation";
import { useGetFoodsWithQuestions } from "@/lib/hooks/useFoodQuestions";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingNavBar } from "@/components/floating-nav-bar";
import { ReviewManagementCard } from "@/components/review-management-card";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  const router = useRouter();

  // 리뷰를 받는 메뉴들 가져오기
  const { data: foodsData, isLoading } = useGetFoodsWithQuestions();
  const foods = foodsData?.result || [];

  const handleBack = () => {
    router.push("/menu");
  };

  const handleNewReview = () => {
    router.push("/review/add");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
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
            <div className="text-title-2 text-gray-800">리뷰 받기</div>
            {/* 메뉴 추가 버튼 - 플로팅 탭 위에 고정 */}
            <button
              onClick={handleNewReview}
              className="text-body-sb w-30 h-10 bg-[#7C3BC6] text-white rounded-[12px]"
            >
              신규 등록하기
            </button>
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="flex-1 px-4 overflow-y-auto pb-40">
        {isLoading ? (
          // 로딩 상태
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[140px] rounded-[12px]" />
            ))}
          </div>
        ) : foods.length === 0 ? (
          // 빈 상태
          <div className="flex flex-col items-center justify-center h-64 gap-4 pt-30">
            <div className="text-center">
              <p className="text-body-r text-gray-500 mb-2">
                리뷰를 받을 메뉴가 없습니다
              </p>
              <p className="text-small-r text-gray-400">
                신규 등록하기 버튼을 눌러 메뉴를 추가해주세요
              </p>
            </div>
          </div>
        ) : (
          // 메뉴 리스트
          <div className="flex flex-col gap-4">
            <p className="text-body-m text-gray-700 mb-2 pt-30">
              리뷰 받는 중 ({foods.length}개)
            </p>
            {foods.map((food) => (
              <ReviewManagementCard
                key={food.id}
                foodId={food.id}
                name={food.name}
                price={food.price}
                imageUrl={food.photoUrl}
                questionCount={food.activeQuestionCount}
                reviewCount={food.feedbackCount}
              />
            ))}
          </div>
        )}
      </div>

      <FloatingNavBar currentTab="review" />
    </div>
  );
}
