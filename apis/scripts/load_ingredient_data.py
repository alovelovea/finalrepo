import os
import sys
import django
import csv
from decimal import Decimal

# ✅ Django 프로젝트 루트 경로 등록
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# ✅ Django 환경 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_fridge.settings')
django.setup()

# ✅ 모델 불러오기
from apis.models import Ingredient

# ✅ CSV 파일 경로
CSV_PATH = 'apis/data/Ingredient.csv'

# 기존 전체 데이터 삭제
Ingredient.objects.all().delete()

# CSV 읽어서 DB에 삽입
with open(CSV_PATH, encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        Ingredient.objects.create(
            ingredient_name=row['ingredient_name'],
            ingredient_img=row['ingredient_img'],
            unit=row['unit'],
            ingredient_category=row['ingredient_category'],

            # price는 base_unit 기준 가격
            price=Decimal(row['price']) if row['price'] else 0,

            # shelf_life
            shelf_life=int(row['shelf_life']) if row['shelf_life'] else 0,

            # 🆕 base_unit 추가
            base_unit=int(row['base_unit']) if row['base_unit'] else 1,
        )

print("✅ Ingredient 데이터 삽입 완료!")
