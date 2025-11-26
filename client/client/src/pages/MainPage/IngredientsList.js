
import React, { useState } from 'react';
import IngredientsDialog from './IngredientsDialog';

const ingredients = [
  { name: '재료', amount: '수량' },
  { name: '재료', amount: '수량' },
  { name: '재료', amount: '수량' },
  { name: '재료', amount: '수량' },
  { name: '재료', amount: '수량' },
];

const IngredientsList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">All ingredients</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <ul className="space-y-2">
          {ingredients.map((ing, index) => (
            <li key={index} className="flex justify-between text-gray-700">
              <span>• {ing.name}</span>
              <span>{ing.amount}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={handleOpenDialog}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          전체 식재료 보기
        </button>
      </div>
      {isDialogOpen && <IngredientsDialog onClose={handleCloseDialog} />}
    </div>
  );
};

export default IngredientsList;
