"use client";

import { StoreResponse } from "@/lib/types/api/store";
import { LinkButton } from "./link-button";
import { IoRestaurantOutline } from "react-icons/io5";
import { Card, CardHeader } from "./ui/card";
import { ChevronDown } from "lucide-react";

interface CustomerViewProps {
  storeData: StoreResponse;
  isPreview?: boolean;
}

export function CustomerView({ storeData, isPreview = false }: CustomerViewProps) {
  const links = storeData.links || [];

  return (
    <div className="bg-white w-full mx-auto min-h-screen max-w-[430px]">
      {/* Header Section */}
      <div className="px-6 pt-6 pb-4">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="flex gap-4 items-center">
              <div className="w-8 h-8 bg-[#7790AC] rounded-lg flex items-center justify-center">
                <IoRestaurantOutline className="w-5 h-5 text-white" />
              </div>
              <p className="text-lg text-gray-600 font-medium">
                {storeData.storeName}
              </p>
            </div>
          </div>
        </div>
        <div className="text-center mb-6">
          <p className="text-sub-body-r text-gray-500">공지사항</p>
          {storeData.description && (
            <Card className="p-4 mt-4 rounded-lg">
              <CardHeader className="flex flex-col space-y-1.5 p-6">
                <p className="text-sub-body-r text-gray-500">
                  {storeData.description}
                </p>
              </CardHeader>
            </Card>
          )}
        </div>

        {/* Share Button */}
        <div className="mb-6">
          <button className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium">
            공유하기
          </button>
        </div>
      </div>
      {/* Links Section */}
      <div className="px-6 pb-6">
        <div className="flex flex-col gap-3">
          {links.filter(link => link.isVisible !== false).length > 0 ? (
            links
              .filter(link => link.isVisible !== false)
              .map((link, index) => (
                <LinkButton
                  key={index}
                  linkType={link.linkType}
                  url={link.url}
                  label={link.label || link.customLabel}
                  onClick={isPreview ? () => {} : undefined}
                />
              ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>등록된 링크가 없습니다</p>
            </div>
          )}
        </div>
      </div>
      <div className="px-6 pb-6">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full h-10 px-4 py-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <h2 className="text-lg font-semibold text-gray-800">메뉴</h2>
              <ChevronDown
                className="w-4 h-4 text-gray-600"
              />
            </button>
          </div>
        </div>
    </div>
  );
}
