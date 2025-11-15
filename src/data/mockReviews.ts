export type TasteLevel = "too_little" | "just_right" | "too_much"

export interface ReviewData {
  id: string
  rating: number // 1-5
  willReorder: boolean
  tastes: {
    spicy: TasteLevel
    sweet: TasteLevel
    salty: TasteLevel
    sour: TasteLevel
  }
  nps: number // 0-10
}

export const mockReviews: ReviewData[] = [
  // 맵기: 너무 많다는 의견 많음 (개선 필요 - 65% 문제)
  // 단맛: 적정
  // 짠맛: 약간 부족하다는 의견 있음 (주의 - 45% 문제)
  // 신맛: 적정
  {
    id: "review-1",
    rating: 4,
    willReorder: true,
    tastes: {
      spicy: "too_much",
      sweet: "just_right",
      salty: "too_little",
      sour: "just_right",
    },
    nps: 9,
  },
  {
    id: "review-2",
    rating: 3,
    willReorder: false,
    tastes: {
      spicy: "too_much",
      sweet: "just_right",
      salty: "just_right",
      sour: "just_right",
    },
    nps: 7,
  },
  {
    id: "review-3",
    rating: 5,
    willReorder: true,
    tastes: {
      spicy: "too_much",
      sweet: "just_right",
      salty: "too_little",
      sour: "just_right",
    },
    nps: 10,
  },
  {
    id: "review-4",
    rating: 2,
    willReorder: false,
    tastes: {
      spicy: "too_much",
      sweet: "just_right",
      salty: "just_right",
      sour: "too_little",
    },
    nps: 5,
  },
  {
    id: "review-5",
    rating: 4,
    willReorder: true,
    tastes: {
      spicy: "too_much",
      sweet: "just_right",
      salty: "too_little",
      sour: "just_right",
    },
    nps: 8,
  },
  {
    id: "review-6",
    rating: 5,
    willReorder: true,
    tastes: {
      spicy: "just_right",
      sweet: "just_right",
      salty: "just_right",
      sour: "just_right",
    },
    nps: 10,
  },
  {
    id: "review-7",
    rating: 3,
    willReorder: false,
    tastes: {
      spicy: "too_much",
      sweet: "too_little",
      salty: "too_little",
      sour: "just_right",
    },
    nps: 6,
  },
  {
    id: "review-8",
    rating: 5,
    willReorder: true,
    tastes: {
      spicy: "just_right",
      sweet: "just_right",
      salty: "just_right",
      sour: "just_right",
    },
    nps: 10,
  },
  {
    id: "review-9",
    rating: 4,
    willReorder: true,
    tastes: {
      spicy: "too_much",
      sweet: "just_right",
      salty: "too_little",
      sour: "just_right",
    },
    nps: 9,
  },
  {
    id: "review-10",
    rating: 4,
    willReorder: true,
    tastes: {
      spicy: "too_much",
      sweet: "just_right",
      salty: "just_right",
      sour: "just_right",
    },
    nps: 8,
  },
  {
    id: "review-11",
    rating: 3,
    willReorder: false,
    tastes: {
      spicy: "too_much",
      sweet: "just_right",
      salty: "too_little",
      sour: "just_right",
    },
    nps: 7,
  },
  {
    id: "review-12",
    rating: 5,
    willReorder: true,
    tastes: {
      spicy: "too_much",
      sweet: "just_right",
      salty: "just_right",
      sour: "just_right",
    },
    nps: 10,
  },
  {
    id: "review-13",
    rating: 4,
    willReorder: true,
    tastes: {
      spicy: "too_much",
      sweet: "just_right",
      salty: "just_right",
      sour: "just_right",
    },
    nps: 8,
  },
  {
    id: "review-14",
    rating: 5,
    willReorder: true,
    tastes: {
      spicy: "just_right",
      sweet: "just_right",
      salty: "too_little",
      sour: "just_right",
    },
    nps: 9,
  },
  {
    id: "review-15",
    rating: 3,
    willReorder: false,
    tastes: {
      spicy: "too_much",
      sweet: "just_right",
      salty: "just_right",
      sour: "just_right",
    },
    nps: 6,
  },
  {
    id: "review-16",
    rating: 4,
    willReorder: true,
    tastes: {
      spicy: "just_right",
      sweet: "just_right",
      salty: "too_little",
      sour: "just_right",
    },
    nps: 8,
  },
  {
    id: "review-17",
    rating: 5,
    willReorder: true,
    tastes: {
      spicy: "just_right",
      sweet: "just_right",
      salty: "just_right",
      sour: "just_right",
    },
    nps: 10,
  },
  {
    id: "review-18",
    rating: 4,
    willReorder: true,
    tastes: {
      spicy: "too_much",
      sweet: "just_right",
      salty: "just_right",
      sour: "just_right",
    },
    nps: 9,
  },
  {
    id: "review-19",
    rating: 5,
    willReorder: true,
    tastes: {
      spicy: "just_right",
      sweet: "just_right",
      salty: "just_right",
      sour: "just_right",
    },
    nps: 10,
  },
  {
    id: "review-20",
    rating: 4,
    willReorder: true,
    tastes: {
      spicy: "just_right",
      sweet: "just_right",
      salty: "too_little",
      sour: "just_right",
    },
    nps: 9,
  },
]
