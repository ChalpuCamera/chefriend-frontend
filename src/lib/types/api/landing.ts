/**
 * Landing Page API Types
 * API Spec: api-common.json - Landing Page endpoints
 */

// ============ Enums ============
export type ButtonType = "START_FREE" | "KAKAO_LOGIN" | "LOGIN";

// ============ Request Types ============
export interface ContactInquiryRequest {
  content: string;
}

export interface ButtonLogRequest {
  buttonType: ButtonType;
  sessionId: string;
}
