"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { CustomHeader } from "@/components/ui/custom-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMyStores } from "@/lib/hooks/useStore";
import { useFoodsByStore } from "@/lib/hooks/useFood";
import { FoodItemResponse } from "@/lib/types/api/food";
import {
  useGetSurveyQuestions,
  useGetActiveQuestions,
  useSetFoodQuestions,
  useGetFoodsWithQuestions
} from "@/lib/hooks/useFoodQuestions";
import { toast } from "sonner";

interface SelectedMenu {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

// Survey 2 (일반 음식) 평가 항목 한글 매핑
const questionLabelsSurvey2: { [key: string]: string } = {
  SPICINESS: "매운맛",
  SALTINESS: "짠맛",
  SWEETNESS: "단맛",
  SOURNESS: "신맛",
  CRISPINESS: "바삭함",
  CHEWINESS: "쫄깃함",
  TENDERNESS: "부드러움",
  PORTION_SIZE: "양",
  FRESHNESS: "재료 신선도",
  TEMPERATURE: "온도",
};

// Survey 3 (베이커리) 평가 항목 한글 매핑
const questionLabelsSurvey3: { [key: string]: string } = {
  SWEETNESS: "당도",
  DESIGN_SATISFACTION: "디자인 만족도",
  MOISTNESS: "촉촉함",
  CREAMINESS: "크림 질감",
  OILINESS: "크림 느끼함",
  FLAVOR_BALANCE: "맛 조화",
  FRESHNESS: "신선도",
  PORTION_SIZE: "양",
  VALUE_FOR_MONEY: "가격 대비 만족도",
  REPURCHASE_INTENT: "재구매 의향",
};

function ReviewAddContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState<SelectedMenu | null>(null);
  const [showMenuSelector, setShowMenuSelector] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [surveyId, setSurveyId] = useState<number>(2);

  // 사용자의 가게 정보 가져오기
  const { data: storesData } = useMyStores();
  const stores = storesData?.content || [];
  const currentStore =
    stores.length > 0
      ? stores.reduce((first, store) =>
          store.storeId < first.storeId ? store : first
        )
      : null;
  const storeId = currentStore?.storeId;

  // 메뉴 목록 가져오기
  const { data: foodsData } = useFoodsByStore(
    storeId!,
    { size: 100 },
    { enabled: !!storeId && showMenuSelector }
  );
  const menus = useMemo(() => foodsData?.content || [], [foodsData?.content]);

  // 이미 리뷰를 받는 메뉴들 가져오기 (선택 불가 처리용)
  const { data: reviewFoodsData } = useGetFoodsWithQuestions();
  const reviewFoodIds = reviewFoodsData?.result?.map(food => food.id) || [];

  // 전체 평가 항목 가져오기 (선택한 surveyId에 따라)
  const { data: questionsData } = useGetSurveyQuestions(surveyId);
  const allQuestions = questionsData?.result || [];

  // RATING 타입 질문만 필터링 (TEXT 타입인 "사장님께 한마디"는 자동 포함)
  const ratingQuestions = allQuestions.filter(q => q.questionType === 'RATING');

  // 기존 활성 질문 가져오기 (수정 모드)
  const menuId = selectedMenu?.id || parseInt(searchParams.get('foodId') || '0');
  const { data: activeQuestionsData } = useGetActiveQuestions(menuId);

  // 평가 항목 설정 mutation
  const setQuestionsMutation = useSetFoodQuestions();

  // URL 파라미터에서 메뉴 정보 가져오기 (수정 모드)
  useEffect(() => {
    const foodId = searchParams.get('foodId');
    if (foodId && menus.length > 0) {
      const menu = menus.find(m => (m.id || m.foodItemId) === parseInt(foodId));
      if (menu) {
        setSelectedMenu({
          id: menu.id || menu.foodItemId || 0,
          name: menu.name || menu.foodName || "",
          price: menu.price,
          imageUrl: menu.photoUrl || menu.thumbnailUrl || "/menu_icon.png",
        });
        setIsEditMode(true);
      }
    }
  }, [searchParams, menus]);

