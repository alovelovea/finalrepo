// src/pages/AddIngredientPage/components/AddIngredientDialog.jsx
import React, { useState, useEffect } from 'react';
import './AddIngredientDialog.css';

const AddIngredientDialog = ({ onClose, onConfirm }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [selected, setSelected] = useState([]); // 선택된 재료들

  useEffect(() => {
    fetch('http://127.0.0.1:8000/ingredients/list/')
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch((err) => console.error('Error fetching ingredients:', err));
  }, []);

  const toggleSelect = (item) => {
    setSelected((prev) =>
      prev.some((x) => x.ingredient_id === item.ingredient_id)
        ? prev.filter((x) => x.ingredient_id !== item.ingredient_id)
        : [...prev, item]
    );
  };

  const filteredIngredients = ingredients.filter((item) =>
    item.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    onConfirm && onConfirm(selected);
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog-container">
        <button
          onClick={onClose}
          className="dialog-close"
        >
          ×
        </button>

        <h2 className="dialog-title">재료 추가</h2>

        {/* 검색 바 */}
        <input
          type="text"
          placeholder="재료 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="dialog-search"
        />

        {/* 체크박스 리스트 */}
        <div className="dialog-list">
          {filteredIngredients.map((item) => (
            <label
              key={item.ingredient_id}
              className="dialog-item"
            >
              <input
                type="checkbox"
                checked={selected.some(
                  (x) => x.ingredient_id === item.ingredient_id
                )}
                onChange={() => toggleSelect(item)}
                className="dialog-checkbox"
              />
              <div className="dialog-item-text">
                <span className="dialog-item-name">{item.ingredient_name}</span>
                <span className="dialog-item-unit">({item.unit})</span>
              </div>
            </label>
          ))}
        </div>

        {/* 하단 버튼 */}
        <div className="dialog-actions">
          <button
            onClick={onClose}
            className="dialog-btn dialog-btn--gray"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="dialog-btn dialog-btn--blue"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddIngredientDialog;
