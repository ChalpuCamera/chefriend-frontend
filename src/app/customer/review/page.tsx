"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  useGetFoodItem,
  useGetCustomerActiveQuestions,
  useSubmitCustomerFeedback,
} from "@/lib/hooks/useCustomerReview";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/ui/custom-button";

// 고정 5단계 라벨 (2번, 4번은 빈 문자열)
const fixedLabels = [
  "많이 부족해요",
  "",
  "적당해요",
  "",
  "너무 강해요"
];

function CustomerReviewPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storeId = parseInt(searchParams.get('storeId') || '0');
  const foodId = parseInt(searchParams.get('foodId') || '0');

  // API hooks
  const { data: foodData, isLoading: isFoodLoading } = useGetFoodItem(foodId);
  const { data: questionsData, isLoading: isQuestionsLoading } = useGetCustomerActiveQuestions(foodId);
  const submitMutation = useSubmitCustomerFeedback();

  // 답변 상태
  const [answers, setAnswers] = useState<{ [key: number]: { rating?: number; text?: string } }>({});

  const food = foodData?.result;
  const questions = questionsData?.result || [];

  // 평점 설정
  const handleRatingChange = (questionId: number, rating: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], rating }
    }));
  };

  // 텍스트 답변 설정
  const handleTextChange = (questionId: number, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], text }
    }));
  };

  // TEXT 질문의 답변이 비어있는지 확인
  const textQuestions = questions.filter(q => q.questionType === 'TEXT');
  const hasTextQuestion = textQuestions.length > 0;
  const isTextEmpty = hasTextQuestion && textQuestions.every(q => {
    const answer = answers[q.questionId]?.text || "";
    return answer.trim() === "";
  });

  // 제출 처리
  const handleSubmit = async () => {
    // 답변 데이터 준비 (선택하지 않은 항목은 기본값 3으로 설정)
    const surveyAnswers = questions.map(question => {
      const answer = answers[question.questionId];

      if (question.questionType === 'TEXT') {
        return {
          questionId: question.questionId,
          answerText: answer?.text || ""
        };
      } else {
        return {
          questionId: question.questionId,
          numericValue: answer?.rating || 3  // 기본값 3
        };
      }
    });

    try {
      await submitMutation.mutateAsync({
        storeId,
        foodId,
        surveyId: 2, // 고정값
        surveyAnswers
      });

      // 성공 시 완료 페이지로 이동
      router.push("/customer/review/complete");
    } catch {
      // 에러는 mutation에서 처리
    }
  };

  if (isFoodLoading || isQuestionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-[430px] mx-auto space-y-4">
          <Skeleton className="h-48 rounded-[12px]" />
          <Skeleton className="h-32 rounded-[12px]" />
          <Skeleton className="h-32 rounded-[12px]" />
        </div>
      </div>
    );
  }

  if (!storeId || !foodId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">잘못된 접근입니다. storeId와 foodId가 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">메뉴를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // 리뷰 캠페인이 OFF 상태인지 확인 (활성 질문이 없으면 OFF)
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-[430px]">
          <p className="text-lg font-semibold text-gray-900 mb-2">리뷰를 받고 있지 않습니다</p>
          <p className="text-sm text-gray-500 mb-4">현재 이 메뉴는 리뷰 캠페인이 진행되지 않고 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-[430px] mx-auto">
          <div className="flex items-center justify-center h-14 px-4">
            <h1 className="text-lg font-semibold">리뷰 작성</h1>
          </div>
        </div>
      </div>

      <div className="max-w-[430px] mx-auto p-4 pb-24">
        {/* 메뉴 정보 카드 */}
        <div className="bg-white rounded-[16px] p-4 mb-6 shadow-sm">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={food.thumbnailUrl || "/menu_icon.png"}
                alt={food.foodName || "메뉴 이미지"}
                fill
                className="object-cover rounded-[12px]"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{food.foodName}</h2>
              <p className="text-sm text-gray-500 mt-1">{food.description}</p>
              <p className="text-lg font-semibold text-purple-600 mt-2">
                {food.price.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>

        {/* 맛 평가 섹션 헤더 */}
        <div className="bg-white h-[107px] flex items-center justify-center">
          <h2 className="text-title-2 text-purple-600">맛 평가</h2>
        </div>

        {/* 평가 항목들 */}
        {questions
          .filter(q => q.questionType === 'RATING')
          .map(question => (
            <div key={question.questionId} className="bg-white px-4 py-[18px]">
              <div className="flex flex-col gap-[13px]">
                <div className="flex flex-col gap-4 items-center">
                  {/* 질문 텍스트 */}
                  <p className="text-headline-b text-gray-800 text-center">
                    {question.questionText}
                  </p>

                  {/* 슬라이더 + 라벨 */}
                  <div className="flex flex-col gap-[10px] w-full items-center">
                    {/* 슬라이더 */}
                    <div className="relative h-[29px] w-full max-w-[327px]">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={answers[question.questionId]?.rating || 3}
                        onChange={(e) => handleRatingChange(question.questionId, parseInt(e.target.value))}
                        className="absolute w-full h-[19px] top-[5px] appearance-none cursor-pointer slider-purple-figma"
                        style={{
                          background: `linear-gradient(to right, #a67de8 0%, #a67de8 ${((answers[question.questionId]?.rating || 3) - 1) * 25}%, #e9ecef ${((answers[question.questionId]?.rating || 3) - 1) * 25}%, #e9ecef 100%)`
                        }}
                      />
                    </div>

                    {/* 5단계 라벨 */}
                    <div className="flex justify-between w-full max-w-[341px] text-sub-body-sb text-gray-700">
                      {fixedLabels.map((label, idx) => (
                        <span
                          key={idx}
                          className="text-center text-xs leading-tight"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* 마지막 한마디 섹션 헤더 */}
        <div className="bg-white h-[107px] flex flex-col items-center justify-center gap-1">
          <h2 className="text-title-2 text-purple-600">마지막 한마디</h2>
          <p className="text-body-r text-gray-800">사장님에게 소중한 조언을 전달해보세요.</p>
        </div>

        {/* 텍스트 입력 섹션 */}
        {questions
          .filter(q => q.questionType === 'TEXT')
          .map(question => (
            <div key={question.questionId} className="bg-white px-4 py-[18px]">
              <div className="flex flex-col gap-[13px] items-center">
                <div className="flex flex-col gap-4 items-center w-full">
                  <p className="text-headline-b text-gray-800 text-center whitespace-pre-line">
                    사장님께 딱 한 가지 이야기할 수 있다면,{'\n'}어떤 말을 해주고 싶나요?
                  </p>
                </div>
              </div>

              <Textarea
                placeholder="솔직한 의견을 남겨주세요"
                value={answers[question.questionId]?.text || ""}
                onChange={(e) => handleTextChange(question.questionId, e.target.value)}
                className="mt-4 min-h-[186px] resize-none bg-gray-200 rounded-[12px] border-0"
              />
            </div>
          ))}
      </div>

      {/* 제출 버튼 (하단 고정) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-[430px] mx-auto p-4">
          <CustomButton
            onClick={handleSubmit}
            disabled={submitMutation.isPending || isTextEmpty}
            className="w-full h-12 text-base"
          >
            {submitMutation.isPending ? "제출 중..." : "리뷰 제출하기"}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

export default function CustomerReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">로딩중...</p>
        </div>
      </div>
    }>
      <CustomerReviewPageContent />
    </Suspense>
  );
}