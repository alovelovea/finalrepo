// ...existing code...
import React from 'react';
import { Link } from 'react-router-dom';

const RecommendedRecipes = ({ id, name = '레시피 이름', description = '레시피 묘사', image }) => {
  return (  
    <Link to={`/recipes/${id}`} className="block">
      <div className="flex items-start space-x-4 py-4 hover:bg-gray-50 rounded-md">
        <div className="w-48 h-36 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-500 overflow-hidden">
          {
            <img src={image} alt={name} className="w-full h-full object-cover object-center" />
          }
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-2">{name}</h3>
          <div className="text-sm text-gray-600 max-h-20 overflow-hidden">
            <p>{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecommendedRecipes;
// ...existing code...