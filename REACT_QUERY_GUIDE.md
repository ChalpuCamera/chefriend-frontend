# React Query 및 API 통합 가이드

## 📚 목차
1. [개요](#개요)
2. [설치 및 설정](#설치-및-설정)
3. [API 구조](#api-구조)
4. [주요 기능](#주요-기능)
5. [Custom Hooks 목록](#custom-hooks-목록)
6. [실제 사용 예시](#실제-사용-예시)
7. [타입 안정성](#타입-안정성)
8. [성능 최적화](#성능-최적화)
9. [트러블슈팅](#트러블슈팅)

## 개요

### React Query 도입 배경
- **서버 상태 관리 자동화**: 로딩, 에러, 성공 상태를 자동으로 관리
- **캐싱 및 동기화**: 중복 요청 방지, 백그라운드 리페칭
- **개발 생산성 향상**: 보일러플레이트 코드 90% 감소

### 프로젝트 구조
```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts          # Fetch API 클라이언트
│   │   └── owner/             # Owner API 함수들
│   │       ├── store.ts
│   │       ├── food.ts
│   │       ├── review.ts
│   │       ├── feedback.ts
│   │       ├── photo.ts
│   │       ├── analysis.ts
│   │       └── reward.ts
│   ├── hooks/                 # React Query Custom Hooks
│   │   ├── useStore.ts
│   │   ├── useFood.ts
│   │   ├── useReview.ts
│   │   ├── useFeedback.ts
│   │   ├── usePhoto.ts
│   │   ├── useAnalysis.ts
│   │   └── useReward.ts
│   └── providers/
│       └── query-provider.tsx # QueryClient 설정
```

## 설치 및 설정

### 1. 패키지 설치
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 2. Provider 설정
```typescript
// src/lib/providers/query-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,     // 5분간 fresh 상태 유지
        gcTime: 10 * 60 * 1000,       // 10분 후 가비지 컬렉션
        retry: 1,                      // 실패 시 1회 재시도
        refetchOnWindowFocus: true,   // 윈도우 포커스 시 리페치
        refetchOnReconnect: true,     // 네트워크 재연결 시 리페치
      },
      mutations: {
        onError: (error: any) => {
          toast.error(error?.message || '오류가 발생했습니다');
        },
      },
    },
  });
}
```

### 3. Layout에 Provider 추가
```typescript
// src/app/layout.tsx
import { QueryProvider } from "@/lib/providers/query-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
          <Toaster position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
```

## API 구조

### Fetch 기반 API Client
```typescript
// src/lib/api/client.ts
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) throw new Error('API Error');
    return response.json();
  }
}
```

## 주요 기능

### 🔄 1. 자동 캐싱 및 리페칭

#### 캐싱 메커니즘
- **staleTime**: 데이터가 "신선"한 상태로 유지되는 시간 (5분)
- **gcTime**: 사용하지 않는 캐시가 메모리에서 제거되는 시간 (10분)

```typescript
// 첫 번째 컴포넌트
function MenuList() {
  // 최초 API 호출
  const { data } = useFoodsByStore(storeId);
  return <div>{data?.content.map(...)}</div>;
}

// 두 번째 컴포넌트 (동일 페이지)
function MenuSummary() {
  // 캐시된 데이터 즉시 사용, API 호출 없음
  const { data } = useFoodsByStore(storeId);
  return <div>총 {data?.content.length}개 메뉴</div>;
}
```

#### 자동 리페칭 조건
- 윈도우가 다시 포커스될 때
- 네트워크가 재연결될 때
- 설정한 시간 간격마다 (폴링)

### 🚀 2. 낙관적 업데이트

UI를 즉시 업데이트하고, 서버 응답 후 동기화하는 패턴입니다.

```typescript
// src/lib/hooks/useFood.ts
export function useOptimisticUpdateFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ foodId, data }) => {
      const response = await foodApi.updateFood(foodId, data);
      return response.result;
    },

    // 1. 요청 전: 캐시 백업 & 즉시 UI 업데이트
    onMutate: async ({ foodId, data }) => {
      await queryClient.cancelQueries({ queryKey: foodKeys.detail(foodId) });

      const previousFood = queryClient.getQueryData(foodKeys.detail(foodId));

      // 즉시 UI 업데이트
      queryClient.setQueryData(foodKeys.detail(foodId), (old) => ({
        ...old,
        ...data
      }));

      return { previousFood };
    },

    // 2. 에러 시: 백업 데이터로 롤백
    onError: (err, variables, context) => {
      if (context?.previousFood) {
        queryClient.setQueryData(
          foodKeys.detail(variables.foodId),
          context.previousFood
        );
      }
    },

    // 3. 완료 후: 서버 데이터로 동기화
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: foodKeys.detail(variables.foodId)
      });
    },
  });
}
```

#### 사용 예시
```typescript
function EditMenuForm({ foodId }) {
  const updateFood = useOptimisticUpdateFood();

  const handleSubmit = (formData) => {
    updateFood.mutate(
      { foodId, data: formData },
      {
        onSuccess: () => {
          // UI가 이미 업데이트됨, 성공 메시지만 표시
          toast.success('메뉴가 수정되었습니다');
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <button disabled={updateFood.isLoading}>
        {updateFood.isLoading ? '저장 중...' : '저장'}
      </button>
    </form>
  );
}
```

### ♾️ 3. 무한 스크롤

`useInfiniteQuery`를 사용하여 페이지네이션을 구현합니다.

```typescript
// Hook 정의
export function useInfiniteStoreReviews(storeId: number, size: number = 10) {
  return useInfiniteQuery({
    queryKey: reviewKeys.infiniteByStore(storeId),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await reviewApi.getStoreReviews(storeId, {
        page: pageParam,
        size,
        sort: ['createdAt,desc'],
      });
      return response.result;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 0,
  });
}
```

#### 컴포넌트에서 사용
```typescript
function ReviewList({ storeId }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteStoreReviews(storeId);

  // 모든 페이지의 리뷰를 평탄화
  const reviews = data?.pages.flatMap(page => page.content) ?? [];

  return (
    <div>
      {isLoading ? (
        <div>로딩중...</div>
      ) : (
        <>
          {reviews.map(review => (
            <ReviewItem key={review.id} review={review} />
          ))}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? '로딩중...' : '더 보기'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
```

#### Intersection Observer와 결합
```typescript
function ReviewListWithAutoLoad() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteStoreReviews(storeId);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const reviews = data?.pages.flatMap(page => page.content) ?? [];

  return (
    <div>
      {reviews.map(review => (
        <ReviewItem key={review.id} review={review} />
      ))}
      <div ref={loadMoreRef} style={{ height: 20 }} />
    </div>
  );
}
```

### 📊 4. 자동 폴링 (JAR 분석)

분석 상태를 주기적으로 확인하는 폴링 기능입니다.

```typescript
// Hook 정의
export function useJarAnalysisWithPolling(foodItemId: number) {
  const { data: analysis, ...queryResult } = useJarAnalysis(foodItemId, {
    refetchInterval: (data) => {
      // PROCESSING 상태일 때만 3초마다 폴링
      if (data?.status === 'PROCESSING') {
        return 3000;
      }
      return false; // 폴링 중지
    },
  });

  return {
    analysis,
    isProcessing: analysis?.status === 'PROCESSING',
    isCompleted: analysis?.status === 'COMPLETED',
    isFailed: analysis?.status === 'FAILED',
    ...queryResult,
  };
}
```

#### 사용 예시
```typescript
function AnalysisStatus({ foodId }) {
  const { analysis, isProcessing, isCompleted } = useJarAnalysisWithPolling(foodId);
  const requestAnalysis = useRequestJarAnalysis();

  const handleAnalyze = () => {
    requestAnalysis.mutate({ foodId, data: { /* 분석 옵션 */ } });
  };

  return (
    <div>
      {isProcessing && (
        <div className="flex items-center gap-2">
          <Spinner />
          <span>분석 중... (자동 업데이트)</span>
        </div>
      )}

      {isCompleted && (
        <AnalysisResult data={analysis} />
      )}

      {!analysis && (
        <button onClick={handleAnalyze}>분석 시작</button>
      )}
    </div>
  );
}
```

### 🔔 5. 에러 토스트 알림

전역 에러 핸들링으로 모든 mutation 에러를 자동으로 표시합니다.

```typescript
// QueryClient 설정
mutations: {
  onError: (error: any) => {
    const message = error?.response?.data?.message || '오류가 발생했습니다';
    toast.error(message);
  },
}

// Hook에서 성공 메시지
export function useCreateFood() {
  return useMutation({
    mutationFn: foodApi.createFood,
    onSuccess: () => {
      toast.success('메뉴가 추가되었습니다');
    },
    // onError는 전역에서 처리
  });
}
```

## Custom Hooks 목록

### Store Hooks (`useStore.ts`)
| Hook | 용도 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `useMyStores` | 내 매장 목록 조회 | `pageable?: Pageable` | `PageResponse<StoreResponse>` |
| `useStore` | 매장 상세 조회 | `storeId: number` | `StoreResponse` |
| `useCreateStore` | 매장 생성 | - | `mutation` |
| `useUpdateStore` | 매장 수정 | - | `mutation` |
| `useDeleteStore` | 매장 삭제 | - | `mutation` |
| `useFirstStoreId` | 첫 매장 ID 조회 | - | `number \| undefined` |

### Food Hooks (`useFood.ts`)
| Hook | 용도 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `useFoodsByStore` | 매장별 음식 목록 | `storeId, pageable?` | `PageResponse<FoodItemResponse>` |
| `useFood` | 음식 상세 조회 | `foodId: number` | `FoodItemResponse` |
| `useCreateFood` | 음식 생성 | - | `mutation` |
| `useUpdateFood` | 음식 수정 | - | `mutation` |
| `useDeleteFood` | 음식 삭제 | - | `mutation` |
| `useOptimisticUpdateFood` | 낙관적 업데이트 | - | `mutation` |

### Review Hooks (`useReview.ts`)
| Hook | 용도 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `useStoreReviews` | 매장별 리뷰 | `storeId, pageable?` | `PageResponse<ReviewResponse>` |
| `useFoodReviews` | 음식별 리뷰 | `foodId, pageable?` | `PageResponse<ReviewResponse>` |
| `useInfiniteStoreReviews` | 무한 스크롤 리뷰 | `storeId, size?` | `InfiniteData` |
| `useRecentReviews` | 최근 리뷰 | `storeId, limit?` | `ReviewResponse[]` |

### Feedback Hooks (`useFeedback.ts`)
| Hook | 용도 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `useStoreFeedbacks` | 매장별 피드백 | `storeId, pageable?` | `PageResponse<FeedbackResponse>` |
| `useFeedback` | 피드백 상세 | `feedbackId` | `FeedbackResponse` |
| `useCreateFeedback` | 피드백 생성 | - | `mutation` |
| `useInfiniteStoreFeedbacks` | 무한 스크롤 | `storeId, size?` | `InfiniteData` |

### Photo Hooks (`usePhoto.ts`)
| Hook | 용도 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `useUploadPhoto` | 사진 업로드 | - | `mutation` |
| `useUploadFeedbackPhotos` | 피드백 사진 업로드 | - | `mutation` |
| `useDeletePhoto` | 사진 삭제 | - | `mutation` |

### Analysis Hooks (`useAnalysis.ts`)
| Hook | 용도 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `useJarAnalysis` | JAR 분석 조회 | `foodItemId, options?` | `JarAnalysisResponse` |
| `useRequestJarAnalysis` | JAR 분석 요청 | - | `mutation` |
| `useJarAnalysisWithPolling` | 자동 폴링 분석 | `foodItemId` | `analysis & status` |

### Reward Hooks (`useReward.ts`)
| Hook | 용도 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `useRewards` | 전체 리워드 목록 | - | `RewardResponse[]` |
| `useMyAvailableRewards` | 내 리워드 | - | `RewardResponse[]` |
| `useRedeemReward` | 리워드 교환 | - | `mutation` |
| `useMyActiveRedemptions` | 사용 가능 리워드 | - | `RewardRedemptionResponse[]` |

## 실제 사용 예시

### 메뉴 목록 페이지 전체 코드
```typescript
// src/app/owner/menu/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFirstStoreId } from "@/lib/hooks/useStore";
import { useFoodsByStore, useDeleteFood } from "@/lib/hooks/useFood";
import { Skeleton } from "@/components/ui/skeleton";

export default function MenuPage() {
  const router = useRouter();
  const storeId = useFirstStoreId();
  const { data, isLoading, error } = useFoodsByStore(storeId || 0);
  const deleteFood = useDeleteFood();

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">메뉴를 불러오는데 실패했습니다</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-primary text-white rounded"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const menus = data?.content || [];

  // 빈 상태
  if (menus.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500 mb-4">등록된 메뉴가 없습니다</p>
        <button
          onClick={() => router.push('/owner/menu/add')}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          메뉴 추가하기
        </button>
      </div>
    );
  }

  const handleDelete = (foodId: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteFood.mutate(foodId, {
        onSuccess: () => {
          // 자동으로 목록이 갱신됨
        }
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">메뉴 관리</h1>
        <button
          onClick={() => router.push('/owner/menu/add')}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          메뉴 추가
        </button>
      </div>

      <div className="space-y-4">
        {menus.map((menu) => (
          <div key={menu.id} className="p-4 border rounded-lg flex justify-between">
            <div>
              <h3 className="font-semibold">{menu.name}</h3>
              <p className="text-gray-600">{menu.price.toLocaleString()}원</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => router.push(`/owner/menu/${menu.id}/edit`)}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(menu.id)}
                disabled={deleteFood.isLoading}
                className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 메뉴 추가 페이지
```typescript
// src/app/owner/menu/add/page.tsx
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useFirstStoreId } from "@/lib/hooks/useStore";
import { useCreateFood } from "@/lib/hooks/useFood";
import { useUploadPhoto } from "@/lib/hooks/usePhoto";

export default function AddMenuPage() {
  const router = useRouter();
  const storeId = useFirstStoreId();
  const createFood = useCreateFood();
  const uploadPhoto = useUploadPhoto();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      // 1. 메뉴 생성
      const foodResponse = await createFood.mutateAsync({
        storeId,
        data: {
          foodName: data.name,
          price: data.price,
          description: data.description,
        }
      });

      // 2. 사진 업로드 (있는 경우)
      if (data.photo?.[0]) {
        await uploadPhoto.mutateAsync({
          file: data.photo[0],
          foodItemId: foodResponse.id
        });
      }

      // 3. 목록 페이지로 이동
      router.push('/owner/menu');
    } catch (error) {
      // 에러는 toast로 자동 표시됨
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
      <div>
        <label className="block mb-1">메뉴명</label>
        <input
          {...register('name', { required: '메뉴명을 입력해주세요' })}
          className="w-full p-2 border rounded"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block mb-1">가격</label>
        <input
          type="number"
          {...register('price', { required: '가격을 입력해주세요' })}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1">설명</label>
        <textarea
          {...register('description')}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      <div>
        <label className="block mb-1">사진</label>
        <input
          type="file"
          accept="image/*"
          {...register('photo')}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createFood.isLoading || uploadPhoto.isLoading}
          className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
        >
          {createFood.isLoading ? '저장 중...' : '메뉴 추가'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          취소
        </button>
      </div>
    </form>
  );
}
```

## 타입 안정성

### TypeScript 타입 추론
React Query는 제네릭을 통해 완벽한 타입 추론을 제공합니다.

```typescript
// Hook 정의
export function useFoodsByStore(storeId: number) {
  return useQuery<PageResponse<FoodItemResponse>, Error>({
    queryKey: foodKeys.listByStore(storeId),
    queryFn: async () => {
      const response = await foodApi.getFoodsByStore(storeId);
      return response.result;
    },
  });
}

// 사용 시 타입 자동 추론
const { data, error } = useFoodsByStore(1);
// data: PageResponse<FoodItemResponse> | undefined
// error: Error | null
```

### API 응답 타입 매핑
```typescript
// API 응답 타입
interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Hook에서 result만 추출
queryFn: async () => {
  const response = await api.getData(); // ApiResponse<Data>
  return response.result; // Data
}
```

## 성능 최적화

### Query Key 전략
```typescript
// 계층적 구조로 관리
export const foodKeys = {
  all: ['foods'] as const,
  lists: () => [...foodKeys.all, 'list'] as const,
  listByStore: (storeId: number) =>
    [...foodKeys.lists(), 'store', storeId] as const,
  detail: (id: number) =>
    [...foodKeys.all, 'detail', id] as const,
};

// 무효화 전략
// 특정 음식만 무효화
queryClient.invalidateQueries({
  queryKey: foodKeys.detail(foodId)
});

// 모든 음식 목록 무효화
queryClient.invalidateQueries({
  queryKey: foodKeys.lists()
});

// 모든 음식 관련 데이터 무효화
queryClient.invalidateQueries({
  queryKey: foodKeys.all
});
```

### 선택적 리페칭
```typescript
// 필요한 경우만 활성화
const { data } = useFood(foodId, {
  enabled: !!foodId, // foodId가 있을 때만 실행
});

// 조건부 폴링
refetchInterval: (data) => {
  return data?.needsUpdate ? 5000 : false;
}
```

### 캐시 사전 채우기
```typescript
// 목록 조회 후 상세 캐시 채우기
const { data: foods } = useFoodsByStore(storeId);

useEffect(() => {
  foods?.content.forEach(food => {
    queryClient.setQueryData(
      foodKeys.detail(food.id),
      food
    );
  });
}, [foods]);
```

## 트러블슈팅

### 자주 발생하는 문제

#### 1. 캐시가 업데이트되지 않음
```typescript
// ❌ 잘못된 키
queryClient.invalidateQueries({ queryKey: ['foods'] });

// ✅ 정확한 키 사용
queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
```

#### 2. Mutation 후 목록이 갱신되지 않음
```typescript
// mutation의 onSuccess에서 무효화
onSuccess: () => {
  // 관련된 모든 쿼리 무효화
  queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
  queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) });
}
```

#### 3. 무한 리페칭 발생
```typescript
// ❌ 객체를 queryKey로 사용
const filters = { sort: 'name' };
queryKey: ['foods', filters] // 매번 새 객체 생성

// ✅ 안정적인 키 사용
queryKey: foodKeys.listByStore(storeId, filters)
```

### React Query DevTools 활용
개발 환경에서 자동으로 활성화되는 DevTools를 활용하세요.

```typescript
// 브라우저 우측 하단의 🌸 아이콘 클릭
// - 캐시 상태 확인
// - 쿼리 실행 내역
// - 수동 리페치/무효화
// - 캐시 데이터 확인
```

### 디버깅 팁
```typescript
// 쿼리 상태 로깅
const { data, error, isLoading, isFetching, isStale } = useQuery({
  queryKey: ['debug'],
  queryFn: fetchData,
  onSuccess: (data) => console.log('Success:', data),
  onError: (error) => console.error('Error:', error),
});

console.log({
  isLoading,  // 최초 로딩
  isFetching, // 백그라운드 리페칭
  isStale,    // stale 상태
});
```

## 마이그레이션 가이드

### 기존 코드에서 React Query로
```typescript
// Before: useState + useEffect
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

// After: useQuery
const { data, isLoading, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});
```

## 추가 리소스

- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [React Query 베스트 프랙티스](https://tkdodo.eu/blog/practical-react-query)
- [프로젝트 API 문서](/api-docs.json)

---

이 가이드는 지속적으로 업데이트됩니다.
문의사항은 팀 슬랙 채널로 연락주세요.