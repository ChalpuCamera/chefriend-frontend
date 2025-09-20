// Analysis (JAR 분석) API Types

export interface JARAnalysisResponse {
  results: JARAnalysisResult[];
  npsScore?: NPSResult;
  analyzedAt: string;
}

export interface JARAnalysisResult {
  questionId: number;
  attribute: JARAttribute;
  tooLittle: JARGroup;
  justRight: JARGroup;
  tooMuch: JARGroup;
  overallMeanScore: number;
  totalResponses: number;
  totalPenalty: number;
  priorityLevel: string;
  recommendation: string;
}

export type JARAttribute =
  | 'SPICINESS'
  | 'SWEETNESS'
  | 'SALTINESS'
  | 'SOURNESS'
  | 'BITTERNESS'
  | 'UMAMI'
  | 'PORTION_SIZE'
  | 'TEMPERATURE'
  | 'DONENESS'
  | 'OILINESS'
  | 'PRICE';

export interface JARGroup {
  count: number;
  percentage: number;
  avgSatisfaction: number;
}

export interface NPSResult {
  score: number;
  promoterRate: number;
  passiveRate: number;
  detractorRate: number;
  totalResponses: number;
  level: NPSLevel;
  levelDescription: string;
}

export type NPSLevel =
  | 'CRITICAL'
  | 'ACCEPTABLE'
  | 'GOOD'
  | 'EXCELLENT'
  | 'WORLD_CLASS';

export interface SingleJARResponse {
  questionId: number;
  analysis: JARAnalysisResult;
}