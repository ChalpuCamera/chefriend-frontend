import { apiClient } from '../client';
import type { ApiResponse, PageResponse } from '@/lib/types/api/common';
import type {
  PhotoPresignedUrlResponse,
  PhotoRegisterRequest,
  PhotoResponse,
  FeedbackPhotosPresignedUrlResponse,
} from '@/lib/types/api/photo';

export const photoApi = {
  // Presigned URL 생성 (일반 사진)
  getPresignedUrl: (fileName: string) =>
    apiClient.post<ApiResponse<PhotoPresignedUrlResponse>>(
      '/api/photos/presigned-url',
      { fileName }
    ),

  // 임시 폴더 Presigned URL 생성
  getTmpPresignedUrl: (fileName: string) =>
    apiClient.post<ApiResponse<PhotoPresignedUrlResponse>>(
      '/api/photos/tmp/presigned-url',
      { fileName }
    ),

  // S3 직접 업로드 (Presigned URL 사용)
  uploadToS3: async (presignedUrl: string, file: File): Promise<void> => {
    return apiClient.uploadFile(presignedUrl, file);
  },

  // 업로드 완료 후 등록
  registerPhoto: (data: PhotoRegisterRequest) =>
    apiClient.post<ApiResponse<PhotoResponse>>('/api/photos/register', data),

  // 사진 상세 조회
  getPhoto: (photoId: number) =>
    apiClient.get<ApiResponse<PhotoResponse>>(`/api/photos/${photoId}`),

  // 사진 삭제
  deletePhoto: (photoId: number) =>
    apiClient.delete<ApiResponse<void>>(`/api/photos/${photoId}`),

  // 피드백 사진들 Presigned URL 생성 (여러 개 한번에)
  getFeedbackPresignedUrls: (fileNames: string[]) =>
    apiClient.post<ApiResponse<FeedbackPhotosPresignedUrlResponse>>(
      '/api/customer-feedback/presigned-urls',
      { fileNames }
    ),

  // 파일 업로드 프로세스 헬퍼 함수
  uploadPhotoProcess: async (file: File, foodItemId?: number): Promise<PhotoResponse> => {
    try {
      // 1. Presigned URL 생성
      const presignedResponse = await photoApi.getPresignedUrl(file.name);
      const { presignedUrl, s3Key } = presignedResponse.result;

      // 2. S3 업로드
      await photoApi.uploadToS3(presignedUrl, file);

      // 3. 서버에 등록
      const registerResponse = await photoApi.registerPhoto({
        s3Key,
        fileName: file.name,
        foodItemId,
        fileSize: file.size,
      });

      return registerResponse.result;
    } catch (error) {
      console.error('Photo upload process failed:', error);
      throw error;
    }
  },

  // 여러 피드백 사진 업로드 프로세스 헬퍼 함수
  uploadFeedbackPhotos: async (files: File[]): Promise<string[]> => {
    try {
      // 1. 여러 개의 Presigned URL 한번에 생성
      const fileNames = files.map(f => f.name);
      const presignedResponse = await photoApi.getFeedbackPresignedUrls(fileNames);
      const photoUrls = presignedResponse.result.photoUrls;

      // 2. 병렬로 S3 업로드
      const uploadPromises = files.map((file, index) => {
        const { presignedUrl } = photoUrls[index];
        return photoApi.uploadToS3(presignedUrl, file);
      });
      await Promise.all(uploadPromises);

      // 3. S3 키 반환 (피드백 생성 시 사용)
      return photoUrls.map(p => p.s3Key);
    } catch (error) {
      console.error('Feedback photos upload failed:', error);
      throw error;
    }
  },

  // 음식별 사진 목록 조회 (최대 ~개)
  getPhotosByFoodItem: (foodId: number) =>
    apiClient.get<ApiResponse<PageResponse<PhotoResponse>>>(
      `/api/photos/food-item/${foodId}?size=10`
    ),
};