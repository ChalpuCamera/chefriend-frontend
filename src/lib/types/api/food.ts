/**
 * Food (음식/메뉴) API Types
 * API Spec: api-common.json & api-docs.json - FoodItem endpoints
 */

export interface FoodItemRequest {
  foodName: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  isActive?: boolean;
}

export interface FoodItemResponse {
  id: number;  // foodItemId → id로 변경 (서버 응답 필드)
  foodItemId?: number; // 하위 호환성
  storeId: number;
  name: string;  // foodName → name으로 변경 (서버 응답 필드)
  foodName?: string; // 하위 호환성
  description?: string;
  hasActiveReview: boolean;
  activeQuestionCount: number;
  price: number;
  isActive: boolean;
  photoUrl?: string;  // thumbnailUrl → photoUrl로 변경 (서버 응답 필드)
  thumbnailUrl?: string; // 하위 호환성
  categoryName?: string;  // 카테고리명
  feedbackCount?: number;  // 피드백 개수
  createdAt: string;
  updatedAt: string;
}

// 메뉴 추출 시작 응답
export interface FoodItemExtractionStartResponse {
  requestId: string;
  message: string;
}

// 메뉴 추출 상태 응답
export interface FoodItemExtractionStatusResponse {
  requestId: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  progressPercentage: number; // 0-100
  currentStep: string;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}