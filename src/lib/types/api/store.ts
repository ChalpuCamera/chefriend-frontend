// Store (매장) API Types

// Link Types
export type LinkType =
  | "BAEMIN"
  | "YOGIYO"
  | "COUPANGEATS"
  | "NAVER_MAP"
  | "KAKAO_MAP"
  | "INSTAGRAM"
  | "KAKAO_TALK"
  | "GOOGLE_MAPS"
  | "DDANGYO"
  | "DAANGN"
  | "CUSTOM";

export interface LinkItem {
  linkType: LinkType;
  url: string;
  customLabel?: string;  // CUSTOM 타입일 때 사용
  label?: string;        // 백엔드 응답에만 포함됨
  isVisible?: boolean;   // 링크 표시 여부
}

export interface StoreRequest {
  storeName: string;
  address?: string;
  description?: string;
  siteLink?: string;
  thumbnailUrl?: string;
  requiredStampsForCoupon?: number;
  displayTemplate?: number;
  autoCreateMenus?: boolean;
  links?: LinkItem[] | null;  // null이면 기존 링크 유지, 배열이면 전체 교체
}

export interface StoreResponse {
  storeId: number;
  storeName: string;
  address?: string;
  description?: string;
  siteLink?: string;
  feedbackCount?: number;
  menuCount?: number;
  thumbnailUrl?: string;
  requiredStampsForCoupon?: number;
  displayTemplate?: number;
  autoCreateMenus?: boolean;  // 사장님의 메뉴가 자동으로 자신의 가게에 등록되는 기능 on/off
  links: LinkItem[];
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
