# Chalpu Frontend UI 가이드

## 📋 목차
- [기술 스택](#기술-스택)
- [Design System](#design-system)
- [컴포넌트 라이브러리](#컴포넌트-라이브러리)
- [스타일링 가이드](#스타일링-가이드)
- [사용 예제](#사용-예제)

## 기술 스택

### 핵심 UI 라이브러리
- **Tailwind CSS v4.1.13** - CSS-first 설정 방식
- **shadcn/ui** - 재사용 가능한 컴포넌트 라이브러리
- **Radix UI** - 접근성을 고려한 headless UI primitives
- **lucide-react** - 아이콘 라이브러리
- **class-variance-authority (CVA)** - 컴포넌트 variant 관리

### 폼 관리
- **react-hook-form** - 폼 상태 관리
- **zod** - 스키마 검증
- **@hookform/resolvers** - zod 통합

## Design System

### 🎨 Typography

Tailwind CSS v4의 `--text-*` 패턴을 사용하여 정의된 타이포그래피 시스템입니다.

#### Large Titles
```css
text-large-title-1  /* 36px, font-weight: 700, line-height: 43px */
text-large-title-2  /* 32px, font-weight: 700, line-height: 39px */
```

#### Titles
```css
text-title-1        /* 28px, font-weight: 700, line-height: 36px */
text-title-2        /* 24px, font-weight: 700, line-height: 31px */
```

#### Sub Titles
```css
text-sub-title-b    /* 20px, font-weight: 700, line-height: 26px */
text-sub-title-m    /* 20px, font-weight: 500, line-height: 26px */
```

#### Headlines
```css
text-headline-b     /* 18px, font-weight: 700, line-height: 24px */
text-headline-m     /* 18px, font-weight: 500, line-height: 24px */
```

#### Body
```css
text-body-sb        /* 16px, font-weight: 600, line-height: 24px */
text-body-r         /* 16px, font-weight: 400, line-height: 24px */
```

#### Sub Body
```css
text-sub-body-sb    /* 14px, font-weight: 600, line-height: 21px */
text-sub-body-r     /* 14px, font-weight: 400, line-height: 21px */
```

#### Caption
```css
text-caption-b      /* 12px, font-weight: 700, line-height: 18px */
text-caption-r      /* 12px, font-weight: 400, line-height: 18px */
```

### 🎨 Color Palette

#### Gray Scale
```css
gray-50   /* #F8F9FA */
gray-100  /* #F1F3F5 */
gray-200  /* #E9ECEF */
gray-300  /* #DEE2E6 */
gray-400  /* #CED4DA */
gray-500  /* #ADB5BD */
gray-600  /* #868E96 */
gray-700  /* #495057 */
gray-800  /* #343A40 */
gray-900  /* #212529 */
```

#### Brand Colors
- **Red**: red-50 ~ red-950
- **Orange**: orange-50 ~ orange-950
- **Yellow**: yellow-50 ~ yellow-950
- **Sky**: sky-50 ~ sky-950
- **Blue**: blue-50 ~ blue-900
- **Green**: green-50 ~ green-950
- **Purple**: purple-50 ~ purple-950

#### Semantic Colors
```css
primary, primary-foreground
secondary, secondary-foreground
muted, muted-foreground
accent, accent-foreground
destructive
border, input, ring
```

### 📐 Spacing & Border Radius

#### Border Radius
```css
rounded-sm  /* calc(0.625rem - 4px) */
rounded-md  /* calc(0.625rem - 2px) */
rounded-lg  /* 0.625rem */
rounded-xl  /* calc(0.625rem + 4px) */
```

## 컴포넌트 라이브러리

### 📦 사용 가능한 컴포넌트

모든 컴포넌트는 `@/components/ui/` 경로에서 import합니다.

#### 기본 컴포넌트
- **Button** - 버튼 컴포넌트 (variant: default, destructive, outline, secondary, ghost, link)
- **Input** - 텍스트 입력 필드
- **Textarea** - 여러 줄 텍스트 입력
- **Label** - 폼 라벨

#### 레이아웃
- **Card** - 콘텐츠 컨테이너 (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- **Separator** - 구분선
- **Tabs** - 탭 네비게이션 (Tabs, TabsList, TabsTrigger, TabsContent)

#### 오버레이
- **Dialog** - 모달 다이얼로그
- **Sheet** - 사이드 패널
- **Alert Dialog** - 확인/취소 다이얼로그

#### 폼 컨트롤
- **Form** - react-hook-form 통합 컴포넌트
- **Select** - 드롭다운 선택
- **Checkbox** - 체크박스
- **Radio Group** - 라디오 버튼 그룹
- **Switch** - 토글 스위치

#### 피드백
- **Badge** - 상태 표시 배지
- **Progress** - 진행률 표시
- **Skeleton** - 로딩 스켈레톤
- **Sonner** - 토스트 알림

#### 데이터 표시
- **Avatar** - 사용자 아바타
- **Scroll Area** - 스크롤 영역

#### 네비게이션
- **Navigation Menu** - 네비게이션 메뉴
- **Bottom Nav** - 하단 네비게이션

## 스타일링 가이드

### Tailwind CSS v4 설정

`src/app/globals.css`에서 모든 디자인 토큰을 정의합니다:

```css
@import "tailwindcss";

@theme {
  /* 직접 값 정의 - 유틸리티 클래스 자동 생성 */
  --text-title-1: 24px;
  --color-primary: #FF6B6B;
}

@theme inline {
  /* CSS 변수 참조 시 사용 */
  --color-background: var(--background);
}
```

### 컴포넌트 사용 패턴

#### Button 예제
```tsx
import { Button } from "@/components/ui/button"

// 기본 버튼
<Button>클릭하세요</Button>

// Variant 적용
<Button variant="destructive">삭제</Button>
<Button variant="outline">취소</Button>
<Button variant="ghost">더보기</Button>

// 크기 조정
<Button size="sm">작은 버튼</Button>
<Button size="lg">큰 버튼</Button>
```

### 다크 모드

```tsx
// 다크 모드 지원
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-white">
    다크 모드 지원 텍스트
  </p>
</div>
```

### 2. 아이콘 사용
lucide-react에서 아이콘 import:

```tsx
import { Home, Settings, User } from "lucide-react"

<Button>
  <Home className="mr-2 h-4 w-4" />
  홈으로
</Button>
```

## 문제 해결

### Tailwind 클래스가 적용되지 않을 때
1. `globals.css`에서 `@theme` 블록 확인
2. 직접 값은 `@theme`, 변수 참조는 `@theme inline` 사용
3. Typography는 `--text-*`, 색상은 `--color-*` 패턴 사용

### 컴포넌트 스타일 커스터마이징
1. `className` prop으로 추가 스타일 적용
2. CVA variants로 재사용 가능한 스타일 정의
3. `cn()` 함수로 클래스 안전하게 병합

## 관련 문서
- [CLAUDE.md](./CLAUDE.md) - Figma 통합 및 디자인 시스템 규칙
- [Routing.md](./Routing.md) - 라우팅 구조
- [api-docs.md](./api-docs.md) - API 문서