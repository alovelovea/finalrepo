# apis/scripts/load_personAllergy_data.py
from django.conf import settings
from django.db import transaction
from pathlib import Path
from apis.models import Person, Allergy, PersonAllergy
import csv

def run():
    csv_path = Path(settings.BASE_DIR) / "apis" / "data" / "PersonAllergy.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    print("🧹 기존 PersonAllergy 데이터 삭제 중...")
    PersonAllergy.objects.all().delete()
    print("✅ 기존 데이터 삭제 완료!")

    inserted, skipped = 0, 0
    with csv_path.open(encoding="cp949", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    with transaction.atomic():
        for row in rows:
            user_id = (row.get("user_id") or "").strip()
            allergy_name = (row.get("allergy_name") or "").strip()
            if not user_id or not allergy_name:
                skipped += 1
                continue

            try:
                person = Person.objects.get(user_id=user_id)
            except Person.DoesNotExist:
                print(f"⚠️ 사용자 없음: {user_id}")
                skipped += 1
                continue

            try:
                allergy = Allergy.objects.get(allergy_name=allergy_name)
            except Allergy.DoesNotExist:
                print(f"⚠️ 알러지 없음: {allergy_name}")
                skipped += 1
                continue

            # 중복 방지 원하면 update_or_create로 교체 가능
            PersonAllergy.objects.create(person=person, allergy=allergy)
            inserted += 1

    print(f"🎯 PersonAllergy 삽입 {inserted}건, 스킵 {skipped}건 완료!")
