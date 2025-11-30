import React from 'react';
import '../css/IngredientsList.css';


const sectionConfig = {
  1: { name: '신선 식품', categories: ['신선식품'] },
  2: { name: '유제품', categories: ['유제품'] },
  3: { name: '냉동', categories: ['냉동'] },
  4: { name: '냉동 식품', categories: ['냉동식품'] },
};

const IngredientsList = ({ selectedSection = null, items = [] }) => {

  const sectionsData = items.reduce((acc, item) => {
    let sectionNumber = null; 

    for (const [key, value] of Object.entries(sectionConfig)) {
      if (value.categories.includes(item.category)) {
        sectionNumber = key;
        break;
      }
    }

    if (sectionNumber) { 
      if (!acc[sectionNumber]) {
        acc[sectionNumber] = [];
      }
      acc[sectionNumber].push(item);
    }
    return acc;
  }, {});

  const renderList = (list) => (
    <ul className="ingredient-list">
      {list.map((ing, index) => (
        <li key={index} className="ingredient-list-item">
          <span className="ingredient-name">• {ing.ingredient}</span>
          <span className="ingredient-expiry">{ing.expiry_date}</span>
          <span className="ingredient-quantity-with-unit">{ing.quantity} {ing.unit}</span>
        </li>
      ))}
    </ul>
  );


  if (selectedSection) {
    const sectionName = sectionConfig[selectedSection]?.name || `${selectedSection}번 칸`;
    return (
      <div>
        <div className="section-title-md">{sectionName}</div>
        <div className="ingredients-list-container">
          {renderList(sectionsData[selectedSection] || [])}
        </div>
      </div>
    );
  }

  
  return (
    <div className="sections-container">
      {Object.keys(sectionConfig).map((key) => (
        <div key={key}>
          <div className="section-title-md">{sectionConfig[key].name}</div>
          <div className="ingredients-section-container">
            {renderList(sectionsData[key] || [])}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IngredientsList;