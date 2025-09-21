import { apiClient } from "../client";
import type {
  ApiResponse,
  PageResponse,
  Pageable,
} from "@/lib/types/api/common";
import type { ReviewResponse } from "@/lib/types/api/review";

// Mock data for reviews (현재 사용)
const mockReviews: ReviewResponse[] = [
  {
    id: 1,
    userName: "별내심슨",
    date: "2025. 09. 09",
    menuName: "기영이네 김치찌개",
    servings: "1인분",
    spiciness: "보통",
    price: "2만원",
    review:
      "김치찌개 간도 적당하고 너무 맛있어요! \n옵션 추가로 청양고추 추가 있었으면 좋겠습니다.\n조금더 칼칼했으면 좋겠어요",
  },
  {
    id: 2,
    userName: "신림동베트맨",
    date: "2025. 06. 09",
    menuName: "제육볶음",
    servings: "0.5인분",
    spiciness: "덜 맵게",
    price: "1.5만원",
    review:
      "양도 적당하고 맛있어요. 조금 더 덜 달게 해주시면 좋을 것 같습니다. 매운거 못 먹는데 맵기도 괜찮았어요!!",
  },
  {
    id: 3,
    userName: "송파나부랭이",
    date: "2025. 5. 11",
    menuName: "오삼불고기",
    servings: "1.5인분",
    spiciness: "맵게",
    price: "1만원",
    review:
      "진짜 맛있는데,, 딱 하나 너무 삼삼해요 조금 더 맵게 할 수 있도록 추가 옵션 만들어주세요!!!",
  },
];

export const reviewApi = {
  // 매장별 리뷰 목록 조회 (추후 백엔드 구현 예정)
  getStoreReviews: async (
    storeId: number,
    pageable: Pageable = {}
  ): Promise<ApiResponse<PageResponse<ReviewResponse>>> => {
    const params = {
      page: pageable.page ?? 1,
      size: pageable.size ?? 20,
      sort: pageable.sort ?? ["createdAt,desc"],
    };

    return apiClient.get<ApiResponse<PageResponse<ReviewResponse>>>(
      `/api/customer-feedback/store/${storeId}`,
      { params }
    );
  },

  // 음식별 리뷰 목록 조회 (추후 백엔드 구현 예정)
  getFoodReviews: async (
    foodId: number,
    pageable: Pageable = {}
  ): Promise<ApiResponse<PageResponse<ReviewResponse>>> => {
    const params = {
      page: pageable.page ?? 1,
      size: pageable.size ?? 20,
      sort: pageable.sort ?? ["createdAt,desc"],
    };

    // TODO: 백엔드 API 구현 후 연결
    // return apiClient.get<ApiResponse<PageResponse<ReviewResponse>>>(
    //   `/api/reviews/food/${foodId}`,
    //   { params }
    // );

    // 임시 Mock 데이터 반환 (foodId로 필터링)
    const filteredReviews = mockReviews.filter((r) => r.foodId === foodId);
    return Promise.resolve({
      code: 200,
      message: "성공했습니다",
      result: {
        content: filteredReviews,
        page: params.page,
        size: params.size,
        totalElements: filteredReviews.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    });
  },

  // 리뷰 상세 조회 (추후 백엔드 구현 예정)
  getReview: async (
    reviewId: number
  ): Promise<ApiResponse<ReviewResponse | undefined>> => {
    // TODO: 백엔드 API 구현 후 연결
    // return apiClient.get<ApiResponse<ReviewResponse>>(`/api/reviews/${reviewId}`);

    const review = mockReviews.find((r) => r.id === reviewId);
    return Promise.resolve({
      code: 200,
      message: "성공했습니다",
      result: review,
    });
  },

  // Mock 데이터 getter (테스트용)
  getMockReviews: () => mockReviews,
};
