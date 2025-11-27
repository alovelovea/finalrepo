// ...existing code...
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeById } from './data/recipes';

function RecipeDetailPage() {
  const { recipeId } = useParams();
  const navigate = useNavigate();

  const recipe = getRecipeById(recipeId);
  const sample = {
    title: recipe ? recipe.name : `레시피 이름 ${recipeId}`,
    ingredients: recipe ? recipe.ingredients : ['재료 1', '재료 2', '재료 3', '재료 4', '재료 5', '재료 6', '재료 2', '재료 3', '재료 4', '재료 5', '재료 6', '재료 2', '재료 3', '재료 4', '재료 5', '재료 6'],
    image: recipe ? recipe.image : null,
    instructions: recipe ? recipe.instructions || '냄비에 물을 끓인다. 끓는 물에 재료를 넣고 익힌다. ...' : '냄비에 물을 끓인다. 끓는 물에 재료를 넣고 익힌다. ...',
  };

  const handleClose = () => navigate(-1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{sample.title}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 text-xl">✕</button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 좌측: 이미지(상) + 재료(하, 스크롤) */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
              <img src={sample.image} alt={sample.title} className="w-full h-full object-cover object-center" />
            </div>

            <div>
              <h3 className="font-semibold mb-2">[재료]</h3>
              <div className="max-h-48 overflow-y-auto pr-2 text-gray-700">
                <ul className="list-disc pl-5 space-y-2">
                  {sample.ingredients.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 우측: 조리법(스크롤) */}
          <div>
            <h3 className="font-semibold mb-2">[요리법]</h3>
            <div className="max-h-72 overflow-y-auto text-sm text-gray-700">
              <p className="whitespace-pre-line">{sample.instructions}</p>
              {/* 예시로 길게 보이게 반복 가능 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetailPage;
// ...existing code...