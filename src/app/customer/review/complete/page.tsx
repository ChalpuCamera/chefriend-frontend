"use client";

import { CheckCircle2 } from "lucide-react";

export default function ReviewCompletePage() {

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
        </div>
      </div>
    </div>
  );
}
