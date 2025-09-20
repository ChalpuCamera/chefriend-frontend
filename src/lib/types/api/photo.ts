// Photo Upload API Types

export interface PhotoUploadRequest {
  fileName: string;
}

export interface PhotoPresignedUrlResponse {
  presignedUrl: string;
  s3Key: string;
}

export interface PhotoRegisterRequest {
  s3Key: string;
  fileName: string;
  foodItemId?: number;
  fileSize?: number;
  imageWidth?: number;
  imageHeight?: number;
}

export interface PhotoResponse {
  photoId: number;
  storeId: number;
  userId: number;
  foodItemId?: number;
  imageUrl: string;
  fileName: string;
  fileSize?: number;
  imageWidth?: number;
  imageHeight?: number;
  createdAt: string;
}

export interface FeedbackPhotosUploadRequest {
  fileNames: string[];
}

export interface FeedbackPhotoUrlInfo {
  originalFileName: string;
  presignedUrl: string;
  s3Key: string;
}

export interface FeedbackPhotosPresignedUrlResponse {
  photoUrls: FeedbackPhotoUrlInfo[];
}