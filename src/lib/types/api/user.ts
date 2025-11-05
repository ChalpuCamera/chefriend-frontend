/**
 * User Management API Types
 * API Spec: api-common.json - User endpoints
 */

// ============ Response Types ============
export interface UserDto {
  id: number;
  email: string;
  name: string;
  profileImageUrl?: string;
  provider: string;
  role: string;
}
