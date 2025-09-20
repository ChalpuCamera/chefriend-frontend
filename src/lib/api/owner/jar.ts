import { apiClient } from '../client';
import type { ApiResponse } from '@/lib/types/api/common';
import type { JARAnalysisResponse } from '@/lib/types/api/jar';

export const jarApi = {
  // JAR 분석 데이터 조회
  getJARAnalysis: (foodId: number, startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiClient.get<ApiResponse<JARAnalysisResponse>>(
      `/api/jar/foods/${foodId}/analysis`,
      { params }
    );
  },
};