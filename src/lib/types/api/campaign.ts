/**
 * Campaign API Types
 * API Spec: api-docs.json - Campaign endpoints
 */

// ============ Enums ============
export type CampaignStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "EXPIRED";

// ============ Request Types ============
export interface CreateCampaignRequest {
  name: string;
  description?: string;
  storeId: number;
  foodItemId: number;
  targetFeedbackCount: number;
  targetDays: number;
}

export interface UpdateCampaignRequest {
  id: number;
  name?: string;
  description?: string;
  targetFeedbackCount?: number;
  targetDays?: number;
}

export interface DeleteCampaignRequest {
  id: number;
}

export interface ChangeCampaignStatusRequest {
  campaignId: number;
  status: CampaignStatus;
}

export interface GetCampaignsByStoreRequest {
  storeId: number;
  status?: CampaignStatus;
}

// ============ Response Types ============
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
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  currentFeedbackCount: number;
  foodItemThumbnailUrl: string;
}

export interface CampaignDetailResponse {
  id: number;
  name: string;
  description?: string;
  storeId: number;
  storeName: string;
  foodItemId: number;
  foodItemName: string;
  foodItemThumbnailUrl?: string;
  targetFeedbackCount: number;
  currentFeedbackCount: number;
  status: string;
  isActive: boolean;
  targetDays: number;
  startDate: string;  // date-time
  endDate: string;    // date-time
}
