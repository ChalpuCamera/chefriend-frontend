// Store (매장) API Types

export interface StoreRequest {
  storeName: string;
  address?: string;
  description?: string;
  baeminLink?: string;
  yogiyoLink?: string;
  coupangeatsLink?: string;
  naverLink?: string;
  kakaoLink?: string;
  instagramLink?: string;
  kakaoTalkLink?: string;
  siteLink?: string;
}

export interface StoreResponse {
  storeId: number;
  storeName: string;
  address?: string;
  description?: string;
  baeminLink?: string;
  yogiyoLink?: string;
  coupangEatsLink?: string;
  naverLink?: string;
  kakaoLink?: string;
  instagramLink?: string;
  kakaoTalkLink?: string;
  siteLink?: string;
  feedbackCount?: number;
  menuCount?: number;
  thumbnailUrl?: string;
}

export interface StoreIdResponse {
  storeId: number;
}

export interface MemberResponse {
  userId: number;
  userName: string;
  userEmail: string;
  storeId: number;
  roleType: 'OWNER' | 'CO_OWNER' | 'MANAGER' | 'STAFF';
  joinedAt: string;
}

export interface MemberInviteRequest {
  userId: number;
  roleType: 'OWNER' | 'CO_OWNER' | 'MANAGER' | 'STAFF';
  ownershipPercentage?: number;
}