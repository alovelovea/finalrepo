from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from .models import Person, Fridge, Ingredient, Like, Recipe, Allergy, PersonAllergy
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils.dateparse import parse_date
from rest_framework.decorators import api_view
from django.db import transaction
from django.db.models import Count
from .models import Person, Fridge, Ingredient, Like, Recipe, Allergy, PersonAllergy, RecipeIngredient,Shopping
from django.core.files.storage import default_storage
from django.conf import settings

# ✅ 로그인
@api_view(['POST'])
@csrf_exempt
def login_user(request):
    user_id = request.data.get('user_id')
    password_2 = request.data.get('password_2')

    try:
        # DB에서 user_id로 사용자 조회
        person = Person.objects.get(user_id=user_id)

        # 비밀번호 일치 확인
        if person.password_2 == password_2:
            return JsonResponse({
                "message": "로그인 성공",
                "user_id": person.user_id,
                "name": person.name,
                "address": person.address,
                "is_vegan": person.is_vegan
            }, status=200)
        else:
            return JsonResponse({"error": "비밀번호가 일치하지 않습니다."}, status=401)

    except Person.DoesNotExist:
        return JsonResponse({"error": "존재하지 않는 사용자입니다."}, status=404)


# ✅ 회원가입
@api_view(['POST'])
@csrf_exempt
def signup_user(request):
    try:
        data = request.data
        name = data.get('name')
        address = data.get('address')
        user_id = data.get('user_id')
        password_2 = data.get('password_2')
        is_vegan = data.get('is_vegan', False)
        allergies = data.get('allergies', [])

        # 중복 ID 체크
        if Person.objects.filter(user_id=user_id).exists():
            return JsonResponse({"error": "이미 존재하는 아이디입니다."}, status=400)

        # Person 생성
        person = Person.objects.create(
            name=name,
            address=address,
            user_id=user_id,
            password_2=password_2,
            is_vegan=is_vegan
        )

        # 알레르기 정보 추가 (있을 때만)
        for allergy_name in allergies:
            allergy_obj, _ = Allergy.objects.get_or_create(allergy_name=allergy_name)
            PersonAllergy.objects.create(person=person, allergy=allergy_obj)

        # 회원가입 완료 후 React에 전달할 데이터 (로그인처럼 동일 구조)
        return JsonResponse({
            "message": "회원가입 성공",
            "user_id": person.user_id,
            "name": person.name,
            "address": person.address,
            "is_vegan": person.is_vegan
        }, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    

# ingredientPage: fridge_id가 맞는 재료만 보내주기 API
@api_view(['GET'])
@csrf_exempt
def fridge_items_api(request):
    user_id = request.GET.get('user_id')
    try:
        person = Person.objects.get(user_id=user_id)
        fridge_items = Fridge.objects.filter(person=person).select_related('ingredient')

        data = [
            {
                "fridge_id": item.fridge_id,
                "ingredient": item.ingredient.ingredient_name,
                "quantity": float(item.f_quantity),
                "unit": item.ingredient.unit,
                "category": item.ingredient.ingredient_category,
                "expiry_date": item.expiry_date.strftime("%Y-%m-%d") if item.expiry_date else None,
            }
            for item in fridge_items
        ]
        return JsonResponse({"items": data}, status=200)

    except Person.DoesNotExist:
        return JsonResponse({"error": "존재하지 않는 사용자입니다."}, status=404)



# 쇼핑 식재료 목록 API (수기추가)
@csrf_exempt
def ingredient_list_view(request):
    data = list(
        Ingredient.objects.values(
            "ingredient_id",
            "ingredient_name",
            "ingredient_img",
            "unit"
        )
    )

    # React public/INGREDIENT 기준 URL 생성
    for item in data:
        img = item.get("ingredient_img")
        if img:
            item["ingredient_img"] = f"/INGREDIENT/{img}"

    return JsonResponse(data, safe=False)




#재료저장 (LLM 추가)
@api_view(['POST'])
@csrf_exempt
def save_fridge_items(request):
    data = request.data

    user_id = data.get("user_id")
    items = data.get("items", [])

    # 필드 검증
    if not user_id or not items:
        return JsonResponse(
            {"detail": "user_id and items are required"},
            status=400
        )

    # 사용자 확인
    try:
        person = Person.objects.get(user_id=user_id)
    except Person.DoesNotExist:
        return JsonResponse(
            {"detail": "person not found"},
            status=404
        )

    created_or_updated = []
    today = timezone.now().date()

    # 재료 저장 / 업데이트
    for item in items:
        ing_id = item.get("ingredient_id")
        quantity = item.get("quantity")

        if not ing_id or quantity is None:
            continue

        try:
            ingredient = Ingredient.objects.get(pk=ing_id)
        except Ingredient.DoesNotExist:
            continue

        fridge, _ = Fridge.objects.update_or_create(
            person=person,
            ingredient=ingredient,
            defaults={
                "f_quantity": quantity,
                "added_date": today,  # expiry_date는 모델 save()에서 자동 계산됨
            }
        )

        created_or_updated.append(fridge.fridge_id)

    return JsonResponse(
        {"status": "ok", "fridge_ids": created_or_updated},
        status=200
    )

# ✅ 유통기한 임박 재료 기반 요리 추천
@api_view(['GET'])
@csrf_exempt
def recommend_recipes_by_expiry(request):
    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"detail": "user_id is required"}, status=400)

    try:
        person = Person.objects.get(user_id=user_id)
    except Person.DoesNotExist:
        return JsonResponse({"detail": "person not found"}, status=404)

    today = timezone.now().date()

    # 1) 해당 사용자의 냉장고 재료 중 유통기한이 가까운 순으로 정렬
    #    (여기서는 상위 20개만 사용, 필요하면 숫자 조절)
    fridge_items = (
        Fridge.objects
        .filter(person=person, expiry_date__isnull=False)
        .order_by('expiry_date')[:20]
    )

    if not fridge_items:
        return JsonResponse({"recipes": []}, status=200)

    # 2) 유통기한 임박 재료 id 목록
    urgent_ingredient_ids = [f.ingredient_id for f in fridge_items]

    # 3) 이 재료들을 사용하는 레시피를 찾고
    #    "얼마나 많은 임박 재료를 포함하는지" 기준으로 점수 매기기
    agg = (
        RecipeIngredient.objects
        .filter(ingredient_id__in=urgent_ingredient_ids)
        .values('recipe_id')
        .annotate(match_count=Count('ingredient_id'))
        .order_by('-match_count', 'recipe_id')
    )

    if not agg:
        return JsonResponse({"recipes": []}, status=200)

    # match_count 맵으로 저장
    match_map = {row['recipe_id']: row['match_count'] for row in agg}
    recipe_ids = list(match_map.keys())

    # 4) 레시피 정보 조회
    recipes = (
        Recipe.objects
        .filter(recipe_id__in=recipe_ids)
    )

    # id 기준으로 정렬 (agg 순서를 유지하려고 파이썬에서 다시 정렬)
    recipe_by_id = {r.recipe_id: r for r in recipes}
    ordered_recipes = [recipe_by_id[rid] for rid in recipe_ids if rid in recipe_by_id]

    # 5) 응답용 데이터 만들기
    results = []
    for r in ordered_recipes:
        # 이 레시피에서 "임박 재료"만 뽑아서 이름 리스트로
        matched_ings = (
            RecipeIngredient.objects
            .filter(recipe=r, ingredient_id__in=urgent_ingredient_ids)
            .select_related('ingredient')
        )
        matched_names = [ri.ingredient.ingredient_name for ri in matched_ings]

        results.append({
            "recipe_id": r.recipe_id,
            "recipe_name": r.recipe_name,
            "recipe_img": r.recipe_img,
            "recipe_category": r.recipe_category,
            "match_count": match_map.get(r.recipe_id, 0),
            "matched_ingredients": matched_names,
        })

    return JsonResponse({"recipes": results}, status=200)

