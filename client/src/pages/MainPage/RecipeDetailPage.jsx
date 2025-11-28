import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function RecipeDetailPage() {
  const { recipeId } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleClose = () => navigate(-1);

  const getImageURL = (fileName) => {
    if (!fileName) return "/FOOD/default.png";
    if (fileName.startsWith("/media/")) {
      return `http://localhost:8000${fileName}`;
    }
    return `/FOOD/${fileName}`;
  };

const handleSelect = () => {
  const user_id = localStorage.getItem("user_id");

  fetch(`http://localhost:8000/api/fridge/use-recipe/${recipeId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id }),   // ⭐ user_id 보내기
  })
    .then(res => res.json())
    .then(data => {
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
    if (window.confirm("정말로 이 레시피를 삭제하시겠습니까?")) {
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
    }
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
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">

        {/* 상단 제목 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{recipe.name}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 text-xl">✕</button>
        </div>

        {/* 본문 */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-auto">

          {/* 이미지 */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
              {recipe.image ? (
                <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
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
  

        {/* ⭐ 하단 버튼 바 */}
    
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
