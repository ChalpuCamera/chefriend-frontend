import { CUSTOMER_ANONYMOUS_TOKEN } from '@/lib/constants/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://platform.chalpu.com';

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  result: T;
}

class CustomerApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // 공개 API는 토큰 없이
  async get<T = unknown>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Customer API GET error:', error);
      throw error;
    }
  }

  // 인증이 필요한 POST 요청 (고정 토큰 사용)
  async post<T = unknown>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CUSTOMER_ANONYMOUS_TOKEN}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // 에러 응답 처리
        if (responseData.error?.code === 'INVALID_QUESTION') {
          throw new Error('해당 메뉴에 활성화되지 않은 질문입니다');
        }
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('Customer API POST error:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const customerApiClient = new CustomerApiClient();