  // 기존 선택된 질문 로드 (수정 모드)
  useEffect(() => {
    if (activeQuestionsData?.result && isEditMode) {
      const activeQuestions = activeQuestionsData.result;
      const activeQuestionIds = activeQuestions
        .filter(q => q.questionType === 'RATING')
        .map(q => q.questionId);
      setSelectedQuestions(activeQuestionIds);

      // surveyId 자동 감지: questionId 범위로 판단
      // Survey 2: 23-33, Survey 3: 34-44
      if (activeQuestions.length > 0) {
        const firstQuestionId = activeQuestions[0].questionId;
        if (firstQuestionId >= 34 && firstQuestionId <= 44) {
          setSurveyId(3);
        } else if (firstQuestionId >= 23 && firstQuestionId <= 33) {
          setSurveyId(2);
        }
      }
    }
  }, [activeQuestionsData, isEditMode]);

  const handleBack = () => {
    if (showMenuSelector) {
      setShowMenuSelector(false);
    } else {
      router.back();
    }
  };

  const handleMenuSelect = (menu: FoodItemResponse) => {
    setSelectedMenu({
      id: menu.id || menu.foodItemId || 0,
      name: menu.name || menu.foodName || "",
      price: menu.price,
      imageUrl: menu.photoUrl || menu.thumbnailUrl || "/menu_icon.png",
    });
    setShowMenuSelector(false);
  };

  const handleQuestionToggle = (questionId: number) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSave = async () => {
    if (!selectedMenu) {
      toast.error("메뉴를 선택해주세요");
      return;
    }

    if (selectedQuestions.length === 0) {
      toast.error("최소 1개 이상의 평가 항목을 선택해주세요");
      return;
    }

    try {
      // 선택된 평가 항목 + "사장님께 한마디" 자동 포함
      // Survey 2: questionId 33, Survey 3: questionId 44
      const textQuestion = allQuestions.find(q => q.jarAttribute === 'OWNER_MESSAGE');
      const questionIds = textQuestion
        ? [...selectedQuestions, textQuestion.questionId]
        : selectedQuestions;

      await setQuestionsMutation.mutateAsync({
        foodItemId: selectedMenu.id,
        questionIds
      });

      // 캐시 무효화가 완료될 시간 확보 후 페이지 이동
      setTimeout(() => {
        router.push('/review');
      }, 100);
    } catch (error) {
      console.error('Failed to save questions:', error);
    }
  };

  if (showMenuSelector) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <CustomHeader handleBack={handleBack} title="메뉴 선택" />

        <div className="flex-1 px-4 pt-30 pb-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {menus.map((menu) => {
              const menuId = menu.id || menu.foodItemId || 0;
              const isDisabled = reviewFoodIds.includes(menuId) && !isEditMode;

