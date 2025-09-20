import { useQuery } from '@tanstack/react-query';
import { jarApi } from '@/lib/api/owner/jar';
import type { JARAnalysisResponse } from '@/lib/types/api/jar';

// Query Keys
export const jarKeys = {
  all: ['jar'] as const,
  analysis: (foodId: number, startDate?: string, endDate?: string) =>
    [...jarKeys.all, 'analysis', foodId, startDate, endDate] as const,
};

// JAR 분석 데이터 조회
export function useJARAnalysis(
  foodId: number,
  startDate?: string,
  endDate?: string,
  options?: { enabled?: boolean }
) {
  return useQuery<JARAnalysisResponse>({
    queryKey: jarKeys.analysis(foodId, startDate, endDate),
    queryFn: async () => {
      const response = await jarApi.getJARAnalysis(foodId, startDate, endDate);
      return response.result;
    },
    enabled: options?.enabled ?? !!foodId,
  });
}