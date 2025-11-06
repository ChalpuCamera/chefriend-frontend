import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useMyStores } from './useStore';
import { useFoodsByStore } from './useFood';
import { toast } from 'sonner';
import type {
  SurveyQuestionResponse,
  ActiveQuestionResponse,
} from '@/lib/types/api/survey';

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Hook to get all available survey questions
export const useGetSurveyQuestions = (surveyId: number = 2) => {
  return useQuery<ApiResponse<SurveyQuestionResponse[]>>({
    queryKey: ['surveyQuestions', surveyId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SurveyQuestionResponse[]>>(`/api/surveys/${surveyId}/questions`);
      return response;
    },
  });
};

// Hook to get active questions for a specific food item
export const useGetActiveQuestions = (foodItemId: number) => {
  return useQuery<ApiResponse<ActiveQuestionResponse[]>>({
    queryKey: ['activeQuestions', foodItemId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ActiveQuestionResponse[]>>(`/api/fooditems/${foodItemId}/active-questions`);
      return response;
    },
    enabled: !!foodItemId,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });
};

// Hook to set questions for a food item
export const useSetFoodQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ foodItemId, questionIds }: { foodItemId: number; questionIds: number[] }) => {
      const response = await apiClient.put<ApiResponse<unknown>>(`/api/fooditems/${foodItemId}/questions`, {
        questionIds,
      });
      return response;
    },
    onSuccess: () => {
      // 모든 관련 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['activeQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['foodsWithQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['foods'] }); // 메뉴 목록 캐시도 무효화
      toast.success('평가 항목이 설정되었습니다');
    },
    onError: () => {
      toast.error('평가 항목 설정에 실패했습니다');
    },
  });
};

// Hook to delete all questions for a food item (turn off review)
export const useDeleteFoodQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (foodItemId: number) => {
      const response = await apiClient.delete<ApiResponse<unknown>>(`/api/fooditems/${foodItemId}/question-off`);
      return response;
    },
    onSuccess: () => {
      // 모든 관련 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['activeQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['foodsWithQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['foods'] }); // 메뉴 목록 캐시도 무효화
      toast.success('리뷰 받기가 종료되었습니다');
    },
    onError: () => {
      toast.error('리뷰 받기 종료에 실패했습니다');
    },
  });
};

// Hook to get foods with active questions (review ON state)
export const useGetFoodsWithQuestions = () => {
  const { data: storesData } = useMyStores();
  const stores = storesData?.content || [];
  const currentStore = stores.length > 0
    ? stores.reduce((first, store) =>
        store.storeId < first.storeId ? store : first
      )
    : null;
  const storeId = currentStore?.storeId;

  // Use existing hook to get foods with hasActiveReview field from backend
  const { data: foodsData, isLoading, error } = useFoodsByStore(
    storeId!,
    { size: 100 },
    { enabled: !!storeId }
  );

  // Transform the data to match the expected format
  const transformedData = React.useMemo(() => {
    if (!foodsData?.content) {
      return null;
    }

    // Filter foods that have active reviews (backend provides hasActiveReview field)
    interface FoodItem {
      hasActiveReview?: boolean;
      foodItemId?: number;
      id?: number;
      storeId: number;
      foodName?: string;
      name?: string;
      price: number;
      thumbnailUrl?: string;
      photoUrl?: string;
      isActive: boolean;
      activeQuestionCount?: number;
      reviewCount?: number;
      createdAt: string;
      updatedAt: string;
    }

    const filteredFoods = (foodsData.content as FoodItem[])
      .filter((food) => food.hasActiveReview === true)
      .map((food) => ({
        id: food.foodItemId || food.id || 0,
        storeId: food.storeId,
        name: food.foodName || food.name || '',
        price: food.price,
        photoUrl: food.thumbnailUrl || food.photoUrl || '',
        isActive: food.isActive,
        activeQuestionCount: food.activeQuestionCount || 0,
        reviewCount: food.reviewCount || 0,
        createdAt: food.createdAt,
        updatedAt: food.updatedAt,
      }));

    return {
      code: 200,
      message: '성공',
      result: filteredFoods,
    };
  }, [foodsData]);

  return {
    data: transformedData,
    isLoading,
    error,
  };
};