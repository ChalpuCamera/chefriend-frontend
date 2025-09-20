import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardApi } from '@/lib/api/owner/reward';
import type { RewardRedemptionRequest } from '@/lib/types/api/reward';
import { toast } from 'sonner';

// Query Keys
export const rewardKeys = {
  all: ['rewards'] as const,
  lists: () => [...rewardKeys.all, 'list'] as const,
  allRewards: () => [...rewardKeys.lists(), 'all'] as const,
  myAvailable: () => [...rewardKeys.lists(), 'available'] as const,
  myRedemptions: () => [...rewardKeys.all, 'redemptions', 'me'] as const,
  myActive: () => [...rewardKeys.all, 'redemptions', 'active'] as const,
  eligibility: () => [...rewardKeys.all, 'eligibility'] as const,
};

// 전체 리워드 목록 조회
export function useRewards() {
  return useQuery({
    queryKey: rewardKeys.allRewards(),
    queryFn: async () => {
      const response = await rewardApi.getAllRewards();
      return response.result;
    },
  });
}

// 내가 받을 수 있는 리워드 조회
export function useMyAvailableRewards() {
  return useQuery({
    queryKey: rewardKeys.myAvailable(),
    queryFn: async () => {
      const response = await rewardApi.getMyAvailableRewards();
      return response.result;
    },
  });
}

// 리워드 자격 확인
export function useRewardEligibility() {
  return useQuery({
    queryKey: rewardKeys.eligibility(),
    queryFn: async () => {
      const response = await rewardApi.checkEligibility();
      return response.result;
    },
  });
}

// 내 리워드 교환 내역
export function useMyRedemptions() {
  return useQuery({
    queryKey: rewardKeys.myRedemptions(),
    queryFn: async () => {
      const response = await rewardApi.getMyRedemptions();
      return response.result;
    },
  });
}

// 사용 가능한 리워드
export function useMyActiveRedemptions() {
  return useQuery({
    queryKey: rewardKeys.myActive(),
    queryFn: async () => {
      const response = await rewardApi.getMyActiveRedemptions();
      return response.result;
    },
  });
}

// 리워드 교환
export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RewardRedemptionRequest) => {
      const response = await rewardApi.redeemReward(data);
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.myAvailable() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.myRedemptions() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.myActive() });
      toast.success('리워드가 교환되었습니다');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || '리워드 교환에 실패했습니다';
      toast.error(message);
    },
  });
}

// 리워드 사용 처리
export function useUseRedemption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (redemptionId: number) => {
      await rewardApi.useRedemption(redemptionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.myRedemptions() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.myActive() });
      toast.success('리워드가 사용 처리되었습니다');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || '리워드 사용 처리에 실패했습니다';
      toast.error(message);
    },
  });
}

// 리워드 사용 취소
export function useCancelRedemption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (redemptionId: number) => {
      await rewardApi.cancelRedemption(redemptionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.myRedemptions() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.myActive() });
      toast.success('리워드 사용이 취소되었습니다');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || '리워드 사용 취소에 실패했습니다';
      toast.error(message);
    },
  });
}