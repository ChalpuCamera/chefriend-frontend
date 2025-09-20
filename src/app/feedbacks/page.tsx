"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  CheckCircle,
  Filter,
  Search,
  Store,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";

// Mock 피드백 데이터
const mockFeedbacks = [
  {
    id: "1",
    menuName: "김치찌개",
    restaurantName: "맛있는 한식당",
    customerName: "김고객",
    reorderIntention: 9,
    recommendationScore: 9,
    textFeedback:
      "정말 맛있었어요! 김치가 잘 익어서 깊은 맛이 났습니다. 집에서 먹는 것처럼 정말 맛있어요.",
    createdAt: "2024.01.09 14:30",
    hasReceipt: true,
    photoCount: 2,
  },
  {
    id: "2",
    menuName: "떡볶이",
    restaurantName: "김사장 분식",
    customerName: "이손님",
    reorderIntention: 8,
    recommendationScore: 7,
    textFeedback: "양도 많고 좋았어요. 다음에도 주문할게요.",
    createdAt: "2024.01.09 12:15",
    hasReceipt: true,
    photoCount: 1,
  },
  {
    id: "3",
    menuName: "된장찌개",
    restaurantName: "맛있는 한식당",
    customerName: "박고객",
    reorderIntention: 10,
    recommendationScore: 10,
    textFeedback: "진짜 맛있어요! 사장님이 정성스럽게 만드신 게 느껴집니다.",
    createdAt: "2024.01.09 11:00",
    hasReceipt: true,
    photoCount: 3,
  },
  {
    id: "4",
    menuName: "제육볶음",
    restaurantName: "맛있는 한식당",
    customerName: "최손님",
    reorderIntention: 6,
    recommendationScore: 6,
    textFeedback: "조금 짜긴 했지만 전체적으로 괜찮았어요.",
    createdAt: "2024.01.08 19:20",
    hasReceipt: true,
    photoCount: 0,
  },
  {
    id: "5",
    menuName: "김밥",
    restaurantName: "김사장 분식",
    customerName: "정고객",
    reorderIntention: 3,
    recommendationScore: 3,
    textFeedback: "밥이 너무 많고 속재료가 적었어요.",
    createdAt: "2024.01.08 15:45",
    hasReceipt: false,
    photoCount: 0,
  },
];

// Mock 가게 목록
const mockStores = [
  { id: "1", name: "맛있는 한식당" },
  { id: "2", name: "김사장 분식" },
];

export default function FeedbacksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");

  // 필터링 로직
  const filteredFeedbacks = mockFeedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.menuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.textFeedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStore =
      selectedStore === "all" ||
      feedback.restaurantName ===
        (selectedStore === "1" ? "맛있는 한식당" : "김사장 분식");

    return matchesSearch && matchesStore;
  });

  const FeedbackCard = ({
    feedback,
  }: {
    feedback: (typeof mockFeedbacks)[0];
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* 헤더 */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{feedback.menuName}</h3>
                <Badge variant="secondary">{feedback.restaurantName}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {feedback.customerName}님 · {feedback.createdAt}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {feedback.hasReceipt && (
                <Badge variant="outline" className="text-xs">
                  영수증 인증
                </Badge>
              )}
            </div>
          </div>

          {/* 점수 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-xs text-muted-foreground">재주문 의향</p>
              <p className="font-semibold">{feedback.reorderIntention}/10</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-xs text-muted-foreground">추천 점수</p>
              <p className="font-semibold">{feedback.recommendationScore}/10</p>
            </div>
          </div>

          {/* 피드백 내용 */}
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-sm">&ldquo;{feedback.textFeedback}&rdquo;</p>
          </div>

          {/* 인증 정보 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {feedback.hasReceipt && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>영수증 인증</span>
                </div>
              )}
              {feedback.photoCount > 0 && (
                <div className="flex items-center space-x-1">
                  <ImageIcon className="h-3 w-3" />
                  <span>사진 {feedback.photoCount}장</span>
                </div>
              )}
            </div>

            {/* 상세 보기 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log("View detail:", feedback.id)}
            >
              상세 보기
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-5">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">피드백 목록</h1>
          <div className="flex items-center space-x-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            <span>총 {filteredFeedbacks.length}개</span>
          </div>
        </div>

        {/* 필터 섹션 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">필터</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 검색 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="메뉴명, 고객명, 피드백 내용 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 가게 필터 */}
              <div className="flex items-center space-x-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <div className="flex space-x-2">
                  <Button
                    variant={selectedStore === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStore("all")}
                  >
                    전체
                  </Button>
                  {mockStores.map((store) => (
                    <Button
                      key={store.id}
                      variant={
                        selectedStore === store.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedStore(store.id)}
                    >
                      {store.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 날짜 필터 */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex space-x-2">
                  <Button
                    variant={
                      selectedDateRange === "all" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedDateRange("all")}
                  >
                    전체
                  </Button>
                  <Button
                    variant={
                      selectedDateRange === "today" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedDateRange("today")}
                  >
                    오늘
                  </Button>
                  <Button
                    variant={
                      selectedDateRange === "week" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedDateRange("week")}
                  >
                    이번주
                  </Button>
                  <Button
                    variant={
                      selectedDateRange === "month" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedDateRange("month")}
                  >
                    이번달
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 피드백 리스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeedbacks.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))}
        </div>

        {/* 빈 상태 */}
        {filteredFeedbacks.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || selectedStore !== "all"
                  ? "검색 결과가 없습니다"
                  : "아직 피드백이 없습니다"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
