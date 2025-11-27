# apis/scripts/load_like_data.py
from django.db import transaction
from apis.models import Like, Person, Recipe
from django.conf import settings
from pathlib import Path
import csv

def run():
    csv_path = Path(settings.BASE_DIR) / "apis" / "data" / "Like.csv"

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    print("🧹 기존 Like 데이터 삭제 중...")
    Like.objects.all().delete()
    print("✅ 기존 데이터 삭제 완료!")

    count = 0
    with csv_path.open(encoding="cp949", newline="") as f:
        reader = csv.DictReader(f)
        with transaction.atomic():
            for row in reader:
                try:
                    person = Person.objects.get(user_id=row["user_id"])
                    recipe = Recipe.objects.get(recipe_name=row["recipe_name"])
                    Like.objects.create(person=person, recipe=recipe)
                    count += 1
                except Person.DoesNotExist:
                    print(f"⚠️ 사용자 '{row['user_id']}' 를 찾을 수 없습니다.")
                except Recipe.DoesNotExist:
                    print(f"⚠️ 레시피 '{row['recipe_name']}' 를 찾을 수 없습니다.")

    print(f"✅ Like 데이터 {count}개 삽입 완료!")
