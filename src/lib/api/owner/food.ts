import { apiClient } from "../client";
import type {
  ApiResponse,
  PageResponse,
  Pageable,
} from "@/lib/types/api/common";
import type {
  FoodItemRequest,
  FoodItemResponse,
  FoodItemExtractionStartResponse,
  FoodItemExtractionStatusResponse,
} from "@/lib/types/api/food";

export const foodApi = {
  // 매장별 음식 목록 조회
  getFoodsByStore: (storeId: number, pageable: Pageable = {}) => {
    const params = {
      page: pageable.page ?? 0,
      size: pageable.size ?? 10,
      sort: pageable.sort ?? ["createdAt,desc"],
    };
    return apiClient.get<ApiResponse<PageResponse<FoodItemResponse>>>(
      `/api/foods/store/${storeId}`,
      { params }
    );
  },

  // 음식 생성
  createFood: (storeId: number, data: FoodItemRequest) =>
    apiClient.post<ApiResponse<FoodItemResponse>>(
      `/api/foods/store/${storeId}`,
      data
    ),

  // 음식 상세 조회
  getFood: (foodId: number) =>
    apiClient.get<ApiResponse<FoodItemResponse>>(`/api/foods/${foodId}`),

  // 음식 수정
  updateFood: (foodId: number, data: FoodItemRequest) =>
    apiClient.put<ApiResponse<FoodItemResponse>>(`/api/foods/${foodId}`, data),

  // 음식 삭제
  deleteFood: (foodId: number) =>
    apiClient.delete<ApiResponse<void>>(`/api/foods/${foodId}`),

  // 음식 대표 사진 설정
  updateThumbnail: (foodId: number, photoUrl: string) =>
    apiClient.put<ApiResponse<FoodItemResponse>>(
      `/api/foods/${foodId}/thumbnail?photoUrl=${encodeURIComponent(photoUrl)}`
    ),

  // 메뉴판 사진으로 추출 시작
  startMenuExtraction: (storeId: number, imageFile: File) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    return apiClient.post<ApiResponse<FoodItemExtractionStartResponse>>(
      `/api/foods/menu/extract?storeId=${storeId}`,
      formData
      // Content-Type 헤더를 명시하지 않으면 axios가 자동으로 multipart/form-data + boundary 설정
    );
  },

  // 메뉴 추출 상태 조회 (폴링용)
  getExtractionStatus: (requestId: string) =>
    apiClient.get<ApiResponse<FoodItemExtractionStatusResponse>>(
      `/api/foods/menu/extract/status/${requestId}`
    ),
};
