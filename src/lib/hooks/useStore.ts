import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/lib/api/owner/store';
import type { StoreRequest } from '@/lib/types/api/store';
import type { Pageable } from '@/lib/types/api/common';
import { toast } from 'sonner';

// Query Keys
export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (filters: Pageable) => [...storeKeys.lists(), filters] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: number) => [...storeKeys.details(), id] as const,
  members: (storeId: number) => [...storeKeys.all, 'members', storeId] as const,
};

// 내 매장 목록 조회
export function useMyStores(pageable: Pageable = {}) {
  return useQuery({
    queryKey: storeKeys.list(pageable),
    queryFn: async () => {
      const response = await storeApi.getMyStores(pageable);
      return response.result;
    },
  });
}

// 매장 상세 조회
export function useStore(storeId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: storeKeys.detail(storeId),
    queryFn: async () => {
      const response = await storeApi.getStore(storeId);
      return response.result;
    },
    enabled: options?.enabled ?? true,
  });
}

// 매장 멤버 목록 조회
export function useStoreMembers(storeId: number) {
  return useQuery({
    queryKey: storeKeys.members(storeId),
    queryFn: async () => {
      const response = await storeApi.getStoreMembers(storeId);
      return response.result;
    },
  });
}

// 매장 생성
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StoreRequest) => {
      const response = await storeApi.createStore(data);
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      toast.success('매장이 생성되었습니다');
    },
  });
}

// 매장 수정
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, data }: { storeId: number; data: StoreRequest }) => {
      const response = await storeApi.updateStore(storeId, data);
      return response.result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      toast.success('매장 정보가 수정되었습니다');
    },
  });
}

// 매장 삭제
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storeId: number) => {
      await storeApi.deleteStore(storeId);
    },
    onSuccess: (_, storeId) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      queryClient.removeQueries({ queryKey: storeKeys.detail(storeId) });
      toast.success('매장이 삭제되었습니다');
    },
  });
}

// 사이트 링크 중복 체크
export function useCheckSiteLink() {
  return useMutation({
    mutationFn: async (siteLink: string) => {
      try {
        const response = await storeApi.checkSiteLink(siteLink);
        // 매장이 존재하면 중복
        return { isAvailable: false, storeId: response.result.storeId };
      } catch (error: unknown) {
        // 404 에러면 사용 가능 (ApiError 객체의 status 확인)
        if ((error as { status?: number }).status === 404 || (error as { response?: { status?: number } }).response?.status === 404) {
          return { isAvailable: true, storeId: null };
        }
        throw error;
      }
    },
  });
}