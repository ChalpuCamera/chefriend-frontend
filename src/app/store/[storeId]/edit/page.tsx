"use client";

import { useState, useEffect, use } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { CustomButton } from "@/components/ui/custom-button";
import { CustomHeader } from "@/components/ui/custom-header";
import { useStore, useUpdateStore, useCheckSiteLink } from "@/lib/hooks/useStore";
import { useRouter } from "next/navigation";
import { AddressSearch } from "@/components/address-search";
import { LinkSelectorDialog, PlatformType } from "@/components/link-selector-dialog";
import { X } from "lucide-react";

const platformIcons: Record<PlatformType, string> = {
  naverLink: "/naver.png",
  kakaoLink: "/kakaomap.png",
  yogiyoLink: "/yogiyo.png",
  baeminLink: "/baemin.png",
  coupangeatsLink: "/coupangeats.png",
  kakaoTalkLink: "/kakaotalk.png",
  instagramLink: "/instagram.png",
  ddangyoLink: "/ddangyo.png",
  googleMapsLink: "/googlemaps.png",
  daangnLink: "/daangn.png",
};

const platformNames: Record<PlatformType, string> = {
  naverLink: "네이버 지도",
  kakaoLink: "카카오맵",
  yogiyoLink: "요기요",
  baeminLink: "배달의민족",
  coupangeatsLink: "쿠팡이츠",
  kakaoTalkLink: "카카오톡",
  instagramLink: "인스타그램",
  ddangyoLink: "땡겨요",
  googleMapsLink: "구글맵",
  daangnLink: "당근마켓",
};

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
  const [externalLinks, setExternalLinks] = useState<Partial<Record<PlatformType, string>>>({});

  const [siteLinkChecked, setSiteLinkChecked] = useState(false);
  const [siteLinkError, setSiteLinkError] = useState("");
  const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

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

      // 외부 링크 초기화
      const links: Partial<Record<PlatformType, string>> = {};
      if (storeData.naverLink) links.naverLink = storeData.naverLink;
      if (storeData.kakaoLink) links.kakaoLink = storeData.kakaoLink;
      if (storeData.yogiyoLink) links.yogiyoLink = storeData.yogiyoLink;
      if (storeData.baeminLink) links.baeminLink = storeData.baeminLink;
      if (storeData.coupangEatsLink) links.coupangeatsLink = storeData.coupangEatsLink;
      if (storeData.ddangyoLink) links.ddangyoLink = storeData.ddangyoLink;
      if (storeData.kakaoTalkLink) links.kakaoTalkLink = storeData.kakaoTalkLink;
      if (storeData.instagramLink) links.instagramLink = storeData.instagramLink;
      if (storeData.googleMapsLink) links.googleMapsLink = storeData.googleMapsLink;
      if (storeData.daangnLink) links.daangnLink = storeData.daangnLink;
      setExternalLinks(links);
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

  const handleLinkAdd = (type: PlatformType, url: string) => {
    setExternalLinks((prev) => ({ ...prev, [type]: url }));
  };

  const handleLinkRemove = (type: PlatformType) => {
    setExternalLinks((prev) => {
      const newLinks = { ...prev };
      delete newLinks[type];
      return newLinks;
    });
  };

  const isValid =
    siteLinkChecked &&
    storeName.trim().length >= 1 &&
    address.trim().length >= 1 &&
    description.trim().length >= 1;

  // URL 추출 함수
  const extractUrl = (text: string): string | null => {
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = text.match(urlRegex);
    return match ? match[1] : null;
  };

  const handleSubmit = async () => {
    if (!isValid) {
      return;
    }

    // 서버 전송 시 URL만 파싱하여 전송
    const parsedLinks: Partial<Record<PlatformType, string>> = {};
    (Object.keys(externalLinks) as PlatformType[]).forEach((type) => {
      const value = externalLinks[type];
      if (value) {
        if (type === "instagramLink") {
          // 인스타그램은 원본 그대로
          parsedLinks[type] = value;
        } else {
          // 다른 플랫폼은 URL 추출
          const extractedUrl = extractUrl(value);
          if (extractedUrl) {
            parsedLinks[type] = extractedUrl;
          }
        }
      }
    });

    try {
      await updateStoreMutation.mutateAsync({
        storeId,
        data: {
          siteLink,
          storeName,
          address,
          description,
          ...parsedLinks,
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
        <div className="space-y-10">
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
              placeholder="가게에 대한 간단한 소개를 작성해주세요"
              rows={4}
            />
          </div>

          {/* 외부 링크 */}
          <div className="space-y-2.5">
            <Label className="text-body-sb text-black">외부 링크 (선택)</Label>

            {/* 추가된 링크 목록 */}
            {Object.keys(externalLinks).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {(Object.keys(externalLinks) as PlatformType[]).map((type) => (
                  <div
                    key={type}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                  >
                    <Image
                      src={platformIcons[type]}
                      alt={platformNames[type]}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                    <span className="text-xs text-gray-700">{type === "instagramLink" ? externalLinks[type] : platformNames[type]}</span>
                    <button
                      onClick={() => handleLinkRemove(type)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 링크 추가 버튼 */}
            <button
              onClick={() => setIsLinkDialogOpen(true)}
              className="w-full h-13 bg-gray-200 rounded-[12px] text-body-r text-gray-600 hover:bg-gray-300 transition-colors"
            >
              + 링크 추가하기
            </button>
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

      {/* 링크 선택 Dialog */}
      <LinkSelectorDialog
        open={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        existingLinks={externalLinks}
        onLinkAdd={handleLinkAdd}
      />
    </div>
  );
}
