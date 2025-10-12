import { apiClient } from "../client";
import type {
  ApiResponse,
  PageResponse,
  Pageable,
} from "@/lib/types/api/common";
import type {
  StoreRequest,
  StoreResponse,
  StoreIdResponse,
  MemberResponse,
  MemberInviteRequest,
} from "@/lib/types/api/store";

export const storeApi = {
  // 내 매장 목록 조회 (매장 ID 획득용)
  getMyStores: (pageable: Pageable = {}) => {
    const params: Record<string, string | number | string[]> = {
      page: pageable.page ?? 0,
      size: pageable.size ?? 10,
      sort: pageable.sort ?? ["id", "asc"], // 첫 번째 가게 (ID 오름차순) 우선
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

  // 매장 대표 사진 설정
  updateStoreThumbnail: (storeId: number, photoUrl: string) =>
    apiClient.put<ApiResponse<StoreResponse>>(
      `/api/stores/${storeId}/thumbnail?photoUrl=${encodeURIComponent(photoUrl)}`,
      null
    ),

  // 매장 삭제
  deleteStore: (storeId: number) =>
    apiClient.delete<ApiResponse<void>>(`/api/stores/${storeId}`),

  // 사이트 링크 중복 체크 (공개 API)
  checkSiteLink: (siteLink: string) =>
    apiClient.get<ApiResponse<StoreIdResponse>>(`/api/public/stores/${siteLink}`),

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
