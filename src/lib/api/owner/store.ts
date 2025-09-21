import { apiClient } from "../client";
import type {
  ApiResponse,
  PageResponse,
  Pageable,
} from "@/lib/types/api/common";
import type {
  StoreRequest,
  StoreResponse,
  MemberResponse,
  MemberInviteRequest,
} from "@/lib/types/api/store";

export const storeApi = {
  // 내 매장 목록 조회 (매장 ID 획득용)
  getMyStores: (pageable: Pageable = {}) => {
    const params = {
      page: pageable.page ?? 0,
      size: pageable.size ?? 10,
      sort: pageable.sort ?? ["createdAt,desc"],
    };
    return apiClient.get<ApiResponse<PageResponse<StoreResponse>>>(
      "/api/stores/my",
      { params }
    );
  },

  // 매장 상세 조회
  getStore: (storeId: number) =>
    apiClient.get<ApiResponse<StoreResponse>>(`/api/stores/${storeId}`),

  // 매장 생성
  createStore: (data: StoreRequest) =>
    apiClient.post<ApiResponse<StoreResponse>>("/api/stores", data),

  // 매장 정보 수정
  updateStore: (storeId: number, data: StoreRequest) =>
    apiClient.put<ApiResponse<StoreResponse>>(`/api/stores/${storeId}`, data),

  // 매장 삭제
  deleteStore: (storeId: number) =>
    apiClient.delete<ApiResponse<void>>(`/api/stores/${storeId}`),

  // 매장 멤버 목록 조회
  getStoreMembers: (storeId: number) =>
    apiClient.get<ApiResponse<MemberResponse[]>>(
      `/api/stores/${storeId}/members`
    ),

  // 매장 멤버 초대
  inviteMember: (storeId: number, data: MemberInviteRequest) =>
    apiClient.post<ApiResponse<MemberResponse>>(
      `/api/stores/${storeId}/members`,
      data
    ),
};
