import React from 'react';

const ingredientsData = {
  채소: ['감자', '고구마', '당근', '양파', '오이', '파', '마늘'],
  과일: ['사과', '바나나', '딸기', '포도', '수박'],
  육류: ['소고기', '돼지고기', '닭고기', '양고기'],
};

const IngredientsDialog = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">전체 식재료</h2>
        <div className="space-y-4">
          {Object.entries(ingredientsData).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-2">{category}</h3>
              <div className="grid grid-cols-3 gap-2">
                {items.map((item) => (
                  <label key={item} className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={onClose} // 일단은 닫기 기능으로 통일
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default IngredientsDialog;
