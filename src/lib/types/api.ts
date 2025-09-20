// ============================================================================
// API 응답 및 요청 타입 정의
// ============================================================================


// API 공통 응답 형태
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 피드백 제출 API 요청
export interface SubmitFeedbackRequest {
  menuId: string;
  restaurantId: string;
  orderId: string;

  tasteProfileId: string; // DB에 저장된 프로필 ID 참조
  reorderIntention: number;
  recommendationScore: number;
  textFeedback: string;

  orderReceiptImage: string; // base64 or URL
  foodPhotos: string[]; // base64 or URLs
}

// 리워드 교환 API 요청
export interface RedeemRewardRequest {
  voucherId: string;
  customerId: string;
}

// 메뉴 등록/수정 API 요청
export interface CreateMenuRequest {
  restaurantId: string;
  name: string;
  price: number;
  description: string;
  images: string[]; // 업로드된 이미지 URLs
  isActive?: boolean;
}

export interface UpdateMenuRequest extends Partial<CreateMenuRequest> {
  menuId: string;
}

// 가게 등록/수정 API 요청
export interface CreateRestaurantRequest {
  name: string;
  address: string;
  description: string;
  images?: string[];
}

export interface UpdateRestaurantRequest extends Partial<CreateRestaurantRequest> {
  restaurantId: string;
}

// 입맛 프로필 API 요청
export interface SaveTasteProfileRequest {
  spiceTolerance: number;
  portionPreference: number;
  budgetRange: string;
  favoriteCategories?: string[];
}