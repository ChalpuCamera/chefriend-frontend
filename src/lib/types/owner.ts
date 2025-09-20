// ============================================================================
// 사장님 페이지 데이터 타입 정의
// ============================================================================

import type { User, Restaurant, Menu, Feedback } from './entities';

// 사장님 대시보드/홈 페이지 (마이페이지)
export interface OwnerDashboardData {
  owner: User;
  restaurants: Restaurant[]; // 등록된 가게 목록
  registeredMenus: Menu[]; // 등록된 메뉴 목록

  // 전체 통계 (피드백 수, 고객 수)
  totalStats: {
    totalFeedbacks: number;
    totalCustomers: number;
  };

  // 최근 피드백 (선택적)
  recentFeedbacks?: Array<{
    feedback: Feedback;
    menu: Menu;
    restaurant: Restaurant;
  }>;
}

// 음식 별 통계/분석 리포트 페이지
export interface MenuAnalyticsData {
  menu: Menu;
  restaurant: Restaurant;

  // 종합 통계 분석
  overallStats: {
    totalFeedbacks: number;
    averageStats: {
      reorderIntention: number;
      recommendationScore: number;
    };

    // 항목별 분포
    tasteDistribution: {
      spiciness: Record<1 | 2 | 3 | 4 | 5, number>;
      saltiness: Record<1 | 2 | 3 | 4 | 5, number>;
      sweetness: Record<1 | 2 | 3 | 4 | 5, number>;
      sourness: Record<1 | 2 | 3 | 4 | 5, number>;
      portion: Record<1 | 2 | 3 | 4 | 5, number>;
      price: Record<1 | 2 | 3 | 4 | 5, number>;
    };

    // 재주문 및 추천의향률
    npsData: {
      reorderRate: number; // %
      recommendationRate: number; // %
      detractors: number; // 0-6점 응답자 비율
      passives: number; // 7-8점 응답자 비율
      promoters: number; // 9-10점 응답자 비율
    };
  };

  // 고객 세그먼트 분석
  customerSegments: {
    byAge: Record<string, number>; // "20대": 45, "30대": 30
    byTasteProfile: {
      spiceTolerance: Record<1 | 2 | 3 | 4 | 5, number>;
      portionPreference: Record<1 | 2 | 3 | 4, number>;
      budgetRange: Record<string, number>;
    };
  };

  // 텍스트 형태 개선 제안
  improvements: Array<{
    category: "taste" | "portion" | "price" | "service";
    priority: "high" | "medium" | "low";
    suggestion: string;
    affectedPercentage: number; // 해당 의견을 제시한 고객 비율
  }>;

  // 개별 피드백 목록
  feedbacks: Array<{
    feedback: Feedback;
    customer: Pick<User, "id" | "createdAt">; // 개인정보 제외
  }>;
}

// 가게 등록/수정 폼 데이터
export interface RestaurantFormData {
  name: string;
  address: string;
  description: string;
}

// 가게(메뉴) 조회 페이지
export interface OwnerRestaurantsData {
  // 내 가게의 등록한 메뉴 목록
  restaurants: Restaurant[];
  menus: Array<Menu & {
    restaurantName: string;
    feedbackCount?: number;
  }>;
}

// 메뉴 등록/수정 폼 데이터
export interface MenuFormData {
  name: string;
  price: number;
  description: string;
  images: File[] | string[]; // 등록시 File[], 수정시 string[]
  isActive?: boolean;
}

// 메뉴 세부 페이지
export interface OwnerMenuDetailData {
  menu: Menu; // 메뉴 상세 정보(사진, 이름, 가격, 설명)
  restaurant: Restaurant;
  feedbackSummary: { // 메뉴의 피드백 요약
    totalCount: number;
    lastFeedbackAt?: Date;
    pendingCount?: number;
  };
}

// 사장님 메뉴 목록 페이지 (owner/restaurants/[id]/menu/page.tsx)
export interface OwnerMenuListData {
  restaurant: Restaurant;
  menus: Array<Menu & {
    feedbackCount: number;
    pendingFeedbackCount: number;
  }>;
}