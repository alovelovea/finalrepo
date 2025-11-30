
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AddIngredientDialog from './components/AddIngredientDialog';
import './css/RecognizedIngredientsPage.css';


const parseAmount = (amount) => {
  if (!amount) return { quantity: 1, unit: '' };

  const text = String(amount).trim();
  const match = text.match(/(\d+(?:\.\d+)?)(.*)/); 

  if (!match) {
    return { quantity: 1, unit: text };
  }

  const quantity = parseFloat(match[1]);
  const unit = match[2].trim();

  return {
    quantity: isNaN(quantity) ? 1 : quantity,
    unit,
  };
};

const RecognizedIngredientsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const initialItems = (location.state?.items || []).map((item) => {
    const { quantity, unit } = parseAmount(item.amount);
    return {
      ...item,
      quantity,
      unit,
      isEditing: false,
    };
  });

  const [items, setItems] = useState(initialItems);

  const decreaseAmount = (index) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
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
      setIsDialogOpen(false);
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
    setIsDialogOpen(false);
  };

  
  const handleSaveToFridge = async () => {
    if (items.length === 0) {
      alert('저장할 재료가 없습니다.');
      return;
    }

   
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const parsed = JSON.parse(userStr);
          userId = parsed.user_id || parsed.userId || null;
        }
      } catch (e) { 
       
      }
    }

    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    const payload = {
      user_id: userId,
      items: items.map((it) => ({
        ingredient_id: it.ingredient_id,
        quantity: Number(it.quantity) || 1,
      })),
    };

    try {
      
      await axios.post('http://localhost:8000/api/fridge/manual-add/', payload);
      alert('냉장고에 저장되었습니다!');

      
      navigate('/home');
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="recognized-page">
      <div className="recognized-container">
        <h2 className="recognized-title">인식된 재료 목록</h2>

        
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
                      if (e.key === 'Enter') {
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, isEditing: false } : it
                          )
                        );
                      }
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
            onClick={() => setIsDialogOpen(true)}
            className="ingredient-card add-card"
          >
            <div className="ingredient-image-wrapper">
              <span className="add-card-icon">+</span>
            </div>
            <div className="add-card-text">재료 추가</div>
          </button>
        </div>

        <div className="recognized-actions">
          <button
            onClick={() => navigate('/upload')}
            className="recognized-btn recognized-btn--gray"
          >
            재료 다시 인식
          </button>

         
          <button
            className="recognized-btn recognized-btn--green"
            onClick={handleSaveToFridge}
          >
            재료 인식 완료
          </button>
        </div>
      </div>

      {isDialogOpen && (
        <AddIngredientDialog
          onClose={() => setIsDialogOpen(false)}
          onConfirm={handleAddFromDialog}
        />
      )}
    </div>
  );
};

export default RecognizedIngredientsPage;
