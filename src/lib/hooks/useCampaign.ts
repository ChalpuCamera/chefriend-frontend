import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// ============ Types ============
interface CreateCampaignRequest {
  name: string;
  description?: string;
  storeId: number;
  foodItemId: number;
  targetFeedbackCount: number;
  targetDays: number;
}

interface UpdateCampaignRequest {
  id: number;
  name?: string;
  description?: string;
  targetFeedbackCount?: number;
  targetDays?: number;
}

interface DeleteCampaignRequest {
  id: number;
}

interface ChangeCampaignStatusRequest {
  campaignId: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "EXPIRED";
}

interface GetCampaignsByStoreRequest {
  storeId: number;
  status?: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "EXPIRED";
}

export interface CampaignResponse {
  id: number;
  name: string;
  description?: string;
  storeId: number;
  storeName: string;
  foodItemId: number;
  foodItemName: string;
  targetFeedbackCount: number;
  targetDays: number;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  currentFeedbackCount: number;
  foodItemThumbnailUrl: string;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// ============ API Functions ============
const createCampaign = async (data: CreateCampaignRequest): Promise<ApiResponse<{ campaignId: number }>> => {
  return apiClient.post<ApiResponse<{ campaignId: number }>>("/api/campaigns", data);
};

const getCampaignsByStore = async (
  request: GetCampaignsByStoreRequest,
  page = 0,
  size = 20
): Promise<PageResponse<CampaignResponse>> => {
  const response = await apiClient.post<ApiResponse<PageResponse<CampaignResponse>>>(
    `/api/campaigns/store/list?page=${page}&size=${size}`,
    request
  );
  return response.result;
};

const updateCampaign = async (data: UpdateCampaignRequest): Promise<ApiResponse<void>> => {
  return apiClient.put<ApiResponse<void>>("/api/campaigns", data);
};

const deleteCampaign = async (data: DeleteCampaignRequest): Promise<ApiResponse<void>> => {
  // DELETE 요청은 일반적으로 body를 갖지 않으므로 URL에 id를 포함
  return apiClient.delete<ApiResponse<void>>(`/api/campaigns/${data.id}`);
};

const changeCampaignStatus = async (data: ChangeCampaignStatusRequest): Promise<ApiResponse<void>> => {
  return apiClient.patch<ApiResponse<void>>("/api/campaigns/status", data);
};

// ============ Hooks ============
export const useCreateCampaign = () => {
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      // 캠페인 목록 무효화
      // queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};

export const useGetCampaignsByStore = (
  storeId: number,
  status?: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "EXPIRED",
  page = 0,
  size = 20,
  enabled = true
) => {
  return useQuery({
    queryKey: ["campaigns", "store", storeId, status, page, size],
    queryFn: () => getCampaignsByStore({ storeId, status }, page, size),
    enabled: enabled && !!storeId,
  });
};

export const useUpdateCampaign = () => {
  return useMutation({
    mutationFn: updateCampaign,
    onSuccess: () => {
      // 캠페인 목록 무효화
      // queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};

export const useDeleteCampaign = () => {
  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      // 캠페인 목록 무효화
      // queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};

export const useChangeCampaignStatus = () => {
  return useMutation({
    mutationFn: changeCampaignStatus,
    onSuccess: () => {
      // 캠페인 목록 무효화
      // queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};

// 특정 음식에 대한 활성 캠페인 조회 (임시 구현)
export const useGetActiveCampaignByFood = (
  storeId: number,
  foodItemId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ["campaigns", "food", foodItemId, "active"],
    queryFn: async () => {
      // 매장의 활성 캠페인 조회
      const campaigns = await getCampaignsByStore({ storeId, status: "ACTIVE" });
      // 해당 음식의 캠페인 찾기
      return campaigns.content.find(c => c.foodItemId === foodItemId) || null;
    },
    enabled: enabled && !!storeId && !!foodItemId,
  });
};

// 남은 날짜 계산 헬퍼 함수
export const calculateRemainingDays = (endDate: string): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};