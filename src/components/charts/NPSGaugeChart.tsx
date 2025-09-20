"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * NPS 결과를 위한 타입 정의
 * API 응답과 동일한 구조를 사용합니다
 */
interface NPSResult {
  score: number // -100 ~ 100
  promoterRate: number // 추천자 비율 (%)
  passiveRate: number // 중립자 비율 (%)
  detractorRate: number // 비추천자 비율 (%)
  totalResponses: number // 전체 응답 수
  level?: "CRITICAL" | "ACCEPTABLE" | "GOOD" | "EXCELLENT" | "WORLD_CLASS"
  levelDescription?: string
}

interface NPSGaugeChartProps {
  data: NPSResult
  className?: string
}

/**
 * NPS 게이지 차트 컴포넌트
 * NPS 점수를 반원 게이지 형태로 시각화합니다
 *
 * 사용법:
 * ```tsx
 * import { NPSGaugeChart } from "@/components/charts"
 *
 * // API에서 받은 데이터
 * const npsData = {
 *   score: 45,
 *   promoterRate: 60,
 *   passiveRate: 25,
 *   detractorRate: 15,
 *   totalResponses: 100,
 *   level: "EXCELLENT",
 *   levelDescription: "매우 우수한 수준의 고객 만족도입니다"
 * }
 *
 * <NPSGaugeChart data={npsData} />
 * ```
 */
export function NPSGaugeChart({ data, className }: NPSGaugeChartProps) {
  // NPS 점수를 0-180도 각도로 변환 (-100 = 0도, 0 = 90도, 100 = 180도)
  const angle = ((data.score + 100) / 200) * 180

  // 게이지 데이터 생성
  const gaugeData = [
    { name: "score", value: angle },
    { name: "remaining", value: 180 - angle }
  ]

  // 레벨별 색상 결정
  const getColorByLevel = (level?: string) => {
    switch (level) {
      case "CRITICAL": return "#ef4444" // red-500
      case "ACCEPTABLE": return "#f97316" // orange-500
      case "GOOD": return "#eab308" // yellow-500
      case "EXCELLENT": return "#22c55e" // green-500
      case "WORLD_CLASS": return "#3b82f6" // blue-500
      default: return "#64748b" // slate-500
    }
  }

  const getColorByScore = (score: number) => {
    if (score < -50) return "#ef4444"
    if (score < 0) return "#f97316"
    if (score < 30) return "#eab308"
    if (score < 70) return "#22c55e"
    return "#3b82f6"
  }

  const color = data.level ? getColorByLevel(data.level) : getColorByScore(data.score)

  // 배경 게이지 데이터 (회색 반원)
  const backgroundData = [{ value: 180 }]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>NPS 점수</CardTitle>
        <CardDescription>
          Net Promoter Score (순 추천 점수)
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="relative">
          <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
            <PieChart>
              {/* 배경 반원 */}
              <Pie
                data={backgroundData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
              >
                <Cell fill="#e5e7eb" />
              </Pie>

              {/* 실제 점수 반원 */}
              <Pie
                data={gaugeData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
              >
                <Cell fill={color} />
                <Cell fill="transparent" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* 중앙 점수 표시 */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: "40px" }}>
            <div className="text-center">
              <div className="text-4xl font-bold" style={{ color }}>
                {data.score}
              </div>
              <div className="text-sm text-muted-foreground">NPS Score</div>
            </div>
          </div>
        </div>

        {/* 점수 범위 표시 */}
        <div className="flex justify-between mt-2 px-8">
          <span className="text-xs text-muted-foreground">-100</span>
          <span className="text-xs text-muted-foreground">0</span>
          <span className="text-xs text-muted-foreground">100</span>
        </div>

        {/* 레벨 및 설명 */}
        {data.level && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">평가 수준</span>
              <span
                className="px-2 py-1 text-xs rounded text-white"
                style={{ backgroundColor: color }}
              >
                {data.level}
              </span>
            </div>
            {data.levelDescription && (
              <p className="text-sm text-muted-foreground mt-1">
                {data.levelDescription}
              </p>
            )}
          </div>
        )}

        {/* 구성 비율 */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full" />
              추천자 (9-10점)
            </span>
            <span className="text-sm font-medium">{data.promoterRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full" />
              중립자 (7-8점)
            </span>
            <span className="text-sm font-medium">{data.passiveRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              비추천자 (0-6점)
            </span>
            <span className="text-sm font-medium">{data.detractorRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* 전체 응답 수 */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          전체 응답: {data.totalResponses}명
        </div>
      </CardContent>
    </Card>
  )
}