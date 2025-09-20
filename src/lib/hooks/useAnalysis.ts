import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisApi } from '@/lib/api/owner/analysis';
import { toast } from 'sonner';

// 임시 타입 정의 (analysis API에서 사용하는 것과 동일)
interface JarAnalysisRequest {
  // TODO: 실제 요청 구조 정의 필요
  [key: string]: unknown;
}

interface QuestionAnalysisRequest {
  // TODO: 실제 요청 구조 정의 필요
  [key: string]: unknown;
}

// Query Keys
export const analysisKeys = {
  all: ['analysis'] as const,
  jar: () => [...analysisKeys.all, 'jar'] as const,
  jarByFood: (foodId: number) => [...analysisKeys.jar(), foodId] as const,
  jarStatus: (foodId: number) => [...analysisKeys.jar(), foodId, 'status'] as const,
  question: () => [...analysisKeys.all, 'question'] as const,
  questionByFood: (foodId: number) => [...analysisKeys.question(), foodId] as const,
  questionDetail: (foodId: number, questionId: number) =>
    [...analysisKeys.questionByFood(foodId), questionId] as const,
  questionStatus: (foodId: number, questionId: number) =>
    [...analysisKeys.questionDetail(foodId, questionId), 'status'] as const,
};

// JAR 분석 결과 조회 (폴링 지원)
export function useJarAnalysis(foodItemId: number, options?: {
  enabled?: boolean;
  refetchInterval?: number | false | ((data: unknown) => number | false);
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: analysisKeys.jarByFood(foodItemId),
    queryFn: async () => {
      const response = await analysisApi.getJarAnalysis(
        foodItemId,
        options?.startDate,
        options?.endDate
      );
      return response.result;
    },
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? false,
  });
}

// JAR 분석 상태 확인 (폴링용)
export function useJarAnalysisStatus(foodItemId: number, options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: analysisKeys.jarStatus(foodItemId),
    queryFn: async () => {
      const response = await analysisApi.getJarAnalysisStatus(foodItemId);
      return response.result;
    },
    enabled: options?.enabled ?? false,
    refetchInterval: options?.refetchInterval ?? 3000, // 3초마다 확인
  });
}

// JAR 분석 요청
export function useRequestJarAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      foodItemId,
      data
    }: {
      foodItemId: number;
      data: JarAnalysisRequest
    }) => {
      const response = await analysisApi.requestJarAnalysis(foodItemId, data);
      return response.result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: analysisKeys.jarByFood(variables.foodItemId)
      });
      toast.success('JAR 분석이 시작되었습니다');
    },
  });
}

// 특정 질문 분석 결과 조회 (경로 변경으로 foodItemId 제거)
export function useQuestionAnalysis(
  questionId: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...analysisKeys.question(), questionId],
    queryFn: async () => {
      const response = await analysisApi.getQuestionAnalysis(questionId);
      return response.result;
    },
    enabled: options?.enabled ?? true,
  });
}

// 모든 질문 분석 결과 조회
export function useAllQuestionAnalyses(foodItemId: number) {
  return useQuery({
    queryKey: analysisKeys.questionByFood(foodItemId),
    queryFn: async () => {
      const response = await analysisApi.getAllQuestionAnalyses(foodItemId);
      return response.result;
    },
  });
}

// 질문 분석 요청 (경로 변경으로 foodItemId 제거)
export function useRequestQuestionAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      data
    }: {
      questionId: number;
      data: QuestionAnalysisRequest
    }) => {
      const response = await analysisApi.requestQuestionAnalysis(
        questionId,
        data
      );
      return response.result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...analysisKeys.question(), variables.questionId]
      });
      toast.success('질문 분석이 시작되었습니다');
    },
  });
}

// JAR 분석 자동 폴링 hook (분석 진행 중일 때만)
export function useJarAnalysisWithPolling(foodItemId: number) {
  const { data: analysis, ...queryResult } = useJarAnalysis(foodItemId, {
    refetchInterval: (data) => {
      // PROCESSING 상태일 때만 3초마다 폴링
      // @ts-expect-error - status property may not exist in current implementation
      if (data?.status === 'PROCESSING') {
        return 3000;
      }
      return false;
    },
  });

  return {
    analysis,
    isProcessing: false, // TODO: implement when status is available
    isCompleted: true, // TODO: implement when status is available
    isFailed: false, // TODO: implement when status is available
    ...queryResult,
  };
}

// 질문 분석 자동 폴링 hook
export function useQuestionAnalysisWithPolling(
  foodItemId: number,
  questionId: number
) {
  const { data: analysis, ...queryResult } = useQuestionAnalysis(
    questionId,
    {
      enabled: true,
    }
  );

  const { data: statusData } = useQuery({
    queryKey: analysisKeys.questionStatus(foodItemId, questionId),
    queryFn: async () => {
      const response = await analysisApi.getQuestionAnalysisStatus(foodItemId, questionId);
      return response.result;
    },
    enabled: analysis?.status === 'PROCESSING',
    refetchInterval: 3000,
  });

  const currentStatus = statusData?.status || analysis?.status;

  return {
    ...queryResult,
    analysis,
    status: currentStatus,
    isProcessing: currentStatus === 'PROCESSING',
    isCompleted: currentStatus === 'COMPLETED',
    isFailed: currentStatus === 'FAILED',
  };
}