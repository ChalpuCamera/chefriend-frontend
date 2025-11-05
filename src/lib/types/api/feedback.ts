/**
 * Feedback API Types
 * API Spec: api-common.json & api-docs.json - Customer Feedback endpoints
 */

export interface FeedbackResponse {
  id: number;
  foodName: string;
  storeName: string;
  userNickname: string;
  surveyName: string;
  createdAt: string;
  isViewed: boolean;  // 사장님이 피드백을 조회했는지 여부
  campaignId?: number;  // 캠페인 ID (선택)
  surveyAnswers: SurveyAnswerResponse[];
  photoUrls: string[];
}

export interface SurveyAnswerResponse {
  id: number;
  questionId?: number;  // questionId 추가 (questionId 9번 추출용)
  questionText: string;
  questionType: 'SLIDER' | 'TEXT' | 'RATING' | 'NPS_RECOMMEND' | 'NPS_REORDER';
  answerText?: string;
  numericValue?: number;
}

export interface FeedbackCreateRequest {
  foodId: number;
  storeId: number;
  surveyId: number;
  surveyAnswers: SurveyAnswerRequest[];
  photoS3Keys?: string[];
}

export interface SurveyAnswerRequest {
  questionId: number;
  answerText?: string;
  numericValue?: number;
}

// 고객 취향 정보
export interface CustomerTasteDto {
  spicyLevel: number;    // 1-5 (매운맛 선호도)
  mealAmount: number;     // 1-5 (식사량)
  mealSpending: number;   // 1-5 (식사 지출)
}

// 평가 항목 표시 데이터
export interface ReviewAttributeDisplay {
  label: string;   // 한글 라벨 (예: "맵기", "짠맛")
  value: number;   // 1-5 숫자 값
}

// UI 표시용 리뷰 데이터 (피드백 + 맛 프로필 조합)
export interface ReviewDisplayData {
  id: number;
  userName: string;
  anonymousId?: string;   // 익명 번호 (예: "익명127")
  avatar?: string;
  date: string;           // 포맷된 날짜 (예: "2025. 09. 09")
  menuName: string;
  reviewText: string;     // questionId 33번의 answerText
  attributes?: ReviewAttributeDisplay[]; // questionId 23-32 평가 항목
  servings: string;       // "1인분", "0.5인분" 등 (mealAmount에서 변환)
  spiciness: string;      // "보통", "덜 맵게", "맵게" 등 (spicyLevel에서 변환)
  price: string;          // "2만원", "1.5만원" 등 (mealSpending에서 변환)
  photoUrls?: string[];
  storeId?: number;
  foodId?: number;
}

// 사진 업로드 URL 요청
export interface FeedbackPhotosUploadRequest {
  fileNames: string[];
}

// 사진 업로드 URL 응답
export interface FeedbackPhotoUrlInfo {
  originalFileName: string;
  presignedUrl: string;
  s3Key: string;
}

export interface FeedbackPhotosPresignedUrlResponse {
  photoUrls: FeedbackPhotoUrlInfo[];
}

// 피드백 일괄 읽음 처리 요청
export interface FeedbackBulkViewedRequest {
  feedbackIds: number[];  // 최대 100개
}

// 사장님용 피드백 요약 응답
export interface OwnerFeedbackSummaryResponse {
  id: number;  // 백엔드 응답의 실제 필드명
  feedbackId?: number;  // API 문서상 필드명 (하위 호환)
  customerId?: number;
  customerName?: string;
  foodId: number;
  foodName: string;
  photoUrls: string[];
  createdAt: string;
  isViewed: boolean;
}

// 사장님용 피드백 상세 응답 (고객 입맛 포함)
export interface OwnerFeedbackDetailResponse {
  id: number;
  foodName: string;
  storeName: string;
  userNickname: string;
  isViewed: boolean;
  spicyLevel?: number;     // 1-5 (매운맛 선호도)
  mealAmount?: number;      // 1-5 (식사량)
  mealSpending?: number;    // 1-5 (식사 지출)
  photoUrls: string[];
  surveyAnswers: SurveyAnswerResponse[];
  createdAt: string;
}

// 음식별 읽지 않은 피드백 개수
export interface FeedbackUnreadCountResponse {
  foodItemId: number;
  foodName: string;
  unreadCount: number;
  totalCount: number;
}