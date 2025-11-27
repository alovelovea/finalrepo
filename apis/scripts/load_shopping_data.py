# apis/scripts/load_shopping_data.py
from django.conf import settings
from django.db import transaction
from pathlib import Path
from apis.models import Shopping, Person, Ingredient
import csv
from datetime import datetime

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
    csv_path = Path(settings.BASE_DIR) / "apis" / "data" / "Shopping.csv"

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    print("🧹 기존 Shopping 데이터 삭제 중...")
    Shopping.objects.all().delete()
    print("✅ 기존 데이터 삭제 완료!")

    inserted = skipped = 0

    with csv_path.open(encoding="cp949", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    with transaction.atomic():
        for row in rows:
            user_id = (row.get("user_id") or "").strip()
            iname = (row.get("ingredient") or "").strip()
            qty = _to_float(row.get("quantity"))
            try:
                purchased_date = _to_date(row.get("purchased_date"))
            except Exception as e:
                print(f"⚠️ 날짜 파싱 실패: {row} | {e}")
                skipped += 1
                continue

            # 사용자 찾기
            try:
                person = Person.objects.get(user_id=user_id)
            except Person.DoesNotExist:
                print(f"⚠️ 사용자 없음: {user_id}")
                skipped += 1
                continue

            # 재료 찾기
            try:
                ingredient = Ingredient.objects.get(ingredient_name=iname)
            except Ingredient.DoesNotExist:
                print(f"⚠️ 재료 없음: {iname}")
                skipped += 1
                continue

            # Shopping 생성 → save()에서 가격 계산 및 Fridge 자동 생성됨
            Shopping.objects.create(
                person=person,
                ingredient=ingredient,
                quantity=qty,
                purchased_date=purchased_date
            )
            inserted += 1

    print(f"🎉 Shopping {inserted}건 삽입 완료! (스킵 {skipped}건)")
