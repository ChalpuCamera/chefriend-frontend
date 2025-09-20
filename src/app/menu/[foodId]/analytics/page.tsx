"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  BarChart3,
  ArrowLeft,
  Target,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

// Mock 메뉴별 상세 분석 데이터
const mockMenuAnalytics = {
  menu: {
    id: "1",
    name: "김치찌개",
    restaurant: "맛있는 한식당",
    price: 8000,
    category: "찌개류",
  },

  // 핵심 지표
  keyMetrics: {
    totalFeedbacks: 45,
    thisMonthFeedbacks: 12,
    lastMonthFeedbacks: 8,
    growthRate: 50, // 전월 대비 증가율

    averageReorderIntention: 8.5,
    averageRecommendation: 8.2,

    reorderRate: 78, // 재주문 의향 7점 이상 비율
    recommendationRate: 72, // 추천 의향 7점 이상 비율

    totalRevenue: 360000, // 이 메뉴로 발생한 매출
    averageOrdersPerDay: 15,
  },

  // 월별 추이
  monthlyTrend: [
    { month: "8월", feedbacks: 5, reorder: 7.8, recommend: 7.5 },
    { month: "9월", feedbacks: 7, reorder: 8.0, recommend: 7.8 },
    { month: "10월", feedbacks: 8, reorder: 8.2, recommend: 8.0 },
    { month: "11월", feedbacks: 10, reorder: 8.3, recommend: 8.1 },
    { month: "12월", feedbacks: 8, reorder: 8.4, recommend: 8.2 },
    { month: "1월", feedbacks: 12, reorder: 8.5, recommend: 8.2 },
  ],

  // 고객 세그먼트별 분석
  customerSegments: {
    spiceTolerance: {
      low: 15, // 순한맛 선호
      medium: 45, // 보통
      high: 40, // 매운맛 선호
    },
    portionPreference: {
      small: 10, // 소식
      normal: 35, // 보통
      large: 55, // 대식
    },
    ageGroup: {
      "20대": 25,
      "30대": 35,
      "40대": 25,
      "50대+": 15,
    },
  },

  // 피드백 키워드 분석
  feedbackKeywords: {
    positive: [
      { word: "맛있어요", count: 28 },
      { word: "김치가 잘 익었어요", count: 15 },
      { word: "깊은 맛", count: 12 },
      { word: "양이 많아요", count: 10 },
      { word: "돼지고기가 부드러워요", count: 8 },
    ],
    negative: [
      { word: "짜요", count: 5 },
      { word: "양이 적어요", count: 3 },
      { word: "너무 매워요", count: 3 },
      { word: "비싸요", count: 2 },
    ],
  },

  // AI 인사이트
  insights: [
    {
      type: "positive",
      title: "고객 만족도 상승 추세",
      description:
        "최근 3개월간 재주문 의향이 7.8에서 8.5로 꾸준히 상승했습니다",
      impact: "high",
      suggestion:
        "현재 레시피와 조리법을 유지하되, 품질 관리에 더욱 신경써주세요",
    },
    {
      type: "suggestion",
      title: "간 조절 필요",
      description: "일부 고객이 '짜다'는 피드백을 남겼습니다 (11%)",
      impact: "medium",
      suggestion:
        "염도를 5-10% 줄이거나, 별도 간장을 제공하는 방안을 고려해보세요",
    },
    {
      type: "positive",
      title: "재료 품질 호평",
      description: "김치와 돼지고기 품질에 대한 긍정적 평가가 많습니다",
      impact: "high",
      suggestion: "현재 식재료 공급처를 유지하고, 품질 기준을 문서화하세요",
    },
    {
      type: "opportunity",
      title: "가격 대비 만족도 개선 여지",
      description: "양을 늘리면 가격 대비 만족도를 높일 수 있습니다",
      impact: "medium",
      suggestion: "밥 추가 또는 반찬 구성을 개선하여 가성비를 높이세요",
    },
  ],
};

