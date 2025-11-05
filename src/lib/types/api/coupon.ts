/**
 * Coupon API Types
 * API Spec: api-common.json & api-docs.json - Coupon endpoints
 */

// ============ Request Types - Customer ============
export interface CouponGeneratePinRequest {
  storeId: number;
  phone: string;  // 전화번호 (010-1234-5678 or 01012345678)
}

export interface CouponRedeemRequest {
  storeId: number;
  phone: string;
}

// ============ Request Types - Owner ============
export interface CouponEarnStampsByOwnerRequest {
  storeId: number;
  pin: string;  // 2자리 PIN
  stamps: number;
}

// Legacy alias for backward compatibility
export type EarnStampsRequest = CouponEarnStampsByOwnerRequest;

// ============ Response Types - Customer ============
export interface CouponGeneratePinResponse {
  pin: string;  // 2자리
  expiredAt: string;  // date-time
}

export interface CouponRedeemResponse {
  success: boolean;
  currentStamps: number;
}

export interface CouponMembershipResponse {
  currentStamps: number;
  requiredStamps: number;
  canRedeem: boolean;
}

export interface PinStatusResponse {
  isUsed: boolean;
  isExpired: boolean;
  expiredAt: string;  // date-time
  stamps: number;
}

// ============ Response Types - Owner ============
export interface CouponEarnStampsByOwnerResponse {
  success: boolean;
  currentStamps: number;
  addedStamps: number;
}

// Legacy alias for backward compatibility
export type EarnStampsResponse = CouponEarnStampsByOwnerResponse;
