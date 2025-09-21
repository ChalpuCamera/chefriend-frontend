import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { foodApi } from "@/lib/api/owner/food";
import type { FoodItemRequest, FoodItemResponse } from "@/lib/types/api/food";
import type { Pageable } from "@/lib/types/api/common";
import { toast } from "sonner";

// Query Keys
export const foodKeys = {
  all: ["foods"] as const,
  lists: () => [...foodKeys.all, "list"] as const,
  listByStore: (storeId: number, filters?: Pageable) =>
    [...foodKeys.lists(), "store", storeId, filters ?? {}] as const,
  details: () => [...foodKeys.all, "detail"] as const,
  detail: (id: number) => [...foodKeys.details(), id] as const,
};

// 매장별 음식 목록 조회
export function useFoodsByStore(
  storeId: number,
  pageable: Pageable = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: foodKeys.listByStore(storeId, pageable),
    queryFn: async () => {
      const response = await foodApi.getFoodsByStore(storeId, pageable);
      return response.result;
    },
    enabled: options?.enabled ?? !!storeId,
  });
}

// 음식 상세 조회
export function useFood(foodId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: foodKeys.detail(foodId),
    queryFn: async () => {
      const response = await foodApi.getFood(foodId);
      return response.result;
    },
    enabled: options?.enabled ?? true,
  });
}

// 음식 생성
export function useCreateFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeId,
      data,
    }: {
      storeId: number;
      data: FoodItemRequest;
    }) => {
      const response = await foodApi.createFood(storeId, data);
      return response.result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: foodKeys.listByStore(variables.storeId),
      });
      toast.success("메뉴가 추가되었습니다");
    },
  });
}

// 음식 수정
export function useUpdateFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      foodId,
      data,
    }: {
      foodId: number;
      data: FoodItemRequest;
    }) => {
      const response = await foodApi.updateFood(foodId, data);
      return response.result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: foodKeys.detail(variables.foodId),
      });
      queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
      toast.success("메뉴가 수정되었습니다");
    },
  });
}

// 음식 삭제
export function useDeleteFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (foodId: number) => {
      await foodApi.deleteFood(foodId);
    },
    onSuccess: (_, foodId) => {
      queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
      queryClient.removeQueries({ queryKey: foodKeys.detail(foodId) });
      toast.success("메뉴가 삭제되었습니다");
    },
    onError: () => {
      toast.error("메뉴 삭제에 실패했습니다");
    },
  });
}

// 음식 대표 사진 설정
export function useUpdateThumbnail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      foodId,
      photoUrl,
    }: {
      foodId: number;
      photoUrl: string;
    }) => {
      const response = await foodApi.updateThumbnail(foodId, photoUrl);
      return response.result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: foodKeys.detail(variables.foodId),
      });
      queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
      toast.success("대표 사진이 변경되었습니다");
    },
    onError: () => {
      toast.error("대표 사진 변경에 실패했습니다");
    },
  });
}

// 낙관적 업데이트를 위한 음식 수정 (advanced)
export function useOptimisticUpdateFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      foodId,
      data,
    }: {
      foodId: number;
      data: FoodItemRequest;
    }) => {
      const response = await foodApi.updateFood(foodId, data);
      return response.result;
    },
    onMutate: async ({ foodId, data }) => {
      // 진행 중인 리페치 취소
      await queryClient.cancelQueries({ queryKey: foodKeys.detail(foodId) });

      // 이전 값 스냅샷
      const previousFood = queryClient.getQueryData(foodKeys.detail(foodId));

      // 낙관적 업데이트
      queryClient.setQueryData(
        foodKeys.detail(foodId),
        (old: FoodItemResponse | undefined) => {
          if (!old) return old;
          return { ...old, ...data };
        }
      );

      return { previousFood };
    },
    onError: (err, variables, context) => {
      // 에러 시 이전 값으로 롤백
      if (context?.previousFood) {
        queryClient.setQueryData(
          foodKeys.detail(variables.foodId),
          context.previousFood
        );
      }
    },
    onSettled: (data, error, variables) => {
      // 성공/실패 여부와 관계없이 리페치
      queryClient.invalidateQueries({
        queryKey: foodKeys.detail(variables.foodId),
      });
      queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
    },
    onSuccess: () => {
      toast.success("메뉴가 수정되었습니다");
    },
  });
}
