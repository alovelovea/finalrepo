from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from django.utils import timezone
from .models import Person, Fridge, Ingredient, Like, Recipe, Allergy, PersonAllergy
from django.views.decorators.csrf import csrf_exempt
import json,os,base64,mimetypes
from django.utils.dateparse import parse_date
from rest_framework.decorators import api_view
import re

# key는 공백
llm_consistent = None
try:
    # 이 부분은 환경 변수나 Django 설정 파일에서 관리하는 것이 보안상 더 좋습니다.
    llm_consistent = ChatOpenAI(
        model='gpt-4o',
        api_key="",
        temperature=0,
        max_tokens=1000,
        top_p=0.3,
        frequency_penalty=0.1,
    )
except Exception as e:
    print(f"⚠️ ChatOpenAI 초기화 실패: {e}")

def _parse_quantity_from_amount(amount: str) -> float:
    """'3개', '500g', '1.5L' 에서 숫자만 뽑아 float으로."""
    if not amount:
        return 0
    m = re.search(r'(\d+(?:\.\d+)?)', amount)
    if not m:
        return 0
    return float(m.group(1))


@api_view(['POST'])
@csrf_exempt
def classify_query_view(request):
    uploaded_file = request.FILES.get("image")
    base64_image_data = None
    media_type = "image/jpeg"
    food_text = "" # 예외 발생 시 디버깅을 위해 미리 선언

    if uploaded_file:
        try:
            media_type = uploaded_file.content_type or "image/jpeg"
            base64_image_data = base64.b64encode(uploaded_file.read()).decode("utf-8")
        except Exception:
            return JsonResponse({"detail": "failed to read uploaded file"}, status=400, safe=False)
    else:
        # 파일이 없을 경우 텍스트/경로 처리 로직 (기존 유지)
        user_input = (request.POST.get("query") or request.GET.get("query") or "").strip()
        if not user_input:
            try:
                user_input = request.body.decode("utf-8").strip()
            except Exception:
                user_input = ""

        if not user_input:
            return JsonResponse({"detail": "empty query"}, status=400, safe=False)

        if user_input.lower().startswith(("http://", "https://")):
            return JsonResponse({"detail": "URL 입력은 현재 지원되지 않습니다."}, status=400, safe=False)
        else:
            if not os.path.exists(user_input):
                return JsonResponse({"detail": f"file not found: {user_input}"}, status=400, safe=False)
            try:
                with open(user_input, "rb") as f:
                    base64_image_data = base64.b64encode(f.read()).decode("utf-8")
                media_type = mimetypes.guess_type(user_input)[0] or "image/jpeg"
            except Exception:
                return JsonResponse({"detail": "failed to read image path"}, status=400, safe=False)

    if llm_consistent is None:
        return JsonResponse({"detail": "LLM not initialized"}, status=503, safe=False)

    image_data_uri = f"data:{media_type};base64,{base64_image_data}"

    system_prompt = """
            [역할] 
            당신은 냉장고 이미지 속 재료를 식별하고, 아래의 '재료 목록'과 '수량 판별 규칙'에 따라 각 항목의 정확한 수량을 판별하는 전문 분석가입니다.
            [작업 목표] 
            제공된 이미지에서 '재료 목록'에 있는 각 재료가 얼마나 있는지 '수량 판별 규칙'에 따라 분석하고, '출력 형식'에 맞춰 응답하세요.
            [재료 목록]
            신선식품: '고추장','두부','감자','애호박','양파','대파','청양고추','마늘','당근','배추김치','다진마늘',
            '무','된장','오이','아보카도','사과','버터','어묵','쌈장','마요네즈','메추리알','부추','춘장',
            '가지','고구마','단호박','시래기','생강','토마토'
            유제품: '요거트','단백질쉐이크','계란'
            냉동: '바닷가재','삼겹살','미꾸라지','소고기','목살','베이컨','오징어','고등어','새우'
            냉동식품: '바밤바','김치치즈주먹밥','김치볶음밥','냉동만두','팝콘치킨',
    
            [수량 판별 규칙]
            명확성 원칙: 이미지에서 명확하게 식별되는 재료만 계산합니다.
            추론 원칙:
            그림자, 포장 형태, 쌓인 패턴 등 명백한 시각적 근거가 있어 가려진 부분의 수량을 확실하게 추론할 수 있다면 계산에 포함합니다.
            수량 단위 규칙: 재료의 특성에 따라 다음 단위를 우선순위로 적용합니다.
    
            A. '개' (낱개 카운트):
            '바밤바', '김치치즈주먹밥', '김치볶음밥', '계란', '요거트', '감자','애호박','양파',
            '청양고추','당근','무','오이','아보카도','사과','메추리알','가지','토마토'
            형태가 명확한 낱개 재료.
            출력 예: '감자': 3개

            B. '단' (묶음 카운트):
            '대파', '부추', '깻잎' 등 전통적으로 묶음(단) 단위로 식별되는 재료.
            만약 낱개로 풀려있다면 'A' 규칙을 따라 n개로 표기합니다.
            출력 예: '대파': 1단

            C. '줄','쪽','모':
            줄 : '대파'등
            낱개인데 갯수단위가 아닌 줄단위로 떨어지는 식품
            쪽,모 : '마늘', '두부' 등 특수하게 단위를 샐 수 있는 경우
            출력 예: '대파': '3줄'
            출력 예: '마늘': '10쪽'
            출력 예: '두부': '1모'

            D. 'g' / 'kg' / 'L' (라벨 중량/용량 읽기):
            '고추장', '된장', '쌈장', '삼겹살','버터','어묵','마요네즈','춘장','고구마','단호박','시래기','생강',
            '배추김치','다진마늘','베이컨','소고기','목살','냉동만두','팝콘치킨,
            포장지에 무게(g, kg)가 명시된 재료.
            '우유','단백질쉐이크' 등 액체류는 용량(L, ml)을 읽습니다. 라벨을 읽는 것을 우선으로 합니다.
            출력 예: '삼겹살': 500g, '고추장': '1kg', '우유': '1L' '고추장': '100g'

            E. '마리':
            '미꾸라지','바닷가재','고등어','새우','오징어' 등
            마리 단위로 셀 수 있는 경우

            제외: 목록에 있으나 이미지에서 발견되지 않은 재료(0개)는 출력하지 않습니다.
            이미지에서 시각적으로 확인되지 않거나 추론 불가능한 재료는 출력하지 않습니다.
            '없음', '모름', '추정' 등의 단어는 절대 사용하지 않습니다.
    
            [출력 형식]
            예시:
            {
            "감자": "3개",
            "삼겹살": "500g",
            "고추장": "1kg",
            "두부": "1모",
            "계란": "10개",
            "다진마늘": "100g",
            }
            **주의: 이 JSON 객체 외에 어떠한 설명이나 추가 문장도 포함하지 말고, 오직 JSON 객체 자체만 출력하십시오.**
    """

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=[
            {"type": "image_url", "image_url": {"url": image_data_uri}}
        ])
    ]

    try:
        response = llm_consistent.invoke(messages)
        food_text = response.content  # LLM 응답

        # JSON 객체만 추출
        start_index = food_text.find('{')
        end_index = food_text.rfind('}')
        
        if start_index != -1 and end_index != -1 and end_index > start_index:
            json_string = food_text[start_index:end_index + 1]
            parsed = json.loads(json_string)
        else:
            raise ValueError("LLM 응답에서 유효한 JSON 객체 경계가 발견되지 않았습니다.")

        if not isinstance(parsed, dict):
            raise TypeError("LLM 결과는 JSON 객체({})여야 합니다.")
        
    except Exception as e:
        return JsonResponse(
            {
                "items": [],
                "error": f"LLM 처리 오류: {type(e).__name__}: {str(e)}",
                "raw": food_text,
            },
            status=500,
            safe=False,
        )

    food_json = parsed  # {"감자": "3개", ...}

    # Ingredient 매칭
    items = []
    for name, amount in food_json.items():
        ing = Ingredient.objects.filter(ingredient_name=name.strip()).first()
        if not ing:
            continue

        items.append({
            "ingredient_id": ing.ingredient_id,
            "ingredient_name": ing.ingredient_name,
            "ingredient_img": f"/INGREDIENT/{ing.ingredient_img}",
            "amount": amount,
        })

    return JsonResponse({"items": items})
