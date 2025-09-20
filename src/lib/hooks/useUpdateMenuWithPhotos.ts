import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foodApi } from '@/lib/api/owner/food';
import { usePhotoUpload } from './usePhotoUpload';
import { foodKeys } from './useFood';
import type { FoodItemRequest } from '@/lib/types/api/food';
import type { PhotoResponse } from '@/lib/types/api/photo';
import { toast } from 'sonner';

interface UpdateMenuWithPhotosData {
  foodId: number;
  menuData: {
    name: string;
    price: number;
    description?: string;
  };
  newImages?: File[];
  existingImageUrls?: string[];
}

export function useUpdateMenuWithPhotos() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { uploadPhotos } = usePhotoUpload();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      foodId,
      menuData,
      newImages = [],
      existingImageUrls = []
    }: UpdateMenuWithPhotosData) => {
      setIsUpdating(true);

      try {
        let thumbnailUrl: string | undefined;
        let uploadedPhotos: PhotoResponse[] = [];

        // 1. 새로운 이미지가 있으면 S3에 업로드
        if (newImages.length > 0) {
          uploadedPhotos = await uploadPhotos(newImages, foodId);
        }

        // 2. 썸네일 URL 결정 (기존 이미지 우선, 없으면 새 이미지)
        if (existingImageUrls.length > 0) {
          thumbnailUrl = existingImageUrls[0];
        } else if (uploadedPhotos.length > 0) {
          thumbnailUrl = uploadedPhotos[0].imageUrl;
        }

        // 3. 메뉴 업데이트 요청
        const foodData: FoodItemRequest = {
          foodName: menuData.name,
          price: menuData.price,
          description: menuData.description,
          thumbnailUrl,
          isActive: true,
        };

        const response = await foodApi.updateFood(foodId, foodData);
        const updatedFood = response.result;

        return {
          food: updatedFood,
          photos: uploadedPhotos,
        };
      } finally {
        setIsUpdating(false);
      }
    },
    onSuccess: (data, variables) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: foodKeys.detail(variables.foodId) });
      queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
      toast.success('메뉴가 성공적으로 수정되었어요!');
    },
    onError: (error) => {
      console.error('Menu update failed:', error);
      toast.error('메뉴 수정에 실패했습니다. 다시 시도해주세요.');
    },
  });

  return {
    updateMenuWithPhotos: mutation.mutate,
    updateMenuWithPhotosAsync: mutation.mutateAsync,
    isUpdating: isUpdating || mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
}