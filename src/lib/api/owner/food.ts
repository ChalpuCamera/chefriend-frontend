import { apiClient } from '../client';
import type { ApiResponse, PageResponse, Pageable } from '@/lib/types/api/common';
import type { FoodItemRequest, FoodItemResponse } from '@/lib/types/api/food';

export const foodApi = {
  // 매장별 음식 목록 조회
  getFoodsByStore: (storeId: number, pageable: Pageable = {}) => {
    const params = {
      page: pageable.page ?? 0,
      size: pageable.size ?? 10,
      sort: pageable.sort ?? ['createdAt,desc'],
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
};