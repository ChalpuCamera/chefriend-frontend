"use client"

import React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CampaignCardProps {
  title: string
  status: "active" | "ended"
  daysRemaining?: number
  evaluationType: "손님 평가 수" | "솔직 평가 수"
  currentCount: number
  totalCount: number
  imageUrl: string
  className?: string
}

export function CampaignCard({
  title,
  status,
  daysRemaining,
  evaluationType,
  currentCount,
  totalCount,
  imageUrl,
  className
}: CampaignCardProps) {
  const progressPercentage = (currentCount / totalCount) * 100

  return (
    <div
      className={cn(
        "flex bg-white rounded-lg overflow-hidden border",
        status === "active" ? "border-purple-800" : "border-gray-400 opacity-70",
        className
      )}
    >
      <div className="flex-1 flex flex-col justify-between p-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-headline-b text-gray-700">{title}</h3>
          <p className="text-body-sb text-purple-700">
            {status === "active" && daysRemaining ? `${daysRemaining}일 남음` : "종료"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sub-body-r text-gray-700">{evaluationType}</span>
            <span className="text-sub-body-r text-gray-700">
              {currentCount}/{totalCount}
            </span>
          </div>
          <div className="h-[9px] bg-gray-200 rounded-[20px] overflow-hidden">
            <div
              className="h-full bg-purple-700 rounded-[20px]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="w-[131px] h-[140px] flex-shrink-0 relative">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    </div>
  )
}