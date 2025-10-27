"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LinkType, LinkItem } from "@/lib/types/api/store";

interface Platform {
  key: LinkType;
  name: string;
  icon: string;
  placeholder: string;
  domainToCheck?: string | string[];  // 도메인 검증용 (단일 또는 배열)
}

const platforms: Platform[] = [
  { key: "NAVER_MAP", name: "네이버 지도", icon: "/platform_icons/naver.png", placeholder: "복사한 링크를 바로 붙여넣으세요", domainToCheck: "naver.me" },
  { key: "KAKAO_MAP", name: "카카오맵", icon: "/platform_icons/kakaomap.png", placeholder: "복사한 링크를 바로 붙여넣으세요", domainToCheck: ["kko.kakao.com", "place.map.kakao.com"] },
  { key: "GOOGLE_MAPS", name: "구글맵", icon: "/platform_icons/googlemaps.png", placeholder: "복사한 링크를 바로 붙여넣으세요", domainToCheck: "maps.app.goo.gl" },
  { key: "YOGIYO", name: "요기요", icon: "/platform_icons/yogiyo.png", placeholder: "복사한 링크를 바로 붙여넣으세요", domainToCheck: "yogiyo.onelink.me" },
  { key: "BAEMIN", name: "배달의민족", icon: "/platform_icons/baemin.png", placeholder: "복사한 링크를 바로 붙여넣으세요", domainToCheck: "s.baemin.com" },
  { key: "COUPANGEATS", name: "쿠팡이츠", icon: "/platform_icons/coupangeats.png", placeholder: "복사한 링크를 바로 붙여넣으세요", domainToCheck: "web.coupangeats.com" },
  { key: "DDANGYO", name: "땡겨요", icon: "/platform_icons/ddangyo.png", placeholder: "복사한 링크를 바로 붙여넣으세요", domainToCheck: "fdofd.ddangyo.com" },
  { key: "KAKAO_TALK", name: "카카오톡 채널", icon: "/platform_icons/kakaotalk.png", placeholder: "복사한 링크를 바로 붙여넣으세요", domainToCheck: "pf.kakao.com" },
  { key: "INSTAGRAM", name: "인스타그램", icon: "/platform_icons/instagram.png", placeholder: "인스타 아이디를 입력해주세요", domainToCheck: "www.instagram.com" },
  { key: "DAANGN", name: "당근마켓", icon: "/platform_icons/daangn.png", placeholder: "복사한 링크를 바로 붙여넣으세요", domainToCheck: "www.daangn.com" },
  { key: "CUSTOM", name: "커스텀 링크", icon: "/platform_icons/link.png", placeholder: "링크 URL을 입력해주세요" },
];

interface LinkSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingLinks: LinkItem[];
  onLinkAdd: (linkItem: LinkItem) => void;
}

