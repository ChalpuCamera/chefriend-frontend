import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { photoApi } from '@/lib/api/owner/photo';
import { toast } from 'sonner';

// Query Keys
export const photoKeys = {
  all: ['photos'] as const,
  lists: () => [...photoKeys.all, 'list'] as const,
  listByFood: (foodId: number) => [...photoKeys.lists(), 'food', foodId] as const,
  detail: (id: number) => [...photoKeys.all, id] as const,
};

// 음식별 사진 목록 조회
export function usePhotosByFoodItem(foodId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: photoKeys.listByFood(foodId),
    queryFn: async () => {
      const response = await photoApi.getPhotosByFoodItem(foodId);
      // 최대 3개까지만 반환
      return response.result?.content?.slice(0, 3) || [];
    },
    enabled: options?.enabled ?? !!foodId,
  });
}

// 사진 삭제
export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: number) => {
      await photoApi.deletePhoto(photoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
      toast.success('사진이 삭제되었습니다');
    },
    onError: () => {
      toast.error('사진 삭제에 실패했습니다');
    },
  });
}