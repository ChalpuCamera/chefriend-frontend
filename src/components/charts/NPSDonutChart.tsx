"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

/**
 * NPS 결과를 위한 타입 정의
 * API 응답과 동일한 구조를 사용합니다
 */
interface NPSResult {
  score: number
  promoterRate: number
  passiveRate: number
  detractorRate: number
  totalResponses: number
  level?: "CRITICAL" | "ACCEPTABLE" | "GOOD" | "EXCELLENT" | "WORLD_CLASS"
  levelDescription?: string
}

interface NPSDonutChartProps {
  data: NPSResult
  className?: string
}

/**
 * NPS 도넛 차트 컴포넌트
 * NPS 구성 비율(추천자/중립자/비추천자)을 도넛 차트로 시각화합니다
 *
 * 사용법:
 * ```tsx
 * import { NPSDonutChart } from "@/components/charts"
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
 * <NPSDonutChart data={npsData} />
 * ```
 */
export function NPSDonutChart({ data, className }: NPSDonutChartProps) {
  // 차트 데이터 생성
  const chartData = [
    {
      name: "추천자",
      value: data.promoterRate,
      description: "9-10점"
    },
    {
      name: "중립자",
      value: data.passiveRate,
      description: "7-8점"
    },
    {
      name: "비추천자",
      value: data.detractorRate,
      description: "0-6점"
    }
  ]

  const chartConfig = {
    추천자: {
      label: "추천자",
      color: "oklch(var(--chart-2))" // 초록색
    },
    중립자: {
      label: "중립자",
      color: "oklch(var(--chart-3))" // 노란색
    },
    비추천자: {
      label: "비추천자",
      color: "oklch(var(--chart-1))" // 빨간색
    }
  }

  // 색상 매핑
  const COLORS = {
    추천자: "#22c55e",
    중립자: "#eab308",
    비추천자: "#ef4444"
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>NPS 구성 비율</CardTitle>
        <CardDescription>
          고객 만족도 분포
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => (
                      <div className="flex flex-col gap-1">
                        <div className="font-medium">{name}</div>
                        <div className="text-sm">{value}%</div>
                        <div className="text-xs text-muted-foreground">
                          {item.payload.description}
                        </div>
                      </div>
                    )}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 중앙 텍스트 (총 응답 수) */}
        <div
          className="absolute text-center"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }}
        >
          <div className="text-2xl font-bold">{data.totalResponses}</div>
          <div className="text-sm text-muted-foreground">응답</div>
        </div>

        {/* 범례 및 상세 정보 */}
        <div className="mt-6 space-y-3">
          {chartData.map((item, index) => {
            const count = Math.round((item.value / 100) * data.totalResponses)
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">({item.description})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.value.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground">({count}명)</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* NPS 점수 요약 */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">NPS 점수</span>
            <span className="text-lg font-bold">{data.score}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            (추천자 % - 비추천자 %)
          </div>
        </div>
      </CardContent>
    </Card>
  )
}