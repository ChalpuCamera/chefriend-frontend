import { apiClient } from "@/lib/api/client";
import { ContactInquiryRequest } from "@/lib/types/api/inquiry";
import { ApiResponse } from "@/lib/types/api/common";

export const inquiryApi = {
  saveInquiry: (data: ContactInquiryRequest) =>
    apiClient.post<ApiResponse<void>>("/api/landing/inquiry", data),
};
