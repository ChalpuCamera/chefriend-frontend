"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { customerApiClient } from "@/lib/api/customerClient";
import type { StoreResponse } from "@/lib/types/api/store";

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

function ReviewCompleteContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');
  const [countdown, setCountdown] = useState(3);
  const [siteLink, setSiteLink] = useState<string | null>(null);

  useEffect(() => {
    // storeId가 없으면 리다이렉트 안 함
    if (!storeId) return;

    // 가게 정보 조회
    const fetchStoreInfo = async () => {
      try {
        const response = await customerApiClient.get<ApiResponse<StoreResponse>>(`/api/stores/${storeId}`);
        const store = response.result;

        if (store.siteLink) {
          setSiteLink(store.siteLink);
        }
      } catch (error) {
        console.error('Failed to fetch store info:', error);
      }
    };

    fetchStoreInfo();
  }, [storeId]);

  useEffect(() => {
    // siteLink가 없으면 카운트다운 안 함
    if (!siteLink) return;

    // 카운트다운
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // 0초가 되면 리다이렉트
      window.location.href = `https://chefriend.kr/${siteLink}`;
    }
  }, [countdown, siteLink]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-[430px] w-full text-center">
        <div className="bg-white rounded-[24px] p-8 shadow-sm">
          {/* 성공 아이콘 */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          {/* 메인 메시지 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            리뷰가 등록되었습니다!
          </h1>

          {/* 서브 메시지 */}
          <p className="text-base text-gray-600 mb-8">
            사장님께 소중한 의견이 전달됩니다
          </p>

          {/* 카운트다운 */}
          {siteLink && (
            <p className="text-sm text-gray-500">
              {countdown}초 후 가게 페이지로 이동합니다...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩중...</p>
      </div>
    }>
      <ReviewCompleteContent />
    </Suspense>
  );
}
