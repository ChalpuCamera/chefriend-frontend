"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import {
  useFood,
  useDeleteFood,
  useUpdateThumbnail,
} from "@/lib/hooks/useFood";
import { usePhotosByFoodItem } from "@/lib/hooks/usePhoto";
import {
  useGetActiveQuestions,
  useDeleteFoodQuestions,
} from "@/lib/hooks/useFoodQuestions";
//import { useJARAnalysis } from "@/lib/hooks/useJAR";
import {
  useFoodReviews,
  getFlattenedReviews,
} from "@/lib/hooks/useFoodReviews";
import { inquiryApi } from "@/lib/api/landing/inquiry";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingNavBar } from "@/components/floating-nav-bar";
// import { useGetActiveCampaignByFood, calculateRemainingDays } from "@/lib/hooks/useCampaign";
// import { useMyStores } from "@/lib/hooks/useStore";

export default function Page({
  params,
}: {
  params: Promise<{ foodId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInquiryDialogOpen, setIsInquiryDialogOpen] = useState(false);
  const [inquiryContent, setInquiryContent] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [showDeleteReviewDialog, setShowDeleteReviewDialog] = useState(false);
  const [expandedReviewIndices, setExpandedReviewIndices] = useState<
    Set<number>
  >(new Set());
  const foodId = parseInt(resolvedParams.foodId);
  // const observerTarget = useRef<HTMLDivElement>(null);

  // API 데이터 가져오기
  const { data: menuData, isLoading } = useFood(foodId);
  const { data: photos = [] } = usePhotosByFoodItem(foodId);
  const { data: activeQuestionsData } = useGetActiveQuestions(foodId);
  // const { data: jarData, isError: jarError } = useJARAnalysis(foodId);
  const {
    data: reviewsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFoodReviews(foodId);

  const deleteFood = useDeleteFood();
  const updateThumbnail = useUpdateThumbnail();
  const deleteReviewQuestions = useDeleteFoodQuestions();

  const handleInquirySubmit = async () => {
    if (!inquiryContent.trim()) {
      toast.error("문의 내용을 입력해주세요.");
      return;
    }

    setIsSubmittingInquiry(true);
    try {
      await inquiryApi.saveInquiry({
        content: (
          inquiryContent +
          " [from menu page foodId: " +
          foodId +
          "]"
        ).trim(),
      });
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

  const handleDeleteReview = async () => {
    try {
      await deleteReviewQuestions.mutateAsync(foodId);
      setShowDeleteReviewDialog(false);
    } catch (error) {
      console.error("리뷰 종료 실패:", error);
    }
  };

  const toggleExpandReview = (index: number) => {
    setExpandedReviewIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // 사용자의 가게 정보 가져오기
  // const { data: storesData } = useMyStores({ size: 10 });
  // const stores = storesData?.content || [];
  // const currentStore =
  //   stores.length > 0
  //     ? stores.reduce((first, store) =>
  //         store.storeId < first.storeId ? store : first
  //       )
  //     : null;
  // const storeId = currentStore?.storeId;

  // 캠페인 데이터 가져오기
  // const { data: activeCampaign } = useGetActiveCampaignByFood(
  //   storeId!,
  //   foodId,
  //   !!storeId && !!foodId
  // );

  // 이미지 배열 구성 (thumbnail + photos)
  const allImages = [
    ...(menuData?.thumbnailUrl
      ? [{ url: menuData.thumbnailUrl, id: "thumbnail" }]
      : []),
    ...photos
      .filter((photo) => photo.imageUrl !== menuData?.thumbnailUrl) // 중복 썸네일 제거
      .map((photo) => ({ url: photo.imageUrl, id: photo.photoId })),
  ].slice(0, 3); // 최대 3개까지만

  // reviewsData에서 모든 페이지의 리뷰를 평탄화
  const reviews = getFlattenedReviews(reviewsData);

  // // 캠페인 데이터 처리
  // const hasCampaign = !!activeCampaign;
  // const campaignData = activeCampaign ? {
  //   ...activeCampaign,
  //   daysRemaining: calculateRemainingDays(activeCampaign.endDate),
  //   progressPercent: activeCampaign.currentFeedbackCount
  //     ? Math.round((activeCampaign.currentFeedbackCount / activeCampaign.targetFeedbackCount) * 100)
  //     : 0,
  //   // 이미지는 음식 썸네일 또는 기본 이미지 사용 (백엔드에서 제공하지 않는 경우)
  //   imageUrl: activeCampaign.foodItemThumbnailUrl || menuData?.thumbnailUrl || "/kimchi.png"
  // } : null;

  // 무한 스크롤 설정
  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
  //         fetchNextPage();
  //       }
  //     },
  //     { threshold: 0.5 }
  //   );

  //   if (observerTarget.current) {
  //     observer.observe(observerTarget.current);
  //   }

  //   return () => observer.disconnect();
  // }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleBack = () => {
    router.push("/menu");
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

  const handleHome = () => {
    router.push("/home");
  };

  const handleSettings = () => {
    router.push("/mypage");
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
        <div className="max-w-[430px] mx-auto">
          <div className="flex items-center justify-between h-11 px-3.5">
            <button
              onClick={handleBack}
              className="flex items-center justify-center"
            >
              <ArrowLeft size={24} className="text-foreground" />
            </button>
            <div className="flex items-center gap-5">
              <button
                className="flex items-center justify-center"
                onClick={handleHome}
              >
                <Image src="/home_icon.png" alt="home" width={20} height={20} />
              </button>
              <button
                className="flex items-center justify-center"
                onClick={handleSettings}
              >
                <Image
                  src="/setting_icon.png"
                  alt="settings"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </div>

          {/* Title and Actions */}
          <div className="flex items-center justify-between px-4 py-4">
            <h1 className="text-title-2 text-gray-800">메뉴 상세보기</h1>
            <div className="flex gap-1">
              <button
                onClick={handleDelete}
                className="px-2 py-1 text-gray-800 text-headline-m"
              >
                삭제
              </button>
              <button
                onClick={handleEdit}
                className="pl-2 py-1 text-gray-800 text-headline-m"
              >
                수정
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - pt 추가하여 헤더 공간 확보 */}
      <div className="pt-[104px] pb-40">
        {/* Main Image */}
        <div className="w-full h-[220px] bg-gray-100">
          {allImages.length > 0 ? (
            <Image
              src={allImages[selectedImageIndex]?.url || "/menu_icon.png"}
              alt={menuData?.foodName || "메뉴 이미지"}
              width={375}
              height={220}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src="/menu_icon.png"
                alt="준비중"
                width={120}
                height={120}
                className="opacity-30"
              />
            </div>
          )}
        </div>

        {/* Thumbnail Indicator with Set as Thumbnail Button */}
        <div className="bg-white px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(allImages.length > 0
                ? allImages
                : [{ url: "/menu_icon.png", id: "default" }]
              ).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className="flex flex-col items-center"
                >
                  <div className="w-[38px] h-[38px] rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    <Image
                      src={image.url}
                      alt={`메뉴 이미지 ${index + 1}`}
                      width={38}
                      height={38}
                      className={`w-full h-full object-cover ${
                        allImages.length === 0 ? "opacity-30" : ""
                      }`}
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
                  className="text-xs h-7 px-2 bg-purple-700 text-white rounded-md"
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

        {/* Description - description이 있을 때만 렌더링 */}
        {menuData?.description && menuData.description.trim() && (
          <div className="px-4 mb-6">
            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-body-r text-gray-800 text-center whitespace-pre-line leading-relaxed">
                {menuData.description}
              </p>
            </div>
          </div>
        )}

        {/* Campaign Section */}
        {/* <div className="px-4 mb-6">
          <h3 className="text-sub-title-b text-gray-800 mb-4">캠페인 현황</h3>

          {hasCampaign && campaignData ? ( */}
        {/* 캠페인 진행 중 상태 - Figma 디자인 기반 */}
        {/* <div className="bg-white border border-purple-700 rounded-[8px] relative overflow-hidden h-[140px]">
              <div className="flex h-full">
                <div className="flex-1 p-4 pr-[135px]"> */}
        {/* 메뉴 이름 */}
        {/* <h4 className="text-headline-b text-gray-700 mb-2">
                    {campaignData.foodItemName || campaignData.name}
                  </h4> */}

        {/* 남은 기간 */}
        {/* <p className="text-body-sb text-purple-700 mb-4">
                    {campaignData.daysRemaining > 0
                      ? `${campaignData.daysRemaining}일 남음`
                      : '오늘 종료'}
                  </p> */}

        {/* 평가 수 정보 */}
        {/* <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sub-body-r text-gray-700">고객 평가 수</span>
                      <span className="text-sub-body-r text-gray-700">
                        {campaignData.currentFeedbackCount || 0}/{campaignData.targetFeedbackCount}
                      </span>
                    </div> */}

        {/* 진행률 바 */}
        {/* <div className="h-[9px] bg-gray-300 rounded-[20px] overflow-hidden">
                      <div
                        className="h-full bg-purple-700 rounded-[20px] transition-all"
                        style={{ width: `${campaignData.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div> */}

        {/* 오른쪽 이미지 */}
        {/* <div className="absolute right-0 top-0 h-[140px] w-[131px]">
                  <Image
                    src={campaignData.imageUrl}
                    alt="캠페인 메뉴"
                    width={131}
                    height={140}
                    className="object-cover h-full w-full"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          ) : ( */}
        {/* 캠페인 미등록 상태 */}
        {/* <div className="bg-[#f7f4fe] rounded-[12px] p-6 flex flex-col items-center justify-center">
              <p className="text-body-r text-black text-center mb-4 leading-[24px]">
                캠페인을 등록한 메뉴는
                <br />
                고객의 솔직한 평가를 받아볼 수 있어요.
              </p>
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    menuId: foodId.toString(),
                    menuName: menuData?.foodName || "",
                    menuPrice: menuData?.price?.toString() || "0",
                    menuImage: encodeURIComponent(
                      menuData?.thumbnailUrl || "/kimchi.png"
                    ),
                  });
                  router.push(`/campaign/add?${params.toString()}`);
                }}
                className="bg-purple-700 text-white text-body-sb h-[34px] px-5 rounded-[8px]"
              >
                캠페인 등록하기
              </button>
            </div>
          )}
        </div> */}

        {/* Menu Stats */}
        {/* <div className="px-4 mb-4">
          <h3 className="text-sub-title-b text-gray-800 mb-4">
            메뉴 평가 리포트
          </h3>
          <div className="flex gap-2">
            <div className="flex-1 bg-white border border-gray-300 rounded-lg p-3">
              <p className="text-sub-body-r text-gray-700">평가 수</p>
              <p className="text-title-2 text-gray-800 mt-1">
                {jarData?.npsScore?.totalResponses || 23}
              </p>
            </div>
            <div className="flex-1 bg-white border border-gray-300 rounded-lg p-3">
              <p className="text-sub-body-r text-gray-700">평점</p>
              <p className="text-title-2 text-gray-800 mt-1">
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
            <div className="flex-1 bg-white border border-gray-300 rounded-lg p-3">
              <p className="text-sub-body-r text-gray-700">재주문률</p>
              <p className="text-title-2 text-gray-800 mt-1">
                {jarData?.npsScore?.promoterRate
                  ? `${Math.round(jarData.npsScore.promoterRate)}%`
                  : "87%"}
              </p>
            </div>
          </div>
        </div> */}
        {/* 그래프 Section */}
        {/* <div className="px-4 py-6 flex flex-col gap-4">
      
          <div className="relative bg-white rounded-[8px] overflow-hidden">
            <div className={jarError ? "opacity-20" : ""}>

              <div className="divide-y divide-gray-100">
                {(() => {
                  // 에러 시 더미 데이터 사용
                  let tasteData;

                  // JAR 데이터에서 맛 속성 찾기
                  const spicyData = jarData?.results?.find(
                    (r) => r.attribute === "SPICINESS"
                  );
                  const sweetData = jarData?.results?.find(
                    (r) => r.attribute === "SWEETNESS"
                  );
                  const saltyData = jarData?.results?.find(
                    (r) => r.attribute === "SALTINESS"
                  );
                  const sourData = jarData?.results?.find(
                    (r) => r.attribute === "SOURNESS"
                  );

                  // 각 속성별 상태 결정 함수
                  const getStatus = (
                    data: typeof spicyData,
                    defaultStatus: string
                  ) => {
                    if (!data) return defaultStatus;
                    // tooLittle이나 tooMuch의 비율이 높으면 문제
                    const problemRatio =
                      data.tooLittle.percentage + data.tooMuch.percentage;
                    if (problemRatio > 60) return "개선 필요";
                    if (problemRatio > 40) return "주의";
                    return "적정";
                  };

                  const getColor = (status: string) => {
                    if (status === "개선 필요") return "bg-[#f8535a]";
                    if (status === "주의") return "bg-[#fe951c]";
                    return "bg-[#40c057]";
                  };

                  const getValue = (
                    data: typeof spicyData,
                    defaultValue: number
                  ) => {
                    if (!data) return defaultValue;
                    // justRight 비율을 기준으로 표시
                    return data.justRight.percentage || defaultValue;
                  };

                  if (jarError) {
                    // 에러일 때 더미 데이터
                    tasteData = [
                      {
                        name: "맵기",
                        value: 13,
                        status: "개선 필요",
                        color: "bg-[#f8535a]",
                      },
                      {
                        name: "단맛",
                        value: 34,
                        status: "주의",
                        color: "bg-[#fe951c]",
                      },
                      {
                        name: "짠맛",
                        value: 55,
                        status: "적정",
                        color: "bg-[#40c057]",
                      },
                      {
                        name: "신맛",
                        value: 55,
                        status: "적정",
                        color: "bg-[#40c057]",
                      },
                    ];
                  } else {
                    // 정상일 때 실제 데이터 (없으면 더미 데이터와 동일한 기본값 사용)
                    tasteData = [
                      {
                        name: "맵기",
                        value: getValue(spicyData, 13),
                        status: getStatus(spicyData, "개선 필요"),
                        color: getColor(getStatus(spicyData, "개선 필요")),
                      },
                      {
                        name: "단맛",
                        value: getValue(sweetData, 34),
                        status: getStatus(sweetData, "주의"),
                        color: getColor(getStatus(sweetData, "주의")),
                      },
                      {
                        name: "짠맛",
                        value: getValue(saltyData, 55),
                        status: getStatus(saltyData, "적정"),
                        color: getColor(getStatus(saltyData, "적정")),
                      },
                      {
                        name: "신맛",
                        value: getValue(sourData, 55),
                        status: getStatus(sourData, "적정"),
                        color: getColor(getStatus(sourData, "적정")),
                      },
                    ];
                  }

                  return tasteData;
                })().map((item, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[17px] font-medium text-gray-700">
                        {item.name}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${item.color}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>약함</span>
                        <span>적정</span>
                        <span>강함</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {jarError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-[#f7f4fe] border border-gray-700 rounded-[12px] px-8 py-4 mx-6">
                  <p className="text-body-sb text-gray-800 text-center leading-[24px]">
                    평가 수가 5개가 넘으면
                    <br />더 자세한 리포트를 보여드려요.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div
            className={`bg-white rounded-[8px] border border-gray-300 p-4 ${
              jarError ? "opacity-20" : ""
            }`}
          >
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 rounded-[7px] border border-gray-200 p-3">
                <p className="text-xs font-semibold text-[#008214] mb-1">
                  추천
                </p>
                <p className="text-xl font-bold text-[#008214]">
                  {jarError
                    ? "77%"
                    : jarData?.npsScore?.promoterRate
                    ? `${Math.round(jarData.npsScore.promoterRate)}%`
                    : "77%"}
                </p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-[7px] border border-gray-200 p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">중립</p>
                <p className="text-xl font-bold text-gray-700">
                  {jarError
                    ? "11%"
                    : jarData?.npsScore?.passiveRate
                    ? `${Math.round(jarData.npsScore.passiveRate)}%`
                    : "11%"}
                </p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-[7px] border border-gray-200 p-3">
                <p className="text-xs font-semibold text-[#d02532] mb-1">
                  비추천
                </p>
                <p className="text-xl font-bold text-[#d02532]">
                  {jarError
                    ? "12%"
                    : jarData?.npsScore?.detractorRate
                    ? `${Math.round(jarData.npsScore.detractorRate)}%`
                    : "12%"}
                </p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Recent Reviews Section */}
        <div className="px-4 py-6">
          {/* 헤더: 제목 + ON/OFF 상태 + 버튼들 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-sub-title-b text-gray-800">손님 후기</h2>

              {/* ON/OFF 상태 배지 */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  activeQuestionsData?.result &&
                  activeQuestionsData.result.filter(
                    (q) => q.questionType === "RATING"
                  ).length > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {activeQuestionsData?.result &&
                activeQuestionsData.result.filter(
                  (q) => q.questionType === "RATING"
                ).length > 0
                  ? "ON"
                  : "OFF"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* 리뷰 등록/관리 버튼 */}
              <Button
                onClick={() => {
                  const params = new URLSearchParams({
                    foodId: foodId.toString(),
                  });
                  router.push(`/review/add?${params.toString()}`);
                }}
                className="h-9 px-4 bg-purple-600 text-white text-sm hover:bg-purple-700"
              >
                {menuData?.hasActiveReview ? "리뷰 관리하기" : "리뷰 등록하기"}
              </Button>

              {/* 종료 버튼 (활성 질문이 있을 때만) */}
              {activeQuestionsData?.result &&
                activeQuestionsData.result.filter(
                  (q) => q.questionType === "RATING"
                ).length > 0 && (
                  <Button
                    onClick={() => setShowDeleteReviewDialog(true)}
                    variant="outline"
                    className="h-9 px-4 border-red-500 text-red-500 hover:bg-red-50"
                  >
                    리뷰 끄기
                  </Button>
                )}
            </div>
          </div>

          {reviews.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center w-full h-24">
              <p className="text-sub-body-r mb-4">
                아직 손님이 진행한 평가가 없어요
              </p>
            </div>
          ) : (
            // Review Items
            <div className="space-y-4">
              {reviews.map((review, index) => {
                const isExpanded = expandedReviewIndices.has(index);
                return (
                  <div
                    key={`review-${index}-${review.id}`}
                    className="py-2 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex gap-3">
                      {/* Left: Review Content */}
                      <div className="flex-1 min-w-0">
                        {/* Anonymous ID and Attributes */}
                        <div className="flex items-start gap-2 mb-2 text-sm text-gray-700">
                          <span className="text-body-sb flex-shrink-0">
                            익명{reviews.length - index}
                          </span>
                          {review.attributes && review.attributes.length > 0 && (
                            <div
                              onClick={() => toggleExpandReview(index)}
                              className={`flex-1 cursor-pointer ${
                                isExpanded
                                  ? "whitespace-normal"
                                  : "whitespace-nowrap overflow-hidden text-ellipsis"
                              }`}
                            >
                              {review.attributes.map((attr, idx) => (
                                <span
                                  key={`${review.id}-${attr.label}-${idx}`}
                                  className="mr-2"
                                >
                                  {attr.label}:{attr.value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Review Text */}
                        {review.reviewText && (
                          <p className="text-body-r text-gray-800 whitespace-pre-line mb-2">
                            {review.reviewText}
                          </p>
                        )}

                        {/* Date */}
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>

                      {/* Right: Photo (if exists) */}
                      {review.photoUrls && review.photoUrls.length > 0 && (
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={review.photoUrls[0]}
                            alt="리뷰 사진"
                            className="w-full h-full object-cover rounded-[8px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {hasNextPage && (
                <div className="py-4 text-center">
                  {isFetchingNextPage ? (
                    <p className="text-gray-500">더 불러오는 중...</p>
                  ) : (
                    <Button
                      onClick={() => fetchNextPage()}
                      variant="outline"
                      className="text-sm"
                    >
                      더 보기
                    </Button>
                  )}
                </div>
              )}
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
      </div>
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
            <DialogFooter>
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

      {/* Delete Review Confirmation Dialog */}
      <Dialog
        open={showDeleteReviewDialog}
        onOpenChange={setShowDeleteReviewDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>리뷰 받기 종료</DialogTitle>
            <DialogDescription>
              &quot;{menuData?.foodName}&quot; 메뉴의 리뷰 받기를
              종료하시겠습니까?
              <br />
              설정된 평가 항목이 모두 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2">
            <Button
              onClick={handleDeleteReview}
              disabled={deleteReviewQuestions.isPending}
              className="flex-1 bg-purple-700 text-white hover:bg-purple-800"
            >
              {deleteReviewQuestions.isPending ? "종료 중..." : "종료"}
            </Button>
            <Button
              onClick={() => setShowDeleteReviewDialog(false)}
              className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FloatingNavBar currentTab="menu" />
    </div>
  );
}
