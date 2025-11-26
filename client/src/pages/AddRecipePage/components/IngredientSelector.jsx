import React from "react";
import "../css/IngredientSelector.css";

export default function IngredientSelector({ ingredients, selected, onSelect }) {
  const grouped = ingredients.reduce((acc, ing) => {
    acc[ing.category] = acc[ing.category] || [];
    acc[ing.category].push(ing.name);
    return acc;
  }, {});

  return (
    <div className="ingredient-section">
      <h3 className="section-title">구성 재료</h3>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <div className="ingredient-category">{category}</div>

          <div className="ingredient-row">
            {items.map((item) => (
              <label className="check-item" key={item}>
                <input
                  type="checkbox"
                  checked={selected.includes(item)}
                  onChange={() => onSelect(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
