from django.conf import settings
from django.db import transaction
from pathlib import Path
from apis.models import AllergyIngredient, Ingredient, Allergy
import csv

def run():
    csv_path = Path(settings.BASE_DIR) / "apis" / "data" / "AllergyIngredient.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    print("🧹 AllergyIngredient 데이터 전체 삭제 중...")
    AllergyIngredient.objects.all().delete()
    print("✅ 기존 데이터 삭제 완료!")

    inserted = skipped = 0
    with csv_path.open(encoding="cp949") as f: 
        reader = csv.DictReader(f)
        rows = list(reader)

    with transaction.atomic():
        for row in rows:
            iname = (row.get("ingredient_name") or "").strip()
            aname = (row.get("allergy_name") or "").strip()

            try:
                ingredient = Ingredient.objects.get(ingredient_name=iname)
                allergy = Allergy.objects.get(allergy_name=aname)
            except Ingredient.DoesNotExist:
                print(f"⚠️ 재료 없음: {iname}")
                skipped += 1
                continue
            except Allergy.DoesNotExist:
                print(f"⚠️ 알러지 없음: {aname}")
                skipped += 1
                continue

            AllergyIngredient.objects.create(ingredient=ingredient, allergy=allergy)
            inserted += 1

    print(f"✅ AllergyIngredient 데이터 삽입 {inserted}건, 스킵 {skipped}건 완료!")
