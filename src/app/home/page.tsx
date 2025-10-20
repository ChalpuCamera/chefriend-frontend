"use client";

import React, { useState, useRef } from "react";
import { ChevronRight, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useFoodsByStore } from "@/lib/hooks/useFood";
// import { useRecentReviews } from "@/lib/hooks/useFeedback";
import { useMyStores, storeKeys } from "@/lib/hooks/useStore";
import { photoApi } from "@/lib/api/owner/photo";
import { storeApi } from "@/lib/api/owner/store";
import { inquiryApi } from "@/lib/api/landing/inquiry";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
// import { CampaignCardCompact } from "@/components/campaign-card-compact";
// import { useGetCampaignsByStore, calculateRemainingDays } from "@/lib/hooks/useCampaign";

// Mock image placeholder (using local asset instead of localhost)
// const imgKimchi = "/kimchi.png";

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
  const queryClient = useQueryClient();

  // Dialog states
  const [isSiteLinkDialogOpen, setIsSiteLinkDialogOpen] = useState(false);
  const [isProfileImageDialogOpen, setIsProfileImageDialogOpen] =
    useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isInquiryDialogOpen, setIsInquiryDialogOpen] = useState(false);
  const [inquiryContent, setInquiryContent] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 진행중인 캠페인 데이터 가져오기
  // const { data: campaignsData } = useGetCampaignsByStore(
  //   storeId!,
  //   "ACTIVE",
  //   0,
  //   20,
  //   !!storeId
  // );

  // // API 데이터를 UI 형식으로 변환
  // const campaigns = (campaignsData?.content || []).map(campaign => ({
  //   id: campaign.id,
  //   title: campaign.foodItemName || campaign.name,
  //   imageUrl: campaign.foodItemThumbnailUrl || "/kimchi.png",
  //   daysRemaining: calculateRemainingDays(campaign.endDate),
  //   currentCount: campaign.currentFeedbackCount || 0,
  //   totalCount: campaign.targetFeedbackCount,
  //   foodItemId: campaign.foodItemId, // 메뉴와 매칭을 위해 추가
  // }))

  // React Query hooks - only fetch if we have a valid storeId
  const { data: foodsData } = useFoodsByStore(
    storeId!,
    { size: 7 },
    { enabled: !!storeId }
  );
  // const { data: reviewsData } = useRecentReviews(storeId!, 5, {
  //   enabled: !!storeId,
  // });

  // 메뉴 데이터 처리 (최대 7개) - 캠페인 진행 여부 확인
  const menus =
    foodsData?.content?.slice(0, 7).map((food) => {
      const foodId = food.id || food.foodItemId;
      // // 해당 메뉴에 진행 중인 캠페인이 있는지 확인
      // const hasCampaign = campaigns.some(campaign => campaign.foodItemId === foodId);

      return {
        id: foodId,
        name:
          (food.name || food.foodName || "").length > 6
            ? (food.name || food.foodName || "").substring(0, 5) + "..."
            : food.name || food.foodName || "",
        image: food.photoUrl || food.thumbnailUrl || "/menu_icon.png",
        // hasCampaign: hasCampaign, // 캠페인 진행 여부
      };
    }) || [];

  // 리뷰 데이터 (ReviewDisplayData 타입) - 추후 사용 예정
  // const reviews = reviewsData || [];

  const handleMenuView = () => {
    router.push("/menu");
  };

  const handleSettings = () => {
    router.push("/mypage");
  };

  const handleMenuClick = (menuId: number) => {
    router.push(`/menu/${menuId}`);
  };

  // 사이트 주소 복사
  const handleCopySiteLink = async () => {
    if (currentStore?.siteLink) {
      try {
        await navigator.clipboard.writeText(
          `https://chefriend.kr/${currentStore.siteLink}`
        );
        toast.success("사이트 주소가 복사되었습니다!");
      } catch (error) {
        console.error("Failed to copy:", error);
        toast.error("복사에 실패했습니다.");
      }
    }
  };

  // 사이트 보기
  const handleViewSite = () => {
    if (currentStore?.siteLink) {
      window.open(`https://chefriend.kr/${currentStore.siteLink}`, "_blank");
    }
  };

  // 프로필 이미지 업로드
  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !storeId) {
      console.log("No file or storeId:", { file: !!file, storeId });
      return;
    }

    setIsUploadingImage(true);
    try {
      console.log("Starting image upload for store:", storeId);

      // 1. Presigned URL 생성
      const presignedResponse = await photoApi.getPresignedUrl(file.name);
      const { presignedUrl, s3Key } = presignedResponse.result;
      console.log("Got presigned URL, s3Key:", s3Key);

      // 2. S3에 파일 업로드
      await photoApi.uploadToS3(presignedUrl, file);
      console.log("Uploaded to S3");

      // 3. 서버에 사진 정보 등록 (foodItemId 없이)
      const registerResponse = await photoApi.registerPhoto({
        s3Key,
        fileName: file.name,
        fileSize: file.size,
      });

      const imageUrl = registerResponse.result.imageUrl;
      console.log("Registered photo, imageUrl:", imageUrl);

      // 4. 가게 대표 사진 설정 API 호출
      const updateResult = await storeApi.updateStoreThumbnail(
        storeId,
        imageUrl
      );
      console.log("Store thumbnail updated, result:", updateResult);

      // 5. 캐시 무효화하여 UI 업데이트
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });

      toast.success("대표 사진이 변경되었습니다!");
      setIsProfileImageDialogOpen(false);
    } catch (error) {
      console.error("Profile image upload failed:", error);
      toast.error("사진 업로드에 실패했습니다.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 문의하기 제출
  const handleInquirySubmit = async () => {
    if (!inquiryContent.trim()) {
      toast.error("문의 내용을 입력해주세요.");
      return;
    }

    setIsSubmittingInquiry(true);
    try {
      await inquiryApi.saveInquiry({ content: inquiryContent.trim() });
      toast.success("문의가 접수되었습니다!");
      setInquiryContent("");
      setIsInquiryDialogOpen(false);
    } catch (error) {
      console.error("Inquiry submit failed:", error);
      toast.error("문의 전송에 실패했습니다.");
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // const handleCampaignView = () => {
  //   router.push("/campaign");
  // };

  // const handleCampaignClick = (campaignId: number) => {
  //   // TODO: Navigate to campaign detail page when available
  //   console.log(`Campaign ${campaignId} clicked`);
  // };

  // const handleAddCampaign = () => {
  //   router.push("/campaign/add");
  // };

  return (
    <div className="bg-white w-full mx-auto py-3">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-full">
        <Image
          src="/logo_small.png"
          alt="Logo"
          width={88}
          height={27}
          quality={100}
          priority
          style={{ width: "auto", height: "auto" }}
        />
        <button className="" onClick={handleSettings}>
          <Image
            src="/setting_icon.png"
            alt="setting"
            width={20}
            height={20}
            quality={100}
          />
        </button>
      </div>

      {/* Store Profile Section */}
      <div className="px-4 py-5 mt-6 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 프로필 이미지 - 클릭하여 미리보기 */}
            <button
              onClick={() => setIsProfileImageDialogOpen(true)}
              className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              {currentStore?.thumbnailUrl ? (
                <Image
                  src={currentStore.thumbnailUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  quality={95}
                  sizes="64px"
                  unoptimized={currentStore.thumbnailUrl.startsWith("http")}
                />
              ) : (
                <Image
                  src="/store_icon.png"
                  alt="Profile"
                  width={80}
                  height={80}
                  quality={100}
                  priority
                  className="w-full h-full object-cover"
                />
              )}
            </button>
            <div className="flex flex-col gap-1">
              <h2 className="text-sub-title-b text-gray-800">
                {currentStore?.storeName || mockStoreProfile.name}
              </h2>
              <p className="text-caption-r text-gray-800">
                안녕하세요 사장님 👨‍🌾
              </p>
              {/* 사이트 주소 - 클릭하여 Dialog 오픈 */}
              {currentStore?.siteLink && (
                <button
                  onClick={() => setIsSiteLinkDialogOpen(true)}
                  className="text-body-r text-purple-700 flex items-center gap-1 hover:underline text-left"
                >
                  chefriend.kr/{currentStore.siteLink}🔗
                </button>
              )}
            </div>
          </div>
          {storeId && (
            <button
              onClick={() => router.push(`/store/${storeId}/edit`)}
              className="text-body-sb text-purple-700 px-3 py-2 min-w-[48px] min-h-[44px] flex items-center justify-center"
            >
              수정
            </button>
          )}
        </div>
      </div>

      {/* 캠페인 Section */}
      {/* <div className="mb-6"> */}
      {/* Campaign Items with 3 conditional states */}
      {/* {campaigns.length === 0 ? ( */}
      {/* Empty state */}
      {/* <div className="mx-4 h-48 bg-purple-50 rounded-[12px] flex flex-col items-center justify-center gap-3.5">
            <p className="text-body-r text-black text-center">
              캠페인을 등록한 메뉴는
              <br />
              고객의 솔직한 평가를 받아볼 수 있어요.
            </p>
            <Button
              onClick={handleAddCampaign}
              className="w-[127px] h-[34px] bg-purple-700 text-sub-body-sb text-white rounded-[8px]"
            >
              캠페인 등록하기
            </Button>
          </div> */}
      {/* ) : ( */}
      {/* Multiple campaigns with horizontal scroll */}
      {/* <>
            <div
              className="flex items-center px-4 justify-between mb-5"
              onClick={handleCampaignView}
            >
              <h2 className="text-sub-title-b text-gray-800">
                진행중인 캠페인
              </h2>
              {campaigns.length > 0 && (
                <button className="p-1" onClick={handleCampaignView}>
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </button>
              )}
            </div>

            <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <div className="flex w-max pb-2"> */}
      {/* Campaign items with padding on first item */}
      {/* {campaigns.map((campaign, index) => (
                  <div
                    key={campaign.id}
                    className={`${index === 0 ? "ml-4" : ""} ${
                      index < campaigns.length ? "mr-[18px]" : ""
                    }`}
                  >
                    <CampaignCardCompact
                      {...campaign}
                      onClick={() => handleCampaignClick(campaign.id)}
                    />
                  </div>
                ))} */}

      {/* Add card - always show */}
      {/* <div
                  className="flex flex-col items-center justify-center cursor-pointer flex-shrink-0 w-18 h-[194px] bg-purple-50 rounded-[12px] mr-4"
                  onClick={handleAddCampaign}
                >
                  <Plus className="w-8 h-8 text-gray-500 mb-2" />
                  <p className="text-body-r text-gray-700">캠페인</p>
                  <p className="text-body-r text-gray-700">추가</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div> */}

      {/* 쿠폰 적립 Section */}
      <div className="mx-4 mb-6">
        <button
          onClick={() => router.push('/coupon')}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-[12px] hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
              <Ticket className="w-6 h-6 text-[#7C3BC6]" />
            </div>
            <div className="text-left">
              <h3 className="text-headline-b text-gray-800">쿠폰 적립하기</h3>
              <p className="text-sub-body-r text-gray-600">고객에게 스탬프를 적립해주세요</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-800" />
        </button>
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
              메뉴를 등록하고 관리해 보세요.
            </p>
            <Button
              onClick={() => router.push("/menu/add")}
              className="w-27 h-9 bg-purple-700 text-sub-body-sb text-white rounded-[8px]"
            >
              메뉴 등록하기
            </Button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            <div className="flex w-max pb-2">
              {/* Add button or More button - 맨 앞에 위치 */}
              {menus.length < 7 ? (
                // Add button
                <div
                  className="flex flex-col items-center cursor-pointer flex-shrink-0 w-[77px] ml-4 mr-2"
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
                  className="flex flex-col items-center cursor-pointer flex-shrink-0 w-[77px] ml-4 mr-2"
                  onClick={handleMenuView}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Image
                      src="/rightarrow_icon.png"
                      alt="more"
                      width={28}
                      height={28}
                      quality={100}
                    />
                  </div>
                  <p className="text-body-r text-gray-800 mt-2 text-center">
                    목록보기
                  </p>
                </div>
              ) : null}

              {/* Menu items */}
              {menus.slice(0, 7).map((menu, index) => (
                <div
                  key={menu.id}
                  className={`flex flex-col items-center cursor-pointer flex-shrink-0 w-[77px] ${
                    index < 6 ? "mr-2" : "mr-4"
                  }`}
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
                        quality={95}
                        sizes="64px"
                        unoptimized={menu.image.startsWith("http")}
                      />
                    </div>
                    {/* {menu.hasCampaign && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-caption-b">C</span>
                      </div>
                    )} */}
                  </div>
                  <p className="text-body-r text-gray-800 mt-2 text-center truncate w-full">
                    {menu.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center w-full h-24">
        <Button
          onClick={() => setIsInquiryDialogOpen(true)}
          className="w-40 h-9 bg-purple-600 text-sub-body-sb text-white rounded-[8px]"
        >
          개발자에게 문의하기
        </Button>
      </div>
      {/* 최근 손님 평가 섹션 - 추후 사용 예정 */}
      {/* <div className="px-4 py-6">
        <h2 className="text-sub-title-b text-gray-800 mb-5">최근 손님 평가</h2>

        {reviews.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center w-full h-24">
            <p className="text-sub-body-r mb-4">
              아직 손님이 진행한 평가가 없어요.
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
            {reviews.map((review, index) => (
              <div key={`review-${review.id || index}`} className="py-4">
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
      </div> */}

      {/* 사이트 주소 Dialog */}
      <Dialog
        open={isSiteLinkDialogOpen}
        onOpenChange={setIsSiteLinkDialogOpen}
      >
        <DialogContent className="max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="text-title-2 text-gray-800">
              우리 가게 사이트 주소
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-body-r text-gray-800 break-all">
                chefriend.kr/{currentStore?.siteLink}
              </p>
            </div>
            <DialogFooter className="flex gap-2 sm:justify-center">
              <Button
                onClick={handleCopySiteLink}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                복사하기
              </Button>
              <Button
                onClick={handleViewSite}
                className="flex-1 bg-purple-700 text-white hover:bg-purple-800"
              >
                사이트 보기
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 프로필 이미지 미리보기 Dialog */}
      <Dialog
        open={isProfileImageDialogOpen}
        onOpenChange={setIsProfileImageDialogOpen}
      >
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-title-2 text-gray-800">
              대표 사진
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 이미지 미리보기 - cdn에서 가져오는 이미지는 최적화 불필요*/}
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
              {currentStore?.thumbnailUrl ? (
                <img
                  src={currentStore.thumbnailUrl}
                  alt="대표 사진"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src="/store_icon.png"
                  alt="대표 사진"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                  quality={100}
                  priority
                />
              )}
            </div>
            {/* 히든 파일 input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="hidden"
            />
            <DialogFooter className="flex gap-2 sm:justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="flex-1 bg-purple-700 text-white hover:bg-purple-800"
              >
                {isUploadingImage ? "업로드 중..." : "사진 변경하기"}
              </Button>
              <Button
                onClick={() => setIsProfileImageDialogOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                닫기
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 문의하기 Dialog */}
      <Dialog open={isInquiryDialogOpen} onOpenChange={setIsInquiryDialogOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-title-2 text-gray-800">
              개발자에게 문의하기
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={inquiryContent}
              onChange={(e) => setInquiryContent(e.target.value)}
              placeholder="문의 내용을 입력해주세요"
              className="min-h-[120px] bg-gray-200 rounded-[12px] p-4 text-body-r placeholder:text-gray-500 resize-none"
              rows={5}
            />
            <DialogFooter className="flex gap-2 sm:justify-center">
              <Button
                onClick={handleInquirySubmit}
                disabled={!inquiryContent.trim() || isSubmittingInquiry}
                className="flex-1 bg-purple-700 text-white hover:bg-purple-800"
              >
                {isSubmittingInquiry ? "전송 중..." : "보내기"}
              </Button>
              <Button
                onClick={() => setIsInquiryDialogOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                취소
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
