"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store,
  User,
  Clock,
  MapPin,
  Phone,
  Save,
  Plus
} from "lucide-react";

// Mock 데이터
const mockRestaurants = [
  {
    id: "1",
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
      일: { open: "휴무", close: "휴무" }
    }
  },
  {
    id: "2",
    name: "김사장 분식",
    address: "서울시 서초구 서초대로 456",
    phoneNumber: "02-9876-5432",
    businessNumber: "987-65-43210",
    description: "맛있는 분식을 저렴하게 즐길 수 있는 곳",
    categories: ["분식", "김밥", "떡볶이"],
    isActive: true,
    operatingHours: {
      월: { open: "08:00", close: "20:00" },
      화: { open: "08:00", close: "20:00" },
      수: { open: "08:00", close: "20:00" },
      목: { open: "08:00", close: "20:00" },
      금: { open: "08:00", close: "20:00" },
      토: { open: "09:00", close: "19:00" },
      일: { open: "휴무", close: "휴무" }
    }
  }
];

const mockProfile = {
  name: "김사장",
  email: "kim@example.com",
  phone: "010-1234-5678",
  joinDate: "2024.01.01"
};

export default function SettingsPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState("1");
  const [profileData, setProfileData] = useState(mockProfile);
  const [restaurantData, setRestaurantData] = useState(mockRestaurants[0]);

  const handleSaveProfile = () => {
    // TODO: API 호출하여 프로필 저장
    console.log("Save profile:", profileData);
  };

  const handleSaveRestaurant = () => {
    // TODO: API 호출하여 가게 정보 저장
    console.log("Save restaurant:", restaurantData);
  };

  const toggleRestaurantStatus = (restaurantId: string) => {
    // TODO: API 호출하여 가게 운영 상태 변경
    console.log("Toggle restaurant status:", restaurantId);
  };

  return (
    <div className="min-h-screen bg-background p-5">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <h1 className="text-2xl font-bold">설정</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="restaurants">가게 관리</TabsTrigger>
            <TabsTrigger value="notifications">알림 설정</TabsTrigger>
          </TabsList>

          {/* 프로필 탭 */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>내 프로필</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label>가입일</Label>
                  <p className="text-sm text-muted-foreground">{profileData.joinDate}</p>
                </div>

                <Button onClick={handleSaveProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 가게 관리 탭 */}
          <TabsContent value="restaurants" className="space-y-4">
            {/* 가게 선택 */}
            <div className="flex space-x-2">
              {mockRestaurants.map((restaurant) => (
                <Button
                  key={restaurant.id}
                  variant={selectedRestaurant === restaurant.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedRestaurant(restaurant.id);
                    setRestaurantData(restaurant);
                  }}
                >
                  {restaurant.name}
                </Button>
              ))}
              <Button variant="ghost" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                가게 추가
              </Button>
            </div>

            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Store className="h-5 w-5" />
                    <span>가게 정보</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="restaurant-active" className="text-sm">운영 상태</Label>
                    <Switch
                      id="restaurant-active"
                      checked={restaurantData.isActive}
                      onCheckedChange={() => toggleRestaurantStatus(restaurantData.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="restaurant-name">가게명</Label>
                  <Input
                    id="restaurant-name"
                    value={restaurantData.name}
                    onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="address">주소</Label>
                  <div className="flex space-x-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-2" />
                    <Input
                      id="address"
                      value={restaurantData.address}
                      onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">전화번호</Label>
                  <div className="flex space-x-2">
                    <Phone className="h-5 w-5 text-muted-foreground mt-2" />
                    <Input
                      id="phone"
                      value={restaurantData.phoneNumber}
                      onChange={(e) => setRestaurantData({ ...restaurantData, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="business-number">사업자번호</Label>
                  <Input
                    id="business-number"
                    value={restaurantData.businessNumber}
                    onChange={(e) => setRestaurantData({ ...restaurantData, businessNumber: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={restaurantData.description}
                    onChange={(e) => setRestaurantData({ ...restaurantData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>카테고리</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {restaurantData.categories.map((category) => (
                      <Badge key={category} variant="secondary">{category}</Badge>
                    ))}
                    <Button variant="ghost" size="sm">
                      <Plus className="h-3 w-3" />
                    </Button>
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
                  {Object.entries(restaurantData.operatingHours).map(([day, hours]) => (
                    <div key={day} className="grid grid-cols-3 gap-4 items-center">
                      <span className="font-medium">{day}요일</span>
                      <Input
                        value={hours.open}
                        onChange={(e) => setRestaurantData({
                          ...restaurantData,
                          operatingHours: {
                            ...restaurantData.operatingHours,
                            [day]: { ...hours, open: e.target.value }
                          }
                        })}
                        placeholder="09:00"
                      />
                      <Input
                        value={hours.close}
                        onChange={(e) => setRestaurantData({
                          ...restaurantData,
                          operatingHours: {
                            ...restaurantData.operatingHours,
                            [day]: { ...hours, close: e.target.value }
                          }
                        })}
                        placeholder="22:00"
                      />
                    </div>
                  ))}
                </div>
                
                <Button className="mt-4" onClick={handleSaveRestaurant}>
                  <Save className="mr-2 h-4 w-4" />
                  가게 정보 저장
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 알림 설정 탭 */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-feedback">새 피드백 알림</Label>
                    <p className="text-sm text-muted-foreground">
                      새로운 피드백이 등록되면 알림을 받습니다
                    </p>
                  </div>
                  <Switch id="new-feedback" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-report">주간 리포트</Label>
                    <p className="text-sm text-muted-foreground">
                      매주 월요일 오전에 주간 성과 리포트를 받습니다
                    </p>
                  </div>
                  <Switch id="weekly-report" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="low-satisfaction">낮은 만족도 알림</Label>
                    <p className="text-sm text-muted-foreground">
                      만족도 3점 이하 피드백 시 즉시 알림
                    </p>
                  </div>
                  <Switch id="low-satisfaction" defaultChecked />
                </div>


                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  알림 설정 저장
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}