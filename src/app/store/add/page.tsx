"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Store } from "lucide-react";

export default function AddStorePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    address: "",
    phone: "",
    description: "",
    openTime: "09:00",
    closeTime: "21:00",
    closedDays: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 호출
    console.log("가게 등록:", formData);
    router.push("/store");
  };

  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <div className="min-h-screen bg-background p-5">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">새 가게 등록</h1>
            <p className="text-muted-foreground">가게 정보를 입력해주세요</p>
          </div>
        </div>

        {/* 등록 폼 */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>가게 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 가게명 */}
              <div>
                <Label htmlFor="name">가게명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="예: 맛있는 한식당"
                  required
                />
              </div>

              {/* 카테고리 */}
              <div>
                <Label htmlFor="category">카테고리 *</Label>
                <select
                  id="category"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="한식">한식</option>
                  <option value="중식">중식</option>
                  <option value="일식">일식</option>
                  <option value="양식">양식</option>
                  <option value="분식">분식</option>
                  <option value="카페">카페</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              {/* 주소 */}
              <div>
                <Label htmlFor="address">주소 *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="예: 서울시 강남구 테헤란로 123"
                  required
                />
              </div>

              {/* 전화번호 */}
              <div>
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="예: 02-1234-5678"
                />
              </div>

              {/* 설명 */}
              <div>
                <Label htmlFor="description">가게 소개</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="가게에 대한 간단한 소개를 작성해주세요"
                  rows={4}
                />
              </div>

              {/* 운영시간 */}
              <div>
                <Label>운영시간</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={formData.openTime}
                    onChange={(e) =>
                      setFormData({ ...formData, openTime: e.target.value })
                    }
                    className="w-32"
                  />
                  <span>~</span>
                  <Input
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) =>
                      setFormData({ ...formData, closeTime: e.target.value })
                    }
                    className="w-32"
                  />
                </div>
              </div>

              {/* 휴무일 */}
              <div>
                <Label>휴무일</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {weekDays.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={
                        formData.closedDays.includes(day)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        if (formData.closedDays.includes(day)) {
                          setFormData({
                            ...formData,
                            closedDays: formData.closedDays.filter(
                              (d) => d !== day
                            ),
                          });
                        } else {
                          setFormData({
                            ...formData,
                            closedDays: [...formData.closedDays, day],
                          });
                        }
                      }}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
                {formData.closedDays.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    휴무: {formData.closedDays.join(", ")}요일
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="flex space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1">
              <Store className="mr-2 h-4 w-4" />
              가게 등록
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
