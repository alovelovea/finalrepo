import React, { useState, useEffect } from "react";
import "../css/AddIngredientDialog.css";

export default function AddRecipeIngredientDialog({
  ingredients,
  selectedDefault = [],   // ⭐ 추가된 부분
  onConfirm,
  onClose,
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  // ⭐ 모달 열릴 때 기존 선택한 재료 복원
  useEffect(() => {
    setSelected(selectedDefault);
  }, [selectedDefault]);

  // 선택/해제 + 최초 선택 시 quantity 기본값 1
  const toggleSelect = (ing) => {
    setSelected((prev) => {
      const exists = prev.find((i) => i.ingredient_id === ing.ingredient_id);

      if (exists) {
        return prev.filter((i) => i.ingredient_id !== ing.ingredient_id);
      }

      return [
        ...prev,
        {
          ingredient_id: ing.ingredient_id,
          name: ing.name,
          img: ing.img,
          unit: ing.unit,
          quantity: 1,
          isEditing: false,
        },
      ];
    });
  };

  // 개별 수량 감소
  const decreaseAmount = (id) => {
    setSelected((prev) =>
      prev.map((item) =>
        item.ingredient_id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  // 개별 수량 증가
  const increaseAmount = (id) => {
    setSelected((prev) =>
      prev.map((item) =>
        item.ingredient_id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // 직접 입력 모드 변경
  const toggleEditMode = (id, value) => {
    setSelected((prev) =>
      prev.map((item) =>
        item.ingredient_id === id
          ? { ...item, isEditing: value }
          : item
      )
    );
  };

  const filtered = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dialog-overlay">
      <div className="dialog-container dialog-large">

        <button className="dialog-close" onClick={onClose}>
          ✕
        </button>

        <h2 className="dialog-title">재료 선택</h2>

        {/* 검색 */}
        <input
          className="dialog-search"
          type="text"
          placeholder="재료 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="dialog-card-list">
          {filtered.map((ing) => {
            const isSelected = selected.some(
              (i) => i.ingredient_id === ing.ingredient_id
            );

            const selectedItem = selected.find(
              (i) => i.ingredient_id === ing.ingredient_id
            );

            return (
              <div
                key={ing.ingredient_id}
                className={`dialog-card ${isSelected ? "selected" : ""}`}
                onClick={() => toggleSelect(ing)}
              >
                <img src={ing.img} alt={ing.name} className="dialog-card-img" />

                <div className="dialog-card-name">{ing.name}</div>

                {isSelected && (
                  <div
                    className="quantity-row"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="qty-btn"
                      onClick={() => decreaseAmount(ing.ingredient_id)}
                    >
                      -
                    </button>

                    {selectedItem.isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        className="qty-input"
                        value={selectedItem.quantity}
                        onBlur={() => toggleEditMode(ing.ingredient_id, false)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          setSelected((prev) =>
                            prev.map((item) =>
                              item.ingredient_id === ing.ingredient_id
                                ? {
                                    ...item,
                                    quantity: value === "" ? "" : Number(value),
                                  }
                                : item
                            )
                          );
                        }}
                      />
                    ) : (
                      <span
                        className="qty-text"
                        onDoubleClick={() =>
                          toggleEditMode(ing.ingredient_id, true)
                        }
                      >
                        {selectedItem.quantity}
                        {ing.unit}
                      </span>
                    )}

                    <button
                      className="qty-btn"
                      onClick={() => increaseAmount(ing.ingredient_id)}
                    >
                      +
                    </button>
                  </div>
                )}

                {isSelected && <div className="dialog-card-tag">선택됨</div>}
              </div>
            );
          })}
        </div>

        <div className="dialog-actions">
          <button className="dialog-btn-cancel" onClick={onClose}>
            취소
          </button>
          <button
            className="dialog-btn-confirm"
            onClick={() => onConfirm(selected)}
          >
            선택 완료 ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}
