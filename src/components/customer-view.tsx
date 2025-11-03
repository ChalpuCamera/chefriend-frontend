"use client";

import { StoreResponse } from "@/lib/types/api/store";
import type { StoreNoticeResponse } from "@/lib/types/api/notice";
import { LinkButton } from "./link-button";
import { IoRestaurantOutline } from "react-icons/io5";
import { Card, CardContent } from "./ui/card";
import { ChevronDown } from "lucide-react";

interface CustomerViewProps {
  storeData: StoreResponse;
  notices?: StoreNoticeResponse[];
}

export function CustomerView({ storeData, notices = [] }: CustomerViewProps) {
  const links = storeData.links || [];

  // 최신순 정렬
  const sortedNotices =
    notices.length > 0
      ? [...notices].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      : [];
  const latestNotice = notices.find((notice) => notice.isRepresentative) || sortedNotices[0];

  return (
    <div className="bg-white w-full mx-auto min-h-screen max-w-[430px]">
      {/* Header Section */}
      <div className="px-6 pt-6 pb-4">
        <div className="text-center mb-6">
          <div className="mb-3">
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

        {/* 공지사항 섹션 */}
        {latestNotice && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              공지사항
            </h2>
            <div className="space-y-3">
              {/* 최신 공지사항 1개 */}
              <Card className="rounded-lg border border-gray-200 h-[110px] flex flex-col overflow-hidden py-0">
                <CardContent className="!p-4 h-full flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-2 text-base flex-shrink-0 truncate">
                    {latestNotice.title}
                  </h3>
                  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <div className="flex items-start gap-2">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap break-words line-clamp-1">
                        {latestNotice.body}
                      </p>
                    </div>
                  </div>
                  <div className="relative mt-2 flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(latestNotice.createdAt).toLocaleDateString(
                        "ko-KR"
                      )}
                    </p>
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 나머지 공지사항들 표시 */}
              {/* {sortedNotices.length > 1 && (
                <details className="group">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium list-none flex items-center justify-center py-2">
                    <span>
                      이전 공지사항 {sortedNotices.length - 1}개 더보기
                    </span>
                  </summary>
                </details>
              )} */}
            </div>
          </div>
        )}

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
          {links.filter((link) => link.isVisible !== false).length > 0 ? (
            links
              .filter((link) => link.isVisible !== false)
              .map((link, index) => (
                <LinkButton
                  key={index}
                  linkType={link.linkType}
                  label={link.label || link.customLabel}
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
          <button className="w-full h-10 px-4 py-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">메뉴</h2>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
