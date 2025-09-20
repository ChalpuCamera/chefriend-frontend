"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Store, MapPin, Clock, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock 데이터 - 사장님이 운영하는 가게들
const mockStores = [
  {
    storeId: "1",
    name: "맛있는 한식당",
    address: "서울시 강남구 테헤란로 123",
    category: "한식",
    menuCount: 12,
    totalFeedbacks: 89,
    isActive: true,
    operatingHours: "09:00 - 22:00",
  },
  {
    storeId: "2",
    name: "김사장 분식",
    address: "서울시 서초구 서초대로 456",
    category: "분식",
    menuCount: 8,
    totalFeedbacks: 63,
    isActive: true,
    operatingHours: "08:00 - 20:00",
  },
];

export default function StoreListPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-5">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">가게 관리</h1>
          <Button onClick={() => router.push("/store/add")}>
            <Plus className="mr-2 h-4 w-4" />
            가게 추가
          </Button>
        </div>

        {/* 가게 목록 */}
        <div className="grid gap-4">
          {mockStores.map((store) => (
            <Card
              key={store.storeId}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{store.category}</Badge>
                        {store.isActive ? (
                          <Badge variant="default">운영중</Badge>
                        ) : (
                          <Badge variant="destructive">휴업중</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/store/${store.storeId}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    관리
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* 주소 */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{store.address}</span>
                  </div>

                  {/* 운영시간 */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{store.operatingHours}</span>
                  </div>

                  {/* 통계 */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">메뉴</p>
                      <p className="font-semibold">{store.menuCount}개</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">총 피드백</p>
                      <p className="font-semibold">{store.totalFeedbacks}개</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 가게가 없을 때 */}
        {mockStores.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                등록된 가게가 없습니다
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                첫 번째 가게를 등록해주세요
              </p>
              <Button onClick={() => router.push("/store/add")}>
                <Plus className="mr-2 h-4 w-4" />
                가게 추가하기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
