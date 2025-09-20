"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Clock,
  Save,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Mock 데이터
const mockStoreData = {
  storeId: "1",
  name: "맛있는 한식당",
  address: "서울시 강남구 테헤란로 123",
  phoneNumber: "02-1234-5678",
  businessNumber: "123-45-67890",
  description: "정성스럽게 만든 한식을 제공하는 가족 운영 식당입니다.",
  categories: ["한식", "찌개류", "볶음류"],
  isActive: true,
  operatingHours: {
    월: { open: "09:00", close: "22:00" },
    화: { open: "09:00", close: "22:00" },
    수: { open: "09:00", close: "22:00" },
    목: { open: "09:00", close: "22:00" },
    금: { open: "09:00", close: "22:00" },
    토: { open: "10:00", close: "21:00" },
    일: { open: "휴무", close: "휴무" },
  },
};

export default function StoreDetailPage() {
  const router = useRouter();
  const [storeData, setStoreData] = useState(mockStoreData);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // TODO: API 호출하여 가게 정보 저장
    console.log("Saving store:", storeData);
    setIsEditing(false);
  };

  const toggleStoreStatus = () => {
    setStoreData({ ...storeData, isActive: !storeData.isActive });
  };

  return (
    <div className="min-h-screen bg-background p-5">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{storeData.name}</h1>
              <p className="text-muted-foreground">가게 관리</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={storeData.isActive}
              onCheckedChange={toggleStoreStatus}
            />
            <span className="text-sm">
              {storeData.isActive ? "운영중" : "휴업중"}
            </span>
          </div>
        </div>

        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <Store className="h-5 w-5" />
                <span>기본 정보</span>
              </CardTitle>
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              >
                {isEditing ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </>
                ) : (
                  "편집"
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">가게명</Label>
              <Input
                id="name"
                value={storeData.name}
                onChange={(e) =>
                  setStoreData({ ...storeData, name: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="address">주소</Label>
              <div className="flex space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-2" />
                <Input
                  id="address"
                  value={storeData.address}
                  onChange={(e) =>
                    setStoreData({ ...storeData, address: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">전화번호</Label>
              <div className="flex space-x-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-2" />
                <Input
                  id="phone"
                  value={storeData.phoneNumber}
                  onChange={(e) =>
                    setStoreData({ ...storeData, phoneNumber: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="business">사업자번호</Label>
              <Input
                id="business"
                value={storeData.businessNumber}
                onChange={(e) =>
                  setStoreData({ ...storeData, businessNumber: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={storeData.description}
                onChange={(e) =>
                  setStoreData({ ...storeData, description: e.target.value })
                }
                disabled={!isEditing}
                rows={3}
              />
            </div>

            <div>
              <Label>카테고리</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {storeData.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
                {isEditing && (
                  <Button variant="ghost" size="sm">
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 운영 시간 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>운영 시간</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(storeData.operatingHours).map(([day, hours]) => (
                <div key={day} className="grid grid-cols-3 gap-4 items-center">
                  <span className="font-medium">{day}요일</span>
                  <Input
                    value={hours.open}
                    onChange={(e) =>
                      setStoreData({
                        ...storeData,
                        operatingHours: {
                          ...storeData.operatingHours,
                          [day]: { ...hours, open: e.target.value },
                        },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="09:00"
                  />
                  <Input
                    value={hours.close}
                    onChange={(e) =>
                      setStoreData({
                        ...storeData,
                        operatingHours: {
                          ...storeData.operatingHours,
                          [day]: { ...hours, close: e.target.value },
                        },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="22:00"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 빠른 작업 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => router.push("/menu")}>
                메뉴 관리
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/feedbacks")}
              >
                피드백 확인
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/menu/add")}
              >
                메뉴 추가
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
