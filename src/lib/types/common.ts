// ============================================================================
// 공통 타입 정의
// ============================================================================

export interface ErrorState {
  message: string;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
}

export interface FileUploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
}
