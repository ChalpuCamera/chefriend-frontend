### 가게 홍보 플로우

1. 사장님이 각 메뉴에 대한 홍보를 하기 위해 (캠페인, 피드백(리뷰)) 기능을 사용하려고 함
2. 생성하기 전 피드백 받고 싶은 항목을 선택함(10가지 중 자유롭게 택)
    매운맛
    짠맛
    단맛
    신맛
    바삭함
    쫄깃함
    부드러움
    양
    재료 신선도
    온도
    예시) 
        - A 음식 → [가, 다, 라, 마]
        - B 음식 → [가, 나]
        - C 음식 → [바, 사, 아]
3. 선택한 항목은 메뉴 당 DB에 저장되어서 불러올 수 있고 손님 입장에서는 DB에 저장된 항목들만 평가할 수 있음
4. 맛 평가와 함께 마지막 한마디 글쓰기는 위에서 리뷰 텍스트로 보여주고 맛 평가한 것은 네이버 리뷰 레퍼런스 처럼 간단하게 보여주기 -> 메뉴 상세 페이지에서 구현
    - 예시) 그림1
    
5. 맛 평가는 일단 간단하게 5단계로 설정(db 저장은 0 1 2 3 4)
    1. 많이 부족해요 / 약간 부족해요 / 적당해요 / 조금 강해요 / 너무 강해요
6. 사장님은 각 메뉴에 대한 이 기능을 on/off 할 수 있음 → 하나의 항목이라도 설정하면 on으로 되고 off는 api를 통해 설정된 값들 모두 삭제로 구현

기존의 /campaign 페이지에서처럼 
목록에는 리뷰를 받는 메뉴 항목들 나와 있고 각 메뉴들에는 설정 값(DB저장값)과 리뷰 수 보여주기
리뷰 받기 설정은 기존의 캠페인 생성처럼 설정하기
리뷰 받기를 off 할 수 있는데 이건 설정한 항목 값 다 삭제하는 api로 구현
이 모든 기능들은 새로 만든 review 폴더에 page와 add/page로 구현

필요한 api는 api-docs.json에 있음
- PUT
/api/fooditems/{foodItemId}/questions
메뉴별 활성화 질문 설정
- DELETE
/api/fooditems/{foodItemId}/question-off
사장님이 메뉴의 활성화 질문을 삭제하는 API

# api-docs.json에 없는 api
- 항목 전체 조회 (surveyId 2번으로 조회하면 됨)
"/api/surveys/{surveyId}/questions":{"get":{"tags":["Survey Question"],"summary":"서베이 질문 목록 조회","description":"특정 서베이에 포함된 모든 질문을 조회합니다. 사장님이 메뉴별로 활성화할 질문을 선택하기 위해 사용됩니다.","operationId":"getQuestionsBySurveyId","parameters":[{"name":"surveyId","in":"path","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseListSurveyQuestionResponse"}}}}}}}

- 특정 메뉴에 선택된 항목 표시(리뷰 기능 on 한 메뉴들에서 어떤 게 선택되었는 지 조회할 떄 사용)
"/api/fooditems/{foodItemId}/active-questions":{"get":{"tags":["Food Item Question"],"summary":"메뉴별 활성화된 질문 조회","description":"특정 메뉴에 대해 소비자가 답변 가능한 활성화된 질문 목록을 조회합니다.","operationId":"getActiveQuestions","parameters":[{"name":"foodItemId","in":"path","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseListActiveQuestionResponse"}}}}}}}

# 주요 api 사용 플로우
사장님 (질문 설정)
GET /api/surveys/{surveyId}/questions - 서베이의 전체 질문 확인
메뉴별로 원하는 질문 선택
PUT /api/fooditems/{foodItemId}/questions - 질문 활성화

# DB에 저장된 질문 값
    {
    "code": 200,
    "message": "API 요청이 성공했습니다.",
    "result": [
        {
        "questionId": 23,
        "questionText": "오늘 드신 음식의 맵기는 어떠셨나요?",
        "jarAttribute": "SPICINESS",
        "questionType": "RATING"
        },
        {
        "questionId": 24,
        "questionText": "오늘 드신 음식의 짠 정도는 어떠셨나요?",
        "jarAttribute": "SALTINESS",
        "questionType": "RATING"
        },
        {
        "questionId": 25,
        "questionText": "오늘 드신 음식의 달기는 어떠셨나요?",
        "jarAttribute": "SWEETNESS",
        "questionType": "RATING"
        },
        {
        "questionId": 26,
        "questionText": "오늘 드신 음식의 신맛은 어떠셨나요?",
        "jarAttribute": "SOURNESS",
        "questionType": "RATING"
        },
        {
        "questionId": 27,
        "questionText": "오늘 드신 음식의 바삭함은 어떠셨나요?",
        "jarAttribute": "CRISPINESS",
        "questionType": "RATING"
        },
        {
        "questionId": 28,
        "questionText": "오늘 드신 음식의 쫄깃함은 어떠셨나요?",
        "jarAttribute": "CHEWINESS",
        "questionType": "RATING"
        },
        {
        "questionId": 29,
        "questionText": "오늘 드신 음식의 부드러움은 어떠셨나요?",
        "jarAttribute": "TENDERNESS",
        "questionType": "RATING"
        },
        {
        "questionId": 30,
        "questionText": "오늘 드신 음식의 양은 어떠셨나요?",
        "jarAttribute": "PORTION_SIZE",
        "questionType": "RATING"
        },
        {
        "questionId": 31,
        "questionText": "오늘 드신 음식의 재료 신선도는 어떠셨나요?",
        "jarAttribute": "FRESHNESS",
        "questionType": "RATING"
        },
        {
        "questionId": 32,
        "questionText": "오늘 드신 음식의 온도는 어떠셨나요?",
        "jarAttribute": "TEMPERATURE",
        "questionType": "RATING"
        },
        {
        "questionId": 33,
        "questionText": "사장님께 딱 한 가지만 이야기할 수 있다면, 어떤 말을 해주고 싶으신가요?",
        "jarAttribute": "OWNER_MESSAGE",
        "questionType": "TEXT"
        }
    ]
    }
questionId 33 번은 설정 안해도 필수로 들어감


## 중간정리
지금 남은 거 플로팅 바 구현 재개

메뉴 상세 페이지에 텍스트 리뷰 UI 구현
    - 
리뷰 남기는 페이지 UI 피그마 따라 구성