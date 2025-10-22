"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { CustomButton } from "@/components/ui/custom-button";
import { useCreateStore, useCheckSiteLink, useMyStores } from "@/lib/hooks/useStore";
import { useRouter } from "next/navigation";
import { AddressSearch } from "@/components/address-search";
import { LinkSelectorDialog, PlatformType } from "@/components/link-selector-dialog";
import { X } from "lucide-react";

const platformIcons: Record<PlatformType, string> = {
  naverLink: "/platfrom_icons/naver.png",
  kakaoLink: "/platfrom_icons/kakaomap.png",
  yogiyoLink: "/platfrom_icons/yogiyo.png",
  baeminLink: "/platform_icons/baemin.png",
  coupangeatsLink: "/platform_icons/coupangeats.png",
  kakaoTalkLink: "/platform_icons/kakaotalk.png",
  instagramLink: "/platfrom_icons/instagram.png",
  ddangyoLink: "/platform_icons/ddangyo.png",
  googleMapsLink: "/platfrom_icons/googlemaps.png",
  daangnLink: "/platfrom_icons/daangn.png",
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

export default function Page() {
  const [siteLink, setSiteLink] = useState("");
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [requiredStamps, setRequiredStamps] = useState<number | string>(10);
  const [externalLinks, setExternalLinks] = useState<Partial<Record<PlatformType, string>>>({});

  const [siteLinkChecked, setSiteLinkChecked] = useState(false);
  const [siteLinkError, setSiteLinkError] = useState("");
  const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  const router = useRouter();
  const createStoreMutation = useCreateStore();
  const checkSiteLinkMutation = useCheckSiteLink();
  const { data: myStores } = useMyStores({ page: 0, size: 1 });

  // 이미 가게가 등록되어 있으면 홈으로 리다이렉트
  useEffect(() => {
    if (myStores?.content && myStores.content.length > 0) {
      router.replace("/home");
    }
  }, [myStores, router]);

  // 커스텀 URL 유효성 검사 (한글/영문/숫자/하이픈만 허용, 공백/특수문자 불가)
  const validateSiteLink = (value: string) => {
    return /^[가-힣a-zA-Z0-9-]+$/.test(value);
  };

  const handleSiteLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSiteLink(value);
    setSiteLinkChecked(false);
    setSiteLinkError("");
  };

  const handleCheckSiteLink = async () => {
    if (!siteLink.trim()) {
      setSiteLinkError("사이트 주소를 입력해주세요");
      return;
    }

    if (!validateSiteLink(siteLink)) {
      setSiteLinkError("한글, 영문, 숫자, 하이픈(-)만 사용 가능합니다");
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
      const response = await createStoreMutation.mutateAsync({
        siteLink,
        storeName,
        address,
        description,
        requiredStampsForCoupon: typeof requiredStamps === 'string' ? 10 : requiredStamps,
        ...parsedLinks,
      });
      if (response.storeId) {
        router.push(`/home`);
      }
    } catch (err) {
      console.error("Store creation failed:", err);
    }
  };

  return (
    <div className="bg-white w-full mx-auto px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <Image src="/logo_small.png" alt="Logo" width={85} height={25} />
      </div>

      {/* Title */}
      <div className="mb-12">
        <h1 className="px-1 text-title-2 text-gray-800">
          사장님, 어떤 가게를
          <br />
          운영하고 계신가요?
        </h1>
      </div>

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
                className="h-13 bg-gray-200 rounded-[12px] placeholder:text-gray-600 pl-[110px]"
                placeholder="사이트 주소"
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
              <p className="text-xs text-green-600">사용 가능한 주소입니다</p>
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
            className="h-13 bg-gray-200 placeholder:text-gray-500 rounded-[12px]"
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
              className="h-13 bg-gray-200 rounded-[12px] placeholder:text-gray-500 pl-[12px] flex-1"
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

        {/* 쿠폰 완성 스탬프 개수 */}
        <div className="space-y-1.5">
          <Label htmlFor="requiredStamps" className="text-sub-body-sb text-black">
            쿠폰 스탬프 개수
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="requiredStamps"
              type="number"
              min="1"
              max="20"
              value={requiredStamps}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setRequiredStamps(''); // 빈 값 허용
                  return;
                }
                const numValue = parseInt(value);
                if (!isNaN(numValue)) {
                  if (numValue > 20) {
                    setRequiredStamps(20);
                  } else if (numValue >= 1) {
                    setRequiredStamps(numValue);
                  }
                }
              }}
              onBlur={(e) => {
                // 포커스를 잃을 때 빈 값이거나 0 이하면 1로 설정
                const value = e.target.value;
                if (value === '' || parseInt(value) < 1) {
                  setRequiredStamps(10);
                }
              }}
              className="h-11 bg-gray-200 rounded-[10px] placeholder:text-gray-500 w-16 text-center text-sub-body-r"
            />
            <span className="text-sub-body-r text-gray-600">개</span>
            <span className="text-caption-r text-gray-500">최대 20개</span>
          </div>
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
      <div className="sticky bottom-0 bg-white py-3">
        <div className="max-w-[430px] mx-auto flex justify-center px-4">
          <CustomButton
            disabled={!isValid || createStoreMutation.isPending}
            onClick={handleSubmit}
          >
            {createStoreMutation.isPending ? "등록 중..." : "등록하기"}
          </CustomButton>
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
