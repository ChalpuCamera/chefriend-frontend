// Feedback API Types

export interface FeedbackResponse {
  id: number;
  foodName: string;
  storeName: string;
  userNickname: string;
  surveyName: string;
  createdAt: string;
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

// UI 표시용 리뷰 데이터 (피드백 + 맛 프로필 조합)
export interface ReviewDisplayData {
  id: number;
  userName: string;
  avatar?: string;
  date: string;           // 포맷된 날짜 (예: "2025. 09. 09")
  menuName: string;
  reviewText: string;     // questionId 9번의 answerText
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