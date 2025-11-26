import React from "react";
import RecipeCard from "./RecipeCard";
import "./../css/RecipeCategory.css";

const RecipeCategory = ({ title, items, onFavoriteToggle, onCardClick }) => {
  return (
    <div className="recipe-category-wrapper">
      <h2 className="category-title">{title}</h2>

      <div className="recipe-grid">
        {items.length > 0 ? (
          items.map((item) => (
            <RecipeCard
              key={item.id}
              data={item}
              onFavoriteToggle={onFavoriteToggle}
              onClick={onCardClick}   // 🔥 카드 클릭 시 이동 기능 전달
            />
          ))
        ) : (
          <div className="no-result">검색 결과 없음</div>
        )}
      </div>
    </div>
  );
};

export default RecipeCategory;