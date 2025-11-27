# apis/scripts/load_ingredient_data.py
from django.conf import settings
from django.db import transaction
from apis.models import Ingredient
from pathlib import Path
import csv
import os

def run():
    csv_path = Path(settings.BASE_DIR) / "apis" / "data" / "Ingredient.csv"
    photo_base = "photo/INGREDIENT/"

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    Ingredient.objects.all().delete()

    to_create = []
    with csv_path.open(encoding="cp949") as f:   # Windows CSV면 cp949가 안전
        reader = csv.DictReader(f)
        for row in reader:
            to_create.append(
                Ingredient(
                    ingredient_name=row["ingredient_name"],
                    ingredient_img=os.path.join(photo_base, row["ingredient_img"]).replace("\\", "/"),
                    unit=row["unit"],
                    ingredient_category=row.get("ingredient_category") or "기타",
                    price=row.get("price") or 0,
                    shelf_life=int(row.get("shelf_life", 3)),   # 🔥 추가된 부분
                )
            )

    with transaction.atomic():
        Ingredient.objects.bulk_create(to_create, batch_size=1000)

    print("✅ Ingredient 데이터 삽입 완료!")
