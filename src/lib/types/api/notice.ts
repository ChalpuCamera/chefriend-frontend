// 공지사항 응답 타입
export interface StoreNoticeResponse {
  id: number;
  storeId: number;
  title: string;
  body: string;
  isRepresentative: boolean;
  createdAt: string; // ISO date-time string
  updatedAt: string; // ISO date-time string
}

// 공지사항 생성 요청 타입
export interface CreateStoreNoticeRequest {
  title: string;
  body: string;
  isRepresentative: boolean;
}

// 공지사항 수정 요청 타입
export interface UpdateStoreNoticeRequest {
  title: string;
  body: string;
  isRepresentative: boolean;
}

// 공지사항 삭제 요청 타입 (bulk delete)
export interface StoreNoticeDeleteDto {
  deleteIds: number[]; // 삭제할 공지사항 ID 배열
}
