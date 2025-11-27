# apis/scripts/convert_korean_images.py
from django.conf import settings
from apis.models import Ingredient

def run():
    # 1) 한글 → 영어 매핑 테이블
    mapping = {
        "photo/INGREDIENT/감자.jpg": "potato.jpg",
        "photo/INGREDIENT/두부.jpg": "tofu.jpg",
        "photo/INGREDIENT/애호박.jpg": "zucchini.jpg",
        "photo/INGREDIENT/대파.jpg": "green_onion.jpg",
        "photo/INGREDIENT/마늘.jpg": "garlic.jpg",
        "photo/INGREDIENT/삼겹살.jpg": "pork.jpg",
        "photo/INGREDIENT/목살.jpg": "pork_neck.jpg",
        "photo/INGREDIENT/버터.jpg": "butter.jpg",
        "photo/INGREDIENT/고구마.jpg": "sweet_potato.jpg",
        "photo/INGREDIENT/고등어.jpg": "mackerel.jpg",
        "photo/INGREDIENT/고추장.jpg": "gochujang.jpg",
        "photo/INGREDIENT/단호박.jpg": "pumpkin.jpg",
        "photo/INGREDIENT/무.png": "radish.png",
        "photo/INGREDIENT/당근.jpg": "carrot.jpg",
        "photo/INGREDIENT/베이컨.jpg": "bacon.jpg",
        "photo/INGREDIENT/가지.jpg": "eggplant.jpg",
        "photo/INGREDIENT/김치볶음밥(냉동).jpg": "kimchi_fried_rice_frozen.jpg",
        "photo/INGREDIENT/김치치즈주먹밥(냉동).jpg": "kimchi_cheese_riceball_frozen.jpg",
        "photo/INGREDIENT/냉동만두.jpg": "dumpling_frozen.jpg",
        "photo/INGREDIENT/다진 마늘.jpg": "minced_garlic.jpg",
        "photo/INGREDIENT/단백질쉐이크.jfif": "protein_shake.jpg",
        "photo/INGREDIENT/된장.jpg": "doenjang.jpg",
        "photo/INGREDIENT/마요네즈.jpg": "mayonnaise.jpg",
        "photo/INGREDIENT/메추리알.jpg": "quail_egg.jpg",
        "photo/INGREDIENT/미꾸라지.jpg": "loach.jpg",
        "photo/INGREDIENT/바닷가재.jpg": "lobster.jpg",
        "photo/INGREDIENT/바밤바.jpg": "babamba_icecream.jpg",
        "photo/INGREDIENT/배추김치.jpg": "baechu_kimchi.jpg",
        "photo/INGREDIENT/부추.jpg": "buchu.jpg",
        "photo/INGREDIENT/사과.png": "apple.png",
        "photo/INGREDIENT/새우.jpg": "shrimp.jpg",
        "photo/INGREDIENT/생강.png": "ginger.png",
        "photo/INGREDIENT/소고기.jpg": "beef.jpg",
        "photo/INGREDIENT/시래기.jpg": "siraegi.jpg",
        "photo/INGREDIENT/쌈장.jpg": "ssamjang.jpg",
        "photo/INGREDIENT/아보카도.jpg": "avocado.jpg",
        "photo/INGREDIENT/양파.jpg": "onion.jpg",
        "photo/INGREDIENT/어묵.jpg": "fish_cake.jpg",
        "photo/INGREDIENT/오이.jpg": "cucumber.jpg",
        "photo/INGREDIENT/오징어.jpg": "squid.jpg",
        "photo/INGREDIENT/요거트.jpg": "yogurt.jpg",
        "photo/INGREDIENT/청양고추.jpg": "cheongyang_chili.jpg",
        "photo/INGREDIENT/춘장.jpg": "chunjang.jpg",
        "photo/INGREDIENT/토마토.jpg": "tomato.jpg",
        "photo/INGREDIENT/팝콘치킨.jpg": "popcorn_chicken.jpg",
    }

    print("📌 Ingredient DB 이미지명 영어로 업데이트 시작...")

    updated_total = 0

    for kor, eng in mapping.items():
        count = Ingredient.objects.filter(ingredient_img=kor).update(ingredient_img=eng)
        if count:
            print(f"🟢 DB 업데이트: {kor} → {eng} ({count}개 변경됨)")
            updated_total += count
        else:
            print(f"⚠️ DB에 해당 이미지 없음: {kor}")

    print(f"🎉 DB 업데이트 완료! 총 {updated_total}개 변경됨")
