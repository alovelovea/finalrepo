import React from 'react';
import { Link } from 'react-router-dom';
import '../css/RecommendedRecipes.css';

const RecommendedRecipes = ({ id, name = '레시피 이름', description = '레시피 묘사', image }) => {
  return (  
    <Link to={`/recipes/${id}`} className="recommended-recipe-link">
      <div className="recommended-recipe-card">
        <div className="recommended-recipe-image-container">
          {
            <img src={image} alt={name} className="recommended-recipe-image" />
          }
        </div>
        <div className="recommended-recipe-content">
          <h3 className="recommended-recipe-name">{name}</h3>
          <div className="recommended-recipe-description">
            <p>{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecommendedRecipes;