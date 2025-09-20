"use client"

import * as React from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * JAR 분석 결과를 위한 타입 정의
 * API 응답과 동일한 구조를 사용합니다
 */
interface JARAnalysisData {
  attribute: string
  overallMeanScore: number // Y축: 전체 평균 점수
  totalPenalty: number // X축: 총 페널티
  priorityLevel?: string
  recommendation?: string
  totalResponses?: number
}

interface PriorityMatrixProps {
  data: JARAnalysisData[]
  className?: string
}

/**
 * 우선순위 매트릭스 차트 컴포넌트
 * 개선 우선순위를 2D 매트릭스로 시각화합니다
 *
 * 사용법:
 * ```tsx
 * import { PriorityMatrix } from "@/components/charts"
 *
 * // API에서 받은 데이터
 * const jarData = {
 *   results: [
 *     {
 *       attribute: "SPICINESS",
 *       overallMeanScore: 7.2,
 *       totalPenalty: 2.3,
 *       priorityLevel: "HIGH",
 *       recommendation: "매운맛을 약간 줄이는 것을 고려해보세요"
 *     },
 *     // ... 더 많은 속성들
 *   ]
 * }
 *
 * <PriorityMatrix data={jarData.results} />
 * ```
 */
export function PriorityMatrix({ data, className }: PriorityMatrixProps) {
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
    x: item.totalPenalty,
    y: item.overallMeanScore,
    name: attributeLabels[item.attribute] || item.attribute,
    priorityLevel: item.priorityLevel,
    recommendation: item.recommendation
  }))

  // 우선순위별 색상
  const getColorByPriority = (priority?: string) => {
    switch (priority) {
      case "HIGH": return "#ef4444" // red-500
      case "MEDIUM": return "#eab308" // yellow-500
      case "LOW": return "#22c55e" // green-500
      default: return "#64748b" // slate-500
    }
  }

  // 중간값 계산 (사분면 구분용)
  const avgPenalty = data.reduce((sum, item) => sum + item.totalPenalty, 0) / data.length
  const avgScore = data.reduce((sum, item) => sum + item.overallMeanScore, 0) / data.length

  // 커스텀 툴팁 타입
  interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{
      payload: {
        x: number
        y: number
        name: string
        priorityLevel?: string
      }
    }>
  }

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            평균 점수: {data.y.toFixed(1)}
          </p>
          <p className="text-sm text-muted-foreground">
            페널티: {data.x.toFixed(1)}
          </p>
          {data.priorityLevel && (
            <p className="text-sm mt-1">
              <span
                className="px-1.5 py-0.5 text-xs rounded text-white"
                style={{ backgroundColor: getColorByPriority(data.priorityLevel) }}
              >
                {data.priorityLevel}
              </span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // 커스텀 점 렌더링
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomizedDot = (props: any) => {
    const { cx, cy, payload } = props
    const color = getColorByPriority(payload.priorityLevel)

    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.8} />
        <text
          x={cx}
          y={cy - 12}
          fill={color}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
        >
          {payload.name}
        </text>
      </g>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>개선 우선순위 매트릭스</CardTitle>
        <CardDescription>
          페널티와 평균 점수에 따른 개선 우선순위 분석
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ResponsiveContainer width="100%" height={300} className="sm:h-[300px] md:h-[400px]">
          <ScatterChart
            margin={{ top: 20, right: 30, bottom: 50, left: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="총 페널티"
              label={{ value: "총 페널티 →", position: "insideBottom", offset: -5, fontSize: 12 }}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="평균 점수"
              label={{ value: "평균 점수 →", angle: -90, position: "insideLeft", fontSize: 12 }}
              tick={{ fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 사분면 구분선 */}
            <ReferenceLine x={avgPenalty} stroke="#94a3b8" strokeDasharray="3 3" />
            <ReferenceLine y={avgScore} stroke="#94a3b8" strokeDasharray="3 3" />

            <Scatter
              name="속성"
              data={chartData}
              shape={renderCustomizedDot}
            />
          </ScatterChart>
        </ResponsiveContainer>

        {/* 사분면 설명 */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="font-medium text-sm text-red-700 dark:text-red-400">
              긴급 개선 필요
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              높은 페널티 + 낮은 점수
            </div>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="font-medium text-sm text-yellow-700 dark:text-yellow-400">
              개선 고려
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              낮은 페널티 + 낮은 점수
            </div>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="font-medium text-sm text-orange-700 dark:text-orange-400">
              주의 관찰
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              높은 페널티 + 높은 점수
            </div>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="font-medium text-sm text-green-700 dark:text-green-400">
              현상 유지
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              낮은 페널티 + 높은 점수
            </div>
          </div>
        </div>

        {/* 개선 권고사항 */}
        {data.some(item => item.recommendation) && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">개선 권고사항</div>
            {data
              .filter(item => item.recommendation && item.priorityLevel === "HIGH")
              .map((item, index) => (
                <div key={index} className="p-2 bg-muted rounded text-sm">
                  <span className="font-medium">
                    {attributeLabels[item.attribute] || item.attribute}:
                  </span>{" "}
                  {item.recommendation}
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}