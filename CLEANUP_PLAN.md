# 사장님 서비스 전용 전환 - 삭제 및 수정 파일 목록

## 1. 완전 삭제할 디렉토리

### Customer 앱 디렉토리
```bash
rm -rf src/app/customer/
```
- 15개 페이지 파일 포함
- 약 104KB 디렉토리

### Customer 컴포넌트
```bash
rm -rf src/components/customer/
```
- MenuCard.tsx
- MenuList.tsx
- QuickStats.tsx
- RewardProgress.tsx
- 약 20KB 디렉토리

### Customer API 클라이언트
```bash
rm -rf src/lib/api/customer/
```
- customer.ts
- customerFeedback.ts
- customerFood.ts
- customerReward.ts
- 약 16KB 디렉토리

## 2. 완전 삭제할 개별 파일

### 미들웨어 (서브도메인 분기 제거)
```bash
rm src/middleware.ts
```
- 서브도메인 라우팅 로직
- customer/owner 경로 리라이트
- 인증 체크 로직

### Customer 타입 정의
```bash
rm src/lib/types/customer.ts
```

### Customer Hooks
```bash
rm src/lib/hooks/useCustomer.ts
rm src/lib/hooks/useCustomerFeedback.ts
rm src/lib/hooks/useCustomerFood.ts
rm src/lib/hooks/useCustomerReward.ts
```

## 3. 수정이 필요한 파일들

### 인증 관련
- `src/app/(auth)/login/page.tsx`
  - customer 로그인 옵션 제거
  - customer OAuth 경로 제거

- `src/providers/auth-provider.tsx`
  - customer role 처리 제거
  - customer 전용 상태 제거

- `src/hooks/use-auth.ts`
  - customer 인증 로직 제거
  - isCustomer 플래그 제거

- `src/lib/auth.ts`
  - customer 관련 인증 함수 제거
  - role 체크 로직 단순화

### 라우팅 및 네비게이션
- `src/app/page.tsx`
  - customer 리다이렉션 제거
  - owner로 직접 리다이렉트 설정

- `src/components/ui/bottom-nav.tsx`
  - customer 네비게이션 아이템 제거
  - customer 경로 조건부 렌더링 제거

- `src/lib/navigation.ts`
  - CUSTOMER_NAV_ITEMS 제거
  - customer 경로 상수 제거

### API 및 타입
- `src/lib/api-client.ts`
  - customer API 엔드포인트 제거
  - customer 전용 헤더 제거

- `src/lib/types/entities.ts`
  - Customer 엔티티 타입 제거
  - CustomerFood, CustomerReward 등 제거

- `src/lib/types/form.ts`
  - customer 폼 타입 제거
  - CustomerRegistrationForm 등 제거

- `src/lib/types/api.ts`
  - customer API 응답 타입 제거
  - customer 전용 에러 타입 제거

- `src/lib/types/index.ts`
  - customer 타입 export 제거
  - customer.ts 파일 import 제거

- `src/lib/types/auth.ts`
  - UserRole에서 'customer' 제거
  - customer 전용 토큰 타입 제거

- `src/lib/constants.ts`
  - CUSTOMER_* 상수 제거
  - customer 관련 URL 제거

### Owner 파일 중 Customer 참조 수정
- `src/app/owner/oauth2/success/page.tsx`
  - role === 'customer' 체크 제거
  - role 체크 로직 단순화

- `src/app/owner/menu/[foodId]/analytics/page.tsx`
  - customer 피드백 통계는 유지 (백엔드 API 유지)
  - UI 텍스트에서 '손님' 표현 유지

- `src/app/owner/feedbacks/page.tsx`
  - customer 피드백 조회 기능 유지 (백엔드 API 유지)
  - 피드백 데이터 표시 유지

### Owner API 중 Customer 참조 (유지할 파일)
⚠️ **다음 파일들은 수정하지 않음** (사장님이 손님 데이터를 조회하는 기능)
- `src/lib/api/owner/feedback.ts` - 손님 피드백 조회 API
- `src/lib/api/owner/review.ts` - 손님 리뷰 조회 API
- `src/lib/api/owner/photo.ts` - 손님 사진 조회 API
- `src/lib/hooks/useFeedback.ts` - 피드백 조회 Hook
- `src/lib/types/api/feedback.ts` - 피드백 데이터 타입
- `src/lib/types/owner.ts` - owner가 보는 customer 데이터 타입

## 4. 실행 순서

### Step 1: 백업 생성
```bash
git add -A
git commit -m "backup: before removing customer service"
```

### Step 2: 디렉토리 삭제
```bash
# Customer 관련 디렉토리 삭제
rm -rf src/app/customer/
rm -rf src/components/customer/
rm -rf src/lib/api/customer/
```

### Step 3: 파일 삭제
```bash
# 미들웨어 삭제
rm src/middleware.ts

# Customer 타입 삭제
rm src/lib/types/customer.ts

# Customer Hooks 삭제
rm src/lib/hooks/useCustomer.ts
rm src/lib/hooks/useCustomerFeedback.ts
rm src/lib/hooks/useCustomerFood.ts
rm src/lib/hooks/useCustomerReward.ts
```

### Step 4: 파일 수정
각 파일에서 다음 작업 수행:
1. customer 관련 import 문 제거
2. customer 타입 참조 제거
3. customer 조건부 로직 제거
4. customer 상수 제거

### Step 5: 검증
```bash
# TypeScript 컴파일 확인
npm run build

# Lint 검사
npm run lint


## 5. 예상 효과

### 코드 감소량
- **소스 코드**: 약 140KB 삭제
- **코드 라인**: 약 2,900줄 제거
- **파일 수**: 약 25개 파일 삭제

### 성능 개선
- **번들 사이즈**: 15-25% 감소 예상
- **빌드 시간**: 약 30% 단축
- **초기 로딩**: 더 빠른 페이지 로드
- **라우팅**: 미들웨어 제거로 단순화

### 유지보수 개선
- 코드베이스 복잡도 감소
- 단일 서비스 집중으로 개발 효율성 증가
- 배포 프로세스 단순화

## 6. 주의사항

⚠️ **중요**:
- Owner가 Customer 데이터를 조회하는 기능은 유지됨
- 백엔드 API는 변경하지 않음
- 피드백/리뷰 조회 기능은 그대로 유지
- 기존에 구현되어 있던 분기 처리(middleware 또는 라우팅 분기)는 모두 삭제