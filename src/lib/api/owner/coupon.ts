import { apiClient } from '../client';
import type { ApiResponse } from '@/lib/types/api/common';
import type {
  EarnStampsRequest,
  EarnStampsResponse,
} from '@/lib/types/api/coupon';

export const couponApi = {
  // 스탬프 적립
  earnStamps: (data: EarnStampsRequest) =>
    apiClient.post<ApiResponse<EarnStampsResponse>>('/api/owner/coupon/earn-stamps', data),
};
