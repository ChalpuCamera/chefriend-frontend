/**
 * Authentication & User API Types
 * API Spec: api-common.json & api-docs.json - Auth and User endpoints
 */

// ============ Enums ============
export type UserType = "customer" | "owner";
export type DeviceType = "ANDROID" | "IOS";
export type UserRole = "ROLE_CUSTOMER" | "ROLE_OWNER" | "ROLE_ADMIN";

// ============ Request Types ============
export interface CodeExchangeRequest {
  code: string;
}

export interface GoogleLoginRequest {
  accessToken: string;  // Google Sign-In SDK로부터 발급받은 ID Token
  userType: UserType;
  fcmToken?: string;
  deviceType?: DeviceType;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  isAllowed?: boolean;  // 푸시 알림 허용 여부
}

// ============ Response Types ============
export interface TokenExchangeResponse {
  accessToken: string;
  role: string;
}

export interface AccessTokenDTO {
  accessToken: string;
}

export interface TokenDTO {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  tokens: TokenDTO;
  userId: number;
}

export interface UserDto {
  id: number;
  email: string;
  name: string;
  profileImageUrl?: string;
  provider: string;
  role: string;
}
