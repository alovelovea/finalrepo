import React, { useState } from "react";
import "./../css/RecipeCard.css";
import { FaRegStar, FaStar } from "react-icons/fa";

const RecipeCard = ({ data, onFavoriteToggle, onClick }) => {
  const [favorite, setFavorite] = useState(data.favorite);

  const toggleFavorite = (e) => {
    e.stopPropagation(); // 🔥 카드 클릭과 즐겨찾기 클릭 충돌 방지
    setFavorite(!favorite);
    onFavoriteToggle(data.id);
  };

  return (
    <div className="recipe-card" onClick={() => onClick(data.id)}>
      {/* 이미지 영역 */}
      <div className="recipe-card-img">
        <div className="favorite-icon" onClick={toggleFavorite}>
          {favorite ? <FaStar color="#f1c40f" /> : <FaRegStar />}
        </div>

        {/* Django 이미지 URL */}
        {data.image ? (
          <img src={data.image} alt={data.name} />
        ) : (
          <div className="placeholder-img" />
        )}
      </div>

      {/* 텍스트 */}
      <div className="recipe-card-info">
        <div className="recipe-name">{data.name}</div>
      </div>
    </div>
  );
};

export default RecipeCard;