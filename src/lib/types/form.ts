// ============================================================================
// 폼 검증 및 상태 관리 타입 정의
// ============================================================================

import type { Menu, Restaurant } from "./entities";

// 폼 상태 관리
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// 피드백 설문 진행 상태
export interface SurveyState {
  currentStep: number;
  totalSteps: number;

  // 선택된 메뉴/가게 정보
  selectedMenu?: Menu;
  selectedRestaurant?: Restaurant;

  // 진행 상태
  isComplete: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
}

// 검증 에러
export interface ValidationError {
  field: string;
  message: string;
}
