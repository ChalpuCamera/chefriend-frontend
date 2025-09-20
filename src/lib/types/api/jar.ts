// JAR 분석 API Types

export interface JARGroup {
  count: number
  percentage: number
  avgSatisfaction: number
}

export interface JARAnalysisResult {
  questionId: number
  attribute: "SPICINESS" | "SWEETNESS" | "SALTINESS" | "SOURNESS" | "BITTERNESS" |
            "UMAMI" | "PORTION_SIZE" | "TEMPERATURE" | "DONENESS" | "OILINESS" | "PRICE"
  tooLittle: JARGroup
  justRight: JARGroup
  tooMuch: JARGroup
  overallMeanScore: number
  totalResponses: number
  totalPenalty: number
  priorityLevel: string
  recommendation: string
}

export interface NPSResult {
  score: number
  promoterRate: number
  passiveRate: number
  detractorRate: number
  totalResponses: number
  level: "CRITICAL" | "ACCEPTABLE" | "GOOD" | "EXCELLENT" | "WORLD_CLASS"
  levelDescription: string
}

export interface JARAnalysisResponse {
  results: JARAnalysisResult[]
  npsScore: NPSResult
  analyzedAt: string
}