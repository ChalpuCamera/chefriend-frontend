"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { useFood } from "@/lib/hooks/useFood";
import { usePhotosByFoodItem } from "@/lib/hooks/usePhoto";
import { useUpdateMenuWithPhotos } from "@/lib/hooks/useUpdateMenuWithPhotos";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const foodId = Number(params.foodId);
  const [menuName, setMenuName] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuDescription, setMenuDescription] = useState("");
  const [menuImages, setMenuImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { updateMenuWithPhotosAsync, isUpdating } = useUpdateMenuWithPhotos();
  const { data: foodData, isLoading } = useFood(foodId);
  const { data: photos = [] } = usePhotosByFoodItem(foodId);

  // Load existing data on mount
  useEffect(() => {
    if (foodData) {
      setMenuName(foodData.name || foodData.foodName || "");
      setMenuPrice(formatNumberWithCommas((foodData.price || 0).toString()));
      setMenuDescription(foodData.description || "");

      // 모든 이미지 URL 수집 (썸네일 + 추가 사진들)
      const allImageUrls = [];

      // 썸네일 URL 추가
      const thumbnailUrl = foodData.photoUrl || foodData.thumbnailUrl;
      if (thumbnailUrl) {
        allImageUrls.push(thumbnailUrl);
      }

      // photos에서 썸네일과 중복되지 않는 이미지들 추가
      photos
        .filter((photo) => photo.imageUrl !== thumbnailUrl)
        .forEach((photo) => {
          if (allImageUrls.length < 3) {
            allImageUrls.push(photo.imageUrl);
          }
        });

      setExistingImages(allImageUrls);
      setImagePreviewUrls(allImageUrls);
    }
  }, [foodData, photos]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // 3개 초과 체크
    const totalImages = imagePreviewUrls.length + menuImages.length;
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
    // Check if it's an existing image or a new upload
    const existingImagesCount = existingImages.length;

    if (index < existingImagesCount) {
      // Remove existing image
      setExistingImages(existingImages.filter((_, i) => i !== index));
      setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
    } else {
      // Remove new upload
      const newImageIndex = index - existingImagesCount;
      URL.revokeObjectURL(imagePreviewUrls[index]);
      setMenuImages(menuImages.filter((_, i) => i !== newImageIndex));
      setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
    }
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

    try {
      // API 호출하여 메뉴 수정
      await updateMenuWithPhotosAsync({
        foodId,
        menuData: {
          name: menuName,
          price: parseInt(removeCommas(menuPrice)),
          description: menuDescription || undefined,
        },
        newImages: menuImages,
        existingImageUrls: existingImages,
      });

      // 메뉴 상세 페이지로 이동
      router.push(`/menu/${params.foodId}`);
    } catch (error) {
      console.error("Menu update failed:", error);
      // 에러는 hook 내부에서 toast로 처리됨
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full mx-auto bg-white flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full mx-auto bg-white">
      {/* Header */}
      <CustomHeader handleBack={handleBack} title="메뉴 수정하기" />

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
            {imagePreviewUrls.length + menuImages.length < 3 && (
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
            최대 3개까지 등록 가능 ({imagePreviewUrls.length}/3)
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
      <div className="fixed bottom-0 left-0 right-0 pb-6 flex justify-center px-4 bg-white outline-1 outline-transparent">
        <CustomButton onClick={handleSubmit} disabled={isUpdating || isLoading}>
          {isUpdating ? "수정 중..." : "수정하기"}
        </CustomButton>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>메뉴 수정 확인</AlertDialogTitle>
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
