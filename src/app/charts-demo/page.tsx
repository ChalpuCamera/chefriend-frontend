"use client"

import * as React from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  JARAnalysisBarChart,
  NPSGaugeChart,
  NPSDonutChart,
  PriorityMatrix,
  AttributeRadarChart,
  TrendLineChart
} from "@/components/charts"

/**
 * 차트 테스트용 데모 페이지
 * 모든 차트 컴포넌트를 목업 데이터로 테스트할 수 있습니다
 *
 * URL: /owner/charts-demo
 */
export default function ChartsDemo() {
  const router = useRouter()

  // JAR 분석 목업 데이터
  const jarAnalysisData = [
    {
      attribute: "SPICINESS",
      tooLittle: { count: 5, percentage: 20, avgSatisfaction: 3.2 },
      justRight: { count: 15, percentage: 60, avgSatisfaction: 4.5 },
      tooMuch: { count: 5, percentage: 20, avgSatisfaction: 3.0 },
      overallMeanScore: 7.2,
      totalResponses: 25,
      totalPenalty: 2.3,
      priorityLevel: "HIGH",
      recommendation: "매운맛을 약간 줄이는 것을 고려해보세요"
    },
    {
      attribute: "SWEETNESS",
      tooLittle: { count: 3, percentage: 12, avgSatisfaction: 3.5 },
      justRight: { count: 20, percentage: 80, avgSatisfaction: 4.8 },
      tooMuch: { count: 2, percentage: 8, avgSatisfaction: 3.8 },
      overallMeanScore: 8.5,
      totalResponses: 25,
      totalPenalty: 1.2,
      priorityLevel: "LOW",
      recommendation: ""
    },
    {
      attribute: "SALTINESS",
      tooLittle: { count: 8, percentage: 32, avgSatisfaction: 3.0 },
      justRight: { count: 12, percentage: 48, avgSatisfaction: 4.2 },
      tooMuch: { count: 5, percentage: 20, avgSatisfaction: 2.8 },
      overallMeanScore: 6.5,
      totalResponses: 25,
      totalPenalty: 3.5,
      priorityLevel: "MEDIUM",
      recommendation: "짠맛의 균형을 맞춰주세요"
    },
    {
      attribute: "PORTION_SIZE",
      tooLittle: { count: 10, percentage: 40, avgSatisfaction: 2.5 },
      justRight: { count: 10, percentage: 40, avgSatisfaction: 4.0 },
      tooMuch: { count: 5, percentage: 20, avgSatisfaction: 3.5 },
      overallMeanScore: 5.5,
      totalResponses: 25,
      totalPenalty: 4.0,
      priorityLevel: "HIGH",
      recommendation: "양을 늘리는 것을 고려해보세요"
    },
    {
      attribute: "PRICE",
      tooLittle: { count: 2, percentage: 8, avgSatisfaction: 4.5 },
      justRight: { count: 18, percentage: 72, avgSatisfaction: 4.3 },
      tooMuch: { count: 5, percentage: 20, avgSatisfaction: 2.5 },
      overallMeanScore: 7.8,
      totalResponses: 25,
      totalPenalty: 2.0,
      priorityLevel: "MEDIUM",
      recommendation: ""
    }
  ]

  // NPS 목업 데이터
  const npsData = {
    score: 45,
    promoterRate: 60,
    passiveRate: 25,
    detractorRate: 15,
    totalResponses: 100,
    level: "EXCELLENT" as const,
    levelDescription: "매우 우수한 수준의 고객 만족도입니다"
  }

  // 트렌드 목업 데이터
  const trendData = [
    {
      date: "2024-01-01",
      overallMeanScore: 7.2,
      npsScore: 35,
      justRightPercentage: 58,
      totalResponses: 25
    },
    {
      date: "2024-01-15",
      overallMeanScore: 7.5,
      npsScore: 40,
      justRightPercentage: 62,
      totalResponses: 30
    },
    {
      date: "2024-02-01",
      overallMeanScore: 7.8,
      npsScore: 42,
      justRightPercentage: 65,
      totalResponses: 35
    },
    {
      date: "2024-02-15",
      overallMeanScore: 8.0,
      npsScore: 45,
      justRightPercentage: 68,
      totalResponses: 40
    },
    {
      date: "2024-03-01",
      overallMeanScore: 8.2,
      npsScore: 48,
      justRightPercentage: 70,
      totalResponses: 45
    },
    {
      date: "2024-03-15",
      overallMeanScore: 8.1,
      npsScore: 45,
      justRightPercentage: 68,
      totalResponses: 42
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <ArrowLeft size={20} />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-lg font-semibold">차트 컴포넌트 데모</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* JAR Analysis Bar Chart */}
        <section>
          <h2 className="text-2xl font-bold mb-4">1. JAR 분석 바 차트</h2>
          <JARAnalysisBarChart data={jarAnalysisData} />
        </section>

        {/* NPS Charts */}
        <section>
          <h2 className="text-2xl font-bold mb-4">2. NPS 차트</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <NPSGaugeChart data={npsData} />
            <NPSDonutChart data={npsData} />
          </div>
        </section>

        {/* Priority Matrix */}
        <section>
          <h2 className="text-2xl font-bold mb-4">3. 우선순위 매트릭스</h2>
          <PriorityMatrix data={jarAnalysisData} />
        </section>

        {/* Attribute Radar Chart */}
        <section>
          <h2 className="text-2xl font-bold mb-4">4. 속성별 균형도 레이더 차트</h2>
          <AttributeRadarChart data={jarAnalysisData} />
        </section>

        {/* Trend Line Chart */}
        <section>
          <h2 className="text-2xl font-bold mb-4">5. 트렌드 라인 차트</h2>
          <TrendLineChart data={trendData} />
        </section>

        {/* Different Trend Configurations */}
        <section>
          <h2 className="text-2xl font-bold mb-4">6. 트렌드 차트 옵션</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">평균 점수만 표시</h3>
              <TrendLineChart
                data={trendData}
                metrics={["overallMeanScore"]}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">NPS 점수만 표시</h3>
              <TrendLineChart
                data={trendData}
                metrics={["npsScore"]}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">적정 비율만 표시</h3>
              <TrendLineChart
                data={trendData}
                metrics={["justRightPercentage"]}
              />
            </div>
          </div>
        </section>

        {/* API Integration Guide */}
        <section className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">API 연동 가이드</h2>
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold mt-4">데이터 가져오기:</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`// useJARAnalysis 훅 사용
const { data: jarData } = useJARAnalysis(foodId)

// 차트에 전달
<JARAnalysisBarChart data={jarData?.results || []} />
<NPSGaugeChart data={jarData?.npsScore} />
<NPSDonutChart data={jarData?.npsScore} />`}</code>
            </pre>

            <h3 className="text-lg font-semibold mt-4">시간 범위 설정:</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`// startDate와 endDate 파라미터 사용
const { data: jarData } = useJARAnalysis(
  foodId,
  "2024-01-01",
  "2024-03-31"
)`}</code>
            </pre>

            <h3 className="text-lg font-semibold mt-4">실제 페이지에서 사용:</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`import { JARAnalysisBarChart, NPSGaugeChart } from "@/components/charts"

// 메뉴 상세 페이지에서
{jarData?.results && (
  <JARAnalysisBarChart data={jarData.results} />
)}

{jarData?.npsScore && (
  <NPSGaugeChart data={jarData.npsScore} />
)}`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  )
}