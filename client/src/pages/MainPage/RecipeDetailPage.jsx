import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function RecipeDetailPage() {
  const { recipeId } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⭐ 구조화된 부족 재료 배열
  const [missingIngredients, setMissingIngredients] = useState([]);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [userAllergies, setUserAllergies] = useState([]);
  const [allergyMap, setAllergyMap] = useState({});

  useEffect(() => {
    // 유저 알러지 정보 불러오기
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser && parsedUser.allergies) {
        setUserAllergies(parsedUser.allergies);
      }
    }

    // 알러지-재료 맵 불러오기
    fetch('http://localhost:8000/api/allergies/map/')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => setAllergyMap(data))
      .catch(err => console.error("알러지 맵 로딩 실패:", err));
  }, []);

  const handleClose = () => navigate(-1);

  const getImageURL = (fileName) => {
    if (!fileName) return "/FOOD/default.png";
    if (fileName.startsWith("/media/")) {
      return `http://localhost:8000${fileName}`;
    }
    return `/FOOD/${fileName}`;
  };

  // ⭐ 쇼핑 페이지로 이동 (DB 저장 X)
  const handleGoShopping = () => {
    navigate("/shopping", {
      state: { missingItems: missingIngredients }
    });
  };

  // ⭐ 요리 실행
  const handleSelect = () => {
    const user_id = localStorage.getItem("user_id");

    fetch(`http://localhost:8000/api/fridge/use-recipe/${recipeId}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id }),
    })
      .then(res => res.json())
      .then(data => {

        if (data.status === "insufficient") {
          // 🔥 이제 data.shortage는 구조화된 객체 배열
          setMissingIngredients(data.shortage);
          setShowMissingModal(true);
          return;
        }

        if (data.status === "success") {
          alert('레시피의 재료가 냉장고에서 사용되었습니다.');
          navigate(-1);
        } else {
          alert(data.message || '재료 사용에 실패했습니다.');
        }
      })
      .catch(err => {
        console.error("API ERROR:", err);
        alert('오류가 발생했습니다.');
      });
  };

  const handleDelete = () => {
    if (!window.confirm("정말로 이 레시피를 삭제하시겠습니까?")) return;

    fetch(`http://localhost:8000/api/recipes/${recipeId}/`, {
      method: 'DELETE',
    })
      .then(res => {
        if (res.ok) {
          alert("레시피가 삭제되었습니다.");
          navigate(-1);
        } else {
          res.json().then(data => alert(`삭제 실패: ${data.error}`));
        }
      })
      .catch(err => {
        console.error("API ERROR:", err);
        alert("삭제 중 오류가 발생했습니다.");
      });
  };

  useEffect(() => {
    fetch(`http://localhost:8000/api/recipes/${recipeId}/`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);

        setRecipe({
          ...data,
          image: getImageURL(data.image),
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("API ERROR:", err);
        setRecipe(null);
        setLoading(false);
      });
  }, [recipeId]);

  if (loading) return <div className="text-center mt-20">불러오는 중...</div>;
  if (!recipe) return <div className="text-center mt-20">레시피를 찾을 수 없습니다.</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      
      {/* ⭐ 부족 재료 모달 */}
      {showMissingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
            <h3 className="font-bold text-lg mb-3">재료가 부족합니다</h3>

            <ul className="list-disc pl-5 text-gray-700 mb-4">
              {missingIngredients.map((item, idx) => (
                <li key={idx}>
                  {item.name}: {item.missing_qty}{item.unit} 부족
                  <br />
                  
                </li>
              ))}
            </ul>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowMissingModal(false)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                닫기
              </button>

              <button
                onClick={handleGoShopping}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                쇼핑하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 기존 페이지 UI */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{recipe.name}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 text-xl">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-6 flex-1 overflow-auto">

          {/* Row 1: Picture and Ingredients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1.1: Picture */}
            <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
              <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
            </div>
            {/* Column 1.2: Ingredients */}
            <div>
              <h3 className="font-semibold mb-2">[재료]</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 max-h-56 overflow-y-auto">
                {recipe.ingredients_list.map((item, idx) => {
                  // 알러지 맵을 사용하여 알러지 여부 확인
                  const isAllergic = userAllergies.some(userAllergyCategory => {
                    const ingredientsInAllergyCategory = allergyMap[userAllergyCategory];
                    if (!ingredientsInAllergyCategory) {
                      return false;
                    }
                    // 해당 알러지 카테고리에 속하는 재료 중 하나라도 레시피 아이템 문자열에 포함되는지 확인
                    return ingredientsInAllergyCategory.some(allergicIngredient => 
                      item.includes(allergicIngredient)
                    );
                  });

                  return (
                    <li key={idx}>
                      {item}
                      {isAllergic && (
                        <span className="text-red-500 font-bold ml-2">알러지 주의 식품</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Row 2: Cooking Instructions */}
          <div>
            <h3 className="font-semibold mb-2">[조리 설명]</h3>
            <div className="max-h-72 overflow-y-auto text-sm text-gray-700 whitespace-pre-line">
              {recipe.description}
            </div>
          </div>

        </div>

        <div className="w-full border-t p-4 flex justify-end gap-4 bg-white">
          <button
            onClick={handleSelect}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md"
          >
            요리
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetailPage;
