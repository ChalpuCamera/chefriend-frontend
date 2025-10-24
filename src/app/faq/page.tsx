"use client";

import { useRouter } from "next/navigation";
import { CustomHeader } from "@/components/ui/custom-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InquiryButton } from "@/components/inquiry-button";

export default function FAQPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Header */}
      <CustomHeader handleBack={handleBack} title="자주 묻는 질문" />

      {/* Main Content */}
      <div className="max-w-[430px] mx-auto pt-[80px] px-4 pb-8">

        {/* 쿠폰 시스템 섹션 */}
        <div className="mb-8">
          <h2 className="text-sub-title-b text-gray-800 mb-4 px-1">
            쿠폰 시스템
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="coupon-1" className="border rounded-lg px-4">
              <AccordionTrigger className="text-body-sb text-gray-800 hover:no-underline">
                Q. 쿠폰은 어떻게 사용하나요?
              </AccordionTrigger>
              <AccordionContent className="text-sub-body-r text-gray-600 pt-2">
                <div className="space-y-3">
                  <p>
                    <strong className="text-gray-800">1. 고객 확인:</strong> 고객이 셰프랜드 앱의 쿠폰 메뉴에서 2자리 PIN 번호를 확인합니다.
                  </p>
                  <p>
                    <strong className="text-gray-800">2. 적립:</strong> 홈 화면의 "쿠폰 적립하기" 버튼을 눌러 적립 개수를 선택하고 PIN 번호를 입력합니다.
                  </p>
                  <p>
                    <strong className="text-gray-800">3. 완성:</strong> 설정한 스탬프 개수가 모두 채워지면 고객이 쿠폰을 사용할 수 있습니다.
                  </p>
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded mt-3">
                    <p className="text-[#7C3BC6] text-sm">
                      💡 자세한 사용법은 쿠폰 적립 화면에서 "사용법 안내" 버튼을 눌러보세요.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="coupon-2" className="border rounded-lg px-4">
              <AccordionTrigger className="text-body-sb text-gray-800 hover:no-underline">
                Q. 잘못 입력했을 때는?
              </AccordionTrigger>
              <AccordionContent className="text-sub-body-r text-gray-600 pt-2">
                쿠폰 적립 화면에서 "전체 삭제" 버튼을 눌러 입력한 PIN 번호를 지우고 다시 입력하세요.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="coupon-3" className="border rounded-lg px-4">
              <AccordionTrigger className="text-body-sb text-gray-800 hover:no-underline">
                Q. PIN 번호가 틀렸을 때는?
              </AccordionTrigger>
              <AccordionContent className="text-sub-body-r text-gray-600 pt-2">
                고객에게 다시 확인을 요청하거나 고객의 앱 화면을 직접 확인해보세요.
                PIN 번호는 앱을 열 때마다 변경되니 최신 번호를 확인하는 것이 중요합니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="coupon-4" className="border rounded-lg px-4">
              <AccordionTrigger className="text-body-sb text-gray-800 hover:no-underline">
                Q. 여러 개를 한 번에 적립할 수 있나요?
              </AccordionTrigger>
              <AccordionContent className="text-sub-body-r text-gray-600 pt-2">
                네, 최대 10개까지 한 번에 적립 가능합니다.
                이벤트나 프로모션 시 활용하시면 고객 만족도를 높일 수 있습니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* SEO & 사이트 노출 섹션 */}
        <div className="mb-8">
          <h2 className="text-sub-title-b text-gray-800 mb-4 px-1">
            사이트 노출 & 검색
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="seo-1" className="border rounded-lg px-4">
              <AccordionTrigger className="text-body-sb text-gray-800 hover:no-underline">
                Q. 사이트를 만들었는데 구글에서 검색이 안 돼요
              </AccordionTrigger>
              <AccordionContent className="text-sub-body-r text-gray-600 pt-2">
                <div className="space-y-3">
                  <p>
                    새로운 사이트는 구글 검색 엔진에 등록되기까지 <strong className="text-gray-800">보통 1-2주 정도</strong> 시간이 걸립니다.
                  </p>
                  <p>
                    셰프랜드는 자동으로 구글에 사이트를 등록하지만, 검색 결과에 노출되기까지는 시간이 필요합니다.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p className="text-blue-800 text-sm">
                      💡 <strong>더 빠른 노출을 원하시면:</strong><br/>
                      사이트 링크를 SNS나 배달앱 프로필에 추가하시면 더 많은 고객에게 직접 노출될 수 있습니다.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="seo-2" className="border rounded-lg px-4">
              <AccordionTrigger className="text-body-sb text-gray-800 hover:no-underline">
                Q. 사이트를 더 빨리 노출시키려면?
              </AccordionTrigger>
              <AccordionContent className="text-sub-body-r text-gray-600 pt-2">
                <div className="space-y-2">
                  <p className="font-semibold text-gray-800">다음 방법을 추천합니다:</p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex gap-2">
                      <span className="text-purple-600">•</span>
                      <span>네이버/카카오맵 가게 정보에 사이트 주소 추가</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600">•</span>
                      <span>인스타그램 프로필 링크에 추가</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600">•</span>
                      <span>배달 앱 가게 소개란에 링크 공유</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600">•</span>
                      <span>고객들에게 직접 링크 공유 (카카오톡, 문자 등)</span>
                    </li>
                  </ul>
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mt-3">
                    <p className="text-green-800 text-sm">
                      ✅ 외부 링크는 가게 정보 수정 페이지에서 추가/관리할 수 있습니다.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="seo-3" className="border rounded-lg px-4">
              <AccordionTrigger className="text-body-sb text-gray-800 hover:no-underline">
                Q. 사이트 주소는 어디서 확인하나요?
              </AccordionTrigger>
              <AccordionContent className="text-sub-body-r text-gray-600 pt-2">
                <div className="space-y-2">
                  <p>
                    홈 화면 상단의 프로필 섹션에서 <strong className="text-gray-800">chefriend.kr/[내가게주소]</strong> 형태로 표시됩니다.
                  </p>
                  <p>
                    링크를 클릭하면 복사하거나 사이트를 미리 볼 수 있습니다.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* 기타 문의 안내 */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sub-body-r text-gray-600 mb-4">
            원하는 답변을 찾지 못하셨나요?
          </p>
          <div className="flex flex-col items-center gap-3">
            <InquiryButton source="faq page" variant="primary" />
            <button
              onClick={() => window.open("https://open.kakao.com/o/sCpB58Hh", "_blank")}
              className="text-body-sb text-purple-700 hover:text-purple-800"
            >
              카카오톡 고객센터 →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
