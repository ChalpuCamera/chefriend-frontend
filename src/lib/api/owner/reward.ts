import { apiClient } from '../client';
import type { ApiResponse } from '@/lib/types/api/common';
import type {
  RewardResponse,
  RewardRedemptionRequest,
  RewardRedemptionResponse,
} from '@/lib/types/api/reward';

export const rewardApi = {
  // 전체 리워드 목록 조회
  getAllRewards: () =>
    apiClient.get<ApiResponse<RewardResponse[]>>('/api/rewards'),

  // 내가 받을 수 있는 리워드 조회
  getMyAvailableRewards: () =>
    apiClient.get<ApiResponse<RewardResponse[]>>('/api/rewards/me'),

  // 리워드 자격 확인
  checkEligibility: () =>
    apiClient.get<ApiResponse<boolean>>('/api/rewards/eligible'),

  // 리워드 교환
  redeemReward: (data: RewardRedemptionRequest) =>
    apiClient.post<ApiResponse<RewardRedemptionResponse>>('/api/rewards/redeem', data),

  // 내 리워드 교환 내역 조회
  getMyRedemptions: () =>
    apiClient.get<ApiResponse<RewardRedemptionResponse[]>>('/api/rewards/redemptions/me'),

  // 사용 가능한 리워드 조회
  getMyActiveRedemptions: () =>
    apiClient.get<ApiResponse<RewardRedemptionResponse[]>>('/api/rewards/redemptions/me/active'),

  // 리워드 사용 처리
  useRedemption: (redemptionId: number) =>
    apiClient.put<ApiResponse<void>>(`/api/rewards/redemptions/${redemptionId}/use`),

  // 리워드 사용 취소
  cancelRedemption: (redemptionId: number) =>
    apiClient.put<ApiResponse<void>>(`/api/rewards/redemptions/${redemptionId}/cancel`),
};