import { useState } from 'react';
import { photoApi } from '@/lib/api/owner/photo';
import type { PhotoResponse } from '@/lib/types/api/photo';

interface UsePhotoUploadOptions {
  onSuccess?: (photos: PhotoResponse[]) => void;
  onError?: (error: Error) => void;
}

export function usePhotoUpload(options?: UsePhotoUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadPhotos = async (files: File[], foodItemId?: number): Promise<PhotoResponse[]> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedPhotos: PhotoResponse[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 1. Presigned URL 생성
        const presignedResponse = await photoApi.getPresignedUrl(file.name);
        const { presignedUrl, s3Key } = presignedResponse.result;

        // 2. S3에 파일 업로드
        await photoApi.uploadToS3(presignedUrl, file);

        // 3. 서버에 사진 정보 등록
        const registerResponse = await photoApi.registerPhoto({
          s3Key,
          fileName: file.name,
          foodItemId,
          fileSize: file.size,
        });

        uploadedPhotos.push(registerResponse.result);

        // 진행률 업데이트
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      options?.onSuccess?.(uploadedPhotos);
      return uploadedPhotos;
    } catch (error) {
      console.error('Photo upload failed:', error);
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadSinglePhoto = async (file: File, foodItemId?: number): Promise<PhotoResponse> => {
    const results = await uploadPhotos([file], foodItemId);
    return results[0];
  };

  return {
    uploadPhotos,
    uploadSinglePhoto,
    isUploading,
    uploadProgress,
  };
}