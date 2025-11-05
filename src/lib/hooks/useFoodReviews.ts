import { useInfiniteQuery } from "@tanstack/react-query";
import { feedbackApi } from "@/lib/api/owner/feedback";
import type { ReviewDisplayData } from "@/lib/types/api/feedback";

// Query Keys
export const reviewKeys = {
  all: ["reviews"] as const,
  byFood: (foodId: number) => [...reviewKeys.all, "food", foodId] as const,
};

// 음식별 리뷰 무한 스크롤
export function useFoodReviews(
  foodId: number,
  options?: { enabled?: boolean }
) {
  console.log(`🎯 useFoodReviews called with foodId: ${foodId}, enabled: ${options?.enabled ?? !!foodId}`);

  return useInfiniteQuery({
    queryKey: reviewKeys.byFood(foodId),
    queryFn: async ({ pageParam = 0 }) => {
      console.log(`🚀 Fetching reviews for foodId: ${foodId}, page: ${pageParam}`);
      const reviews = await feedbackApi.getFoodReviews(foodId, {
        page: pageParam,
        size: 20,
      });

      console.log(`📦 Received ${reviews.length} reviews`);

      return {
        reviews,
        page: pageParam,
        hasNextPage: reviews.length === 20, // 20개 미만이면 더 이상 데이터 없음
      };
    },
    getNextPageParam: (lastPage) => {
      // 마지막 페이지에 20개 미만의 리뷰가 있으면 더 이상 없음
      if (!lastPage.hasNextPage) return undefined;
      return lastPage.page + 1;
    },
    initialPageParam: 0,
    enabled: options?.enabled ?? !!foodId,
  });
}

// 페이지 응답 타입
interface PagedReviewData {
  pages: Array<{
    reviews: ReviewDisplayData[];
    page: number;
    totalPages?: number;
    hasNextPage?: boolean;
  }>;
}

// 모든 리뷰 평탄화하여 배열로 반환하는 헬퍼
export function getFlattenedReviews(
  data: PagedReviewData | undefined
): ReviewDisplayData[] {
  if (!data?.pages) return [];
  return data.pages.flatMap((page) => page.reviews);
}