              return (
                <div
                  key={menuId}
                  onClick={() => !isDisabled && handleMenuSelect(menu)}
                  className={`relative rounded-[12px] overflow-hidden border ${
                    isDisabled
                      ? 'border-gray-200 opacity-50 cursor-not-allowed'
                      : 'border-gray-100 cursor-pointer hover:border-purple-300'
                  }`}
                >
                  <div className="relative h-32">
                    <Image
                      src={menu.photoUrl || menu.thumbnailUrl || "/menu_icon.png"}
                      alt={menu.name || menu.foodName || ""}
                      fill
                      className="object-cover"
                    />
                    {isDisabled && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-small-sb">리뷰 받는 중</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-body-m font-medium text-gray-900 mb-1">
                      {menu.name || menu.foodName}
                    </h3>
                    <p className="text-small-m text-gray-600">
                      {menu.price.toLocaleString()}원
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <CustomHeader handleBack={handleBack} title="리뷰 받기 설정" />

      <div className="flex-1 px-4 pt-30 pb-6 overflow-y-auto">
        {/* 메뉴 선택 영역 */}
        <div className="mb-6">
          <h2 className="text-body-sb text-gray-900 mb-3">메뉴 선택</h2>
          {selectedMenu ? (
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-[12px] border border-purple-200">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={selectedMenu.imageUrl}
                  alt={selectedMenu.name}
                  fill
                  className="object-cover rounded-[8px]"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-body-sb text-gray-900">{selectedMenu.name}</h3>
                <p className="text-small-m text-gray-600">
                  {selectedMenu.price.toLocaleString()}원
                </p>
              </div>
              {!isEditMode && (
                <button
                  onClick={() => setSelectedMenu(null)}
                  className="p-1 hover:bg-purple-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowMenuSelector(true)}
              className="w-full h-24 border-2 border-dashed border-gray-300 rounded-[12px] flex flex-col items-center justify-center gap-2 hover:border-purple-400 transition-colors"
            >
              <Plus className="w-6 h-6 text-gray-400" />
              <span className="text-body-m text-gray-500">메뉴를 선택해주세요</span>
            </button>
          )}
        </div>

        {/* Survey 템플릿 선택 */}
        <div className={`mb-6 ${!selectedMenu ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="text-body-sb text-gray-900 mb-3">평가 템플릿 선택</h2>
          <RadioGroup
            value={surveyId.toString()}
            onValueChange={(value) => {
              setSurveyId(parseInt(value));
              setSelectedQuestions([]); // 템플릿 변경 시 선택 초기화
            }}
            disabled={!selectedMenu}
          >
            <div className="grid grid-cols-2 gap-2">
              <Label
                htmlFor="survey-2"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-[8px] cursor-pointer hover:bg-gray-100 transition-colors border-2 data-[checked=true]:border-purple-500 data-[checked=true]:bg-purple-50"
                data-checked={surveyId === 2}
              >
                <RadioGroupItem
                  value="2"
                  id="survey-2"
                  disabled={!selectedMenu}
                />
                <div className="text-body-m text-gray-900">일반 음식</div>
              </Label>

              <Label
                htmlFor="survey-3"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-[8px] cursor-pointer hover:bg-gray-100 transition-colors border-2 data-[checked=true]:border-purple-500 data-[checked=true]:bg-purple-50"
                data-checked={surveyId === 3}
              >
                <RadioGroupItem
                  value="3"
                  id="survey-3"
                  disabled={!selectedMenu}
                />
                <div className="text-body-m text-gray-900">베이커리</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* 평가 항목 선택 */}
        <div className={!selectedMenu ? 'opacity-50 pointer-events-none' : ''}>
          <h2 className="text-body-sb text-gray-900 mb-3">평가 항목 선택</h2>
          <p className="text-small-r text-gray-600 mb-4">
            고객에게 평가받고 싶은 항목을 선택해주세요
          </p>

          <div className="space-y-3">
            {ratingQuestions.map((question) => {
              const labels = surveyId === 3 ? questionLabelsSurvey3 : questionLabelsSurvey2;
              const labelText = labels[question.jarAttribute] || question.jarAttribute;

              return (
                <Label
                  key={question.questionId}
                  htmlFor={`question-${question.questionId}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-[8px] cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <Checkbox
                    id={`question-${question.questionId}`}
                    checked={selectedQuestions.includes(question.questionId)}
                    onCheckedChange={() => handleQuestionToggle(question.questionId)}
                    disabled={!selectedMenu}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <span className="text-body-m text-gray-800 flex-1">
                    {labelText}
                  </span>
                </Label>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-[8px]">
            <p className="text-small-m text-blue-700">
              💡 &quot;사장님께 한마디&quot; 항목은 자동으로 포함됩니다
            </p>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-4 py-4 border-t bg-white">
        <CustomButton
          onClick={handleSave}
          disabled={!selectedMenu || selectedQuestions.length === 0}
          className="w-full"
        >
          저장하기
        </CustomButton>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewAddContent />
    </Suspense>
  );
}