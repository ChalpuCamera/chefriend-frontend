"use client"

import * as React from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"

/**
 * 트렌드 데이터를 위한 타입 정의
 */
interface TrendData {
  date: string // "2024-01-15" 형식
  overallMeanScore?: number
  npsScore?: number
  justRightPercentage?: number
  totalResponses?: number
}

interface TrendLineChartProps {
  data: TrendData[]
  metrics?: ("overallMeanScore" | "npsScore" | "justRightPercentage")[]
  className?: string
}

/**
 * 시간별 추이 라인 차트 컴포넌트
 * 메뉴 평가 지표의 시간별 변화를 시각화합니다
 *
 * 사용법:
 * ```tsx
 * import { TrendLineChart } from "@/components/charts"
 *
 * // API에서 받은 시계열 데이터
 * const trendData = [
 *   {
 *     date: "2024-01-01",
 *     overallMeanScore: 7.2,
 *     npsScore: 45,
 *     justRightPercentage: 65,
 *     totalResponses: 25
 *   },
 *   {
 *     date: "2024-01-15",
 *     overallMeanScore: 7.5,
 *     npsScore: 50,
 *     justRightPercentage: 68,
 *     totalResponses: 30
 *   }
 * ]
 *
 * <TrendLineChart
 *   data={trendData}
 *   metrics={["overallMeanScore", "npsScore"]}
 * />
 * ```
 */
export function TrendLineChart({
  data,
  metrics = ["overallMeanScore", "npsScore", "justRightPercentage"],
  className
}: TrendLineChartProps) {
  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 차트 데이터 변환
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    fullDate: item.date,
    "평균 점수": item.overallMeanScore ? (item.overallMeanScore * 10) : undefined,
    "NPS 점수": item.npsScore,
    "적정 비율": item.justRightPercentage,
    totalResponses: item.totalResponses
  }))

  const chartConfig = {
    "평균 점수": {
      label: "평균 점수",
      color: "oklch(var(--chart-1))"
    },
    "NPS 점수": {
      label: "NPS 점수",
      color: "oklch(var(--chart-2))"
    },
    "적정 비율": {
      label: "적정 비율 (%)",
      color: "oklch(var(--chart-3))"
    }
  }

  // 표시할 라인 결정
  const linesToShow = {
    "평균 점수": metrics.includes("overallMeanScore"),
    "NPS 점수": metrics.includes("npsScore"),
    "적정 비율": metrics.includes("justRightPercentage")
  }

  // 커스텀 툴팁 타입
  interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{
      color: string
      name: string
      value: number
      payload: {
        date: string
        fullDate: string
        totalResponses?: number
      }
    }>
  }

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{data.fullDate}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-sm" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="text-sm font-medium">
                {entry.value?.toFixed(1)}
                {entry.name === "적정 비율" ? "%" : ""}
              </span>
            </div>
          ))}
          {data.totalResponses && (
            <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
              응답 수: {data.totalResponses}명
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>평가 지표 추이</CardTitle>
        <CardDescription>
          시간에 따른 메뉴 평가 지표 변화
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer config={chartConfig} className="h-[300px] sm:h-[350px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "currentColor", fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "currentColor", fontSize: 10 }}
                domain={[0, 100]}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "12px"
                }}
              />

              {linesToShow["평균 점수"] && (
                <Line
                  type="monotone"
                  dataKey="평균 점수"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {linesToShow["NPS 점수"] && (
                <Line
                  type="monotone"
                  dataKey="NPS 점수"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {linesToShow["적정 비율"] && (
                <Line
                  type="monotone"
                  dataKey="적정 비율"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 통계 요약 */}
        {data.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {metrics.includes("overallMeanScore") && data[0].overallMeanScore !== undefined && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">평균 점수 변화</div>
                <div className="text-sm font-medium mt-1">
                  {(() => {
                    const first = data[0].overallMeanScore!
                    const last = data[data.length - 1].overallMeanScore!
                    const change = last - first
                    return (
                      <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
                        {change >= 0 ? "+" : ""}{(change * 10).toFixed(1)}점
                      </span>
                    )
                  })()}
                </div>
              </div>
            )}

            {metrics.includes("npsScore") && data[0].npsScore !== undefined && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">NPS 변화</div>
                <div className="text-sm font-medium mt-1">
                  {(() => {
                    const first = data[0].npsScore!
                    const last = data[data.length - 1].npsScore!
                    const change = last - first
                    return (
                      <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
                        {change >= 0 ? "+" : ""}{change.toFixed(0)}점
                      </span>
                    )
                  })()}
                </div>
              </div>
            )}

            {metrics.includes("justRightPercentage") && data[0].justRightPercentage !== undefined && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">적정 비율 변화</div>
                <div className="text-sm font-medium mt-1">
                  {(() => {
                    const first = data[0].justRightPercentage!
                    const last = data[data.length - 1].justRightPercentage!
                    const change = last - first
                    return (
                      <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
                        {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                      </span>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 기간 정보 */}
        {data.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground text-center">
            {data[0].date} ~ {data[data.length - 1].date} ({data.length}개 데이터 포인트)
          </div>
        )}
      </CardContent>
    </Card>
  )
}