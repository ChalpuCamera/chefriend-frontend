import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { reviewApi } from "@/lib/api/owner/review";
import type { Pageable } from "@/lib/types/api/common";

// Query Keys
export const reviewKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  listByStore: (storeId: number, filters?: Pageable) =>
    [...reviewKeys.lists(), "store", storeId, filters ?? {}] as const,
  listByFood: (foodId: number, filters?: Pageable) =>
    [...reviewKeys.lists(), "food", foodId, filters ?? {}] as const,
  infiniteByStore: (storeId: number) =>
    [...reviewKeys.lists(), "infinite", "store", storeId] as const,
  infiniteByFood: (foodId: number) =>
    [...reviewKeys.lists(), "infinite", "food", foodId] as const,
  details: () => [...reviewKeys.all, "detail"] as const,
  detail: (id: number) => [...reviewKeys.details(), id] as const,
};

// 매장별 리뷰 목록 조회
export function useStoreReviews(storeId: number, pageable: Pageable = {}) {
  return useQuery({
    queryKey: reviewKeys.listByStore(storeId, pageable),
    queryFn: async () => {
      const response = await reviewApi.getStoreReviews(storeId, pageable);
      return response.result;
    },
    enabled: !!storeId,
  });
}

// 음식별 리뷰 목록 조회
export function useFoodReviews(foodId: number, pageable: Pageable = {}) {
  return useQuery({
    queryKey: reviewKeys.listByFood(foodId, pageable),
    queryFn: async () => {
      const response = await reviewApi.getFoodReviews(foodId, pageable);
      return response.result;
    },
    enabled: !!foodId,
  });
}

// 리뷰 상세 조회
export function useReview(reviewId: number) {
  return useQuery({
    queryKey: reviewKeys.detail(reviewId),
    queryFn: async () => {
      const response = await reviewApi.getReview(reviewId);
      return response.result;
    },
  });
}

// 매장별 리뷰 무한 스크롤
export function useInfiniteStoreReviews(storeId: number, size: number = 10) {
  return useInfiniteQuery({
    queryKey: reviewKeys.infiniteByStore(storeId),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await reviewApi.getStoreReviews(storeId, {
        page: pageParam,
        size,
        sort: ["createdAt,desc"],
      });
      return response.result;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 0,
    enabled: !!storeId,
  });
}

// 음식별 리뷰 무한 스크롤
export function useInfiniteFoodReviews(foodId: number, size: number = 10) {
  return useInfiniteQuery({
    queryKey: reviewKeys.infiniteByFood(foodId),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await reviewApi.getFoodReviews(foodId, {
        page: pageParam,
        size,
        sort: ["createdAt,desc"],
      });
      return response.result;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 0,
    enabled: !!foodId,
  });
}

// 최근 리뷰 가져오기 헬퍼 (홈 화면용)
export function useRecentReviews(storeId: number, limit: number = 5) {
  return useQuery({
    queryKey: [...reviewKeys.listByStore(storeId, { size: limit }), "recent"],
    queryFn: async () => {
      const response = await reviewApi.getStoreReviews(storeId, {
        page: 1,
        size: limit,
        sort: ["createdAt,desc"],
      });
      return response.result.content;
    },
    enabled: !!storeId,
  });
}
