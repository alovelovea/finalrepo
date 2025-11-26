import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Fridge = () => {
  const [items, setItems] = useState([]);  // ✅ 냉장고 재료 목록
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFridgeItems = async () => {
      try {
        const userId = localStorage.getItem("user_id"); // ✅ 로그인한 사용자 ID
        const res = await axios.get(`http://127.0.0.1:8000/api/fridge_items/?user_id=${userId}`);
        setItems(res.data.items);
      } catch (err) {
        console.error("❌ 냉장고 데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFridgeItems();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-64 bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 mb-4">
        <p>냉장고 사진</p>
      </div>

      <div className="flex space-x-4">
        <Link to="/upload" className="bg-green-500 text-white py-2 px-6 rounded-lg hover:shadow-md hover:underline">
          사진 업로드
        </Link>
        <button className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:shadow-md hover:underline">
          전체 식재료 보기
        </button>
      </div>

      {/* ✅ 냉장고 재료 목록 표시 */}
      <div className="mt-8 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">내 냉장고 재료</h3>

        {loading ? (
          <p>불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">냉장고에 재료가 없습니다.</p>
        ) : (
       <ul className="space-y-2">
  {items.map((item, index) => (
    <li key={index} className="flex justify-between bg-white p-3 rounded-lg shadow-sm">
      <span>{item.ingredient}</span>
      <span>
        {item.quantity}
        {item.unit && <span className="text-gray-500 ml-1">{item.unit}</span>}
      </span>
      <span className="text-gray-400 text-sm">{item.exdate}</span>
    </li>
  ))}
</ul>
        )}
      </div>
    </div>
  );
};

export default Fridge;
