// Reward API Types

export interface RewardResponse {
  id: number;
  rewardName: string;
  rewardType: string;
  rewardValue: number;
  requiredCount: number;
  description?: string;
  isActive: boolean;
}

export interface RewardRedemptionRequest {
  rewardId: number;
}

export interface RewardRedemptionResponse {
  id: number;
  rewardName: string;
  rewardCount: number;
  status: 'ISSUED' | 'USED' | 'CANCELLED';
  redeemedAt: string;
  usedAt?: string;
  expiresAt?: string;
  discountRate?: number;
}

export interface RewardEligibilityResponse {
  isEligible: boolean;
  feedbackCount: number;
  nextRewardAt?: number;
}