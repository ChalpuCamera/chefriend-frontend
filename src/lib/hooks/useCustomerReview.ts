import { useQuery, useMutation } from '@tanstack/react-query';
import { customerApiClient } from '@/lib/api/customerClient';
import { toast } from 'sonner';
import type { ActiveQuestionResponse } from '@/lib/types/api/survey';
import type { FoodItemResponse } from '@/lib/types/api/food';
import type { FeedbackCreateRequest } from '@/lib/types/api/feedback';

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// 평가 항목 한글 매핑
export const questionLabels: { [key: string]: string } = {
  SPICINESS: "매운맛",
  SALTINESS: "짠맛",
  SWEETNESS: "단맛",
  SOURNESS: "신맛",
  CRISPINESS: "바삭함",
  CHEWINESS: "쫄깃함",
  TENDERNESS: "부드러움",
  PORTION_SIZE: "양",
  FRESHNESS: "재료 신선도",
  TEMPERATURE: "온도",
  OWNER_MESSAGE: "사장님께 한마디",
};

// Hook to get food item details
export const useGetFoodItem = (foodId: number) => {
  return useQuery<ApiResponse<FoodItemResponse>>({
    queryKey: ['customerFood', foodId],
    queryFn: async () => {
      return await customerApiClient.get(`/api/foods/${foodId}`);
    },
    enabled: !!foodId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// Hook to get active questions for a food item
export const useGetCustomerActiveQuestions = (foodItemId: number) => {
  return useQuery<ApiResponse<ActiveQuestionResponse[]>>({
    queryKey: ['customerActiveQuestions', foodItemId],
    queryFn: async () => {
      return await customerApiClient.get(`/api/fooditems/${foodItemId}/active-questions`);
    },
    enabled: !!foodItemId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// Hook to submit customer feedback
export const useSubmitCustomerFeedback = () => {
  return useMutation({
    mutationFn: async (data: FeedbackCreateRequest) => {
      return await customerApiClient.post('/api/customer-feedback', data);
    },
    onSuccess: () => {
      toast.success('리뷰가 성공적으로 등록되었습니다!');
    },
    onError: (error: Error) => {
      if (error.message.includes('활성화되지 않은 질문')) {
        toast.error('선택한 평가 항목이 유효하지 않습니다.');
      } else {
        toast.error('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
      }
    },
  });
};