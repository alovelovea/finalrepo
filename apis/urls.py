from django.urls import path
from .views_api import classify_query_view
from .views import (
    login_user,
    signup_user,
    fridge_items_api,
    save_fridge_items,
    ingredient_list_view,
    recommend_recipes_by_expiry,
    recipe_list_api,
    add_recipe,
    ingredient_list_api,
    toggle_like,
    update_fridge_item,
    delete_ingredient,
    create_shopping_records_api,
    recipe_detail_api,
)

urlpatterns = [
    # 로그인 
    path('api/login/', login_user, name='login_user'),
    # 회원가입
    path('api/signup/', signup_user, name='signup_user'),

    # GPT LLM 분석 호출
    path('classify/', classify_query_view, name='classify_query'),
    
    # 재료 추가 식재료 조회 (+쇼핑)
    path('fridge_items/', fridge_items_api, name='fridge_items_api'),
    #쇼핑 
    path('shopping/', create_shopping_records_api, name='create_shopping_records_api'),
    # 쇼핑 식재료 목록 API (수기추가)
    path("ingredients/list/", ingredient_list_view, name='ingredient_list_view'),
    #재료저장 (LLM 추가)
    path('api/fridge/save/', save_fridge_items, name='save_fridge_items'),

    #레시피 리스트 API 
    path('api/recipes/', recipe_list_api, name='recipe_list_api'),
    #레시피 저장 API
    path('api/add_recipe/', add_recipe, name='add_recipe'),
    #레시피 상세정보
    path('api/recipes/<int:recipe_id>/', recipe_detail_api, name='recipe_detail_api'),
    #재료 목록 제공 API 
    path('api/ingredients/', ingredient_list_api, name='ingredient_list_api'),
    
    # 좋아요 표시
    path('api/toggle_like/<int:recipe_id>/', toggle_like, name='toggle_like'),
    # ✅ 유통기한 임박 재료 기반 요리 추천
    path('api/recipes/recommend/expiry/', recommend_recipes_by_expiry, name='recommend_recipes_by_expiry'), #api/recipes/recommend/expiry/?user_id=minjae01
    # 쇼핑 식재료// GET /api/recipes/recommend/expiry/?user_id=minjae01
    # fetch('http://127.0.0.1:8000/api/recipes/recommend/expiry/?user_id=minjae01')
    #   .then(res => res.json())
    #   .then(data => console.log(data.recipes));

    #ingredientPage 수량 조절
    path('api/fridge_items/<int:fridge_id>/', update_fridge_item, name='update_fridge_item'),
    #ingredientPage 재료 삭제
    path('api/delete_ingredient/<int:fridge_id>/', delete_ingredient, name='delete_ingredient'),
]
