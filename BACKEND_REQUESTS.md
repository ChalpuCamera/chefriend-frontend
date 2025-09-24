# 백엔드 API 추가 요청사항

## 1. 캠페인 관련 API

### 1.1 누락된 API 엔드포인트

#### GET `/api/campaigns/food/{foodId}/active`
- **설명**: 특정 음식의 현재 활성 캠페인 조회
- **용도**: 메뉴 상세 페이지에서 해당 메뉴에 대한 진행중인 캠페인 표시
- **응답 예시**:
```json
{
  "code": 200,
  "message": "성공",
  "result": {
    "id": 1,
    "name": "김치찌개 캠페인",
    "foodItemId": 5,
    "foodItemName": "김치찌개",
    "status": "ACTIVE",
    "targetFeedbackCount": 100,
    "currentFeedbackCount": 45,  // 중요: 현재 피드백 수
    "startDate": "2024-01-01T00:00:00",
    "endDate": "2024-01-31T23:59:59",
    "foodItemThumbnailUrl": "https://..."  // 메뉴 이미지
  }
}
```

#### GET `/api/campaigns/{campaignId}`
- **설명**: 단일 캠페인 상세 정보 조회
- **용도**: 캠페인 상세 페이지, 수정 페이지에서 사용
- **응답**: `CampaignResponse` 타입과 동일

### 1.2 CampaignResponse 스키마 수정 요청

현재 `CampaignResponse`에 다음 필드 추가 필요:

```typescript
interface CampaignResponse {
  // ... 기존 필드들 ...

  // 추가 필요 필드:
  currentFeedbackCount: number;      // 현재까지 수집된 피드백 수
  foodItemThumbnailUrl?: string;     // 음식 메뉴 이미지 URL
  remainingDays?: number;            // 남은 일수 (또는 클라이언트에서 계산)
}
```

### 1.3 캠페인 생성 응답 개선

현재 POST `/api/campaigns` 응답이 `Map<String, Long>` 형태인데,
더 명확한 응답 구조를 요청:

```json
{
  "code": 201,
  "message": "캠페인이 생성되었습니다",
  "result": {
    "campaignId": 123,
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

## 2. 음식별 캠페인 조회 최적화

현재 구현:
- 매장의 모든 캠페인을 조회한 후 클라이언트에서 필터링
- 비효율적이고 불필요한 데이터 전송

제안:
- 특정 음식의 활성 캠페인을 직접 조회하는 API 제공
- 또는 `getCampaignsByStore` API에 `foodItemId` 필터 파라미터 추가

## 3. 캠페인 상태값 정리

현재 상태값:
- DRAFT, ACTIVE, PAUSED, COMPLETED, EXPIRED

UI에서 필요한 구분:
- 진행중 (ACTIVE)
- 일시정지 (PAUSED)
- 완료 (COMPLETED)
- 만료 (EXPIRED)
- 임시저장 (DRAFT)

상태 전환 로직 명확화 필요:
- 목표 피드백 수 달성 시 → COMPLETED
- 종료 날짜 도달 시 → EXPIRED
- 사용자가 중지 시 → PAUSED

## 4. 피드백 수 실시간 업데이트

캠페인에 대한 피드백이 등록될 때마다 `currentFeedbackCount`가 자동으로 업데이트되어야 함.

## 5. 이미지 처리

캠페인 카드에 표시할 이미지:
1. 음식 썸네일 이미지 (`foodItemThumbnailUrl`)
2. 캠페인 전용 이미지 (선택사항)

음식 테이블과 JOIN하여 이미지 URL을 함께 반환하면 좋을 것 같습니다.

## 구현 완료 사항

프론트엔드에서 다음 기능들을 구현했습니다:
- ✅ 캠페인 생성 (POST `/api/campaigns`)
- ✅ 매장별 캠페인 목록 조회 (POST `/api/campaigns/store/list`)
- ✅ 캠페인 수정 (PUT `/api/campaigns`)
- ✅ 캠페인 삭제 (DELETE `/api/campaigns`)
- ✅ 캠페인 상태 변경 (PATCH `/api/campaigns/status`)

임시 구현:
- ⚠️ 특정 음식의 활성 캠페인 조회 (매장 전체 캠페인에서 필터링)
- ⚠️ 남은 날짜 계산 (클라이언트에서 endDate로 계산)
- ⚠️ 진행률 계산 (currentFeedbackCount가 없어서 0으로 표시)