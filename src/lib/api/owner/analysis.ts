import { apiClient } from '../client';
import type { ApiResponse } from '@/lib/types/api/common';

// 임시 타입 정의 (실제 타입은 나중에 정의 필요)
interface JarAnalysisRequest {
  // TODO: 실제 요청 구조 정의 필요
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface JarAnalysisResponse {
  // TODO: 실제 응답 구조 정의 필요
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface QuestionAnalysisRequest {
  // TODO: 실제 요청 구조 정의 필요
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface QuestionAnalysisResponse {
  // TODO: 실제 응답 구조 정의 필요
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const analysisApi = {
  // JAR 분석 요청 (음식별) - POST 요청 (분석 시작)
  requestJarAnalysis: (foodItemId: number, data: JarAnalysisRequest) =>
    apiClient.post<ApiResponse<JarAnalysisResponse>>(
      `/api/jar/foods/${foodItemId}/analysis`,
      data
    ),

  // JAR 분석 결과 조회 (음식별) - GET 요청 (결과 조회)
  getJarAnalysis: (foodItemId: number, startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiClient.get<ApiResponse<JarAnalysisResponse>>(
      `/api/jar/foods/${foodItemId}/analysis`,
      { params }
    );
  },

  // 특정 질문 분석 요청 (새로운 경로)
  requestQuestionAnalysis: (
    questionId: number,
    data: QuestionAnalysisRequest
  ) =>
    apiClient.post<ApiResponse<QuestionAnalysisResponse>>(
      `/api/jar/questions/${questionId}/analysis`,
      data
    ),

  // 특정 질문 분석 결과 조회 (새로운 경로)
  getQuestionAnalysis: (questionId: number) =>
    apiClient.get<ApiResponse<QuestionAnalysisResponse>>(
      `/api/jar/questions/${questionId}/analysis`
    ),

  // 모든 질문 분석 결과 조회 (음식별)
  getAllQuestionAnalyses: (foodItemId: number) =>
    apiClient.get<ApiResponse<QuestionAnalysisResponse[]>>(
      `/api/analysis/question/food/${foodItemId}`
    ),

  // JAR 분석 상태 확인 (폴링용)
  getJarAnalysisStatus: (foodItemId: number) =>
    apiClient.get<ApiResponse<{ status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' }>>(
      `/api/analysis/jar/food/${foodItemId}/status`
    ),

  // 질문 분석 상태 확인 (폴링용)
  getQuestionAnalysisStatus: (foodItemId: number, questionId: number) =>
    apiClient.get<ApiResponse<{ status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' }>>(
      `/api/analysis/question/food/${foodItemId}/question/${questionId}/status`
    ),
};