// Review API Types (현재 mockReview 기반, 추후 백엔드 구현 예정)

export interface ReviewResponse {
  id: number;
  userName: string;
  avatar?: string;
  date: string;           // "2025. 09. 09" 형식
  menuName: string;
  servings: string;       // "1인분", "0.5인분" 등
  spiciness: string;      // "보통", "덜 맵게", "맵게" 등
  price: string;          // "2만원", "1.5만원" 등
  review: string;         // 리뷰 텍스트
  storeId?: number;       // 매장 ID
  foodId?: number;        // 음식 ID
  createdAt?: string;     // ISO 날짜 형식 (정렬용)
}

// 추후 백엔드 구현 시 확장 예정
export interface ReviewRequest {
  foodId: number;
  storeId: number;
  servings: string;
  spiciness: string;
  price: string;
  review: string;
}