export default function MenuAnalyticsPage({
  params,
}: {
  params: Promise<{ foodId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background p-5">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {mockMenuAnalytics.menu.name} 분석
              </h1>
              <p className="text-muted-foreground">
                {mockMenuAnalytics.menu.restaurant} ·{" "}
                {mockMenuAnalytics.menu.category}
              </p>
            </div>
          </div>

          <Button onClick={() => router.push(`/menu/${resolvedParams.foodId}`)}>
            메뉴 상세
          </Button>
        </div>

        {/* 핵심 지표 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 피드백</p>
                  <p className="text-2xl font-bold">
                    {mockMenuAnalytics.keyMetrics.totalFeedbacks}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    이번달 {mockMenuAnalytics.keyMetrics.thisMonthFeedbacks}개
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">성장률</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-2xl font-bold">
                      {mockMenuAnalytics.keyMetrics.growthRate}%
                    </p>
                    {mockMenuAnalytics.keyMetrics.growthRate > 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    전월 대비
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">재주문 의향</p>
                  <p className="text-2xl font-bold">
                    {mockMenuAnalytics.keyMetrics.averageReorderIntention}/10
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mockMenuAnalytics.keyMetrics.reorderRate}% 긍정
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">추천 점수</p>
                  <p className="text-2xl font-bold">
                    {mockMenuAnalytics.keyMetrics.averageRecommendation}/10
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mockMenuAnalytics.keyMetrics.recommendationRate}% 추천
                  </p>
                </div>
                <ThumbsUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">추이 분석</TabsTrigger>
            <TabsTrigger value="segments">고객 분석</TabsTrigger>
            <TabsTrigger value="feedback">피드백 분석</TabsTrigger>
            <TabsTrigger value="insights">AI 인사이트</TabsTrigger>
          </TabsList>

          {/* 추이 분석 탭 */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>월별 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 간단한 차트 표현 */}
                  <div className="grid grid-cols-6 gap-2">
                    {mockMenuAnalytics.monthlyTrend.map((month) => (
                      <div key={month.month} className="text-center">
                        <div className="h-20 flex items-end">
                          <div
                            className="w-full bg-primary rounded-t"
                            style={{
                              height: `${(month.feedbacks / 12) * 100}%`,
                              minHeight: "4px",
                            }}
                          />
                        </div>
                        <p className="text-xs mt-1">{month.month}</p>
                        <p className="text-xs font-semibold">
                          {month.feedbacks}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* 지표별 추이 */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium mb-2">
                        재주문 의향 추이
                      </p>
                      <div className="space-y-1">
                        {mockMenuAnalytics.monthlyTrend
                          .slice(-3)
                          .map((month) => (
                            <div
                              key={month.month}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {month.month}
                              </span>
                              <span className="font-medium">
                                {month.reorder}/10
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">추천 점수 추이</p>
                      <div className="space-y-1">
                        {mockMenuAnalytics.monthlyTrend
                          .slice(-3)
                          .map((month) => (
                            <div
                              key={month.month}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {month.month}
                              </span>
                              <span className="font-medium">
                                {month.recommend}/10
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 고객 분석 탭 */}
          <TabsContent value="segments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">맛 선호도</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">순한맛</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-orange-400 h-2 rounded-full"
                            style={{
                              width: `${mockMenuAnalytics.customerSegments.spiceTolerance.low}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {
                            mockMenuAnalytics.customerSegments.spiceTolerance
                              .low
                          }
                          %
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">보통</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${mockMenuAnalytics.customerSegments.spiceTolerance.medium}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {
                            mockMenuAnalytics.customerSegments.spiceTolerance
                              .medium
                          }
                          %
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">매운맛</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${mockMenuAnalytics.customerSegments.spiceTolerance.high}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {
                            mockMenuAnalytics.customerSegments.spiceTolerance
                              .high
                          }
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">양 선호도</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">소식</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-400 h-2 rounded-full"
                            style={{
                              width: `${mockMenuAnalytics.customerSegments.portionPreference.small}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {
                            mockMenuAnalytics.customerSegments.portionPreference
                              .small
                          }
                          %
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">보통</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${mockMenuAnalytics.customerSegments.portionPreference.normal}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {
                            mockMenuAnalytics.customerSegments.portionPreference
                              .normal
                          }
                          %
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">대식</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${mockMenuAnalytics.customerSegments.portionPreference.large}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {
                            mockMenuAnalytics.customerSegments.portionPreference
                              .large
                          }
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">연령대</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      mockMenuAnalytics.customerSegments.ageGroup
                    ).map(([age, percentage]) => (
                      <div
                        key={age}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{age}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 피드백 분석 탭 */}
          <TabsContent value="feedback" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span>긍정 키워드</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockMenuAnalytics.feedbackKeywords.positive.map(
                      (keyword) => (
                        <div
                          key={keyword.word}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm">{keyword.word}</span>
                          <Badge variant="secondary">{keyword.count}회</Badge>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    <span>개선 필요 키워드</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockMenuAnalytics.feedbackKeywords.negative.map(
                      (keyword) => (
                        <div
                          key={keyword.word}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm">{keyword.word}</span>
                          <Badge variant="outline">{keyword.count}회</Badge>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI 인사이트 탭 */}
          <TabsContent value="insights" className="space-y-4">
            {mockMenuAnalytics.insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {insight.type === "positive" && (
                        <div className="p-2 bg-green-100 rounded-full">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                      {insight.type === "suggestion" && (
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                        </div>
                      )}
                      {insight.type === "opportunity" && (
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge
                          variant={
                            insight.impact === "high"
                              ? "destructive"
                              : insight.impact === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {insight.impact === "high"
                            ? "중요"
                            : insight.impact === "medium"
                            ? "보통"
                            : "낮음"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      <div className="p-3 bg-muted/50 rounded">
                        <p className="text-sm">
                          <span className="font-medium">💡 제안: </span>
                          {insight.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
