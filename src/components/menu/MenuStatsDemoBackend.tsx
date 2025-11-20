"use client"

import { useJARAnalysis } from "@/lib/hooks/useJAR"
import type { JARAnalysisResponse, JARAnalysisResult } from "@/lib/types/api/jar"

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

// JAR API 응답을 UI 데이터 형식으로 변환
function transformJARData(jarData: JARAnalysisResponse): CalculatedStats {
  // 평균 평점: overallMeanScore의 평균값
  const avgRating = jarData.results.length > 0
    ? jarData.results.reduce((sum, r) => sum + r.overallMeanScore, 0) / jarData.results.length
    : 0

  // 특정 속성 찾기
  const getAttribute = (attr: string) =>
    jarData.results.find((r) => r.attribute === attr)

  // JARGroup을 TasteStats로 변환 (percentage 사용)
  const mapToTasteStats = (result?: JARAnalysisResult): TasteStats => ({
    too_little: result?.tooLittle.percentage || 0,
    just_right: result?.justRight.percentage || 0,
    too_much: result?.tooMuch.percentage || 0,
  })

  return {
    totalReviews: jarData.npsScore.totalResponses,
    averageRating: avgRating,
    reorderRate: jarData.npsScore.promoterRate, // 추천 비율을 재주문률로 사용
    tastes: {
      spicy: mapToTasteStats(getAttribute("SPICINESS")),
      sweet: mapToTasteStats(getAttribute("SWEETNESS")),
      salty: mapToTasteStats(getAttribute("SALTINESS")),
      sour: mapToTasteStats(getAttribute("SOURNESS")),
    },
    nps: {
      promoters: jarData.npsScore.promoterRate,
      passives: jarData.npsScore.passiveRate,
      detractors: jarData.npsScore.detractorRate,
    },
  }
}

interface TasteItemData {
  label: string
  key: "spicy" | "sweet" | "salty" | "sour"
  stats: TasteStats
}

function getTasteBadge(avgPosition: number) {
  // 바의 위치가 중앙(50%)에서 얼마나 떨어져 있는지 계산
  const distanceFromCenter = Math.abs(avgPosition - 50)

  // 중앙에 가까울수록 녹색 (JAR 방식: 적정이 중앙)
  if (distanceFromCenter <= 10) {
    return { label: "적정", variant: "default" as const, color: "bg-[#40c057]" }
  } else if (distanceFromCenter <= 30) {
    return { label: "주의", variant: "secondary" as const, color: "bg-[#fe951c]" }
  } else {
    return { label: "개선 필요", variant: "destructive" as const, color: "bg-[#f8535a]" }
  }
}

interface MenuStatsDemoBackendProps {
  foodId: number
}

export function MenuStatsDemoBackend({ foodId }: MenuStatsDemoBackendProps) {
  // JAR 분석 데이터 가져오기
  const { data: jarData, isLoading, isError } = useJARAnalysis(foodId)

  // API 데이터를 UI 형식으로 변환
  const stats = jarData ? transformJARData(jarData) : null

  // 로딩 중
  if (isLoading) {
    return (
      <div className="py-3">
        <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  // 에러 또는 데이터 없음
  if (isError || !stats) {
    return null
  }

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

              // 평균 위치 계산: 약함(0) ~ 강함(100) 스펙트럼에서의 위치
              // too_little은 0, just_right는 50, too_much는 100으로 가중 평균
              const avgPosition =
                (tooLittlePercent * 0 +
                  justRightPercent * 50 +
                  tooMuchPercent * 100) /
                100

              const badge = getTasteBadge(avgPosition)

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
                        className={`absolute top-0 h-full rounded-full ${badge.color} transition-all duration-300`}
                        style={{
                          left: 0,
                          width: `${avgPosition.toFixed(1)}%`
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
