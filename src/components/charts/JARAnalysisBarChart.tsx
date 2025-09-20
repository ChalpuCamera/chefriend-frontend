"use client"

import * as React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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
  attribute: string // "SPICINESS", "SWEETNESS", "SALTINESS" 등
  tooLittle: JARGroup
  justRight: JARGroup
  tooMuch: JARGroup
  overallMeanScore: number
  totalResponses: number
  totalPenalty: number
  priorityLevel?: string
  recommendation?: string
}

interface JARAnalysisBarChartProps {
  data: JARAnalysisData[]
  className?: string
}

/**
 * JAR 분석 바 차트 컴포넌트
 *
 * 사용법:
 * ```tsx
 * import { JARAnalysisBarChart } from "@/components/charts"
 *
 * // API에서 받은 데이터
 * const jarData = {
 *   results: [
 *     {
 *       attribute: "SPICINESS",
 *       tooLittle: { count: 5, percentage: 20, avgSatisfaction: 3.2 },
 *       justRight: { count: 15, percentage: 60, avgSatisfaction: 4.5 },
 *       tooMuch: { count: 5, percentage: 20, avgSatisfaction: 3.0 },
 *       overallMeanScore: 7.2,
 *       totalResponses: 25,
 *       totalPenalty: 2.3,
 *       priorityLevel: "HIGH",
 *       recommendation: "매운맛을 약간 줄이는 것을 고려해보세요"
 *     }
 *   ]
 * }
 *
 * <JARAnalysisBarChart data={jarData.results} />
 * ```
 */
export function JARAnalysisBarChart({ data, className }: JARAnalysisBarChartProps) {
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
    "부족": item.tooLittle.percentage,
    "적정": item.justRight.percentage,
    "과함": item.tooMuch.percentage,
    avgSatisfaction: {
      tooLittle: item.tooLittle.avgSatisfaction,
      justRight: item.justRight.avgSatisfaction,
      tooMuch: item.tooMuch.avgSatisfaction
    },
    recommendation: item.recommendation,
    priorityLevel: item.priorityLevel,
    totalResponses: item.totalResponses
  }))

  const chartConfig = {
    "부족": {
      label: "부족",
      color: "oklch(var(--chart-1))" // 빨강 계열
    },
    "적정": {
      label: "적정",
      color: "oklch(var(--chart-2))" // 초록 계열
    },
    "과함": {
      label: "과함",
      color: "oklch(var(--chart-3))" // 주황 계열
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>JAR 분석 결과</CardTitle>
        <CardDescription>
          각 속성별 적정도 평가 (Just About Right Analysis)
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer config={chartConfig} className="h-[300px] sm:h-[350px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={chartData}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis dataKey="attribute" type="category" width={70} tick={{ fontSize: 11 }} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => {
                      const satisfaction = item.payload.avgSatisfaction
                      return (
                        <div className="flex flex-col gap-1">
                          <div>{`${name}: ${value}%`}</div>
                          {satisfaction && (
                            <div className="text-xs text-muted-foreground">
                              만족도: {satisfaction[name === "부족" ? "tooLittle" : name === "적정" ? "justRight" : "tooMuch"]?.toFixed(1)}
                            </div>
                          )}
                        </div>
                      )
                    }}
                  />
                }
              />
              <Legend />
              <Bar dataKey="부족" stackId="a" fill={chartConfig["부족"].color} />
              <Bar dataKey="적정" stackId="a" fill={chartConfig["적정"].color} />
              <Bar dataKey="과함" stackId="a" fill={chartConfig["과함"].color} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 개선 권고사항 표시 */}
        <div className="mt-4 space-y-2">
          {data.filter(item => item.recommendation).map((item, index) => (
            <div key={index} className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">
                  {attributeLabels[item.attribute] || item.attribute}
                </span>
                {item.priorityLevel && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.priorityLevel === "HIGH" ? "bg-red-100 text-red-700" :
                    item.priorityLevel === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {item.priorityLevel}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{item.recommendation}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}