# apis/scripts/load_recipeIngredient_data.py
from django.conf import settings
from django.db import transaction
from pathlib import Path
from apis.models import RecipeIngredient, Recipe, Ingredient
import csv

def _to_float(s):
    try:
        return float(str(s).strip())
    except Exception:
        return 0.0

def run():
    csv_path = Path(settings.BASE_DIR) / "apis" / "data" / "RecipeIngredient.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    print("🧹 RecipeIngredient 데이터 전체 삭제 중...")
    RecipeIngredient.objects.all().delete()
    print("✅ 기존 데이터 삭제 완료!")

    inserted = skipped = 0
    with csv_path.open(encoding="cp949", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    with transaction.atomic():
        for row in rows:
            rname = (row.get("recipe_name") or "").strip()
            iname = (row.get("ingredient_name") or "").strip()
            r_quantity = _to_float(row.get("r_quantity"))

            try:
                recipe = Recipe.objects.get(recipe_name=rname)
                ingredient = Ingredient.objects.get(ingredient_name=iname)
            except Recipe.DoesNotExist:
                print(f"⚠️ 레시피 없음: {rname} (skip)")
                skipped += 1
                continue
            except Ingredient.DoesNotExist:
                print(f"⚠️ 재료 없음: {iname} (skip)")
                skipped += 1
                continue

            # 필요 시 upsert로 바꾸고 싶으면 아래 줄을 update_or_create로 교체 가능
            RecipeIngredient.objects.create(
                recipe=recipe, ingredient=ingredient, r_quantity=r_quantity
            )
            inserted += 1

    print(f"🎯 RecipeIngredient 데이터 {inserted}개 삽입, 스킵 {skipped}개 완료!")
