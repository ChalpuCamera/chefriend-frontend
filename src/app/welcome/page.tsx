"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { CustomButton } from "@/components/ui/custom-button";
import { useCreateStore } from "@/lib/hooks/useStore";
import { useRouter } from "next/navigation";

export default function Page() {
  const [storeName, setStoreName] = useState("");
  const [isStoreNameFocused, setIsStoreNameFocused] = useState(false);
  const [isAddressFocused, setIsAddressFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const isValid =
    storeName.trim().length >= 1 &&
    address.trim().length >= 1 &&
    description.trim().length >= 1;
  const router = useRouter();
  const createStoreMutation = useCreateStore();

  const handleSubmit = async () => {
    if (!isValid) {
      return;
    }
    try {
      const response = await createStoreMutation.mutateAsync({
        storeName,
        address,
        description,
      });
      if (response.storeId) {
        router.push(`/home`);
      }
    } catch (error) {
      console.error("Store creation failed:", error);
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
          사장님, 운영하고 있는
          <br />
          가게가 어디인가요?
        </h1>
      </div>

      {/* Form Section */}
      <div className="mb-8 space-y-10">
        {/* Step 1: Store Name Input */}
        <div className="space-y-2.5">
          <Label htmlFor="storeName" className="text-body-sb text-black">
            가게 이름
          </Label>
          <Input
            id="storeName"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            onFocus={() => setIsStoreNameFocused(true)}
            onBlur={() => setIsStoreNameFocused(false)}
            className={`h-13 bg-gray-200 rounded-[12px] ${
              isStoreNameFocused ? "ring-2 ring-blue-500" : ""
            }`}
            placeholder=""
          />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="storeName" className="text-body-sb text-black">
            주소
          </Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onFocus={() => setIsAddressFocused(true)}
            onBlur={() => setIsAddressFocused(false)}
            className={`h-13 bg-gray-200 rounded-[12px] ${
              isAddressFocused ? "ring-2 ring-blue-500" : ""
            }`}
            placeholder=""
          />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="description" className="text-body-sb text-black">
            가게 설명
          </Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => setIsDescriptionFocused(true)}
            onBlur={() => setIsDescriptionFocused(false)}
            className={`h-27 bg-gray-200 rounded-[12px] p-4 text-body-r placeholder:text-gray-500 resize-none ${
              isDescriptionFocused ? "ring-2 ring-blue-500" : ""
            }`}
            placeholder=""
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="fixed bottom-6 left-0 right-0">
        <div className="max-w-[430px] mx-auto flex justify-center px-4">
          <CustomButton
            disabled={!isValid || createStoreMutation.isPending}
            onClick={handleSubmit}
          >
            {createStoreMutation.isPending ? "등록 중..." : "등록하기"}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
