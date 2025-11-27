import React from "react";
import "../css/IngredientSelector.css";

export default function IngredientSelector({ ingredients, selected, onSelect }) {

  // 🔥 Django에서 받은 재료를 카테고리 그룹으로 묶기
  const grouped = ingredients.reduce((acc, ing) => {
    if (!acc[ing.category]) acc[ing.category] = [];
    acc[ing.category].push(ing.name);
    return acc;
  }, {});

  return (
    <div className="section-box">
      <p className="section-title">구성 재료</p>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="category-group">
          <p className="category-title">{category}</p>

          {/* 🔥 너 디자인의 가로 스크롤 UI 유지 */}
          <div className="scroll-x-box">
            {items.map((item) => (
              <label key={item} className="ingredient-item">
                <input
                  type="checkbox"
                  checked={selected.includes(item)}
                  onChange={() => onSelect(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}