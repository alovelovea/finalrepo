// src/components/IngredientsList.jsx (예시 경로)

// ...existing code...
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

// 섹션 번호, 이름, 그리고 해당 섹션에 포함될 카테고리 목록을 정의합니다.
const sectionConfig = {
  1: { name: '신선 식품', categories: ['신선식품'] },
  2: { name: '유제품', categories: ['유제품'] },
  3: { name: '냉동', categories: ['냉동'] },
  4: { name: '냉동 식품', categories: ['냉동식품'] },
};

const IngredientsList = ({ selectedSection = null }) => {
  const [items, setItems] = useState([]);

  // 🔹 user_id 기준 냉장고 재료 가져오기
  useEffect(() => {
    const fetchFridgeItems = async () => {
      try {
        const userId = localStorage.getItem('user_id') || 'minjae01';

        const res = await axios.get('http://localhost:8000/fridge_items/', {
          params: { user_id: userId },
        });

        // API에서 오는 필드 예시:
        // {
        //   ingredient: "양파",
        //   quantity: 2,
        //   unit: "개",
        //   category: "신선식품",
        //   expiry_date: "2025-12-01"
        // }
        const apiItems = (res.data.items || []).map((item) => ({
          ingredient: item.ingredient,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category || '',           // 없으면 빈 문자열
          expiry_date: item.expiry_date || item.exdate || '-', // exdate 쓰던 경우도 대비
        }));

        setItems(apiItems);
      } catch (err) {
        console.error('냉장고 재료 불러오기 실패:', err);
      }
    };

    fetchFridgeItems();
  }, []);

  // 🔹 섹션별 데이터로 그룹화
  const sectionsData = useMemo(() => {
    return items.reduce((acc, item) => {
      let sectionNumber = null; // 기본값은 null, 매핑되지 않으면 무시

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
  }, [items]);

  // 스타일 클래스
  const sectionHeightClass = 'h-24';
  const singleHeightClass = 'h-96';

  const renderList = (list) => (
    <ul className="space-y-2">
      {list.map((ing, index) => (
        <li
          key={index}
          className="grid grid-cols-3 items-center text-gray-700"
        >
          {/* 왼쪽: 재료명 */}
          <span className="justify-self-start">• {ing.ingredient}</span>

          {/* 중앙: 유통기한(날짜 문자열) */}
          <span className="justify-self-center text-gray-500 text-sm">
            {ing.expiry_date || '-'}
          </span>

          {/* 오른쪽: 수량 + 단위 */}
          <span className="justify-self-end">
            {ing.quantity} {ing.unit}
          </span>
        </li>
      ))}
      {list.length === 0 && (
        <li className="text-gray-400 text-sm">등록된 재료가 없습니다.</li>
      )}
    </ul>
  );

  // ✅ 특정 섹션이 선택된 경우 (예: selectedSection = 1)
  if (selectedSection) {
    const sectionName = sectionConfig[selectedSection]?.name || `${selectedSection}번 칸`;
    return (
      <div>
        <div className="mb-2 font-medium">{sectionName}</div>
        <div
          className={`${singleHeightClass} overflow-y-auto p-3 bg-white rounded border`}
        >
          {renderList(sectionsData[selectedSection] || [])}
        </div>
      </div>
    );
  }

  // ✅ 선택이 없는 경우: 4개의 칸을 각각 스크롤 가능한 박스로 보여줌
  return (
    <div className="space-y-3">
      {Object.keys(sectionConfig).map((key) => (
        <div key={key}>
          <div className="mb-2 font-medium">{sectionConfig[key].name}</div>
          <div
            className={`${sectionHeightClass} overflow-y-auto p-3 bg-white rounded border`}
          >
            {renderList(sectionsData[key] || [])}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IngredientsList;
