/**
 * Subscription & Notification API Types
 * API Spec: api-docs.json - Subscription and Owner Notification endpoints
 */

// ============ Enums ============
export type NotificationType =
  | "SPECIAL_OFFER"
  | "EVENT"
  | "ANNOUNCEMENT";

// ============ Request Types ============
export interface SubscribeRequest {
  storeId: number;
  phone?: string;  // 전화번호 (선택)
}

export interface CreateNotificationRequest {
  storeId: number;
  type: NotificationType;
  title: string;
  message: string;
  scheduledAt?: string;  // date-time, 예약 발송 시간 (선택)
  data?: Record<string, unknown>;  // 추가 데이터 (선택)
}

// ============ Response Types ============
export interface SubscriptionResponse {
  subscriptionId: number;
  storeId: number;
  customerId?: number;
  subscribedAt: string;
  isNotificationEnabled?: boolean;
}

export interface CreateNotificationResponse {
  notificationId: number;
  targetSubscriberCount: number;
  message: string;
}
