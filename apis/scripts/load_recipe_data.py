# apis/scripts/load_recipe_data.py
from django.conf import settings
from django.db import transaction
from apis.models import Recipe
from pathlib import Path
import csv, os

def run():
    csv_path = Path(settings.BASE_DIR) / "apis" / "data" / "Recipe.csv"
    photo_base = "photo/FOOD/"  # DB 저장 상대경로

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    # 필요 시 초기화
    # Recipe.objects.all().delete()

    rows = []
    with csv_path.open(encoding="cp949", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(Recipe(
                recipe_name=row["recipe_name"],
                description=row.get("description", ""),
                recipe_img=os.path.join(photo_base, row["recipe_img"]).replace("\\", "/"),
                recipe_category=row.get("recipe_category", "기타"),
            ))

    with transaction.atomic():
        Recipe.objects.bulk_create(rows, batch_size=1000)

    print("✅ Recipe 데이터 삽입 완료!")
