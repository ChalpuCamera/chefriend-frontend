"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type PlatformType =
  | "naverLink"
  | "kakaoLink"
  | "yogiyoLink"
  | "baeminLink"
  | "coupangeatsLink"
  | "kakaoTalkLink"
  | "instagramLink"
  | "ddangyoLink"
  | "googleMapsLink"
  | "daangnLink";

interface Platform {
  key: PlatformType;
  name: string;
  icon: string;
  placeholder: string;
}

const platforms: Platform[] = [
  { key: "naverLink", name: "네이버 지도", icon: "/platform_icons/naver.png", placeholder: "복사한 링크를 바로 붙여넣으세요" },
  { key: "kakaoLink", name: "카카오맵", icon: "/platform_icons/kakaomap.png", placeholder: "복사한 링크를 바로 붙여넣으세요" },
  { key: "googleMapsLink", name: "구글맵", icon: "/platform_icons/googlemaps.png", placeholder: "복사한 링크를 바로 붙여넣으세요" },
  { key: "yogiyoLink", name: "요기요", icon: "/platform_icons/yogiyo.png", placeholder: "복사한 링크를 바로 붙여넣으세요" },
  { key: "baeminLink", name: "배달의민족", icon: "/platform_icons/baemin.png", placeholder: "복사한 링크를 바로 붙여넣으세요" },
  { key: "coupangeatsLink", name: "쿠팡이츠", icon: "/platform_icons/coupangeats.png", placeholder: "복사한 링크를 바로 붙여넣으세요" },
  { key: "ddangyoLink", name: "땡겨요", icon: "/platform_icons/ddangyo.png", placeholder: "복사한 링크를 바로 붙여넣으세요" },
  { key: "kakaoTalkLink", name: "카카오톡 채널", icon: "/platform_icons/kakaotalk.png", placeholder: "복사한 링크를 바로 붙여넣으세요" },
  { key: "instagramLink", name: "인스타그램", icon: "/platform_icons/instagram.png", placeholder: "인스타 아이디를 입력해주세요" },
  { key: "daangnLink", name: "당근마켓", icon: "/platform_icons/daangn.png", placeholder: "복사한 링크를 바로 붙여넣으세요" },
];

interface LinkSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingLinks: Partial<Record<PlatformType, string>>;
  onLinkAdd: (type: PlatformType, url: string) => void;
}

export function LinkSelectorDialog({
  open,
  onOpenChange,
  existingLinks,
  onLinkAdd
}: LinkSelectorDialogProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  // URL 추출 함수
  const extractUrl = (text: string): string | null => {
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = text.match(urlRegex);
    return match ? match[1] : null;
  };

  // 플랫폼별 도메인 검증 함수
  const validatePlatformUrl = (platformKey: PlatformType, url: string): boolean => {
    const platformDomains: Record<PlatformType, string> = {
      baeminLink: "s.baemin.com",
      yogiyoLink: "yogiyo.onelink.me",
      coupangeatsLink: "web.coupangeats.com",
      ddangyoLink: "fdofd.ddangyo.com",
      naverLink: "naver.me",
      kakaoLink: "kko.kakao.com",
      googleMapsLink: "maps.app.goo.gl",
      instagramLink: "www.instagram.com",
      kakaoTalkLink: "pf.kakao.com",
      daangnLink: "www.daangn.com",
    };

    const expectedDomain = platformDomains[platformKey];
    return url.includes(expectedDomain);
  };

  const handlePlatformClick = (platform: Platform) => {
    // 이미 추가된 링크가 있으면 선택하지 않음
    if (existingLinks[platform.key]) return;

    setSelectedPlatform(platform);
    setLinkUrl("");
    setUrlError("");
  };

  const handleLinkUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlError("");
    // 원본 텍스트 그대로 저장
    setLinkUrl(value);
  };

  const handleSubmit = () => {
    if (!selectedPlatform || !linkUrl.trim()) {
      return;
    }

    // 인스타그램 제외한 모든 플랫폼은 http:// 또는 https:// 포함 여부 검증
    if (selectedPlatform.key !== "instagramLink") {
      const extractedUrl = extractUrl(linkUrl.trim());
      if (!extractedUrl) {
        setUrlError("올바른 URL을 찾을 수 없습니다. http:// 또는 https://로 시작하는 링크를 포함해주세요.");
        return;
      }

      // 플랫폼별 도메인 검증
      if (!validatePlatformUrl(selectedPlatform.key, extractedUrl)) {
        const platformDomainNames: Record<PlatformType, string> = {
          baeminLink: "s.baemin.com",
          yogiyoLink: "yogiyo.onelink.me",
          coupangeatsLink: "web.coupangeats.com",
          ddangyoLink: "fdofd.ddangyo.com",
          naverLink: "naver.me",
          kakaoLink: "kko.kakao.com",
          googleMapsLink: "maps.app.goo.gl",
          instagramLink: "www.instagram.com",
          kakaoTalkLink: "pf.kakao.com",
          daangnLink: "www.daangn.com",
        };
        const expectedDomain = platformDomainNames[selectedPlatform.key];
        setUrlError(`${selectedPlatform.name} 링크가 아닙니다. ${expectedDomain}을(를) 포함하는 링크를 입력해주세요.`);
        return;
      }
    }

    // 원본 텍스트 그대로 전달
    onLinkAdd(selectedPlatform.key, linkUrl.trim());
    setSelectedPlatform(null);
    setLinkUrl("");
    setUrlError("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedPlatform(null);
    setLinkUrl("");
    setUrlError("");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Dialog가 닫힐 때 상태 초기화
      handleCancel();
    }
    onOpenChange(isOpen);
  };

  const handleCloseClick = () => {
    if (selectedPlatform) {
      // URL 입력 화면에서는 뒤로가기
      handleCancel();
    } else {
      // 플랫폼 선택 화면에서는 Dialog 닫기
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[400px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>링크 추가</DialogTitle>
          {/* 커스텀 X 버튼 */}
          <button
            onClick={handleCloseClick}
            className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        {!selectedPlatform ? (
          // 플랫폼 선택 화면
          <div className="space-y-3 mt-4">
            {platforms.map((platform) => {
              const isAdded = !!existingLinks[platform.key];
              return (
                <button
                  key={platform.key}
                  onClick={() => handlePlatformClick(platform)}
                  disabled={isAdded}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isAdded
                      ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Image
                      src={platform.icon}
                      alt={platform.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-body-sb text-gray-800">{platform.name}</span>
                  {isAdded && (
                    <span className="ml-auto text-xs text-gray-500">추가됨</span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          // URL 입력 화면
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src={selectedPlatform.icon}
                  alt={selectedPlatform.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-body-sb text-gray-800">{selectedPlatform.name}</span>
            </div>

            <div className="space-y-2">
              <Input
                value={linkUrl}
                onChange={handleLinkUrlChange}
                placeholder={selectedPlatform.placeholder}
                className="h-13 bg-gray-200 rounded-[12px]"
              />
              {urlError && (
                <p className="text-xs text-red-500">{urlError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!linkUrl.trim()}
                className="flex-1 bg-purple-700 text-white"
              >
                추가
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
