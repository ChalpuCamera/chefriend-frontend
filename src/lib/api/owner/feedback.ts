import { apiClient } from "../client";
import type {
  ApiResponse,
  PageResponse,
  Pageable,
} from "@/lib/types/api/common";
import type {
  FeedbackResponse,
  FeedbackCreateRequest,
  CustomerTasteDto,
  ReviewDisplayData,
  FeedbackPhotosUploadRequest,
  FeedbackPhotosPresignedUrlResponse,
} from "@/lib/types/api/feedback";

// Mock 맛 프로필 데이터 (백엔드에서 사용자별 조회 API 제공 전까지 사용)
const mockTasteProfiles: Record<string, CustomerTasteDto> = {
  별내심슨: { spicyLevel: 3, mealAmount: 3, mealSpending: 4 },
  신림동베트맨: { spicyLevel: 2, mealAmount: 2, mealSpending: 3 },
  송파나부랭이: { spicyLevel: 4, mealAmount: 4, mealSpending: 2 },
};

// 맛 프로필 값 변환 헬퍼 함수들
export const getServingsText = (mealAmount: number): string => {
  const servingsMap: Record<number, string> = {
    1: "0.5인분",
    2: "0.5인분",
    3: "1인분",
    4: "1.5인분",
    5: "2인분",
  };
  return servingsMap[mealAmount] || "1인분";
};

export const getSpicinessText = (spicyLevel: number): string => {
  const spicyMap: Record<number, string> = {
    1: "안 맵게",
    2: "덜 맵게",
    3: "보통",
    4: "맵게",
    5: "아주 맵게",
  };
  return spicyMap[spicyLevel] || "보통";
};

export const getPriceText = (mealSpending: number): string => {
  const priceMap: Record<number, string> = {
    1: "1만원",
    2: "1.5만원",
    3: "2만원",
    4: "3만원",
    5: "4만원+",
  };
  return priceMap[mealSpending] || "2만원";
};

