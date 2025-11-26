import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Link 컴포넌트를 임포트합니다.

function RecommendedRecipes() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    // Django API 연동 전, 임시로 사용할 데이터 배열
    const temporaryRecipes = [
      { id: 1, name: '김치찌개' },
      { id: 2, name: '된장찌개' },
      { id: 3, name: '불고기' },
    ];
    setRecipes(temporaryRecipes);
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-bold mb-4 text-gray-800">추천 레시피</h2>
      {recipes.length > 0 ? (
        <ul>
          {recipes.map(recipe => (
            <li key={recipe.id} className="mb-2">
              {/* 
                Link 컴포넌트를 사용해 상세 페이지로 이동하는 링크를 생성합니다.
                to 속성에 숫자 ID를 포함시켜 동적인 URL을 만듭니다.
              */}
              <Link 
                to={`/recipes/${recipe.id}`} 
                className="text-green-600 hover:text-green-800 hover:underline"
              >
                {recipe.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">추천 레시피를 불러오는 중입니다...</p>
      )}
    </div>
  );
}

export default RecommendedRecipes;