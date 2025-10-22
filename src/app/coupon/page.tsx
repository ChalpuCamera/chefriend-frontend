"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomButton } from "@/components/ui/custom-button";
import { CustomHeader } from "@/components/ui/custom-header";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { couponApi } from "@/lib/api/owner";
import { ApiError } from "@/lib/api/client";

export default function CouponStationPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [stamps, setStamps] = useState(1);
  const [storeId] = useState<number>(1); // TODO: Get from auth/context
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.push("/home");
  };

  const handleNumberClick = (num: number) => {
    if (pin.length < 2) {
      setPin(pin + num);
    }
  };

  const handleClear = () => {
    setPin("");
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const adjustStamps = (delta: number) => {
    const newValue = stamps + delta;
    if (newValue >= 0 && newValue <= 10) {
      setStamps(newValue);
    }
  };

  const handleSubmit = async () => {
    if (pin.length !== 2) {
      toast.error("2자리 PIN을 입력해주세요");
      return;
    }

    if (stamps === 0) {
      toast.error("적립할 스탬프 개수를 설정해주세요");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await couponApi.earnStamps({
        storeId,
        pin,
        stamps,
      });

      const data = response.result;

      if (data.success) {
        toast.success(
          `적립 완료! ${data.addedStamps}개 적립 → 총 ${data.currentStamps}개`,
          { duration: 3000 }
        );
        // Reset after success
        setPin("");
        setStamps(1);
      } else {
        throw new Error("적립 처리에 실패했습니다");
      }
    } catch (err) {
      console.error("Failed to process coupon:", err);
      if (err instanceof ApiError) {
        const errorMessage =
          (err.data as { message?: string })?.message ||
          "적립 처리에 실패했습니다";
        toast.error(errorMessage);
      } else {
        toast.error(
          err instanceof Error ? err.message : "적립 처리에 실패했습니다"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Header */}
      <CustomHeader handleBack={handleBack} title="쿠폰 적립" />

      {/* Main Content - with top padding for fixed header */}
      <div className="max-w-[430px] mx-auto pt-[107px] px-4 pb-4">
        {/* Guide Link Banner */}
        <button
          onClick={() => router.push("/coupon/guide")}
          className="w-full bg-purple-50 hover:bg-purple-100 transition-colors rounded-[12px] p-3 mb-4 flex items-center justify-between group"
        >
          <span className="text-sub-body-sb text-[#7C3BC6]">
            처음 사용하시나요? 쿠폰 시스템 안내 보기
          </span>
          <ChevronRight className="w-5 h-5 text-[#7C3BC6] group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Subtitle */}
        <div className="mb-3">
          <p className="text-body-r text-gray-600">
            고객의 PIN 번호를 입력하세요
          </p>
        </div>

        {/* Stamp Count Adjustment */}
        <div className="mb-3 p-3">
          <label className="block text-sub-body-sb text-gray-700 mb-2">
            적립 개수
          </label>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => adjustStamps(-1)}
              disabled={stamps <= 0}
              variant="outline"
              className="w-16 h-16 text-[36px] font-bold rounded-[8px]"
            >
              −
            </Button>
            <div className="bg-purple-50 rounded-[12px] px-8 py-4 min-w-[120px]">
              <div className="text-title-2 text-[#7C3BC6] text-center">
                {stamps}
              </div>
              <div className="text-sub-body-r text-gray-600 text-center">
                스탬프
              </div>
            </div>
            <Button
              onClick={() => adjustStamps(1)}
              disabled={stamps >= 10}
              variant="outline"
              className="w-16 h-16 text-[36px] font-bold rounded-[8px]"
            >
              +
            </Button>
          </div>
        </div>

        {/* Quick Preset Buttons */}
        <div className="mb-3 flex gap-2 p-3">
          <Button
            onClick={() => setStamps(1)}
            variant="outline"
            size="sm"
            className={`flex-1 rounded-[8px] ${
              stamps === 1 ? "bg-purple-50 border-[#7C3BC6]" : ""
            }`}
          >
            1개
          </Button>
          <Button
            onClick={() => setStamps(2)}
            variant="outline"
            size="sm"
            className={`flex-1 rounded-[8px] ${
              stamps === 2 ? "bg-purple-50 border-[#7C3BC6]" : ""
            }`}
          >
            2개
          </Button>
          <Button
            onClick={() => setStamps(3)}
            variant="outline"
            size="sm"
            className={`flex-1 rounded-[8px] ${
              stamps === 3 ? "bg-purple-50 border-[#7C3BC6]" : ""
            }`}
          >
            3개
          </Button>
          <Button
            onClick={() => setStamps(5)}
            variant="outline"
            size="sm"
            className={`flex-1 rounded-[8px] ${
              stamps === 5 ? "bg-purple-50 border-[#7C3BC6]" : ""
            }`}
          >
            5개
          </Button>
        </div>

        {/* Main Card */}
        <Card className="p-3 shadow-sm rounded-[12px] mb-2">
          {/* PIN Display */}
          <div className="mb-2">
            <label className="block text-sub-body-sb text-gray-700 mb-2">
              PIN 번호
            </label>
            <div className="flex justify-center gap-3">
              <div
                className={`w-16 h-20 bg-white border-2 rounded-[12px] flex items-center justify-center transition-colors ${
                  pin[0] ? "border-[#7C3BC6]" : "border-gray-300"
                }`}
              >
                <span className="text-[40px] font-bold text-gray-900">
                  {pin[0] || ""}
                </span>
              </div>
              <div
                className={`w-16 h-20 bg-white border-2 rounded-[12px] flex items-center justify-center transition-colors ${
                  pin[1] ? "border-[#7C3BC6]" : "border-gray-300"
                }`}
              >
                <span className="text-[40px] font-bold text-gray-900">
                  {pin[1] || ""}
                </span>
              </div>
            </div>
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={pin.length >= 2}
                variant="outline"
                className="h-16 text-[32px] font-bold rounded-[8px] hover:bg-purple-50 hover:border-[#7C3BC6] transition-colors"
              >
                {num}
              </Button>
            ))}
            <Button
              onClick={handleClear}
              variant="outline"
              className="h-16 text-sub-body-sb rounded-[8px] hover:bg-red-50 hover:border-red-500 hover:text-red-600"
            >
              전체 삭제
            </Button>
            <Button
              onClick={() => handleNumberClick(0)}
              disabled={pin.length >= 2}
              variant="outline"
              className="h-16 text-[32px] font-bold rounded-[8px] hover:bg-purple-50 hover:border-[#7C3BC6] transition-colors"
            >
              0
            </Button>
            <Button
              onClick={handleBackspace}
              variant="outline"
              className="h-16 text-[32px] font-bold rounded-[8px] hover:bg-gray-100"
            >
              ←
            </Button>
          </div>
        </Card>

        {/* Submit Button */}
        <CustomButton
          onClick={handleSubmit}
          disabled={pin.length !== 2 || stamps === 0 || isSubmitting}
        >
          {isSubmitting ? "처리 중..." : "적립하기"}
        </CustomButton>

      </div>
    </div>
  );
}
