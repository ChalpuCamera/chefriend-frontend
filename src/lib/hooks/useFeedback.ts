import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { feedbackApi } from "@/lib/api/owner/feedback";
import type {
  FeedbackCreateRequest,
  ReviewDisplayData,
} from "@/lib/types/api/feedback";
import type { Pageable } from "@/lib/types/api/common";
import { toast } from "sonner";

// Query Keys
export const feedbackKeys = {
  all: ["feedbacks"] as const,
  lists: () => [...feedbackKeys.all, "list"] as const,
  listByStore: (storeId: number, filters?: Pageable) =>
    [...feedbackKeys.lists(), "store", storeId, filters ?? {}] as const,
  listByFood: (foodId: number, filters?: Pageable) =>
    [...feedbackKeys.lists(), "food", foodId, filters ?? {}] as const,
  infiniteByStore: (storeId: number) =>
    [...feedbackKeys.lists(), "infinite", "store", storeId] as const,
  infiniteByFood: (foodId: number) =>
    [...feedbackKeys.lists(), "infinite", "food", foodId] as const,
  myList: (filters?: Pageable) =>
    [...feedbackKeys.lists(), "me", filters ?? {}] as const,
  infiniteMyList: () => [...feedbackKeys.lists(), "infinite", "me"] as const,
  details: () => [...feedbackKeys.all, "detail"] as const,
  detail: (id: number) => [...feedbackKeys.details(), id] as const,
  taste: () => ["taste"] as const,
  myTaste: () => [...feedbackKeys.taste(), "me"] as const,
  reviews: () => ["reviews"] as const,
  reviewsByStore: (storeId: number, filters?: Pageable) =>
    [...feedbackKeys.reviews(), "store", storeId, filters ?? {}] as const,
  reviewsByFood: (foodId: number, filters?: Pageable) =>
    [...feedbackKeys.reviews(), "food", foodId, filters ?? {}] as const,
};

// 매장별 피드백 목록 조회
export function useStoreFeedbacks(storeId: number, pageable: Pageable = {}) {
  return useQuery({
    queryKey: feedbackKeys.listByStore(storeId, pageable),
    queryFn: async () => {
      const response = await feedbackApi.getStoreFeedbacks(storeId, pageable);
      return response.result;
    },
    enabled: !!storeId,
  });
}

// 피드백 상세 조회
export function useFeedback(feedbackId: number) {
  return useQuery({
    queryKey: feedbackKeys.detail(feedbackId),
    queryFn: async () => {
      const response = await feedbackApi.getFeedback(feedbackId);
      return response.result;
    },
  });
}

// 내 피드백 목록 조회 (고객용)
export function useMyFeedbacks(pageable: Pageable = {}) {
  return useQuery({
    queryKey: feedbackKeys.myList(pageable),
    queryFn: async () => {
      const response = await feedbackApi.getMyFeedbacks(pageable);
      return response.result;
    },
  });
}

// 피드백 생성
export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FeedbackCreateRequest) => {
      const response = await feedbackApi.createFeedback(data);
      return response.result;
    },
    onSuccess: () => {
      // 모든 피드백 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.all,
      });
      toast.success("피드백이 제출되었습니다");
    },
  });
}

