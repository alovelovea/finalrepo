// ...existing code...
import React from 'react';

// 섹션 번호, 이름, 그리고 해당 섹션에 포함될 카테고리 목록을 정의합니다.
const sectionConfig = {
  1: { name: '신선 식품', categories: ['신선식품'] },
  2: { name: '유제품', categories: ['유제품'] },
  3: { name: '냉동', categories: ['냉동'] },
  4: { name: '냉동 식품', categories: ['냉동식품'] },
};

const IngredientsList = ({ selectedSection = null, items = [] }) => {
  // API로 받은 items를 카테지에 따라 sectionsData 객체로 그룹화합니다.
  const sectionsData = items.reduce((acc, item) => {
    let sectionNumber = null; // 기본값은 null, 매핑되지 않으면 무시

    for (const [key, value] of Object.entries(sectionConfig)) {
      if (value.categories.includes(item.category)) {
        sectionNumber = key;
        break;
      }
    }

    if (sectionNumber) { // 매핑된 카테고리만 처리
      if (!acc[sectionNumber]) {
        acc[sectionNumber] = [];
      }
      acc[sectionNumber].push(item);
    }
    return acc;
  }, {});

  // 스타일 클래스
  const sectionHeightClass = 'h-24';
  const singleHeightClass = 'h-96';

  const renderList = (list) => (
    <ul className="space-y-2">
      {list.map((ing, index) => (
        <li key={index} className="grid grid-cols-3 items-center text-gray-700"> {/* grid와 3개의 열로 변경 */}
          <span className="justify-self-start">• {ing.ingredient}</span> {/* 왼쪽 정렬 */}
          <span className="justify-self-center text-gray-500 text-sm">{ing.expiry_date}</span> {/* 중앙 정렬 */}
          <span className="justify-self-end">{ing.quantity} {ing.unit}</span> {/* 오른쪽 정렬 */}
        </li>
      ))}
    </ul>
  );

  // 특정 섹션이 선택된 경우
  if (selectedSection) {
    const sectionName = sectionConfig[selectedSection]?.name || `${selectedSection}번 칸`;
    return (
      <div>
        <div className="mb-2 font-medium">{sectionName}</div>
        <div className={`${singleHeightClass} overflow-y-auto p-3 bg-white rounded border`}>
          {renderList(sectionsData[selectedSection] || [])}
        </div>
      </div>
    );
  }

  // 선택이 없는 경우: 4개의 칸을 각각 스크롤 가능한 박스로 보여줌
  return (
    <div className="space-y-3">
      {Object.keys(sectionConfig).map((key) => (
        <div key={key}>
          <div className="mb-2 font-medium">{sectionConfig[key].name}</div>
          <div className={`${sectionHeightClass} overflow-y-auto p-3 bg-white rounded border`}>
            {renderList(sectionsData[key] || [])}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IngredientsList;
// ...existing code...