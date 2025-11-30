import React from 'react';


const AddIngredientDialog = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl relative w-full max-w-sm">
      <button 
        onClick={onClose} 
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
      >
        &times;
      </button>
      <p className="text-center">재료를 추가로 입력해주세요.</p>
    </div>
  </div>
);

export default AddIngredientDialog;
