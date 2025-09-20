// ============================================================================
// 기본 엔티티 타입 정의
// ============================================================================

export interface User {
  id: string;
  phone: string;
  name?: string;
  profileImage?: string;
  email?: string;
  kakaoId?: string;
  isOnboarded?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  description?: string;
  ownerId: string;
  images?: string[];
  businessNumber?: string;
  phoneNumber?: string;
  operatingHours?: {
    [key: string]: { open: string; close: string };
  };
  categories?: string[];
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Menu {
  id: number;
  storeId: number;
  name: string;
  price: number;
  description?: string;
  reviewCount: number;
  imageUrl?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Feedback {
  id: number;
  customerId: string;
  restaurantId: string;
  menuId: number;
  orderId: string;

  // 사전 정보
  tasteProfileId: string; // DB에 저장된 프로필 참조

  // 사후 평가
  reorderIntention: number; // 0-10 (NPS)
  recommendationScore: number; // 0-10 (NPS)

  // 텍스트 피드백
  textFeedback: string; // 30자 이상

  // 검증 정보
  orderReceiptImage: string;
  foodPhotos: string[];

  // 상태
  status: "pending" | "approved" | "rejected";
  verifiedAt?: Date;
  createdAt: Date;
}

export interface RewardTransaction {
  id: string;
  customerId: string;
  type: "earn" | "redeem";
  amount: number; // 적립/사용 횟수
  reason: string; // '피드백 작성' | '상품권 교환'
  relatedFeedbackId?: string;
  createdAt: Date;
}

// ============================================================================
// 관련 타입 (entities에서 사용되는 타입들)
// ============================================================================

export type BudgetRange =
  | "8000미만"
  | "8000-12999"
  | "13000-19999"
  | "20000이상";

export interface UserTasteProfile {
  id?: string;
  userId: string;
  spiceTolerance: number; // 1-5 (순한맛 ~ 매운맛)
  portionPreference: number; // 1-4 (소식 ~ 대식)
  budgetRange: BudgetRange;
  favoriteCategories?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
