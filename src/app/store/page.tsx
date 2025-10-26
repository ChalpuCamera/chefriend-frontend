"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Store, MapPin, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMyStores } from "@/lib/hooks/useStore";

export default function StoreListPage() {
  const router = useRouter();

  // Get user's stores
  const { data: storesData, isLoading } = useMyStores();
  const stores = storesData?.content || [];

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
        {isLoading ? (
          <div className="text-center py-8">
            <p>가게 정보를 불러오는 중...</p>
          </div>
        ) : stores.length > 0 ? (
          <div className="grid gap-4">
            {stores.map((store) => (
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
                        <CardTitle className="text-lg">
                          {store.storeName}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="default">운영중</Badge>
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
                    {store.address && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{store.address}</span>
                      </div>
                    )}

                    {/* 설명 */}
                    {store.description && (
                      <div className="text-sm text-muted-foreground">
                        <p>{store.description}</p>
                      </div>
                    )}

                    {/* 링크 정보 */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          배달 연동
                        </p>
                        <p className="text-xs">
                          {store.links?.some(link =>
                            ['BAEMIN', 'YOGIYO', 'COUPANGEATS'].includes(link.linkType)
                          )
                            ? "연동됨"
                            : "미연동"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">매장 ID</p>
                        <p className="font-semibold text-xs">
                          #{store.storeId}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Empty state
          <Card className="min-h-48">
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
                가게 등록하기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
