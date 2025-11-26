import React from 'react';
import { useParams, Link } from 'react-router-dom';

function RecipeDetailPage() {
  // useParams 훅을 사용하여 URL 파라미터(라우트의 :recipeId 부분)를 가져옵니다.
  const { recipeId } = useParams();

  // 실제 앱에서는 이 recipeId를 사용하여 Django API에
  // 해당 레시피의 상세 정보를 요청해야 합니다.
  // 예: fetch(`/api/recipes/${recipeId}`)

  return (
    <div className="p-8 pt-20">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">레시피 상세 정보</h1>
        <p className="text-lg mb-4">
          전달받은 레시피의 고유 ID는 <strong className="text-red-500">{recipeId}</strong> 입니다.
        </p>
        <p className="mb-6">
          이제 이 ID를 사용해서 Django 서버에 상세 데이터를 요청하고, 받아온 데이터를 이 페이지에 채워넣으면 됩니다.
        </p>
        <Link to="/home" className="text-blue-600 hover:underline">
          &larr; 메인 페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default RecipeDetailPage;
