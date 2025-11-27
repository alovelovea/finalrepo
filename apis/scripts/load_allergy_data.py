# apis/scripts/load_allergy_data.py
from django.conf import settings
from django.db import transaction
from apis.models import Allergy
from pathlib import Path
import csv

def run():
    csv_path = Path(settings.BASE_DIR) / "apis" / "data" / "Allergy.csv"

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    Allergy.objects.all().delete()

    rows = []
    with csv_path.open(encoding="cp949", newline="") as f:

        reader = csv.DictReader(f)
        for row in reader:
            rows.append(Allergy(allergy_name=row["allergy_name"]))

    with transaction.atomic():
        Allergy.objects.bulk_create(rows, batch_size=1000)

    print("✅ Allergy 데이터 삽입 완료!")