# 레시피 리스트 API
@api_view(['GET'])
def recipe_list_api(request):
    user_id = request.GET.get("user_id")
    person = Person.objects.get(user_id=user_id)

    recipes = Recipe.objects.all()
    liked_ids = Like.objects.filter(person=person).values_list("recipe_id", flat=True)

    data = []
    for r in recipes:
        ing_list = RecipeIngredient.objects.filter(recipe=r)
        ingredients = [
            f"{ri.ingredient.ingredient_name} {float(ri.r_quantity)}{ri.ingredient.unit}"
            for ri in ing_list
        ]

        data.append({
            "id": r.recipe_id,
            "name": r.recipe_name,
            "category": r.recipe_category,
            "image": r.recipe_img,
            "ingredients": ", ".join(ingredients),
            "favorite": r.recipe_id in liked_ids
        })

    return JsonResponse({"recipes": data})


# 레시피 저장 API
@api_view(['POST'])
@csrf_exempt
def add_recipe(request):
    try:
        # --- 기본 정보 ---
        name = request.POST.get("name")
        description = request.POST.get("description")
        category = request.POST.get("category")
        ingredients = json.loads(request.POST.get("ingredients", "[]"))
        image_file = request.FILES.get("image")

        # -------------------------
        # 1) Recipe 생성
        # -------------------------
        recipe = Recipe.objects.create(
            recipe_name=name,
            description=description,
            recipe_category=category
        )

        # -------------------------
        # 2) 이미지 파일 저장
        # -------------------------
        if image_file:
            save_path = default_storage.save(f"recipes/{image_file.name}", image_file)
            recipe.recipe_img = settings.MEDIA_URL + save_path
            recipe.save()

        # -------------------------
        # 3) RecipeIngredient 생성
        #    재료 이름만 넘어온다고 가정.
        #    수량은 기본 1로 저장.
        # -------------------------
        for ing_name in ingredients:
            ingredient = Ingredient.objects.get(ingredient_name=ing_name)

            RecipeIngredient.objects.create(
                recipe=recipe,
                ingredient=ingredient,
                r_quantity=1  # 기본 1개로 저장
            )

        return JsonResponse({"message": "레시피 저장 완료", "recipe_id": recipe.recipe_id}, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    

# 재료 목록 제공 API 
@api_view(['GET'])
@csrf_exempt
def ingredient_list_api(request):
    try:
        ingredients = Ingredient.objects.all()
        data = [
            {
                "ingredient_id": ing.ingredient_id,
                "name": ing.ingredient_name,
                "img": f"INGREDIENT/{ing.ingredient_img}",  # 🔥 prefix 적용
                "unit": ing.unit,
                "category": ing.ingredient_category,
                "price": float(ing.price),
                "shelf_life": ing.shelf_life
            }
            for ing in ingredients
        ]
        return JsonResponse({"ingredients": data}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


# 좋아요 표시
def toggle_like(request, recipe_id):
    person = Person.objects.get(user_id='minjae01')
    recipe = get_object_or_404(Recipe, pk=recipe_id)

    existing = Like.objects.filter(person=person, recipe=recipe)
    if existing.exists():
        existing.delete()
    else:
        Like.objects.create(person=person, recipe=recipe)

    return redirect("my_fridge")

#Fridge 수량 조절
@api_view(['PUT'])
@csrf_exempt
def update_fridge_item(request, fridge_id):
    try:
        item = get_object_or_404(Fridge, pk=fridge_id)
        
        new_quantity = request.data.get('quantity')
        
        if new_quantity is None:
            return JsonResponse({"error": "수량을 입력해주세요."}, status=400)
        
        item.f_quantity = new_quantity
        item.save()
        
        # 업데이트된 데이터를 다시 프론트엔드로 보내줍니다.
        updated_data = {
            "fridge_id": item.fridge_id,
            "ingredient": item.ingredient.ingredient_name,
            "quantity": float(item.f_quantity),
            "unit": item.ingredient.unit,
            "category": item.ingredient.ingredient_category,
            "added_date": item.added_date.strftime("%Y-%m-%d"),
            "expiry_date": item.expiry_date.strftime("%Y-%m-%d")
        }
        
        return JsonResponse(updated_data, status=200)

    except Fridge.DoesNotExist:
        return JsonResponse({"error": "해당 재료를 찾을 수 없습니다."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    
#Fridge 재료 삭제
@api_view(['DELETE'])
@csrf_exempt
def delete_ingredient(request, fridge_id):
    try:
        item = get_object_or_404(Fridge, pk=fridge_id)
        item.delete()
        return JsonResponse({"message": "재료가 성공적으로 삭제되었습니다."}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

#쇼핑
@api_view(['POST'])
@csrf_exempt
@transaction.atomic # 모든 작업이 성공하거나, 하나라도 실패하면 모두 롤백
def create_shopping_records_api(request):
    try:
        user_id = request.data.get('user_id')
        cart_items = request.data.get('items')

        if not user_id or not cart_items:
            return JsonResponse({"error": "사용자 ID와 장바구니 항목이 필요합니다."}, status=400)

        person = Person.objects.get(user_id=user_id)

        for item_data in cart_items:
            ingredient_id = item_data.get('ingredient_id')
            quantity = item_data.get('quantity')
            
            ingredient = Ingredient.objects.get(pk=ingredient_id)
            
            # Shopping 레코드 생성 (모델의 save 로직에 따라 Fridge에도 자동 추가됨)
            Shopping.objects.create(
                person=person,
                ingredient=ingredient,
                quantity=quantity,
                purchased_date=timezone.now().date()
            )
        
        return JsonResponse({"message": "구매가 성공적으로 처리되었고, 재료가 냉장고에 추가되었습니다."}, status=201)

    except Person.DoesNotExist:
        return JsonResponse({"error": "사용자를 찾을 수 없습니다."}, status=404)
    except Ingredient.DoesNotExist:
        return JsonResponse({"error": "장바구니에 유효하지 않은 재료가 포함되어 있습니다."}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

