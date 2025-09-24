"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CampaignCard } from "@/components/campaign-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CustomHeader } from "@/components/ui/custom-header"
import { useGetCampaignsByStore, calculateRemainingDays } from "@/lib/hooks/useCampaign"
import { useMyStores } from "@/lib/hooks/useStore"
import { Skeleton } from "@/components/ui/skeleton"

interface Campaign {
  id: number
  title: string
  status: "active" | "ended"
  daysRemaining?: number
  evaluationType: "손님 평가 수" | "솔직 평가 수"
  currentCount: number
  totalCount: number
  imageUrl: string
}

export default function Page() {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "ACTIVE" | "COMPLETED" | "EXPIRED">("all")

  // 사용자의 가게 정보 가져오기
  const { data: storesData } = useMyStores({ size: 10 })
  const stores = storesData?.content || []
  const currentStore =
    stores.length > 0
      ? stores.reduce((first, store) =>
          store.storeId < first.storeId ? store : first
        )
      : null
  const storeId = currentStore?.storeId

  // 캠페인 데이터 가져오기
  const { data: campaignsData, isLoading } = useGetCampaignsByStore(
    storeId!,
    filter === "all" ? undefined : filter,
    0,
    20,
    !!storeId
  )

  const handleBack = () => {
    router.push("/home")
  }

  const handleNewCampaign = () => {
    router.push("/campaign/add")
  }

  // API 데이터를 UI 형식으로 변환
  const campaigns: Campaign[] = (campaignsData?.content || []).map(campaign => ({
    id: campaign.id,
    title: campaign.foodItemName || campaign.name,
    status: campaign.status === "ACTIVE" ? "active" : "ended" as "active" | "ended",
    daysRemaining: calculateRemainingDays(campaign.endDate),
    evaluationType: "손님 평가 수" as const,
    currentCount: campaign.currentFeedbackCount || 0,
    totalCount: campaign.targetFeedbackCount,
    imageUrl: campaign.foodItemThumbnailUrl || "/kimchi.png"
  }))

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <CustomHeader handleBack={handleBack} title="캠페인 모아보기" />

      {/* Filter Section */}
      <div className="flex items-center justify-between px-4 pb-4 pt-30">
        <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <SelectTrigger className="w-auto h-auto border-none shadow-none px-1 py-1.25 text-body-r text-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체보기</SelectItem>
            <SelectItem value="ACTIVE">진행중</SelectItem>
            <SelectItem value="COMPLETED">완료</SelectItem>
            <SelectItem value="EXPIRED">만료</SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={handleNewCampaign}
          className="text-body-sb text-purple-700"
        >
          신규 등록하기
        </button>
      </div>

      {/* Campaign List */}
      <div className="flex-1 px-4 overflow-y-auto pb-20">
        {isLoading ? (
          // 로딩 상태
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[140px] rounded-[12px]" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-body-r text-gray-500">
              {filter === "ACTIVE" ? "진행 중인" : filter === "COMPLETED" ? "완료된" : filter === "EXPIRED" ? "만료된" : ""} 캠페인이 없습니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4.5">
            {campaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                title={campaign.title}
                status={campaign.status}
                daysRemaining={campaign.daysRemaining}
                evaluationType={campaign.evaluationType}
                currentCount={campaign.currentCount}
                totalCount={campaign.totalCount}
                imageUrl={campaign.imageUrl}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom New Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={handleNewCampaign}
          className="w-full py-3 bg-purple-700 text-white rounded-lg text-body-sb"
        >
          신규 캠페인 등록
        </button>
      </div>
    </div>
  )
}