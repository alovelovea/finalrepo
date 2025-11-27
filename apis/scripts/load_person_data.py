# apis/scripts/load_person_data.py
from django.conf import settings
from django.db import transaction
from apis.models import Person
from pathlib import Path
import csv

def _to_bool(s):
    return str(s).strip().lower() in ('true','1','y','yes','t')

def run():
    csv_path = Path(settings.BASE_DIR) / "apis" / "data" / "Person.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    inserted = updated = 0
    rows = []

    # 필요 시 전체 초기화:
    # Person.objects.all().delete()

    with csv_path.open(encoding="cp949", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)

    with transaction.atomic():
        for row in rows:
            obj, created = Person.objects.update_or_create(
                user_id=row['user_id'].strip(),
                defaults={
                    'name': (row.get('name') or '').strip(),
                    'password_2': (row.get('password_2') or '').strip(),
                    'address': (row.get('address') or '').strip(),
                    'is_vegan': _to_bool(row.get('is_vegan','')),
                }
            )
            inserted += int(created)
            updated  += int(not created)

    print(f"✅ Person 삽입 {inserted}건, 갱신 {updated}건 완료")
