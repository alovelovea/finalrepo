import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecommendedRecipes from './RecommendedRecipes';
import Fridge from './Fridge';
import IngredientsList from './IngredientsList';

const MainPage = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [fridgeItems, setFridgeItems] = useState([]); // 냉장고 재료 상태 추가
  const [recommendedRecipes, setRecommendedRecipes] = useState([]); // 추천 레시피 상태 추가
  const currentUserId = localStorage.getItem("user_id") || null; // 로그인한 사용자 ID 가져오기

  // API에서 데이터(추천 레시피, 냉장고 재료)를 가져오는 useEffect 훅
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUserId) {
        console.log("로그인한 사용자가 없어 데이터를 가져오지 않습니다.");
        setRecommendedRecipes([]);
        setFridgeItems([]);
        return;
      }
      try {
        // 두 API를 동시에 호출
        const [recipesResponse, fridgeResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/recipes/recommend/expiry/?user_id=${currentUserId}`),
          axios.get(`http://localhost:8000/fridge_items/?user_id=${currentUserId}`)
        ]);
        
        setRecommendedRecipes(recipesResponse.data.recipes);
        setFridgeItems(fridgeResponse.data.items);

      } catch (error) {
        console.error('데이터를 가져오는데 실패했습니다.', error);
      }
    };

    fetchData();
  }, [currentUserId]);


  return (
    <main className="p-8 pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* 추천 레시피 (왼쪽) */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold mb-4 text-gray-800">추천 레시피</h2>
          <div className="p-4 border rounded-lg shadow-sm bg-white">
          
            <div className="divide-y">
              {/* API에서 가져온 추천 레시피 중 상위 5개만 렌더링 */}
              {recommendedRecipes.slice(0, 3).map((r) => (
                <div key={r.recipe_id} className="last:border-b-0">
                  <RecommendedRecipes
                    id={r.recipe_id}
                    name={r.recipe_name}
                    description={`활용 가능한 재료: ${r.matched_ingredients.join(', ')}`}
                    image={`/FOOD/${r.recipe_img}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 냉장고 이미지(중앙) */}
        <div className="lg:col-span-1">
          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <Fridge onSelectSection={setSelectedSection} selectedSection={selectedSection} />
          </div>
        </div>

        {/* 재료 목록(우측) - 제목과 버튼을 카드 밖에 배치 */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-800">
              {selectedSection ? `${selectedSection}번 재료목록` : '전체 재료목록'}
            </h2>
            <button
              onClick={() => setSelectedSection(null)}
              className="ml-4 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
            >
              전체 식재료 보기
            </button>
          </div>

          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <IngredientsList selectedSection={selectedSection} items={fridgeItems} />
          </div>
        </div>
      </div>
    </main>
  );
};


export default MainPage;
// ...existing code...