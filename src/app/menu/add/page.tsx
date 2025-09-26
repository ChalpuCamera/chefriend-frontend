"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { CustomHeader } from "@/components/ui/custom-header";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCreateMenuWithPhotos } from "@/lib/hooks/useCreateMenuWithPhotos";
import { useMyStores } from "@/lib/hooks/useStore";

export default function Page() {
  const router = useRouter();
  const [menuName, setMenuName] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuDescription, setMenuDescription] = useState("");
  const [menuImages, setMenuImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { createMenuWithPhotosAsync, isCreating } = useCreateMenuWithPhotos();

  // 사용자의 가게 정보 가져오기 (첫 번째 가게 우선)
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // 3개 초과 체크
    const totalImages = menuImages.length;
    if (totalImages >= 3) {
      toast.error("사진은 3개까지 등록이 가능해요");
      event.target.value = ""; // input 초기화
      return;
    }

    if (totalImages + files.length > 3) {
      toast.error("사진은 3개까지 등록이 가능해요");
      event.target.value = ""; // input 초기화
      return;
    }

    // 파일 추가
    const newFiles = Array.from(files).slice(0, 3 - totalImages);
    setMenuImages([...menuImages, ...newFiles]);

    // 미리보기 URL 생성
    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newUrls]);

    event.target.value = ""; // input 초기화
  };

  const handleImageDelete = (index: number) => {
    // 미리보기 URL 해제
    URL.revokeObjectURL(imagePreviewUrls[index]);

    // 이미지 배열에서 제거
    setMenuImages(menuImages.filter((_, i) => i !== index));
    setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
  };

  // 메뉴 이름 변경 핸들러 (최대 30자)
  const handleMenuNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 30) {
      setMenuName(value);
    }
  };

  // 숫자에 쉼표 추가하는 함수
  const formatNumberWithCommas = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 쉼표 제거하여 순수 숫자만 반환하는 함수
  const removeCommas = (str: string) => {
    return str.replace(/,/g, "");
  };

  // 판매 가격 변경 핸들러 (숫자만, 최대 8자리, 3자리마다 쉼표)
  const handleMenuPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbersOnly = removeCommas(value);

    // 숫자만 허용하고 최대 8자리까지
    if (/^\d*$/.test(numbersOnly) && numbersOnly.length <= 8) {
      const formattedValue = formatNumberWithCommas(numbersOnly);
      setMenuPrice(formattedValue);
    }
  };

  // 메뉴 설명 변경 핸들러 (최대 120자)
  const handleMenuDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= 120) {
      setMenuDescription(value);
    }
  };

  // 유효성 검사 함수
  const validateForm = () => {
    if (!menuName.trim()) {
      setErrorMessage("메뉴 이름을 입력해주세요.");
      setShowErrorDialog(true);
      return false;
    }

    if (!menuPrice.trim() || removeCommas(menuPrice).length === 0) {
      setErrorMessage("판매 가격을 입력해주세요.");
      setShowErrorDialog(true);
      return false;
    }

    if (imagePreviewUrls.length === 0) {
      setErrorMessage("메뉴 사진을 최소 1개 이상 등록해주세요.");
      setShowErrorDialog(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // storeId가 없으면 등록 불가
    if (!storeId) {
      setErrorMessage(
        "가게 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요."
      );
      setShowErrorDialog(true);
      return;
    }

    try {
      // API 호출하여 메뉴 등록
      const result = await createMenuWithPhotosAsync({
        storeId,
        menuData: {
          name: menuName,
          price: parseInt(removeCommas(menuPrice)),
          description: menuDescription || undefined,
        },
        images: menuImages,
      });

      // 메뉴 상세 페이지로 이동
      if (result.food.foodItemId) {
        router.push(`/menu/${result.food.foodItemId}`);
      } else {
        router.push("/menu");
      }
    } catch (error) {
      console.error("Menu creation failed:", error);
      // 에러는 hook 내부에서 toast로 처리됨
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="h-screen w-full mx-auto bg-white">
      {/* Header */}
      <CustomHeader handleBack={handleBack} title="메뉴 등록하기" />

      {/* Main Content */}
      <div className="space-y-8 px-4 pt-30">
        {/* Menu Photo */}
        <div>
          <label className="block text-body-sb text-black mb-3">
            메뉴 사진
          </label>
          <div className="flex gap-3">
            {/* 업로드된 이미지들 */}
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative w-24 h-24">
                <Image
                  src={url}
                  alt={`메뉴 이미지 ${index + 1}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => handleImageDelete(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* 추가 버튼 (3개 미만일 때만 표시) */}
            {menuImages.length < 3 && (
              <label className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                />
                <Plus size={24} className="text-gray-500" />
              </label>
            )}
          </div>

          {/* 안내 텍스트 */}
          <p className="text-sm text-gray-500 mt-2">
            최대 3개까지 등록 가능 ({menuImages.length}/3)
          </p>
        </div>

        {/* Menu Name */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-body-sb text-black">메뉴 이름</label>
            <span className="text-xs text-gray-500">{menuName.length}/30</span>
          </div>
          <input
            type="text"
            value={menuName}
            onChange={handleMenuNameChange}
            className="w-full h-13 bg-gray-200 rounded-[12px] px-4 text-body-r placeholder:text-gray-500"
            placeholder="메뉴 이름을 입력하세요"
            maxLength={30}
          />
        </div>

        {/* Menu Price */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-body-sb text-black">판매 가격</label>
            <span className="text-xs text-gray-500">
              {removeCommas(menuPrice).length}/8 (숫자만 입력 가능)
            </span>
          </div>
          <input
            type="text"
            value={menuPrice}
            onChange={handleMenuPriceChange}
            className="w-full h-13 bg-gray-200 rounded-[12px] px-4 text-body-r placeholder:text-gray-500"
            placeholder="가격을 입력하세요"
          />
        </div>

        {/* Menu Description */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-body-sb text-black">메뉴 설명</label>
            <span className="text-xs text-gray-500">
              {menuDescription.length}/120
            </span>
          </div>
          <textarea
            value={menuDescription}
            onChange={handleMenuDescriptionChange}
            className="w-full h-27 bg-gray-200 rounded-[12px] p-4 text-body-r placeholder:text-gray-500 resize-none"
            placeholder="메뉴에 대한 설명을 입력하세요"
            maxLength={120}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white">
        <div className="max-w-[430px] mx-auto pb-6 flex justify-center px-4">
          <CustomButton onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? "등록 중..." : "등록하기"}
          </CustomButton>
        </div>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>메뉴 등록 확인</AlertDialogTitle>
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
