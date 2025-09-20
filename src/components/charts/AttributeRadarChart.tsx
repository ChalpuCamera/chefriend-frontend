"use client"

import * as React from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * JAR 분석 결과를 위한 타입 정의
 * API 응답과 동일한 구조를 사용합니다
 */
interface JARGroup {
  count: number
  percentage: number
  avgSatisfaction: number
}

interface JARAnalysisData {
  attribute: string
  tooLittle: JARGroup
  justRight: JARGroup
  tooMuch: JARGroup
  overallMeanScore: number
}

interface AttributeRadarChartProps {
  data: JARAnalysisData[]
  className?: string
}

/**
 * 속성별 성과 레이더 차트 컴포넌트
 * 각 속성의 적정도를 레이더 차트로 시각화합니다
 *
 * 사용법:
 * ```tsx
 * import { AttributeRadarChart } from "@/components/charts"
 *
 * // API에서 받은 데이터
 * const jarData = {
 *   results: [
 *     {
 *       attribute: "SPICINESS",
 *       tooLittle: { count: 5, percentage: 20, avgSatisfaction: 3.2 },
 *       justRight: { count: 15, percentage: 60, avgSatisfaction: 4.5 },
 *       tooMuch: { count: 5, percentage: 20, avgSatisfaction: 3.0 },
 *       overallMeanScore: 7.2
 *     },
 *     // ... 더 많은 속성들
 *   ]
 * }
 *
 * <AttributeRadarChart data={jarData.results} />
 * ```
 */
export function AttributeRadarChart({ data, className }: AttributeRadarChartProps) {
  // 속성 이름 한글 매핑
  const attributeLabels: Record<string, string> = {
    SPICINESS: "매운맛",
    SWEETNESS: "단맛",
    SALTINESS: "짠맛",
    SOURNESS: "신맛",
    BITTERNESS: "쓴맛",
    UMAMI: "감칠맛",
    PORTION_SIZE: "양",
    TEMPERATURE: "온도",
    DONENESS: "익힘 정도",
    OILINESS: "기름기",
    PRICE: "가격"
  }

  // 차트 데이터 변환
  const chartData = data.map(item => ({
    attribute: attributeLabels[item.attribute] || item.attribute,
    실제: item.justRight.percentage, // 실제 적정 비율
    이상적: 100, // 이상적인 적정 비율 (100%)
    점수: (item.overallMeanScore / 10) * 100 // 평균 점수를 백분율로 변환
  }))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>속성별 균형도</CardTitle>
        <CardDescription>
          각 속성의 적정도 비율을 이상적인 값과 비교
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ResponsiveContainer width="100%" height={400} className="sm:h-[300px] md:h-[400px]">
          <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid
              stroke="#94a3b8"
              strokeDasharray="3 3"
              radialLines={true}
            />
            <PolarAngleAxis
              dataKey="attribute"
              tick={{ fontSize: 10 }}
              className="text-xs sm:text-sm"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tickCount={5}
              tick={{ fontSize: 10 }}
              axisLine={false}
            />

            {/* 이상적인 형태 (반투명) */}
            <Radar
              name="이상적"
              dataKey="이상적"
              stroke="#cbd5e1"
              fill="#cbd5e1"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />

            {/* 실제 적정 비율 */}
            <Radar
              name="실제 적정도"
              dataKey="실제"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.3}
              strokeWidth={2}
            />

            {/* 평균 점수 */}
            <Radar
              name="평균 점수"
              dataKey="점수"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.2}
              strokeWidth={2}
            />

            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px"
              }}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* 성과 요약 */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {data.map((item, index) => {
            const label = attributeLabels[item.attribute] || item.attribute
            const performance = item.justRight.percentage
            const status = performance >= 70 ? "good" : performance >= 50 ? "moderate" : "poor"

            return (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  status === "good"
                    ? "bg-green-50 dark:bg-green-900/20"
                    : status === "moderate"
                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{label}</span>
                  <span className={`text-sm font-bold ${
                    status === "good"
                      ? "text-green-700 dark:text-green-400"
                      : status === "moderate"
                      ? "text-yellow-700 dark:text-yellow-400"
                      : "text-red-700 dark:text-red-400"
                  }`}>
                    {performance.toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  적정: {item.justRight.percentage.toFixed(0)}% |
                  부족: {item.tooLittle.percentage.toFixed(0)}% |
                  과함: {item.tooMuch.percentage.toFixed(0)}%
                </div>
              </div>
            )
          })}
        </div>

        {/* 전체 균형도 평가 */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-2">전체 균형도 평가</div>
          <div className="space-y-1">
            {(() => {
              const avgJustRight = data.reduce((sum, item) => sum + item.justRight.percentage, 0) / data.length
              const balance = Math.min(...data.map(item => item.justRight.percentage)) / Math.max(...data.map(item => item.justRight.percentage))

              return (
                <>
                  <div className="text-xs text-muted-foreground">
                    평균 적정도: {avgJustRight.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    균형 지수: {(balance * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs mt-2">
                    {avgJustRight >= 70
                      ? "✅ 전반적으로 우수한 균형을 유지하고 있습니다"
                      : avgJustRight >= 50
                      ? "⚠️ 일부 속성의 개선이 필요합니다"
                      : "❌ 전반적인 균형 개선이 필요합니다"}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}