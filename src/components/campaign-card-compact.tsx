"use client"

import React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CampaignCardCompactProps {
  id: number
  title: string
  imageUrl: string
  daysRemaining: number
  currentCount: number
  totalCount: number
  className?: string
  onClick?: () => void
}

export function CampaignCardCompact({
  title,
  imageUrl,
  daysRemaining,
  currentCount,
  totalCount,
  className,
  onClick
}: CampaignCardCompactProps) {
  const progressPercentage = (currentCount / totalCount) * 100

  return (
    <div
      className={cn(
        "flex flex-col flex-shrink-0 w-[186px] cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Image with badge */}
      <div className="relative w-[186px] h-[124px] rounded-[12px] overflow-hidden bg-gray-200">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          unoptimized
        />
        {/* Days remaining badge */}
        <div className="absolute top-[6px] left-[6px] bg-purple-700 rounded-[11.5px] px-[15px] h-[23px] flex items-center">
          <span className="text-caption-b text-white">{daysRemaining}일 남음</span>
        </div>
      </div>

      {/* Title */}
      <p className="text-body-sb text-gray-700 mt-4 truncate">{title}</p>

      {/* Evaluation count */}
      <div className="flex justify-between items-center mt-2 text-sub-body-r text-gray-700">
        <span>손님 평가 수</span>
        <span className="text-right">{currentCount}/{totalCount}</span>
      </div>

      {/* Progress bar */}
      <div className="h-[9px] bg-gray-200 rounded-[20px] overflow-hidden mt-2">
        <div
          className="h-full bg-purple-700 rounded-[20px] transition-all duration-300"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>
    </div>
  )
}