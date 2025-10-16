"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomButton } from "@/components/ui/custom-button";
import { CustomHeader } from "@/components/ui/custom-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

// 추천 항목 데이터
const recommendedItems = [
  "면의 삶기",
  "마라향",
  "불향",
  "마늘",
  "단짠 밸런스",
  "바삭함",
  "쫄깃함",
  "온도",
  "양",
  "육수 진함도",
  "고기 양",
  "소스 맛",
];

export default function Page() {
  const router = useRouter();

  // 상태 관리 - 마케팅용 예시 데이터 포함
  const [title] = useState("맛 평가");
  const [defaultItems, setDefaultItems] = useState({
    spicy: { label: "매운맛", checked: true },
    sweet: { label: "단맛", checked: true },
    sour: { label: "신맛", checked: true },
    salty: { label: "짠맛", checked: true },
  });
  const [customItems, setCustomItems] = useState<string[]>([
    "육수 진함도",
    "고기 양",
  ]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  const handleBack = () => {
    router.back();
  };

  const handleDefaultItemToggle = (key: keyof typeof defaultItems) => {
    setDefaultItems((prev) => ({
      ...prev,
      [key]: { ...prev[key], checked: !prev[key].checked },
    }));
  };

  const handleAddCustomItem = () => {
    if (newItemText.trim()) {
      if (customItems.includes(newItemText.trim())) {
        toast.error("이미 추가된 항목입니다.");
        return;
      }
      setCustomItems([...customItems, newItemText.trim()]);
      setNewItemText("");
      setShowAddInput(false);
      toast.success(`"${newItemText.trim()}" 항목이 추가되었습니다.`);
    }
  };

  const handleAddRecommendedItem = (item: string) => {
    if (!customItems.includes(item)) {
      setCustomItems([...customItems, item]);
      toast.success(`"${item}" 항목이 추가되었습니다.`, {
        duration: 800,
      });
    }
  };

  const handleRemoveCustomItem = (index: number) => {
    const removedItem = customItems[index];
    setCustomItems(customItems.filter((_, i) => i !== index));
    toast.success(`"${removedItem}" 항목이 제거되었습니다.`, {
      duration: 800,
    });
  };

  const handleSubmit = () => {
    // 선택된 항목들 수집
    const selectedDefaults = Object.entries(defaultItems)
      .filter(([, item]) => item.checked)
      .map(([, item]) => item.label);

    const allSelected = [...selectedDefaults, ...customItems];

    if (allSelected.length === 0) {
      toast.error("최소 1개 이상의 평가 항목을 선택해주세요.");
      return;
    }

    // TODO: API 연동 또는 상태 저장
    console.log({
      title,
      items: allSelected,
    });

    toast.success("피드백 항목이 설정되었습니다.");
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <CustomHeader handleBack={handleBack} title="피드백 항목 설정" />

      <div className="pt-20 px-4 pb-24">
        {/* 제목 입력 섹션 - 카드 스타일 */}
        <div className="mt-6 bg-white rounded-[16px] shadow-sm">
          <div className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50">
            <Image
              src={"/kimchi.png"}
              alt={"메뉴"}
              width={98}
              height={98}
              className="w-[98px] h-[98px] object-cover rounded-[12px] border border-gray-200"
              unoptimized
            />
            <div className="ml-4 flex-1">
              <h3 className="text-headline-b text-gray-800">김치찌개</h3>
              <p className="text-headline-m text-gray-700 mt-1">10,000원</p>
            </div>
          </div>
        </div>

        {/* 기본 항목 섹션 - 카드 스타일 */}
        <div className="mt-6 bg-white rounded-[16px] p-5 shadow-sm">
          <h2 className="text-headline-b text-gray-800 mb-6 flex items-center gap-2">
            기본 평가 항목
          </h2>
          <div className="space-y-1">
            {Object.entries(defaultItems).map(([key, item]) => (
              <Label
                key={key}
                htmlFor={key}
                className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-purple-50 rounded-lg transition-colors"
              >
                <span className="text-body-sb text-gray-700 text-[16px]">
                  {item.label}
                </span>
                <Checkbox
                  id={key}
                  checked={item.checked}
                  onCheckedChange={() =>
                    handleDefaultItemToggle(key as keyof typeof defaultItems)
                  }
                  className="w-6 h-6 border-2 data-[state=checked]:bg-purple-700 data-[state=checked]:border-purple-700"
                />
              </Label>
            ))}
          </div>
        </div>

        {/* 추천 항목 섹션 - 새로 추가 */}
        <div className="mt-6 bg-white rounded-[16px] p-5 shadow-sm">
          <h2 className="text-headline-b text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            추천 평가 항목
          </h2>
          <p className="text-body-r text-gray-600 mb-4">
            탭하여 빠르게 추가하세요
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendedItems.map((item) => {
              const isAdded = customItems.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => !isAdded && handleAddRecommendedItem(item)}
                  disabled={isAdded}
                  className={cn(
                    "px-4 py-2 rounded-full text-body-r transition-all transform active:scale-95",
                    isAdded
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                      : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300"
                  )}
                >
                  <span className="flex items-center gap-1">
                    {!isAdded && <Plus size={14} />}
                    {isAdded && <Check size={14} />}
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 커스텀 항목 섹션 - 카드 스타일로 개선 */}
        <div className="mt-6 bg-white rounded-[16px] p-5 shadow-sm">
          <h2 className="text-headline-b text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-[20px]">➕</span>
            추가된 항목
          </h2>

          {/* 추가된 커스텀 항목들 */}
          {customItems.length > 0 ? (
            <div className="space-y-2 mb-4">
              {customItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-4 bg-purple-50 rounded-lg border border-purple-100 group hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-purple-600" />
                    <span className="text-body-sb text-gray-700">{item}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveCustomItem(index)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="항목 삭제"
                  >
                    <X
                      size={16}
                      className="text-gray-600 hover:text-red-500 transition-colors"
                    />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-r text-gray-500 text-center py-4">
              추천 항목을 탭하거나 직접 추가해보세요
            </p>
          )}

          {/* 항목 추가 입력 필드 */}
          {showAddInput ? (
            <div className="flex gap-2 mt-4">
              <Input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCustomItem()}
                className="flex-1 h-12 bg-gray-100 rounded-[12px] px-4 text-body-r border-2 border-transparent focus:border-purple-400 transition-all"
                placeholder="직접 입력하기"
                autoFocus
              />
              <button
                onClick={handleAddCustomItem}
                className="px-4 h-12 bg-purple-700 text-white rounded-[12px] text-body-sb hover:bg-purple-800 transition-colors"
              >
                추가
              </button>
              <button
                onClick={() => {
                  setShowAddInput(false);
                  setNewItemText("");
                }}
                className="px-4 h-12 bg-gray-200 text-gray-700 rounded-[12px] text-body-sb hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddInput(true)}
              className="w-full h-12 bg-gradient-to-r from-purple-50 to-purple-100 rounded-[12px] flex items-center justify-center gap-2 mt-4 border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all"
            >
              <Plus size={20} className="text-purple-700" />
              <span className="text-body-sb text-purple-700">
                직접 항목 추가하기
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 완료 버튼 - 그라데이션 배경으로 더 돋보이게 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-[430px] mx-auto pb-6 pt-4 flex items-center justify-center px-4">
          <CustomButton onClick={handleSubmit} className="shadow-lg">
            <span className="flex justify-center items-center gap-2">
              <Check size={18} />
              설정 완료
            </span>
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