// 날짜 포맷 헬퍼
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}`;
};

// FeedbackResponse를 ReviewDisplayData로 변환
export const transformFeedbackToReview = (
  feedback: FeedbackResponse,
  tasteProfile?: CustomerTasteDto
): ReviewDisplayData => {
  // surveyAnswers가 없는 경우 빈 배열로 처리
  const surveyAnswers = feedback.surveyAnswers || [];

  // questionId 9번 찾기 (리뷰 텍스트)
  const reviewAnswer = surveyAnswers.find((answer) => answer.questionId === 9);
  const reviewText = reviewAnswer?.answerText || "";

  // Mock 맛 프로필 가져오기 (실제로는 API 호출 필요)
  const profile = tasteProfile ||
    mockTasteProfiles[feedback.userNickname] || {
      spicyLevel: 3,
      mealAmount: 3,
      mealSpending: 3,
    };

  return {
    id: feedback.id,
    userName: feedback.userNickname || "익명",
    date: feedback.createdAt ? formatDate(feedback.createdAt) : "",
    menuName: feedback.foodName || "",
    reviewText,
    servings: getServingsText(profile.mealAmount),
    spiciness: getSpicinessText(profile.spicyLevel),
    price: getPriceText(profile.mealSpending),
    photoUrls: feedback.photoUrls || [],
  };
};

// Mock 리뷰 데이터 (개발/테스트용)
const mockReviews: ReviewDisplayData[] = [
  {
    id: 101,
    userName: "별내심슨",
    date: "2025. 09. 09",
    menuName: "기영이네 김치찌개",
    servings: "1인분",
    spiciness: "보통",
    price: "2만원",
    reviewText:
      "김치찌개 간도 적당하고 너무 맛있어요! \n옵션 추가로 청양고추 추가 있었으면 좋겠습니다.\n조금더 칼칼했으면 좋겠어요",
  },
  {
    id: 102,
    userName: "신림동베트맨",
    date: "2025. 06. 09",
    menuName: "제육볶음",
    servings: "0.5인분",
    spiciness: "덜 맵게",
    price: "1.5만원",
    reviewText:
      "양도 적당하고 맛있어요. 조금 더 덜 달게 해주시면 좋을 것 같습니다. 매운거 못 먹는데 맵기도 괜찮았어요!!",
  },
  {
    id: 103,
    userName: "송파나부랭이",
    date: "2025. 5. 11",
    menuName: "오삼불고기",
    servings: "1.5인분",
    spiciness: "맵게",
    price: "1만원",
    reviewText:
      "진짜 맛있는데,, 딱 하나 너무 삼삼해요 조금 더 맵게 할 수 있도록 추가 옵션 만들어주세요!!!",
  },
];

export const feedbackApi = {
  // 매장별 피드백 목록 조회
  getStoreFeedbacks: async (
    storeId: number,
    pageable: Pageable = {}
  ): Promise<ApiResponse<PageResponse<FeedbackResponse>>> => {
    const params = {
      page: pageable.page ?? 0,
      size: pageable.size ?? 20,
      sort: pageable.sort ?? ["createdAt,desc"],
    };
    return apiClient.get<ApiResponse<PageResponse<FeedbackResponse>>>(
      `/api/customer-feedback/store/${storeId}`,
      { params }
    );
  },

  // 음식별 피드백 목록 조회
  getFoodFeedbacks: async (
    foodId: number,
    pageable: Pageable = {}
  ): Promise<ApiResponse<PageResponse<FeedbackResponse>>> => {
    const params = {
      page: pageable.page ?? 0,
      size: pageable.size ?? 20,
      sort: pageable.sort ?? ["createdAt,desc"],
    };
    return apiClient.get<ApiResponse<PageResponse<FeedbackResponse>>>(
      `/api/customer-feedback/food/${foodId}`,
      { params }
    );
  },

  // 피드백 상세 조회
  getFeedback: async (
    feedbackId: number
  ): Promise<ApiResponse<FeedbackResponse>> => {
    return apiClient.get<ApiResponse<FeedbackResponse>>(
      `/api/customer-feedback/${feedbackId}`
    );
  },

  // 피드백 생성
  createFeedback: async (
    data: FeedbackCreateRequest
  ): Promise<ApiResponse<FeedbackResponse>> => {
    return apiClient.post<ApiResponse<FeedbackResponse>>(
      "/api/customer-feedback",
      data
    );
  },

  // 내 피드백 목록 조회 (고객용)
  getMyFeedbacks: async (
    pageable: Pageable = {}
  ): Promise<ApiResponse<PageResponse<FeedbackResponse>>> => {
    const params = {
      page: pageable.page ?? 0,
      size: pageable.size ?? 20,
      sort: pageable.sort ?? ["createdAt,desc"],
    };
    return apiClient.get<ApiResponse<PageResponse<FeedbackResponse>>>(
      "/api/customer-feedback/me",
      { params }
    );
  },

  // 피드백 사진 Presigned URL 생성
  generatePresignedUrls: async (
    data: FeedbackPhotosUploadRequest
  ): Promise<ApiResponse<FeedbackPhotosPresignedUrlResponse>> => {
    return apiClient.post<ApiResponse<FeedbackPhotosPresignedUrlResponse>>(
      "/api/customer-feedback/presigned-urls",
      data
    );
  },

  // 고객 취향 정보 조회 (현재 로그인한 사용자)
  getCustomerTaste: async (): Promise<ApiResponse<CustomerTasteDto>> => {
    return apiClient.get<ApiResponse<CustomerTasteDto>>(
      "/api/user/profile/taste"
    );
  },

  // 고객 취향 정보 수정
  updateCustomerTaste: async (
    data: CustomerTasteDto
  ): Promise<ApiResponse<CustomerTasteDto>> => {
    return apiClient.put<ApiResponse<CustomerTasteDto>>(
      "/api/user/profile/taste",
      data
    );
  },

  // 매장 피드백을 리뷰 형태로 변환하여 조회 (UI 표시용)
  getStoreReviews: async (
    storeId: number,
    pageable: Pageable = {}
  ): Promise<ReviewDisplayData[]> => {
    try {
      const response = await feedbackApi.getStoreFeedbacks(storeId, pageable);

      if (response?.code === 200 && response?.result?.content) {
        // null/undefined 체크 및 필터링
        return response.result.content
          .filter((feedback) => feedback && typeof feedback === "object")
          .map((feedback) => {
            try {
              return transformFeedbackToReview(feedback);
            } catch (err) {
              console.error("Failed to transform feedback:", err, feedback);
              // 변환 실패 시 기본값 반환
              return {
                id: feedback?.id || Math.random(),
                userName: feedback?.userNickname || "익명",
                date: feedback?.createdAt ? formatDate(feedback.createdAt) : "",
                menuName: feedback?.foodName || "",
                reviewText: "",
                servings: "1인분",
                spiciness: "보통",
                price: "2만원",
                photoUrls: feedback?.photoUrls || [],
              };
            }
          });
      }
    } catch (error) {
      console.error("Failed to fetch store feedbacks:", error);
    }

    // 오류 시 Mock 데이터 반환
    return mockReviews;
  },

  // 음식별 피드백을 리뷰 형태로 변환하여 조회 (UI 표시용)
  getFoodReviews: async (
    foodId: number,
    pageable: Pageable = {}
  ): Promise<ReviewDisplayData[]> => {
    try {
      const response = await feedbackApi.getFoodFeedbacks(foodId, pageable);

      if (response?.code === 200 && response?.result?.content) {
        // null/undefined 체크 및 필터링
        return response.result.content
          .filter((feedback) => feedback && typeof feedback === "object")
          .map((feedback) => {
            try {
              return transformFeedbackToReview(feedback);
            } catch (err) {
              console.error("Failed to transform feedback:", err, feedback);
              // 변환 실패 시 기본값 반환
              return {
                id: feedback?.id || Math.random(),
                userName: feedback?.userNickname || "익명",
                date: feedback?.createdAt ? formatDate(feedback.createdAt) : "",
                menuName: feedback?.foodName || "",
                reviewText: "",
                servings: "1인분",
                spiciness: "보통",
                price: "2만원",
                photoUrls: feedback?.photoUrls || [],
              };
            }
          });
      }
    } catch (error) {
      console.error("Failed to fetch food feedbacks:", error);
    }

    // 오류 시 빈 배열 반환
    return [];
  },
};