// 매장별 피드백 무한 스크롤
export function useInfiniteStoreFeedbacks(storeId: number, size: number = 20) {
  return useInfiniteQuery({
    queryKey: feedbackKeys.infiniteByStore(storeId),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await feedbackApi.getStoreFeedbacks(storeId, {
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

// 내 피드백 무한 스크롤 (고객용)
export function useInfiniteMyFeedbacks(size: number = 20) {
  return useInfiniteQuery({
    queryKey: feedbackKeys.infiniteMyList(),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await feedbackApi.getMyFeedbacks({
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
  });
}

// 음식별 피드백 목록 조회
export function useFoodFeedbacks(foodId: number, pageable: Pageable = {}) {
  return useQuery({
    queryKey: feedbackKeys.listByFood(foodId, pageable),
    queryFn: async () => {
      const response = await feedbackApi.getFoodFeedbacks(foodId, pageable);
      return response.result;
    },
    enabled: !!foodId,
  });
}

// 음식별 피드백 무한 스크롤
export function useInfiniteFoodFeedbacks(foodId: number, size: number = 20) {
  return useInfiniteQuery({
    queryKey: feedbackKeys.infiniteByFood(foodId),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await feedbackApi.getFoodFeedbacks(foodId, {
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

// 고객 취향 정보 조회
export function useCustomerTaste() {
  return useQuery({
    queryKey: feedbackKeys.myTaste(),
    queryFn: async () => {
      const response = await feedbackApi.getCustomerTaste();
      return response.result;
    },
  });
}

// 고객 취향 정보 수정
export function useUpdateCustomerTaste() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: feedbackApi.updateCustomerTaste,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.myTaste() });
      toast.success("취향 정보가 수정되었습니다");
    },
  });
}

// ============= UI용 통합 훅 (맛 프로필 포함) =============

// 매장별 리뷰 목록 조회 (맛 프로필 포함)
export function useStoreReviews(
  storeId: number,
  pageable: Pageable = {}
): {
  data: ReviewDisplayData[] | undefined;
  isLoading: boolean;
  error: unknown;
} {
  return useQuery({
    queryKey: feedbackKeys.reviewsByStore(storeId, pageable),
    queryFn: async () => {
      return feedbackApi.getStoreReviews(storeId, pageable);
    },
    enabled: !!storeId,
  });
}

// 음식별 리뷰 목록 조회 (맛 프로필 포함)
export function useFoodReviews(
  foodId: number,
  pageable: Pageable = {}
): {
  data: ReviewDisplayData[] | undefined;
  isLoading: boolean;
  error: unknown;
} {
  return useQuery({
    queryKey: feedbackKeys.reviewsByFood(foodId, pageable),
    queryFn: async () => {
      return feedbackApi.getFoodReviews(foodId, pageable);
    },
    enabled: !!foodId,
  });
}

// 최근 리뷰 가져오기 헬퍼 (홈 화면용 - 맛 프로필 포함)
export function useRecentReviews(
  storeId: number,
  limit: number = 5,
  options?: { enabled?: boolean }
): {
  data: ReviewDisplayData[] | undefined;
  isLoading: boolean;
  error: unknown;
} {
  return useQuery({
    queryKey: [
      ...feedbackKeys.reviewsByStore(storeId, { size: limit }),
      "recent",
    ],
    queryFn: async () => {
      return feedbackApi.getStoreReviews(storeId, {
        page: 1,
        size: limit,
        sort: ["createdAt,desc"],
      });
    },
    enabled: options?.enabled ?? !!storeId,
  });
}

// 매장별 리뷰 무한 스크롤 (UI용)
export function useInfiniteStoreReviews(storeId: number, size: number = 10) {
  return useInfiniteQuery({
    queryKey: [...feedbackKeys.reviews(), "infinite", "store", storeId],
    queryFn: async ({ pageParam = 0 }) => {
      const reviews = await feedbackApi.getStoreReviews(storeId, {
        page: pageParam,
        size,
        sort: ["createdAt,desc"],
      });
      return {
        content: reviews,
        page: pageParam,
        hasNext: reviews.length === size,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 0,
    enabled: !!storeId,
  });
}

// 음식별 리뷰 무한 스크롤 (UI용)
export function useInfiniteFoodReviews(foodId: number, size: number = 10) {
  return useInfiniteQuery({
    queryKey: [...feedbackKeys.reviews(), "infinite", "food", foodId],
    queryFn: async ({ pageParam = 0 }) => {
      const reviews = await feedbackApi.getFoodReviews(foodId, {
        page: pageParam,
        size,
        sort: ["createdAt,desc"],
      });
      return {
        content: reviews,
        page: pageParam,
        hasNext: reviews.length === size,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 0,
    enabled: !!foodId,
  });
}
