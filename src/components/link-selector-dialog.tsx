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
  | "instagramLink";

interface Platform {
  key: PlatformType;
  name: string;
  icon: string;
  placeholder: string;
}

const platforms: Platform[] = [
  { key: "naverLink", name: "네이버 지도", icon: "/naver.png", placeholder: "https://map.naver.com/..." },
  { key: "kakaoLink", name: "카카오맵", icon: "/kakaomap.png", placeholder: "https://place.map.kakao.com/..." },
  { key: "yogiyoLink", name: "요기요", icon: "/yogiyo.png", placeholder: "https://yogiyo.com/..." },
  { key: "baeminLink", name: "배달의민족", icon: "/baemin.png", placeholder: "https://baemin.com/..." },
  { key: "coupangeatsLink", name: "쿠팡이츠", icon: "/coupangeats.png", placeholder: "https://coupangeats.com/..." },
  { key: "kakaoTalkLink", name: "카카오톡 채널", icon: "/kakaotalk.png", placeholder: "https://pf.kakao.com/..." },
  { key: "instagramLink", name: "인스타그램", icon: "/instagram.png", placeholder: "https://instagram.com/..." },
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

  const handlePlatformClick = (platform: Platform) => {
    // 이미 추가된 링크가 있으면 선택하지 않음
    if (existingLinks[platform.key]) return;

    setSelectedPlatform(platform);
    setLinkUrl("");
  };

  const handleSubmit = () => {
    if (selectedPlatform && linkUrl.trim()) {
      onLinkAdd(selectedPlatform.key, linkUrl.trim());
      setSelectedPlatform(null);
      setLinkUrl("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSelectedPlatform(null);
    setLinkUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>링크 추가</DialogTitle>
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

            <div>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder={selectedPlatform.placeholder}
                className="h-13 bg-gray-200 rounded-[12px]"
              />
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
