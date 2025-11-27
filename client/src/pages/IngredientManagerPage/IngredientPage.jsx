// src/pages/IngredientPage.jsx

import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const categories = ['전체', '신선식품', '유제품', '냉동', '냉동식품', '유통기한 임박'];

const IngredientPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('전체');
  const navigate = useNavigate();

  // 🔹 냉장고 재료 가져오기
  useEffect(() => {
    const fetchFridgeItems = async () => {
      try {
        const userId = localStorage.getItem('user_id') || 'minjae01';

        const res = await axios.get('http://localhost:8000/fridge_items/', {
          params: { user_id: userId },
        });

        const itemsWithExpiryDays = (res.data.items || []).map((item) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null;

          let diffDays = null;
          if (expiryDate && !isNaN(expiryDate.getTime())) {
            expiryDate.setHours(0, 0, 0, 0);
            const diffTime = expiryDate.getTime() - today.getTime();
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }

          return {
            ...item,
            id: item.fridge_id,
            name: item.ingredient,
            amount: item.quantity,
            category: item.category || '',
            expiryDays: diffDays,
            expiryDateStr: item.expiry_date || '-',
          };
        });

        setIngredients(itemsWithExpiryDays);
      } catch (err) {
        console.error('냉장고 재료를 가져오는데 실패했습니다.', err);
      }
    };

    fetchFridgeItems();
  }, []);

  // 🔹 필터링: 검색 + 카테고리 + 유통기한 임박
  const filtered = useMemo(() => {
    if (category === '유통기한 임박') {
      return ingredients.filter(
        (it) =>
          typeof it.expiryDays === 'number' &&
          it.expiryDays <= 4 &&
          it.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return ingredients
      .filter((it) => (category === '전체' ? true : it.category === category))
      .filter((it) => it.name.toLowerCase().includes(search.toLowerCase()));
  }, [ingredients, search, category]);

  // 🔹 수량 조정
  const changeAmount = (id, delta) => {
    setIngredients((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, amount: Math.max(0, Number(it.amount) + delta) }
          : it
      )
    );
  };

  // 🔹 수량 수정 API
  const handleUpdate = async (id, newAmount) => {
    try {
      const res = await axios.put(
        `http://localhost:8000/api/fridge_items/${id}/`,
        { quantity: newAmount }
      );

      setIngredients((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, amount: res.data.quantity } : it
        )
      );
      alert('수량이 성공적으로 수정되었습니다.');
    } catch (err) {
      console.error('재료 수량 수정에 실패했습니다.', err);
      alert('수정 실패. 다시 시도해주세요.');
    }
  };

  // 🔹 재료 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 이 재료를 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/delete_ingredient/${id}/`);
      setIngredients((prev) => prev.filter((it) => it.id !== id));
      alert('삭제에 성공했습니다.');
    } catch (err) {
      console.error('재료 삭제에 실패했습니다.', err);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="p-8 pt-20">
      <div className="max-w-4xl mx-auto">

        {/* 제목 */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-semibold">재료 관리</h1>
        </div>

        {/* 우측 상단 버튼 */}
        <div className="flex justify-end gap-2 mb-4">
          <button
            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
            aria-label="새 재료 추가"
            onClick={() =>
              navigate('/upload', {
                state: { from: 'ingredient' },   // 🔥 업로드 후 건너뛰기 → ingredient로
              })
            }
          >
            새 재료 추가
          </button>

          <button
            className="border rounded-md px-3 py-1 hover:bg-gray-50"
            aria-label="이미지 업로드"
          >
            🖼️
          </button>
        </div>

        {/* 검색 + 카테고리 */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <input
              placeholder="재료 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div className="w-64 text-right">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-sm text-gray-600 border-b">
                <th className="px-4 py-3 text-left w-20">
                  {category === '유통기한 임박' ? '남은일' : ''}
                </th>
                <th className="px-4 py-3 text-left">재료명</th>
                <th className="px-4 py-3 text-left">카테고리</th>
                <th className="px-4 py-3 text-center">수량</th>
                <th className="px-4 py-3 text-center">유통기한만료일</th>
                <th className="px-4 py-3 text-center">작업</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((it) => (
                <tr key={it.id} className="text-sm border-b last:border-b-0">

                  {/* 남은일 */}
                  <td className="px-4 py-3">
                    {category === '유통기한 임박' ? (
                      <div className="text-sm text-red-600 font-semibold min-w-[56px] text-left">
                        {typeof it.expiryDays === 'number'
                          ? `${it.expiryDays}일`
                          : '-'}
                      </div>
                    ) : (
                      <div className="min-w-[56px]" />
                    )}
                  </td>

                  {/* 재료명 */}
                  <td className="px-4 py-3">
                    <div className="font-medium">{it.name}</div>
                  </td>

                  {/* 카테고리 */}
                  <td className="px-4 py-3">{it.category || '-'}</td>

                  {/* 수량 */}
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center border rounded">
                      <button
                        onClick={() => changeAmount(it.id, -1)}
                        className="px-2 py-1"
                      >
                        [-]
                      </button>
                      <div className="px-3 py-1">{it.amount}</div>
                      <button
                        onClick={() => changeAmount(it.id, 1)}
                        className="px-2 py-1"
                      >
                        [+]
                      </button>
                    </div>
                  </td>

                  {/* 유통기한 */}
                  <td className="px-4 py-3 text-center">
                    {it.expiryDateStr || '-'}
                  </td>

                  {/* 작업 버튼 */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleUpdate(it.id, it.amount)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                      >
                        수정
                      </button>

                      <button
                        onClick={() => handleDelete(it.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default IngredientPage;
