import React, { useState, useEffect } from 'react';
import AddIngredientDialog from '../AddIngredientPage/components/AddIngredientDialog';
import '../AddIngredientPage/css/RecognizedIngredientsPage.css';
import '../AddIngredientPage/components/AddIngredientDialog.css';

const parseAmount = (amount) => {
  if (!amount) return { quantity: 1, unit: '' };
  const text = String(amount).trim();
  const match = text.match(/(\d+(?:\.\d+)?)(.*)/);
  if (!match) return { quantity: 1, unit: text };
  const quantity = parseFloat(match[1]);
  const unit = match[2].trim();
  return { quantity: isNaN(quantity) ? 1 : quantity, unit };
};

const RecognizedIngredientsDialog = ({ initialItems = [], onClose, onConfirm, onRetry }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const processedItems = initialItems.map((item) => {
      const { quantity, unit } = parseAmount(item.amount);
      return {
        ...item,
        quantity,
        unit,
        isEditing: false,
      };
    });
    setItems(processedItems);
  }, [initialItems]);

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
  
  const handleConfirm = () => {
    onConfirm(items);
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog-container" style={{ maxWidth: '56rem' }}> {/* 너비 확장 */}
        <h2 className="dialog-title">인식된 재료 목록</h2>
        
        <div className="ingredient-list scroll-area">
          {items.map((item, idx) => (
            <div key={idx} className="ingredient-card">
              <div className="ingredient-image-wrapper">
                {item.ingredient_img ? (
                  <img src={item.ingredient_img} alt={item.ingredient_name} className="ingredient-image" />
                ) : '이미지'}
              </div>
              <div className="ingredient-name">{item.ingredient_name}</div>
              <div className="ingredient-quantity-row">
                <button onClick={() => decreaseAmount(idx)} className="quantity-button">-</button>
                {item.isEditing ? (
                  <input
                    type="text"
                    value={item.quantity}
                    autoFocus
                    onBlur={() => setItems(prev => prev.map((it, i) => i === idx ? { ...it, isEditing: false } : it))}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, '');
                      setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: v === '' ? '' : Number(v) } : it));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setItems(prev => prev.map((it, i) => i === idx ? { ...it, isEditing: false } : it));
                    }}
                    className="quantity-input"
                    style={{ width: '40px', textAlign: 'center', fontSize: '14px', border: '1px solid #ccc', borderRadius: '6px' }}
                  />
                ) : (
                  <span
                    className="quantity-text"
                    onDoubleClick={() => setItems(prev => prev.map((it, i) => i === idx ? { ...it, isEditing: true } : it))}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    {item.quantity}{item.unit}
                  </span>
                )}
                <button onClick={() => increaseAmount(idx)} className="quantity-button">+</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setIsAddDialogOpen(true)} className="ingredient-card add-card">
            <div className="ingredient-image-wrapper"><span className="add-card-icon">+</span></div>
            <div className="add-card-text">재료 추가</div>
          </button>
        </div>

        <div className="dialog-actions" style={{ justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <button onClick={onRetry} className="dialog-btn dialog-btn--gray">
            재료 다시 인식
          </button>
          <button onClick={handleConfirm} className="dialog-btn dialog-btn--green">
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

export default RecognizedIngredientsDialog;
