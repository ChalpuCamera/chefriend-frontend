"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { CustomButton } from "@/components/ui/custom-button";
import { useCreateStore, useCheckSiteLink, useMyStores } from "@/lib/hooks/useStore";
import { useRouter } from "next/navigation";
import { AddressSearch } from "@/components/address-search";

export default function Page() {
  const [siteLink, setSiteLink] = useState("");
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [autoCreateMenus, setAutoCreateMenus] = useState(true);

  const [siteLinkChecked, setSiteLinkChecked] = useState(false);
  const [siteLinkError, setSiteLinkError] = useState("");
  const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);

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

    if (siteLink.trim().length < 4) {
      setSiteLinkError("사이트 주소는 최소 4글자 이상이어야 합니다");
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

  const isValid =
    siteLinkChecked &&
    storeName.trim().length >= 1 &&
    address.trim().length >= 1 &&
    description.trim().length >= 1;

  const handleSubmit = async () => {
    if (!isValid) {
      return;
    }

    try {
      const response = await createStoreMutation.mutateAsync({
        siteLink,
        storeName,
        address,
        description,
        requiredStampsForCoupon: 10,  // 기본값으로 고정
        displayTemplate: 1,            // 기본 템플릿으로 고정
        links: [],                     // 빈 배열
        autoCreateMenus,               // 메뉴 자동 등록 옵션
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

        {/* 공지사항 */}
        <div className="space-y-2.5">
          <Label htmlFor="description" className="text-body-sb text-black">
            공지사항
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-27 bg-gray-200 rounded-[12px] p-4 text-body-r placeholder:text-gray-500 resize-none"
            placeholder="공지사항을 입력해주세요"
            rows={4}
          />
        </div>

        {/* 메뉴 자동 등록 */}
        <div className="space-y-2.5">
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-[12px] border border-purple-200">
            <Checkbox
              id="autoCreateMenus"
              checked={autoCreateMenus}
              onCheckedChange={(checked) => setAutoCreateMenus(checked as boolean)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor="autoCreateMenus"
                className="text-body-sb text-gray-800 cursor-pointer"
              >
                메뉴 자동 등록 옵션
              </Label>
              <p className="text-caption-r text-gray-600 mt-1.5 leading-relaxed">
                지도 링크를 하나라도 등록하시면 가게의 메뉴가 자동으로 추가됩니다.
              </p>
            </div>
          </div>
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
    </div>
  );
}
