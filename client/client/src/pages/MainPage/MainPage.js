import React from 'react';
import RecommendedRecipes from './RecommendedRecipes';
import Fridge from './Fridge';
import IngredientsList from './IngredientsList';

const MainPage = () => (
  <main className="p-8 pt-20">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <RecommendedRecipes />
      </div>
      <div className="lg:col-span-1">
        <Fridge />
      </div>
      <div className="lg:col-span-1">
        <IngredientsList />
      </div>
    </div>
  </main>
);

export default MainPage;