export function LinkSelectorDialog({
  open,
  onOpenChange,
  existingLinks,
  onLinkAdd
}: LinkSelectorDialogProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [urlError, setUrlError] = useState("");

  // 텍스트에서 특정 플랫폼의 URL 추출 함수 (프로토콜 제거)
  const extractUrlForPlatform = (text: string, domain: string): string | null => {
    // 도메인을 포함한 URL 찾기 (프로토콜 선택적, 공백 전까지)
    const urlRegex = new RegExp(`(https?:\\/\\/)?${domain.replace(/\./g, '\\.')}[^\\s]*`, 'i');
    const match = text.match(urlRegex);

    if (!match) return null;

    let url = match[0];

    // 프로토콜 제거
    url = url.replace(/^https?:\/\//, '');

    return url;
  };

  // 플랫폼별 도메인 검증 함수 (도메인으로 시작하는지 확인)
  const validatePlatformUrl = (url: string, domain: string): boolean => {
    return url.toLowerCase().startsWith(domain.toLowerCase());
  };

  const handlePlatformClick = (platform: Platform) => {
    // 일반 플랫폼은 중복 불가, CUSTOM은 중복 가능
    if (platform.key !== "CUSTOM") {
      const isAdded = existingLinks.some(link => link.linkType === platform.key);
      if (isAdded) return;
    }

    // 즉시 빈 링크 아이템 추가 (URL은 나중에 입력)
    const linkItem: LinkItem = {
      linkType: platform.key,
      url: "",  // 빈 URL로 추가
      isVisible: true,  // 기본값 true
    };

    // CUSTOM이면 빈 customLabel도 추가
    if (platform.key === "CUSTOM") {
      linkItem.customLabel = "";
    }

    onLinkAdd(linkItem);
    onOpenChange(false);
  };

  const handleLinkUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlError("");
    setLinkUrl(value);
  };

  const handleCustomLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomLabel(e.target.value);
  };

  const handleSubmit = () => {
    if (!selectedPlatform || !linkUrl.trim()) {
      return;
    }

    // CUSTOM 타입일 때 customLabel 필수
    if (selectedPlatform.key === "CUSTOM" && !customLabel.trim()) {
      setUrlError("커스텀 링크는 이름을 입력해주세요");
      return;
    }

    let finalUrl = linkUrl.trim();

    // CUSTOM과 INSTAGRAM 제외한 플랫폼은 도메인 검증
    if (selectedPlatform.key !== "CUSTOM" && selectedPlatform.key !== "INSTAGRAM" && selectedPlatform.domainToCheck) {
      const domainsToCheck = Array.isArray(selectedPlatform.domainToCheck)
        ? selectedPlatform.domainToCheck
        : [selectedPlatform.domainToCheck];

      let extractedUrl: string | null = null;
      let matchedDomain: string | null = null;

      // 여러 도메인 중 하나라도 매칭되면 성공
      for (const domain of domainsToCheck) {
        const url = extractUrlForPlatform(linkUrl.trim(), domain);
        if (url && validatePlatformUrl(url, domain)) {
          extractedUrl = url;
          matchedDomain = domain;
          break;
        }
      }

      if (!extractedUrl) {
        const domainsText = domainsToCheck.join(' 또는 ');
        setUrlError(`링크를 찾을 수 없습니다. ${domainsText}을(를) 포함하는 링크를 입력해주세요.`);
        return;
      }

      finalUrl = extractedUrl;
    } else if (selectedPlatform.key === "CUSTOM") {
      // CUSTOM은 프로토콜 제거만
      finalUrl = finalUrl.replace(/^https?:\/\//, '');
    }

    // LinkItem 생성
    const linkItem: LinkItem = {
      linkType: selectedPlatform.key,
      url: finalUrl,
      isVisible: true,
    };

    // CUSTOM이면 customLabel 추가
    if (selectedPlatform.key === "CUSTOM") {
      linkItem.customLabel = customLabel.trim();
    }

    onLinkAdd(linkItem);
    setSelectedPlatform(null);
    setLinkUrl("");
    setCustomLabel("");
    setUrlError("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedPlatform(null);
    setLinkUrl("");
    setCustomLabel("");
    setUrlError("");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleCancel();
    }
    onOpenChange(isOpen);
  };

  const handleCloseClick = () => {
    if (selectedPlatform) {
      handleCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[400px] max-h-[85vh] flex flex-col p-0 gap-0" showCloseButton={false}>
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
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

        <div className="overflow-y-auto px-6 pb-6">
          {!selectedPlatform ? (
            // 플랫폼 선택 화면
            <div className="space-y-3">
              {platforms.map((platform) => {
                const isAdded = platform.key !== "CUSTOM" && existingLinks.some(link => link.linkType === platform.key);
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
            <div className="space-y-4">
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
                {selectedPlatform.key === "CUSTOM" && (
                  <Input
                    value={customLabel}
                    onChange={handleCustomLabelChange}
                    placeholder="링크 이름 (예: 공식 홈페이지)"
                    className="h-13 bg-gray-200 rounded-[12px]"
                  />
                )}

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
                  disabled={!linkUrl.trim() || (selectedPlatform.key === "CUSTOM" && !customLabel.trim())}
                  className="flex-1 bg-purple-700 text-white"
                >
                  추가
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
