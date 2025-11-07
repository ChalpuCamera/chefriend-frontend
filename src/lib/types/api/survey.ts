/**
 * Survey & Question API Types
 * API Spec: api-common.json - Survey Question endpoints
 */

// ============ Enums ============
export type JARAttribute =
  | "SPICINESS"
  | "SWEETNESS"
  | "SALTINESS"
  | "SOURNESS"
  | "BITTERNESS"
  | "UMAMI"
  | "CRISPINESS"
  | "CHEWINESS"
  | "TENDERNESS"
  | "PORTION_SIZE"
  | "FRESHNESS"
  | "TEMPERATURE"
  | "DONENESS"
  | "OILINESS"
  | "PRICE"
  | "OWNER_MESSAGE"
  | "DESIGN_SATISFACTION"
  | "MOISTNESS"
  | "CREAMINESS"
  | "FLAVOR_BALANCE"
  | "VALUE_FOR_MONEY"
  | "REPURCHASE_INTENT";

export type QuestionType =
  | "SLIDER"
  | "TEXT"
  | "RATING"
  | "NPS_RECOMMEND"
  | "NPS_REORDER";

// ============ Response Types ============
export interface SurveyQuestionResponse {
  questionId: number;
  questionText: string;
  jarAttribute: JARAttribute;
  questionType: QuestionType;
}

export interface ActiveQuestionResponse {
  questionId: number;
  questionText: string;
  jarAttribute: JARAttribute;
  questionType: QuestionType;
}

export interface SurveyAnswerResponse {
  id: number;
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  answerText?: string;     // For TEXT type
  numericValue?: number;   // For SLIDER/RATING type
}

// ============ Request Types ============
export interface FoodItemQuestionUpdateRequest {
  questionIds: number[];
}

export interface SurveyAnswer {
  questionId: number;
  numericValue?: number;
  answerText?: string;
}

// ============ Food Item with Questions ============
export interface FoodItemWithQuestionsResponse {
  id: number;
  storeId: number;
  name: string;
  price: number;
  photoUrl: string;
  isActive: boolean;
  activeQuestionCount: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}
