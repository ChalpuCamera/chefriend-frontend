"use client";

import { useState, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  useGetFoodItem,
  useGetCustomerActiveQuestions,
  useSubmitCustomerFeedback,
  useGetFeedbackPresignedUrls,
} from "@/lib/hooks/useCustomerReview";
import { customerApiClient } from "@/lib/api/customerClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/ui/custom-button";
import { toast } from "sonner";

// 고정 5단계 라벨 (2번, 4번은 빈 문자열)
const fixedLabels = [
  "매우 불만족",
  "",
  "보통",
  "",
  "매우 만족"
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
  const getPresignedUrlsMutation = useGetFeedbackPresignedUrls();

  // 답변 상태
  const [answers, setAnswers] = useState<{ [key: number]: { rating?: number; text?: string } }>({});

  // 사진 업로드 상태
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const food = foodData?.result;
  const questions = questionsData?.result || [];

  // surveyId 자동 감지: questionId 범위로 판단
  // Survey 2: 23-33, Survey 3: 34-44
  const surveyId = useMemo(() => {
    const questionList = questionsData?.result || [];
    if (questionList.length === 0) return 2; // 기본값

    const firstQuestionId = questionList[0].questionId;
    if (firstQuestionId >= 34 && firstQuestionId <= 44) {
      return 3;
    } else if (firstQuestionId >= 23 && firstQuestionId <= 33) {
      return 2;
    }
    return 2; // 기본값
  }, [questionsData?.result]);

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

  // 이미지 선택 처리
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 파일인지 확인
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다');
        return;
      }
      setSelectedImage(file);
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 사진 업로드 (선택 사항)
  const uploadPhoto = async (): Promise<string[]> => {
    if (!selectedImage) return [];

    setIsUploadingPhoto(true);
    try {
      // 1. Presigned URL 가져오기
      const response = await getPresignedUrlsMutation.mutateAsync([selectedImage.name]);
      const photoUrlInfo = response.result.photoUrls[0];

      // 2. S3에 업로드
      await customerApiClient.uploadFile(photoUrlInfo.presignedUrl, selectedImage);

      // 3. S3 키 반환
      return [photoUrlInfo.s3Key];
    } catch (error) {
      console.error('Photo upload failed:', error);
      toast.error('사진 업로드에 실패했습니다');
      return [];
    } finally {
      setIsUploadingPhoto(false);
    }
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
      // 사진 업로드 (선택 사항 - 없으면 빈 배열 반환)
      const photoS3Keys = await uploadPhoto();

      await submitMutation.mutateAsync({
        storeId,
        foodId,
        surveyId, // questionId 범위로 자동 감지된 값
        surveyAnswers,
        photoS3Keys
      });

      // 성공 시 완료 페이지로 이동 (storeId 전달)
      router.push(`/customer/review/complete?storeId=${storeId}`);
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
                    <div className="relative w-full max-w-[327px] h-[20px]">
                      {fixedLabels.map((label, idx) => (
                        <span
                          key={idx}
                          className={`absolute text-sub-body-r font-bold leading-tight text-gray-700 ${
                            idx === 0 ? 'left-0' :
                            idx === fixedLabels.length - 1 ? 'right-0' :
                            '-translate-x-1/2'
                          }`}
                          style={idx === 0 || idx === fixedLabels.length - 1 ? {} : { left: `${idx * 25}%` }}
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

        {/* 사진 업로드 섹션 */}
        <div className="bg-white px-4 py-6 mt-4">
          <h3 className="text-headline-b text-gray-800 mb-4">사진 추가 (선택)</h3>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {selectedImage ? (
            // 이미지 미리보기
            <div className="relative w-full h-full mx-auto">
              <Image
                src={URL.createObjectURL(selectedImage)}
                alt="선택한 사진"
                width={100}
                height={100}
                className="object-cover rounded-[12px]"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
              >
                ✕
              </button>
            </div>
          ) : (
            // 사진 선택 버튼
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-[12px] text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">📷</span>
                <span className="text-body-m">사진 선택</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* 제출 버튼 (하단 고정) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white">
        <div className="max-w-[430px] mx-auto p-4">
          <CustomButton
            onClick={handleSubmit}
            disabled={submitMutation.isPending || isUploadingPhoto || isTextEmpty}
            className="w-full h-12 text-base"
          >
            {isUploadingPhoto ? "사진 업로드 중..." : submitMutation.isPending ? "제출 중..." : "리뷰 제출하기"}
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