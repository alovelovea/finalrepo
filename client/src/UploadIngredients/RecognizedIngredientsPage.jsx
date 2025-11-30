import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AddIngredientDialog from './AddIngredientDialog';

const RecognizedIngredientsPage = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-20">인식된 재료 목록</h2>
        
        
        <div className="flex flex-col items-center space-y-4">
          <button onClick={() => navigate('/upload')} className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg w-48">
            재료 다시 인식
          </button>
          <button onClick={() => setIsDialogOpen(true)} className="bg-blue-500 text-white py-2 px-6 rounded-lg w-48">
            재료 추가입력
          </button>
          <Link to="/home" className="w-48">
            <button className="bg-green-500 text-white py-2 px-6 rounded-lg w-full">
              자료 인식 완료
            </button>
          </Link>
        </div>
      </div>

      
      {isDialogOpen && <AddIngredientDialog onClose={() => setIsDialogOpen(false)} />}
    </div>
  );
};

export default RecognizedIngredientsPage;
