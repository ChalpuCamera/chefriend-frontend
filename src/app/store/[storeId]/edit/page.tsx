"use client";

import { useState, useEffect, use } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/ui/custom-button";
import { CustomHeader } from "@/components/ui/custom-header";
import { useStore, useUpdateStore, useCheckSiteLink } from "@/lib/hooks/useStore";
import { useRouter } from "next/navigation";
import { AddressSearch } from "@/components/address-search";

export default function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const resolvedParams = use(params);
  const storeId = parseInt(resolvedParams.storeId);
  const router = useRouter();

  // 기존 가게 정보 로드
  const { data: storeData, isLoading } = useStore(storeId);

  const [siteLink, setSiteLink] = useState("");
  const [originalSiteLink, setOriginalSiteLink] = useState(""); // 기존 주소 저장
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [siteLinkChecked, setSiteLinkChecked] = useState(false);
  const [siteLinkError, setSiteLinkError] = useState("");
  const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);

  const updateStoreMutation = useUpdateStore();
  const checkSiteLinkMutation = useCheckSiteLink();

  // 기존 데이터로 state 초기화
  useEffect(() => {
    if (storeData) {
      setSiteLink(storeData.siteLink || "");
      setOriginalSiteLink(storeData.siteLink || "");
      setSiteLinkChecked(true); // 기존 주소는 이미 검증됨
      setStoreName(storeData.storeName || "");
      setAddress(storeData.address || "");
      setDescription(storeData.description || "");
    }
  }, [storeData]);

  // 커스텀 URL 유효성 검사
  const validateSiteLink = (value: string) => {
    return /^[가-힣a-zA-Z0-9-_]+$/.test(value);
  };

  const handleSiteLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSiteLink(value);
    // 기존 주소와 다를 때만 재검증 필요
    if (value !== originalSiteLink) {
      setSiteLinkChecked(false);
      setSiteLinkError("");
    } else {
      setSiteLinkChecked(true);
      setSiteLinkError("");
    }
  };

  const handleCheckSiteLink = async () => {
    // 기존 주소와 동일하면 체크 불필요
    if (siteLink === originalSiteLink) {
      setSiteLinkChecked(true);
      setSiteLinkError("");
      return;
    }

    if (!siteLink.trim()) {
      setSiteLinkError("사이트 주소를 입력해주세요");
      return;
    }

    if (siteLink.trim().length < 4) {
      setSiteLinkError("사이트 주소는 최소 4글자 이상이어야 합니다");
      return;
    }

    if (!validateSiteLink(siteLink)) {
      setSiteLinkError("한글, 영문, 숫자, 하이픈(-), 언더바(_) 사용 가능합니다");
      return;
    }

    try {
      const result = await checkSiteLinkMutation.mutateAsync(siteLink);
      if (result.isAvailable) {
        setSiteLinkChecked(true);
        setSiteLinkError("");
      } else {
        setSiteLinkError("이미 사용 중인 주소입니다");
        setSiteLinkChecked(false);
      }
    } catch {
      setSiteLinkError("중복 확인 중 오류가 발생했습니다");
      setSiteLinkChecked(false);
    }
  };

  const handleAddressSelect = (selectedAddress: string) => {
    setAddress(selectedAddress);
  };

  const isValid =
    siteLinkChecked &&
    storeName.trim().length >= 1 &&
    address.trim().length >= 1 &&
    description.trim().length >= 1;

  const handleSubmit = async () => {
    if (!isValid) {
      return;
    }

    // 백엔드 label → customLabel 변환
    const convertedLinks = storeData?.links?.map(link => {
      const converted = {
        linkType: link.linkType,
        url: link.url,
      };

      // CUSTOM 타입이고 label이 있으면 customLabel로 변환
      if (link.linkType === "CUSTOM" && link.label) {
        return { ...converted, customLabel: link.label };
      } else if (link.customLabel) {
        return { ...converted, customLabel: link.customLabel };
      }

      return converted;
    });

    try {
      await updateStoreMutation.mutateAsync({
        storeId,
        data: {
          siteLink,
          storeName,
          address,
          description,
          // 아래 필드는 storeData에서 원본 그대로 사용하여 null 방지
          requiredStampsForCoupon: storeData?.requiredStampsForCoupon,
          displayTemplate: storeData?.displayTemplate,
          thumbnailUrl: storeData?.thumbnailUrl,
          links: convertedLinks,  // label → customLabel 변환된 링크 전송
        },
      });
      router.push(`/home`);
    } catch (err) {
      console.error("Store update failed:", err);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="bg-white w-full mx-auto">
      {/* Header */}
      <CustomHeader handleBack={handleBack} title="가게 정보 수정" />

      <div className="px-4 pt-30 pb-6">
        {/* Form Section */}
        <div className="space-y-6">
          {/* 사이트 주소 (커스텀 URL) */}
          <div className="space-y-2.5">
            <Label htmlFor="siteLink" className="text-body-sb text-black">
              사이트 주소 <span className="text-caption-r text-gray-500">(중복 체크를 하셔야 등록이 가능합니다)</span>
            </Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-body-r text-gray-500">
                  chefriend.kr/
                </div>
                <Input
                  id="siteLink"
                  value={siteLink}
                  onChange={handleSiteLinkChange}
                  className="h-13 bg-gray-200 rounded-[12px] pl-[110px]"
                  placeholder="우리가게"
                />
              </div>
              <button
                onClick={handleCheckSiteLink}
                disabled={checkSiteLinkMutation.isPending}
                className="px-4 h-13 bg-purple-700 text-white text-sub-body-sb rounded-[8px] whitespace-nowrap disabled:opacity-50"
              >
                {checkSiteLinkMutation.isPending ? "확인 중..." : "중복 체크"}
              </button>
            </div>
            {/* 에러 메시지 영역 (높이 고정) */}
            <div className="h-5">
              {siteLinkError ? (
                <p className="text-xs text-red-500">{siteLinkError}</p>
              ) : siteLinkChecked ? (
                <p className="text-xs text-green-600">
                  {siteLink === originalSiteLink ? "기존 주소를 사용합니다" : "사용 가능한 주소입니다"}
                </p>
              ) : (
                <p className="text-xs text-gray-500">사용하실 사이트 주소를 입력해주세요</p>
              )}
            </div>
          </div>

          {/* 가게 이름 */}
          <div className="space-y-2.5">
            <Label htmlFor="storeName" className="text-body-sb text-black">
              가게 이름
            </Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="h-13 bg-gray-200 rounded-[12px]"
              placeholder="맛있는 식당"
            />
          </div>

          {/* 주소 */}
          <div className="space-y-2.5">
            <Label htmlFor="address" className="text-body-sb text-black">
              주소
            </Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={address}
                readOnly
                className="h-13 bg-gray-200 rounded-[12px] flex-1"
                placeholder="주소를 검색해주세요"
              />
              <button
                onClick={() => setIsAddressSearchOpen(true)}
                className="px-4 h-13 bg-purple-700 text-white text-sub-body-sb rounded-[8px] whitespace-nowrap"
              >
                주소 검색
              </button>
            </div>
          </div>

          {/* 가게 설명 */}
          <div className="space-y-2.5">
            <Label htmlFor="description" className="text-body-sb text-black">
              가게 설명
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-27 bg-gray-200 rounded-[12px] p-4 text-body-r placeholder:text-gray-500 resize-none"
              placeholder="가게 설명을 입력해주세요"
              rows={4}
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="sticky bottom-0 bg-white py-6 mt-6">
          <div className="max-w-[430px] mx-auto flex justify-center">
            <CustomButton
              disabled={!isValid || updateStoreMutation.isPending}
              onClick={handleSubmit}
            >
              {updateStoreMutation.isPending ? "수정 중..." : "수정하기"}
            </CustomButton>
          </div>
        </div>
      </div>

      {/* 주소 검색 Dialog */}
      <AddressSearch
        open={isAddressSearchOpen}
        onOpenChange={setIsAddressSearchOpen}
        onAddressSelect={handleAddressSelect}
      />
    </div>
  );
}
