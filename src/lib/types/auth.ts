// ============================================================================
// 인증 관련 타입 정의
// ============================================================================

export interface KakaoAuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  kakaoAccount?: {
    profile?: {
      nickname?: string;
      profileImageUrl?: string;
    };
    phone?: string;
  };
}

export interface TokenPayload {
  userId: string;
  exp: number;
  iat: number;
}

// 로그인 페이지 데이터
export interface LoginPageData {
  // 카카오 로그인 설정
  kakaoAppKey: string;
  redirectUri: string;
}

// 온보딩/튜토리얼 페이지 데이터
export interface OnboardingData {
  steps: Array<{
    id: number;
    title: string;
    description: string;
    image?: string;
    userType: "owner";
  }>;
}

// 사용자 분기 페이지 데이터
export interface UserTypeSelectionData {
  // 단순 선택 페이지, 특별한 데이터 없음
  appVersion?: string;
  maintenanceMode?: boolean;
}
