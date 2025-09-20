// Store (매장) API Types

export interface StoreRequest {
  storeName: string;
  address?: string;
  description?: string;
  baeminLink?: string;
  yogiyoLink?: string;
  coupangeatsLink?: string;
}

export interface StoreResponse {
  storeId: number;
  storeName: string;
  address?: string;
  description?: string;
  baeminLink?: string;
  yogiyoLink?: string;
  coupangEatsLink?: string;
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