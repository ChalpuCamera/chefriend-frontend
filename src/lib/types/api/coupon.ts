// Coupon API Types

export interface EarnStampsRequest {
  storeId: number;
  pin: string;
  stamps: number;
}

export interface EarnStampsResponse {
  success: boolean;
  addedStamps: number;
  currentStamps: number;
}
