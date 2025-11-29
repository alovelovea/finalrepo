import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import AddManualIngredientDialog from './AddManualIngredientDialog';
import ImageUploadDialog from './ImageUploadDialog';
import RecognizedIngredientsDialog from './RecognizedIngredientsDialog';

const categories = ['전체', '신선식품', '유제품', '냉동', '냉동식품', '유통기한 임박'];

// 🔥 localStorage 에서 로그인한 user_id 가져오기
const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      if (parsed.user_id) return parsed.user_id;
      if (parsed.userId) return parsed.userId;
    }
  } catch (e) {
    // JSON 파싱 실패해도 무시
  }
  // 백업: 별도로 저장된 user_id 키가 있으면 사용
  return localStorage.getItem('user_id') || null;
};

const IngredientPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('전체');

  // Dialog visibility states
  const [isAddManualDialogVisible, setIsAddManualDialogVisible] = useState(false);
  const [isUploadDialogVisible, setIsUploadDialogVisible] = useState(false);
  const [isRecognizedDialogVisible, setIsRecognizedDialogVisible] = useState(false);
  
  // State for recognized items from image upload
  const [recognizedItems, setRecognizedItems] = useState([]);

  const currentUserId = getCurrentUserId();
const fetchFridgeItems = async () => {
  if (!currentUserId) {
    setIngredients([]);
    return;
  }

  try {
    const response = await axios.get(`http://localhost:8000/fridge_items/?user_id=${currentUserId}`);

    // ------------------------------
    // ① 상대방 코드 그대로: itemsWithExpiryDays 생성
    // ------------------------------
    const itemsWithExpiryDays = response.data.items
      .filter(item => item.fridge_id != null)
      .map((item, index) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiryDate = new Date(item.expiry_date);
        expiryDate.setHours(0, 0, 0, 0);

        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return { 
          ...item, 
          id: `${item.fridge_id}-${index}-${Math.random()}`,
          backendId: item.fridge_id,
          name: item.ingredient,
          amount: item.quantity,
          expiryDays: diffDays 
        };
      });

    // ------------------------------
    // ② 너의 통합 로직 그대로 적용
    // ------------------------------
    const grouped = {};

    itemsWithExpiryDays.forEach(item => {
      const key = item.name;
      if (!grouped[key]) {
        grouped[key] = {
          ...item,
          amount: item.amount,
          expiryList: [item.expiryDays],
          backendIds: [item.backendId],
        };
      } else {
        grouped[key].amount += item.amount; // 수량 합산
        grouped[key].expiryList.push(item.expiryDays);
        grouped[key].backendIds.push(item.backendId);
      }
    });

    // 가장 임박한 expiryDays 선택
    const finalList = Object.values(grouped).map(item => ({
      ...item,
      expiryDays: Math.min(...item.expiryList),
    }));

    // 최종 반영
    setIngredients(finalList);

  } catch (error) {
    console.error("냉장고 재료를 가져오는데 실패했습니다.", error);
  }
};

  useEffect(() => {
    fetchFridgeItems();
  }, [currentUserId]);

  // ✅ 새 재료(직접추가/이미지 인식) → FridgeDB 저장
  const handleAddConfirm = async (itemsToAdd) => {
    try {
      if (!currentUserId) {
        alert("로그인이 필요합니다.");
        return;
      }
      if (!itemsToAdd || itemsToAdd.length === 0) {
        alert("추가할 재료를 선택해주세요.");
        return;
      }

      const payload = {
        user_id: currentUserId,
        items: itemsToAdd.map(item => ({
          ingredient_id: item.ingredient_id,
          quantity: Number(item.quantity) || 1,
        })),
      };

      await axios.post('http://localhost:8000/api/fridge/save/', payload);
      await fetchFridgeItems();

      // 모든 다이얼로그 닫기
      setIsAddManualDialogVisible(false);
      setIsRecognizedDialogVisible(false);
      alert("재료가 냉장고에 추가되었습니다.");
    } catch (error) {
      console.error("재료 추가에 실패했습니다.", error);
      alert("재료 추가에 실패했습니다.");
    }
  };

  const handleUploadSuccess = (items) => {
    setRecognizedItems(items);
    setIsUploadDialogVisible(false);
    setIsRecognizedDialogVisible(true);
  };

  const handleRecognitionRetry = () => {
    setIsRecognizedDialogVisible(false);
    setIsUploadDialogVisible(true);
  };

  const filtered = useMemo(() => {
    if (category === '유통기한 임박') {
      return ingredients.filter(
        (it) =>
          (typeof it.expiryDays === 'number' && it.expiryDays <= 4) &&
          it.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return ingredients
      .filter((it) => (category === '전체' ? true : it.category === category))
      .filter((it) => it.name.toLowerCase().includes(search.toLowerCase()));
  }, [ingredients, search, category]);

  const changeAmount = (id, delta) => {
    setIngredients((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, amount: Math.max(0, it.amount + delta) } : it
      )
    );
  };

  const handleUpdate = async (id, newAmount) => {
    try {
      const itemToUpdate = ingredients.find(ing => ing.id === id);
      if (!itemToUpdate) {
        return alert("수정할 재료를 찾지 못했습니다.");
      }
      
      const backendId = itemToUpdate.backendId;
      const response = await axios.put(`http://localhost:8000/api/fridge_items/${backendId}/`, {
        quantity: newAmount 
      });
      
      // 상태를 업데이트할 때도 고유 ID(id)를 사용하고, 서버로부터 받은 값으로 amount를 갱신합니다.
      setIngredients((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, amount: response.data.quantity } : it
        )
      );
      alert("수량이 성공적으로 수정되었습니다.");
    } catch (error) {
      console.error("재료 수량 수정에 실패했습니다.", error);
      alert("수정 실패. 다시 시도해주세요.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말 이 재료를 삭제하시겠습니까?")) {
      try {
        const itemToDelete = ingredients.find(ing => ing.id === id);
        if (!itemToDelete) {
          return alert("삭제할 재료를 찾지 못했습니다.");
        }

        const backendId = itemToDelete.backendId;
        await axios.delete(`http://localhost:8000/api/delete_ingredient/${backendId}/`);
        
        // 상태에서 삭제할 때도 고유 ID(id)를 사용합니다.
        setIngredients((prev) => prev.filter((it) => it.id !== id));
      } catch (error) {
        console.error("재료 삭제에 실패했습니다.", error);
        alert("삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="p-8 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl font-semibold">재료 관리</h1>
        </div>
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => setIsAddManualDialogVisible(true)}
            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
            aria-label="새 재료 추가"
          >
            새 재료 추가
          </button>
          <button
            onClick={() => setIsUploadDialogVisible(true)}
            className="border rounded-md px-3 py-1 hover:bg-gray-50"
            aria-label="이미지 업로드"
          >
            🖼️
          </button>
        </div>
        
        {isAddManualDialogVisible && (
          <AddManualIngredientDialog
            onClose={() => setIsAddManualDialogVisible(false)}
            onConfirm={handleAddConfirm}
          />
        )}
        {isUploadDialogVisible && (
          <ImageUploadDialog
            onCancel={() => setIsUploadDialogVisible(false)}
            onSuccess={handleUploadSuccess}
          />
        )}
        {isRecognizedDialogVisible && (
          <RecognizedIngredientsDialog
            initialItems={recognizedItems}
            onClose={() => setIsRecognizedDialogVisible(false)}
            onConfirm={handleAddConfirm}
            onRetry={handleRecognitionRetry}
          />
        )}

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
                <th className="px-4 py-3 text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id} className="text-sm border-b last:border-b-0">
                  <td className="px-4 py-3">
                    {category === '유통기한 임박' ? (
                      <div className="text-sm text-red-600 font-semibold min-w-[56px] text-left">
                        {typeof it.expiryDays === 'number' ? `${it.expiryDays}일` : '-'}
                      </div>
                    ) : (
                      <div className="min-w-[56px]" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{it.name}</div>
                  </td>
                  <td className="px-4 py-3">{it.category}</td>
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
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
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
