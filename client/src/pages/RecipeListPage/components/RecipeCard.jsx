import React, { useState } from "react";
import "./../css/RecipeCard.css";
import { FaRegStar, FaStar } from "react-icons/fa";

const RecipeCard = ({ data, onFavoriteToggle, onClick }) => {
  const [favorite, setFavorite] = useState(data.favorite);

  const toggleFavorite = (e) => {
    e.stopPropagation(); 
    setFavorite(!favorite);
    onFavoriteToggle(data.id);
  };

  return (
    <div className="recipe-card" onClick={() => onClick(data.id)}>
      
      <div className="recipe-card-img">
        <div className="favorite-icon" onClick={toggleFavorite}>
          {favorite ? <FaStar color="#f1c40f" /> : <FaRegStar />}
        </div>

        
        {data.image ? (
          <img src={data.image} alt={data.name} />
        ) : (
          <div className="placeholder-img" />
        )}
      </div>

      
      <div className="recipe-card-info">
        <div className="recipe-name">{data.name}</div>
      </div>
    </div>
  );
};

export default RecipeCard;