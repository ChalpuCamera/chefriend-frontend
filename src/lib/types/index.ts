// ============================================================================
// 모든 타입을 중앙에서 재export
// ============================================================================

// 기본 엔티티
export type {
  User,
  Restaurant,
  Menu,
  Feedback,
  RewardTransaction,
  BudgetRange,
  UserTasteProfile,
} from "./entities";

// 인증 관련
export type {
  KakaoAuthResponse,
  TokenPayload,
  LoginPageData,
  OnboardingData,
  UserTypeSelectionData,
} from "./auth";

// 사장님 페이지
export type {
  OwnerDashboardData,
  MenuAnalyticsData,
  RestaurantFormData,
  OwnerRestaurantsData,
  MenuFormData,
  OwnerMenuDetailData,
  OwnerMenuListData,
} from "./owner";

// API 타입
export type {
  ApiResponse,
  PaginatedResponse,
  SubmitFeedbackRequest,
  RedeemRewardRequest,
  CreateMenuRequest,
  UpdateMenuRequest,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
} from "./api";

// 폼 상태 관리
export type {
  FormState,
  SurveyState,
  ValidationError as FormValidationError,
} from "./form";

// 공통 유틸리티
export type {
  ErrorState,
  ValidationError,
  LoadingState,
  FileUploadResponse,
} from "./common";
