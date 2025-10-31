import { apiClient } from "../client";
import type {
  ApiResponse,
  PageResponse,
  Pageable,
} from "@/lib/types/api/common";
import type {
  StoreNoticeResponse,
  CreateStoreNoticeRequest,
  UpdateStoreNoticeRequest,
  StoreNoticeDeleteDto,
} from "@/lib/types/api/notice";

export const noticeApi = {
  // Get notices list
  getNotices: (storeId: number, pageable: Pageable = {}) => {
    const params: Record<string, string | number | string[]> = {
      page: pageable.page ?? 0,
      size: pageable.size ?? 20,
      sort: pageable.sort ?? ["createdAt", "desc"],
    };
    return apiClient.get<ApiResponse<PageResponse<StoreNoticeResponse>>>(
      `/api/stores/${storeId}/notices`,
      { params }
    );
  },

  // Create notice
  createNotice: (storeId: number, data: CreateStoreNoticeRequest) =>
    apiClient.post<ApiResponse<StoreNoticeResponse>>(
      `/api/stores/${storeId}/notices`,
      data
    ),

  // Update notice
  updateNotice: (noticeId: number, data: UpdateStoreNoticeRequest) =>
    apiClient.put<ApiResponse<StoreNoticeResponse>>(
      `/api/stores/notices/${noticeId}`,
      data
    ),

  // Delete notices (bulk delete)
  deleteNotices: (storeId: number, deleteIds: number[]) =>
    apiClient.delete<ApiResponse<void>>(`/api/stores/${storeId}/notices`, {
      body: JSON.stringify({ deleteIds } as StoreNoticeDeleteDto),
    }),
};
