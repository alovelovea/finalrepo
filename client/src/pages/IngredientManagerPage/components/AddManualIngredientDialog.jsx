
import React, { useState } from 'react';
import axios from 'axios';
import AddIngredientDialog from '../../AddIngredientPage/components/AddIngredientDialog';
import '../../AddIngredientPage/css/RecognizedIngredientsPage.css';
import '../css/AddIngredientDialog.css';

const AddManualIngredientDialog = ({ onClose, userId }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [items, setItems] = useState([]);

 
  const effectiveUserId = userId || localStorage.getItem('user_id');

  const decreaseAmount = (index) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
    );
  };

  const increaseAmount = (index) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleAddFromDialog = (selectedIngredients) => {
    if (!selectedIngredients || selectedIngredients.length === 0) {
      setIsAddDialogOpen(false);
      return;
    }
    const newItems = selectedIngredients.map((ing) => ({
      ingredient_id: ing.ingredient_id,
      ingredient_name: ing.ingredient_name,
      ingredient_img: ing.ingredient_img || null,
      quantity: 1,
      unit: ing.unit || '',
      isEditing: false,
    }));
    setItems((prev) => [...prev, ...newItems]);
    setIsAddDialogOpen(false);
  };

  const handleConfirm = async () => {
    if (items.length === 0) {
      alert('추가할 재료를 선택해주세요.');
      return;
    }
    if (!effectiveUserId) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const payload = {
        user_id: effectiveUserId,
        items: items.map((it) => ({
          ingredient_id: it.ingredient_id,
          quantity: Number(it.quantity) || 1,
        })),
      };

     
      await axios.post('http://localhost:8000/api/fridge/manual-add/', payload);

      alert('냉장고에 추가되었습니다!');
      onClose(); 
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog-container" style={{ maxWidth: '56rem' }}>
        <h2 className="dialog-title">새 재료 직접 추가</h2>

        <div className="ingredient-list scroll-area">
          {items.map((item, idx) => (
            <div key={idx} className="ingredient-card">
              <div className="ingredient-image-wrapper">
                {item.ingredient_img ? (
                  <img
                    src={item.ingredient_img}
                    alt={item.ingredient_name}
                    className="ingredient-image"
                  />
                ) : (
                  '이미지'
                )}
              </div>
              <div className="ingredient-name">{item.ingredient_name}</div>
              <div className="ingredient-quantity-row">
                <button
                  onClick={() => decreaseAmount(idx)}
                  className="quantity-button"
                >
                  -
                </button>
                {item.isEditing ? (
                  <input
                    type="text"
                    value={item.quantity}
                    autoFocus
                    onBlur={() =>
                      setItems((prev) =>
                        prev.map((it, i) =>
                          i === idx ? { ...it, isEditing: false } : it
                        )
                      )
                    }
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, '');
                      setItems((prev) =>
                        prev.map((it, i) =>
                          i === idx
                            ? { ...it, quantity: v === '' ? '' : Number(v) }
                            : it
                        )
                      );
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, isEditing: false } : it
                          )
                        );
                    }}
                    className="quantity-input"
                    style={{
                      width: '40px',
                      textAlign: 'center',
                      fontSize: '14px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                    }}
                  />
                ) : (
                  <span
                    className="quantity-text"
                    onDoubleClick={() =>
                      setItems((prev) =>
                        prev.map((it, i) =>
                          i === idx ? { ...it, isEditing: true } : it
                        )
                      )
                    }
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    {item.quantity}
                    {item.unit}
                  </span>
                )}
                <button
                  onClick={() => increaseAmount(idx)}
                  className="quantity-button"
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setIsAddDialogOpen(true)}
            className="ingredient-card add-card"
          >
            <div className="ingredient-image-wrapper">
              <span className="add-card-icon">+</span>
            </div>
            <div className="add-card-text">재료 추가</div>
          </button>
        </div>

        <div
          className="dialog-actions"
          style={{ justifyContent: 'space-between', marginTop: '1.5rem' }}
        >
          <button onClick={onClose} className="dialog-btn dialog-btn--gray">
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="dialog-btn dialog-btn--green"
          >
            냉장고에 추가
          </button>
        </div>
      </div>

      {isAddDialogOpen && (
        <AddIngredientDialog
          onClose={() => setIsAddDialogOpen(false)}
          onConfirm={handleAddFromDialog}
        />
      )}
    </div>
  );
};

export default AddManualIngredientDialog;
