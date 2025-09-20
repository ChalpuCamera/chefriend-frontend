import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foodApi } from '@/lib/api/owner/food';
import { usePhotoUpload } from './usePhotoUpload';
import type { FoodItemRequest } from '@/lib/types/api/food';
import type { PhotoResponse } from '@/lib/types/api/photo';
import { toast } from 'sonner';
import { foodKeys } from './useFood';

interface CreateMenuWithPhotosData {
  storeId: number;
  menuData: {
    name: string;
    price: number;
    description?: string;
  };
  images: File[];
}

export function useCreateMenuWithPhotos() {
  const [isCreating, setIsCreating] = useState(false);
  const { uploadPhotos } = usePhotoUpload();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ storeId, menuData, images }: CreateMenuWithPhotosData) => {
      setIsCreating(true);

      try {
        let uploadedPhotos: PhotoResponse[] = [];

        // 1. 먼저 메뉴 생성 요청 (사진 없이)
        const foodData: FoodItemRequest = {
          foodName: menuData.name,
          price: menuData.price,
          description: menuData.description,
          thumbnailUrl: undefined, // 초기에는 썸네일 없음
          isActive: true,
        };

        const response = await foodApi.createFood(storeId, foodData);
        const createdFood = response.result;

        // 2. 메뉴 생성 후 foodId를 가지고 이미지 업로드
        if (images.length > 0 && createdFood.foodItemId) {
          // foodItemId를 포함하여 사진 업로드
          uploadedPhotos = await uploadPhotos(images, createdFood.foodItemId);

          // 3. 첫 번째 사진을 썸네일로 설정
          if (uploadedPhotos.length > 0) {
            await foodApi.updateThumbnail(createdFood.foodItemId, uploadedPhotos[0].imageUrl);
            // 썸네일 설정 후 createdFood 객체 업데이트
            createdFood.thumbnailUrl = uploadedPhotos[0].imageUrl;
          }
        }

        return {
          food: createdFood,
          photos: uploadedPhotos,
          storeId, // storeId를 반환값에 포함
        };
      } finally {
        setIsCreating(false);
      }
    },
    onSuccess: (data) => {
      // 해당 store의 메뉴 리스트 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: foodKeys.listByStore(data.storeId)
      });
      toast.success('메뉴가 성공적으로 등록되었어요!');
    },
    onError: (error) => {
      console.error('Menu creation failed:', error);
      toast.error('메뉴 등록에 실패했습니다. 다시 시도해주세요.');
    },
  });

  return {
    createMenuWithPhotos: mutation.mutate,
    createMenuWithPhotosAsync: mutation.mutateAsync,
    isCreating: isCreating || mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
}