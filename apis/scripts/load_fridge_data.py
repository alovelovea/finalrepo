# apis/scripts/load_fridge_data.py
from django.conf import settings
from django.db import transaction
from apis.models import Fridge, Ingredient, Person
from pathlib import Path
from datetime import datetime
import csv

def _to_float(s):
    try:
        return float(str(s).strip())
    except Exception:
        return 0.0

def _to_date(s):
    s = str(s).strip()
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            pass
    raise ValueError(f"날짜 파싱 실패: {s}")

def run():
    csv_path = Path(settings.BASE_DIR) / "apis" / "data" / "Fridge.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    print("🧹 기존 Fridge 데이터 삭제 중...")
    Fridge.objects.all().delete()
    print("✅ 기존 데이터 삭제 완료!")

    inserted = skipped = 0

    with csv_path.open(encoding="cp949") as f: 
        reader = csv.DictReader(f)
        rows = list(reader)

    with transaction.atomic():
        for row in rows:
            user_id = (row.get("user_id") or "").strip()
            ing_name = (row.get("ingredient_name") or "").strip()

            try:
                f_qty = _to_float(row.get("f_quantity"))
                added_date = _to_date(row.get("added_date"))
            except Exception as e:
                print(f"⚠️ 잘못된 데이터(건너뜀): {row} | {e}")
                skipped += 1
                continue

            try:
                person = Person.objects.get(user_id=user_id)
            except Person.DoesNotExist:
                print(f"⚠️ 사용자 '{user_id}' 없음(건너뜀)")
                skipped += 1
                continue

            try:
                ingredient = Ingredient.objects.get(ingredient_name=ing_name)
            except Ingredient.DoesNotExist:
                print(f"⚠️ 재료 '{ing_name}' 없음(건너뜀)")
                skipped += 1
                continue

            # added_date만 넣으면 expiry_date는 모델 save()에서 자동 계산됨
            Fridge.objects.create(
                person=person,
                ingredient=ingredient,
                f_quantity=f_qty,
                added_date=added_date,
            )
            inserted += 1

    print(f"🎯 Fridge 데이터 {inserted}건 삽입, 스킵 {skipped}건 완료!")
