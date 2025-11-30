import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecommendedRecipes from './components/RecommendedRecipes';
import Fridge from './components/Fridge';
import IngredientsList from './components/IngredientsList';
import './css/MainPage.css';

const MainPage = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [fridgeItems, setFridgeItems] = useState([]); 
  const [recommendedRecipes, setRecommendedRecipes] = useState([]); 
  const currentUserId = localStorage.getItem("user_id") || null; 

  
  useEffect(() => {
  const fetchData = async () => {
    if (!currentUserId) {
      setRecommendedRecipes([]);
      setFridgeItems([]);
      return;
    }

    try {
      const [recipesResponse, fridgeResponse] = await Promise.all([
        axios.get(`http://localhost:8000/api/recipes/recommend/expiry/?user_id=${currentUserId}`),
        axios.get(`http://localhost:8000/fridge_items/?user_id=${currentUserId}`)
      ]);

      setRecommendedRecipes(recipesResponse.data.recipes);

      const items = fridgeResponse.data.items;

      
      const grouped = {};

      items.forEach(item => {
        const name = item.ingredient;

        if (!grouped[name]) {
          grouped[name] = {
            ...item,
            quantity: Number(item.quantity),
            expiryList: [item.expiry_date],
          };
        } else {
          grouped[name].quantity += Number(item.quantity);
          grouped[name].expiryList.push(item.expiry_date);
        }
      });

      
      const finalItems = Object.values(grouped).map(g => ({
        ...g,
        expiry_date: g.expiryList.sort()[0],   
      }));

      
      setFridgeItems(finalItems);

    } catch (error) {
      console.error('데이터를 가져오는데 실패했습니다.', error);
    }
  };

  fetchData();
}, [currentUserId]);

  return (
    <main className="main-page-container">
      <div className="main-grid">
        
        <div className="grid-col-span-1">
          <h2 className="section-title">추천 레시피</h2>
          <div className="card">
          
            <div className="recipe-list-container2">
              
              {recommendedRecipes.slice(0, 3).map((r) => (
                <div key={r.recipe_id} className="recipe-item-container">
                  <RecommendedRecipes
                    id={r.recipe_id}
                    name={r.recipe_name}
                    description={`활용 가능한 재료: ${r.matched_ingredients.join(', ')}`}
                    image={`/FOOD/${r.recipe_img}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        
        <div className="grid-col-span-1">
          <div className="card">
            <Fridge onSelectSection={setSelectedSection} selectedSection={selectedSection} />
          </div>
        </div>

        
        <div className="grid-col-span-1">
          <div className="ingredients-header">
            <h2 className="section-title">
              {selectedSection ? `${selectedSection}번 재료목록` : '전체 재료목록'}
            </h2>
            <button
              onClick={() => setSelectedSection(null)}
              className="show-all-btn"
            >
              전체 식재료 보기
            </button>
          </div>

          <div className="card">
            <IngredientsList selectedSection={selectedSection} items={fridgeItems} />
          </div>
        </div>
      </div>
    </main>
  );
};


export default MainPage;
