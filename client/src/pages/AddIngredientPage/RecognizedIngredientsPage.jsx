// src/pages/AddIngredientPage/RecognizedIngredientsPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AddIngredientDialog from './components/AddIngredientDialog';
import './css/RecognizedIngredientsPage.css';

// 문자열  숫자 / 단위 분리
const parseAmount = (amount) => {
  if (!amount) return { quantity: 1, unit: '' };

  const text = String(amount).trim();
  const match = text.match(/(\d+(?:\.\d+)?)(.*)/); // 숫자 + 나머지

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
      isEditing: false, // ✅ 수량 직접 입력 모드 플래그
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
        i === index
          ? { ...item, quantity: item.quantity + 1 }
          : item
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
      isEditing: false, // ✅ 새로 추가된 재료도 기본값 false
    }));

    setItems((prev) => [...prev, ...newItems]);
    setIsDialogOpen(false);
  };

  // 🔥 재료 인식 완료 → Fridge에 저장
  const handleConfirm = async () => {
    const userId = localStorage.getItem('user_id');

    if (!userId) {
      alert('로그인 정보를 찾을 수 없습니다. 다시 로그인 해주세요.');
      navigate('/login');
      return;
    }

    // ingredient_id가 있는 항목만 보내기
    const payloadItems = items
      .filter((it) => it.ingredient_id)
      .map((it) => ({
        ingredient_id: it.ingredient_id,
        quantity:
          it.quantity === '' || it.quantity == null ? 1 : Number(it.quantity),
      }));

    if (payloadItems.length === 0) {
      alert('저장할 재료가 없습니다.');
      return;
    }

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/fridge/save/', {
        user_id: userId,
        items: payloadItems,
      });

      if (res.status === 200) {
        alert('냉장고에 재료가 저장되었습니다.');
        // ✅ 인식 완료 후 홈으로 이동 (원하면 /ingredient로 바꿔도 됨)
        navigate('/home');
      } else {
        alert('저장에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('냉장고 저장 중 오류:', err);
      alert('냉장고에 저장하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="recognized-page">
      <div className="recognized-container">
        <h2 className="recognized-title">인식된 재료 목록</h2>

        {/* 스크롤 추가 */}
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

                {/* 수량 더블클릭 → 직접 입력 */}
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

          {/* 수동 추가 카드 */}
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

          {/* 🔥 인식 완료 → Fridge 저장 후 페이지 이동 */}
          <button
            className="recognized-btn recognized-btn--green"
            onClick={handleConfirm}
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
