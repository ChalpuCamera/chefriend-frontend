"use client"

import { mockReviews } from "@/data/mockReviews"
import { useMemo } from "react"

interface TasteStats {
  too_little: number
  just_right: number
  too_much: number
}

interface CalculatedStats {
  totalReviews: number
  averageRating: number
  reorderRate: number
  tastes: {
    spicy: TasteStats
    sweet: TasteStats
    salty: TasteStats
    sour: TasteStats
  }
  nps: {
    promoters: number
    passives: number
    detractors: number
  }
}

function calculateStats(): CalculatedStats {
  const totalReviews = mockReviews.length

  // 평균 평점 계산
  const totalRating = mockReviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / totalReviews

  // 재주문률 계산
  const reorderCount = mockReviews.filter((review) => review.willReorder).length
  const reorderRate = (reorderCount / totalReviews) * 100

  // 맛 속성 통계 계산
  const tastes = {
    spicy: { too_little: 0, just_right: 0, too_much: 0 },
    sweet: { too_little: 0, just_right: 0, too_much: 0 },
    salty: { too_little: 0, just_right: 0, too_much: 0 },
    sour: { too_little: 0, just_right: 0, too_much: 0 },
  }

  mockReviews.forEach((review) => {
    Object.keys(tastes).forEach((taste) => {
      const level = review.tastes[taste as keyof typeof review.tastes]
      tastes[taste as keyof typeof tastes][level]++
    })
  })

  // NPS 계산
  const promoters = mockReviews.filter((r) => r.nps >= 9).length
  const passives = mockReviews.filter((r) => r.nps >= 7 && r.nps <= 8).length
  const detractors = mockReviews.filter((r) => r.nps <= 6).length

  return {
    totalReviews,
    averageRating,
    reorderRate,
    tastes,
    nps: {
      promoters: (promoters / totalReviews) * 100,
      passives: (passives / totalReviews) * 100,
      detractors: (detractors / totalReviews) * 100,
    },
  }
}

interface TasteItemData {
  label: string
  key: "spicy" | "sweet" | "salty" | "sour"
  stats: TasteStats
}

function getTasteBadge(stats: TasteStats) {
  const total = stats.too_little + stats.just_right + stats.too_much
  const tooLittlePercent = (stats.too_little / total) * 100
  const tooMuchPercent = (stats.too_much / total) * 100

  // tooLittle이나 tooMuch의 비율이 높으면 문제
  const problemRatio = tooLittlePercent + tooMuchPercent

  if (problemRatio > 60) {
    return { label: "개선 필요", variant: "destructive" as const, color: "bg-[#f8535a]" }
  } else if (problemRatio > 40) {
    return { label: "주의", variant: "secondary" as const, color: "bg-[#fe951c]" }
  } else {
    return { label: "적정", variant: "default" as const, color: "bg-[#40c057]" }
  }
}

export function MenuStatsDemo() {
  const stats = useMemo(() => calculateStats(), [])

  const tasteItems: TasteItemData[] = [
    { label: "맵기", key: "spicy", stats: stats.tastes.spicy },
    { label: "단맛", key: "sweet", stats: stats.tastes.sweet },
    { label: "짠맛", key: "salty", stats: stats.tastes.salty },
    { label: "신맛", key: "sour", stats: stats.tastes.sour },
  ]

  return (
    <>
      {/* Menu Stats Cards */}
      <div className="mb-2">
        <h2 className="text-sub-title-b text-gray-800 mb-5">
          메뉴 평가 리포트
        </h2>
        <div className="flex gap-2">
          <div className="flex-1 bg-white border border-gray-300 rounded-lg p-3">
            <p className="text-sub-body-r text-gray-700">평가 수</p>
            <p className="text-title-2 text-gray-800 mt-1">
              {stats.totalReviews}
            </p>
          </div>
          <div className="flex-1 bg-white border border-gray-300 rounded-lg p-3">
            <p className="text-sub-body-r text-gray-700">평점</p>
            <p className="text-title-2 text-gray-800 mt-1">
              {stats.averageRating.toFixed(1)}
            </p>
          </div>
          <div className="flex-1 bg-white border border-gray-300 rounded-lg p-3">
            <p className="text-sub-body-r text-gray-700">재주문률</p>
            <p className="text-title-2 text-gray-800 mt-1">
              {Math.round(stats.reorderRate)}%
            </p>
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="py-3 flex flex-col gap-4">
        {/* Taste Attributes Graph */}
        <div className="relative bg-white rounded-[8px] overflow-hidden">
          <div className="divide-y divide-gray-100">
            {tasteItems.map((item, index) => {
              const total =
                item.stats.too_little + item.stats.just_right + item.stats.too_much
              const tooLittlePercent = (item.stats.too_little / total) * 100
              const justRightPercent = (item.stats.just_right / total) * 100
              const tooMuchPercent = (item.stats.too_much / total) * 100
              const badge = getTasteBadge(item.stats)

              // 평균 위치 계산: 약함(0) ~ 강함(100) 스펙트럼에서의 위치
              // too_little은 0, just_right는 50, too_much는 100으로 가중 평균
              const avgPosition =
                (tooLittlePercent * 0 +
                  justRightPercent * 50 +
                  tooMuchPercent * 100) /
                100

              return (
                <div key={index} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[17px] font-medium text-gray-700">
                      {item.label}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>약함</span>
                      <span>적정</span>
                      <span>강함</span>
                    </div>
                    <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 h-full rounded-full ${badge.color}`}
                        style={{
                          left: 0,
                          width: `${avgPosition}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* NPS Section */}
        <div className="bg-white rounded-[8px] p-4">
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-[7px] border border-gray-200 p-3">
              <p className="text-xs font-semibold text-[#008214] mb-1">추천</p>
              <p className="text-xl font-bold text-[#008214]">
                {Math.round(stats.nps.promoters)}%
              </p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-[7px] border border-gray-200 p-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">중립</p>
              <p className="text-xl font-bold text-gray-700">
                {Math.round(stats.nps.passives)}%
              </p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-[7px] border border-gray-200 p-3">
              <p className="text-xs font-semibold text-[#d02532] mb-1">비추천</p>
              <p className="text-xl font-bold text-[#d02532]">
                {Math.round(stats.nps.detractors)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
