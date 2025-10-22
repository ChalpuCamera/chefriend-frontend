"use client";

import { useRouter } from "next/navigation";
import { CustomHeader } from "@/components/ui/custom-header";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function CouponGuidePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Header */}
      <CustomHeader handleBack={handleBack} title="쿠폰 시스템 안내" />

      {/* Main Content */}
      <div className="max-w-[430px] mx-auto pt-[107px] px-4 pb-4">

        {/* Section 1: Customer PIN */}
        <Card className="p-4 mb-3 shadow-sm">
          <h3 className="text-sub-title font-semibold text-gray-900 mb-3">
            1. 고객의 PIN 번호 확인
          </h3>

          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <Image
              src="/coupon_guides/customer.png"
              alt="고객 PIN 확인 화면"
              width={1080}
              height={1920}
              className="w-full h-auto"
              priority
            />
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>
              고객이 셰프랜드 앱을 열고 쿠폰 메뉴로 이동하면 <strong className="text-gray-900">오른쪽 화면처럼 큰 숫자로 PIN 번호</strong>가 표시됩니다.
            </p>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
              <p className="text-[#7C3BC6] font-medium">
                💡 고객에게 &quot;셰프랜드 앱에서 PIN 번호 알려주세요&quot;라고 요청하세요.
              </p>
            </div>
          </div>
        </Card>

        {/* Section 2: Owner Earn */}
        <Card className="p-4 mb-3 shadow-sm">
          <h3 className="text-sub-title font-semibold text-gray-900 mb-3">
            2. 스탬프 적립하기
          </h3>

          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <Image
              src="/coupon_guides/owner.png"
              alt="사장님 적립 화면"
              width={1080}
              height={1920}
              className="w-full h-auto"
            />
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-[#7C3BC6] flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">적립 개수 선택 (보라색 영역)</p>
                <p className="text-gray-600">기본 1개, -/+ 버튼이나 프리셋 버튼(1개, 2개, 3개, 5개)으로 조절</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">PIN 번호 입력 (파란색 영역)</p>
                <p className="text-gray-600">고객이 알려준 2자리 PIN 번호를 입력하세요</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">숫자 입력 및 적립 (초록색 영역)</p>
                <p className="text-gray-600">숫자 패드로 PIN을 입력한 후 하단의 &quot;적립하기&quot; 버튼을 누르세요</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Customer Use */}
        <Card className="p-4 mb-3 shadow-sm">
          <h3 className="text-sub-title font-semibold text-gray-900 mb-3">
            3. 스탬프 완성 후
          </h3>

          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <Image
              src="/coupon_guides/customer_use.png"
              alt="스탬프 완성 화면"
              width={1080}
              height={1920}
              className="w-full h-auto"
            />
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>
              스탬프가 모두 채워지면 <strong className="text-gray-900">왼쪽처럼 &quot;쿠폰 사용 가능!&quot;</strong> 상태가 되고, 고객이 <strong className="text-gray-900">오른쪽처럼 쿠폰을 사용</strong>할 수 있습니다.
            </p>
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <p className="text-green-800 font-medium">
                💡 &quot;스탬프 X개 더 모으시면 쿠폰 받으실 수 있어요!&quot;라고 안내하면 재방문을 유도할 수 있습니다.
              </p>
            </div>
          </div>
        </Card>

        {/* Section 4: FAQ */}
        <Card className="p-4 mb-3 shadow-sm">
          <h3 className="text-sub-title font-semibold text-gray-900 mb-3">
            자주 묻는 질문
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Q. 잘못 입력했을 때는?</p>
              <p className="text-gray-600">A. &quot;전체 삭제&quot; 버튼을 눌러 다시 입력하세요.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Q. PIN 번호가 틀렸을 때는?</p>
              <p className="text-gray-600">A. 고객에게 다시 확인을 요청하거나 앱을 직접 확인해보세요.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Q. 여러 개를 한 번에 적립할 수 있나요?</p>
              <p className="text-gray-600">A. 최대 10개까지 가능합니다. 이벤트나 프로모션 시 활용하세요.</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
