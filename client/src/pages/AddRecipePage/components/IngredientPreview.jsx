import React from "react";
import "../css/IngredientPreview.css";

export default function IngredientPreview({ items, onRemove }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="preview-container">
      <p className="preview-title">선택된 재료 {items.length}개</p>

      <div className="preview-list">
        {items.map((ing) => (
          <div className="preview-item" key={ing.ingredient_id}>
            <img src={ing.img} alt={ing.name} className="preview-img" />

            <span className="preview-text">
              {ing.name} x {ing.quantity || 1}
              {ing.unit || "개"}
            </span>

            <button
              className="preview-delete"
              onClick={() => onRemove(ing.ingredient_id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
