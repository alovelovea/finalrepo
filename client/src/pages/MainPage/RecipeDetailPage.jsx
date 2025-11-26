import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function RecipeDetailPage() {
  const { recipeId } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleClose = () => navigate(-1);

  // ⭐ 정적/업로드 이미지 자동 경로 처리 함수
  const getImageURL = (fileName) => {
    if (!fileName) return "/FOOD/default.png";

    // 업로드 이미지: /media/... 형태로 저장된 경우
    if (fileName.startsWith("/media/")) {
      return `http://localhost:8000${fileName}`;
    }

    // 파일명만 있다 → 정적 이미지 (public/FOOD)
    return `/FOOD/${fileName}`;
  };

  useEffect(() => {
    fetch(`http://localhost:8000/api/recipes/${recipeId}/`)
      .then(res => res.json())
      .then(data => {
        const mapped = {
          ...data,
          image: getImageURL(data.image),  // ⭐ 이미지 경로 자동 변환
        };
        setRecipe(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error("API ERROR:", err);
        setLoading(false);
      });
  }, [recipeId]);

  if (loading) return <div className="text-center mt-20">불러오는 중...</div>;
  if (!recipe) return <div className="text-center mt-20">레시피를 찾을 수 없습니다.</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{recipe.name}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 text-xl">✕</button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 이미지 */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
              {recipe.image ? (
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">이미지 없음</span>
              )}
            </div>

            {/* 재료 */}
            <div>
              <h3 className="font-semibold mb-2">[재료]</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {recipe.ingredients_list.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 설명 */}
          <div>
            <h3 className="font-semibold mb-2">[조리 설명]</h3>
            <div className="max-h-72 overflow-y-auto text-sm text-gray-700">
              <p className="whitespace-pre-line">{recipe.description}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RecipeDetailPage;
