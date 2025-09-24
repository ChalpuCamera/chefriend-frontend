"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { CustomHeader } from "@/components/ui/custom-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useMyStores } from "@/lib/hooks/useStore";
import { useFoodsByStore } from "@/lib/hooks/useFood";
import { toast } from "sonner";
import { useCreateCampaign } from "@/lib/hooks/useCampaign";

interface SelectedMenu {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

function CampaignAddContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState<SelectedMenu | null>(null);
  const [showMenuSelector, setShowMenuSelector] = useState(false);
  const [campaignDuration, setCampaignDuration] = useState<string>("10");
  const [evaluationTarget, setEvaluationTarget] = useState<string>("20");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // URL 파라미터에서 메뉴 정보 가져오기
  useEffect(() => {
    const menuId = searchParams.get('menuId');
    const menuName = searchParams.get('menuName');
    const menuPrice = searchParams.get('menuPrice');
    const menuImage = searchParams.get('menuImage');

    if (menuId && menuName && menuPrice) {
      setSelectedMenu({
        id: parseInt(menuId),
        name: menuName,
        price: parseInt(menuPrice),
        imageUrl: decodeURIComponent(menuImage || '/kimchi.png')
      });
    }
  }, [searchParams]);

  // 사용자의 가게 정보 가져오기 (menu/add와 동일)
  const { data: storesData } = useMyStores({ size: 10 });
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
  const menus = foodsData?.content || [];

  const handleBack = () => {
      router.back();
  };

  const handleMenuSelect = (menu: {
    id?: number;
    foodItemId?: number;
    name?: string;
    foodName?: string;
    price: number;
    photoUrl?: string;
    thumbnailUrl?: string;
  }) => {
    setSelectedMenu({
      id: menu.id || menu.foodItemId || 0,
      name: menu.name || menu.foodName || "",
      price: menu.price,
      imageUrl: menu.photoUrl || menu.thumbnailUrl || "/kimchi.png",
    });
    setShowMenuSelector(false);
  };

  const handleRemoveMenu = () => {
    setSelectedMenu(null);
  };

  const validateForm = () => {
    if (!selectedMenu) {
      setErrorMessage("메뉴를 선택해주세요.");
      setShowErrorDialog(true);
      return false;
    }
    return true;
  };

