// Food (음식/메뉴) API Types

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
  price: number;
  isActive: boolean;
  photoUrl?: string;  // thumbnailUrl → photoUrl로 변경 (서버 응답 필드)
  thumbnailUrl?: string; // 하위 호환성
  createdAt: string;
  updatedAt: string;
}