  const createCampaign = useCreateCampaign();

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!storeId || !selectedMenu) {
      toast.error("매장 또는 메뉴 정보가 없습니다.");
      return;
    }

    try {
      await createCampaign.mutateAsync({
        name: `${selectedMenu.name} 캠페인`,
        description: `${selectedMenu.name}에 대한 고객 피드백 수집`,
        storeId: storeId,
        foodItemId: selectedMenu.id,
        targetFeedbackCount: parseInt(evaluationTarget),
        targetDays: parseInt(campaignDuration),
      });

      toast.success("캠페인이 등록되었습니다.");
      router.push("/campaign");
    } catch (error) {
      console.error("캠페인 등록 실패:", error);
      toast.error("캠페인 등록에 실패했습니다.");
    }
  };

  // 메뉴 선택 화면
  if (showMenuSelector) {
    return (
      <div className="min-h-screen bg-white">
        <CustomHeader handleBack={handleBack} title="메뉴 선택하기" />

        <div className="pt-[44px]">
          {menus.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96">
              <p className="text-body-r text-gray-600">
                등록된 메뉴가 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-2 pt-20">
              {menus.map((menu) => (
                <div
                  key={menu.id || menu.foodItemId}
                  className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleMenuSelect(menu)}
                >
                  <Image
                    src={menu.photoUrl || menu.thumbnailUrl || "/kimchi.png"}
                    alt={menu.name || menu.foodName || "메뉴"}
                    width={98}
                    height={98}
                    className="w-[98px] h-[98px] object-cover rounded-[12px] border border-gray-200"
                    unoptimized
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-headline-b text-gray-800">
                      {menu.name || menu.foodName}
                    </h3>
                    <p className="text-headline-m text-gray-700 mt-1">
                      {menu.price?.toLocaleString()}원
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

  // 메인 등록 화면
  return (
    <div className="min-h-screen bg-white">
      <CustomHeader handleBack={handleBack} title="캠페인 등록하기" />

      <div className="pt-[44px] px-4 pb-24">
        {/* 메뉴 선택 섹션 */}
        <div className="mt-6">
          <div className="text-headline-b text-gray-800 mb-4 pt-15">
            메뉴 선택
          </div>

          {selectedMenu ? (
            // 선택된 메뉴 표시 - Figma 디자인과 일치
            <div className="relative -mx-4">
              <div className="flex items-start h-[122px] px-4">
                <Image
                  src={selectedMenu.imageUrl}
                  alt={selectedMenu.name}
                  width={98}
                  height={98}
                  className="w-[98px] h-[98px] object-cover rounded-[12px] border border-gray-200"
                  unoptimized
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-headline-b text-gray-800">
                      {selectedMenu.name}
                    </h3>
                    <X size={16} className="text-gray-800" />
                  </div>
                  <p className="text-headline-m text-gray-700 mt-1">
                    {selectedMenu.price.toLocaleString()}원
                  </p>
                </div>
                <button
                  onClick={handleRemoveMenu}
                  className="p-2"
                  aria-label="메뉴 제거"
                ></button>
              </div>
            </div>
          ) : (
            // 빈 상태 - 메뉴 추가 버튼
            <button
              onClick={() => setShowMenuSelector(true)}
              className="w-20 h-20 bg-gray-200 rounded-[12px] flex items-center justify-center"
            >
              <Plus size={32} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* 캠페인 기간 섹션 */}
        <div className="mt-10">
          <div className="text-headline-b text-gray-800 mb-6">
            얼마 동안 캠페인을 진행하시나요?
          </div>

          <RadioGroup
            value={campaignDuration}
            onValueChange={setCampaignDuration}
          >
            <div className="space-y-0">
              <Label
                htmlFor="duration-10"
                className="flex items-center justify-between py-3 cursor-pointer"
              >
                <span className="text-body-r text-gray-700">10일</span>
                <RadioGroupItem
                  value="10"
                  id="duration-10"
                  className="w-6 h-6 border-2 data-[state=checked]:border-purple-700 data-[state=checked]:text-purple-700"
                />
              </Label>

              <Label
                htmlFor="duration-20"
                className="flex items-center justify-between py-3 cursor-pointer"
              >
                <span className="text-body-r text-gray-700">20일</span>
                <RadioGroupItem
                  value="20"
                  id="duration-20"
                  className="w-6 h-6 border-2 data-[state=checked]:border-purple-700 data-[state=checked]:text-purple-700"
                />
              </Label>

              <Label
                htmlFor="duration-30"
                className="flex items-center justify-between py-3 cursor-pointer"
              >
                <span className="text-body-r text-gray-700">30일</span>
                <RadioGroupItem
                  value="30"
                  id="duration-30"
                  className="w-6 h-6 border-2 data-[state=checked]:border-purple-700 data-[state=checked]:text-purple-700"
                />
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* 목표 평가 수 섹션 */}
        <div className="mt-10">
          <div className="text-headline-b text-gray-800 mb-6">
            총 몇개의 손님 평가를 받을까요?
          </div>

          <RadioGroup
            value={evaluationTarget}
            onValueChange={setEvaluationTarget}
          >
            <div className="space-y-0">
              <Label
                htmlFor="target-20"
                className="flex items-center justify-between py-3 cursor-pointer"
              >
                <span className="text-body-r text-gray-700">20개</span>
                <RadioGroupItem
                  value="20"
                  id="target-20"
                  className="w-6 h-6 border-2 data-[state=checked]:border-purple-700 data-[state=checked]:text-purple-700"
                />
              </Label>

              <Label
                htmlFor="target-50"
                className="flex items-center justify-between py-3 cursor-pointer"
              >
                <span className="text-body-r text-gray-700">50개</span>
                <RadioGroupItem
                  value="50"
                  id="target-50"
                  className="w-6 h-6 border-2 data-[state=checked]:border-purple-700 data-[state=checked]:text-purple-700"
                />
              </Label>

              <Label
                htmlFor="target-100"
                className="flex items-center justify-between py-3 cursor-pointer"
              >
                <span className="text-body-r text-gray-700">100개</span>
                <RadioGroupItem
                  value="100"
                  id="target-100"
                  className="w-6 h-6 border-2 data-[state=checked]:border-purple-700 data-[state=checked]:text-purple-700"
                />
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 pb-6 flex justify-center px-4 bg-white">
        <CustomButton
          onClick={handleSubmit}
          disabled={createCampaign.isPending}
        >
          {createCampaign.isPending ? "등록 중..." : "완료"}
        </CustomButton>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>캠페인 등록 확인</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CampaignAddContent />
    </Suspense>
  );
}
