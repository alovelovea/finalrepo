import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import AddManualIngredientDialog from './AddManualIngredientDialog';
import ImageUploadDialog from './ImageUploadDialog';
import RecognizedIngredientsDialog from './RecognizedIngredientsDialog';

const categories = ['전체', '신선식품', '유제품', '냉동', '냉동식품', '유통기한 임박'];

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

  const currentUserId = localStorage.getItem("user_id") || "defaultUser";

  const fetchFridgeItems = async () => {
    if (!currentUserId || currentUserId === "defaultUser") {
      setIngredients([]);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8000/fridge_items/?user_id=${currentUserId}`);
      const itemsWithExpiryDays = response.data.items
        .filter(item => item.fridge_id != null) // Defensively filter out items that don't have a fridge_id
        .map((item, index) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const expiryDate = new Date(item.expiry_date);
          expiryDate.setHours(0, 0, 0, 0);
          const diffTime = expiryDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return { 
            ...item, 
            id: `${item.fridge_id}-${index}-${Math.random()}`, // Create a truly unique ID for React key
            backendId: item.fridge_id, // Store original ID for backend calls
            name: item.ingredient, 
            amount: item.quantity, 
            expiryDays: diffDays 
          };
        });
      setIngredients(itemsWithExpiryDays);
    } catch (error) {
      console.error("냉장고 재료를 가져오는데 실패했습니다.", error);
    }
  };

  useEffect(() => {
    fetchFridgeItems();
  }, [currentUserId]);

  const handleAddConfirm = async (itemsToAdd) => {
    try {
      const promises = itemsToAdd.map(item => {
        const newIngredient = {
          user_id: currentUserId,
          ingredient: item.ingredient_name,
          quantity: item.quantity,
          category: item.category,
          expiry_date: new Date().toISOString().split('T')[0],
        };
        return axios.post('http://localhost:8000/ingredients/list/', newIngredient);
      });
      await Promise.all(promises);
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
    setIngredients((prev) => prev.map((it) => (it.id === id ? { ...it, amount: Math.max(0, it.amount + delta) } : it)));
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
        prev.map((it) => (it.id === id ? { ...it, amount: response.data.quantity } : it))
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
          <button onClick={() => setIsAddManualDialogVisible(true)} className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600" aria-label="새 재료 추가">새 재료 추가</button>
          <button onClick={() => setIsUploadDialogVisible(true)} className="border rounded-md px-3 py-1 hover:bg-gray-50" aria-label="이미지 업로드">🖼️</button>
        </div>
        
        {isAddManualDialogVisible && <AddManualIngredientDialog onClose={() => setIsAddManualDialogVisible(false)} onConfirm={handleAddConfirm} />}
        {isUploadDialogVisible && <ImageUploadDialog onCancel={() => setIsUploadDialogVisible(false)} onSuccess={handleUploadSuccess} />}
        {isRecognizedDialogVisible && <RecognizedIngredientsDialog initialItems={recognizedItems} onClose={() => setIsRecognizedDialogVisible(false)} onConfirm={handleAddConfirm} onRetry={handleRecognitionRetry} />}

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <input placeholder="재료 검색" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border rounded px-4 py-2" />
          </div>
          <div className="w-64 text-right">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded px-3 py-2 w-full">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-sm text-gray-600 border-b">
                <th className="px-4 py-3 text-left w-20">{category === '유통기한 임박' ? '남은일' : ''}</th>
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
                    {category === '유통기한 임박' ? <div className="text-sm text-red-600 font-semibold min-w-[56px] text-left">{typeof it.expiryDays === 'number' ? `${it.expiryDays}일` : '-'}</div> : <div className="min-w-[56px]" />}
                  </td>
                  <td className="px-4 py-3"><div className="font-medium">{it.name}</div></td>
                  <td className="px-4 py-3">{it.category}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center border rounded">
                      <button onClick={() => changeAmount(it.id, -1)} className="px-2 py-1">[-]</button>
                      <div className="px-3 py-1">{it.amount}</div>
                      <button onClick={() => changeAmount(it.id, 1)} className="px-2 py-1">[+]</button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleUpdate(it.id, it.amount)} className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">수정</button>
                      <button onClick={() => handleDelete(it.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-500">결과가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IngredientPage;

// // ...existing code...
// import React, { useState, useMemo, useEffect } from 'react';
// import axios from 'axios';

// const categories = ['전체', '신선식품', '유제품', '냉동', '냉동식품', '유통기한 임박'];

// const IngredientPage = () => {
//   const [ingredients, setIngredients] = useState([]);
//   const [search, setSearch] = useState('');
//   const [category, setCategory] = useState('전체');

//   // 백엔드로부터 데이터를 가져오는 useEffect
//   useEffect(() => {
//     const fetchFridgeItems = async () => {
//       try {
//         const response = await axios.get('http://localhost:8000/api/fridge_items/?user_id=minjae01');
//         // API 응답에 expiryDays가 없으므로 계산해서 추가해주고, amount->quantity, name->ingredient로 맞춰줍니다.
//         const itemsWithExpiryDays = response.data.items.map(item => {
//           const today = new Date();
//           today.setHours(0, 0, 0, 0);
//           const expiryDate = new Date(item.expiry_date);
//           expiryDate.setHours(0, 0, 0, 0);
//           const diffTime = expiryDate.getTime() - today.getTime();
//           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//           return {
//             ...item,
//             id: item.fridge_id, // id를 백엔드의 fridge_id로 매핑
//             name: item.ingredient, // name을 ingredient로 매핑
//             amount: item.quantity, // amount를 quantity로 매핑
//             expiryDays: diffDays
//           };
//         });
//         setIngredients(itemsWithExpiryDays);
//       } catch (error) {
//         console.error("냉장고 재료를 가져오는데 실패했습니다.", error);
//       }
//     };
//     fetchFridgeItems();
//   }, []);

//   // 필터링 로직: '유통기한 임박'이면 expiryDays <= 4 아이템만, 그 외엔 카테고리/검색으로 필터링
//   const filtered = useMemo(() => {
//     if (category === '유통기한 임박') {
//       return ingredients.filter(
//         (it) =>
//           (typeof it.expiryDays === 'number' && it.expiryDays <= 4) &&
//           it.name.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     return ingredients
//       .filter((it) => (category === '전체' ? true : it.category === category))
//       .filter((it) => it.name.toLowerCase().includes(search.toLowerCase()));
//   }, [ingredients, search, category]);

//   const changeAmount = (id, delta) => {
//     setIngredients((prev) => prev.map((it) => (it.id === id ? { ...it, amount: Math.max(0, it.amount + delta) } : it)));
//   };

//   const handleUpdate = async (id, newAmount) => {
//     try {
//       const response = await axios.put(`http://localhost:8000/api/fridge_items/${id}/`, {
//         quantity: newAmount 
//       });
//       // API 응답으로 받은 업데이트된 데이터로 프론트엔드 상태 갱신
//       setIngredients((prev) =>
//         prev.map((it) => (it.id === id ? { ...it, amount: response.data.quantity } : it))
//       );
//       alert("수량이 성공적으로 수정되었습니다.");
//     } catch (error) {
//       console.error("재료 수량 수정에 실패했습니다.", error);
//       alert("수정 실패. 다시 시도해주세요.");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("정말 이 재료를 삭제하시겠습니까?")) {
//       try {
//         await axios.delete(`http://localhost:8000/api/delete_ingredient/${id}/`);
//         // API 요청 성공 시, 프론트엔드 상태에서도 해당 아이템 제거
//         setIngredients((prev) => prev.filter((it) => it.id !== id));
//       } catch (error) {
//         console.error("재료 삭제에 실패했습니다.", error);
//         alert("삭제에 실패했습니다. 다시 시도해주세요.");
//       }
//     }
//   };

//   return (
//     <div className="p-8 pt-20">
//       {/* 상단 제목 중앙 배치 */}
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-4">
//           <h1 className="text-xl font-semibold">재료 관리</h1>
//         </div>

//         {/* 우측 상단 버튼들 (기능 제거 - 사용자 구현 대기) */}
//         <div className="flex justify-end gap-2 mb-4">
//           <button className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600" aria-label="새 재료 추가">
//             새 재료 추가
//           </button>
//           <button className="border rounded-md px-3 py-1 hover:bg-gray-50" aria-label="이미지 업로드">
//             🖼️
//           </button>
//         </div>

//         {/* 검색 + 카테고리 (검색 넓게, 카테고리는 중앙 오른쪽) */}
//         <div className="flex items-center gap-4 mb-4">
//           <div className="flex-1">
//             <input
//               placeholder="재료 검색"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full border rounded px-4 py-2"
//             />
//           </div>

//           <div className="w-64 text-right">
//             <select
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               className="border rounded px-3 py-2 w-full"
//             >
//               {categories.map((c) => (
//                 <option key={c} value={c}>
//                   {c}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* 테이블: 유통기한 칸을 항상 왼쪽에 고정하여 헤더와 행 정렬 유지 */}
//         <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
//           <table className="w-full table-auto">
//             <thead>
//               <tr className="text-sm text-gray-600 border-b">
//                 {/* 항상 고정된 왼쪽 컬럼 (폭 고정). 선택 시에는 '남은일' 텍스트 표시, 아니면 빈 칸으로 자리 확보 */}
//                 <th className="px-4 py-3 text-left w-20">
//                   {category === '유통기한 임박' ? '남은일' : ''}
//                 </th>
//                 <th className="px-4 py-3 text-left">재료명</th>
//                 <th className="px-4 py-3 text-left">카테고리</th>
//                 <th className="px-4 py-3 text-center">수량</th>
//                 <th className="px-4 py-3 text-center">작업</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((it) => (
//                 <tr key={it.id} className="text-sm border-b last:border-b-0">
//                   {/* 항상 존재하는 left cell: 내용은 유통기한 임박 선택시에만 보여줌 */}
//                   <td className="px-4 py-3">
//                     {category === '유통기한 임박' ? (
//                       <div className="text-sm text-red-600 font-semibold min-w-[56px] text-left">
//                         {typeof it.expiryDays === 'number' ? `${it.expiryDays}일` : '-'}
//                       </div>
//                     ) : (
//                       // 보이지 않는 플레이스홀더로 열 너비 유지
//                       <div className="min-w-[56px]" />
//                     )}
//                   </td>

//                   <td className="px-4 py-3">
//                     <div className="font-medium">{it.name}</div>
//                   </td>
//                   <td className="px-4 py-3">{it.category}</td>
//                   <td className="px-4 py-3 text-center">
//                     <div className="inline-flex items-center border rounded">
//                       <button onClick={() => changeAmount(it.id, -1)} className="px-2 py-1">[-]</button>
//                       <div className="px-3 py-1">{it.amount}</div>
//                       <button onClick={() => changeAmount(it.id, 1)} className="px-2 py-1">[+]</button>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 text-center">
//                     <div className="flex justify-center gap-2">
//                       <button onClick={() => handleUpdate(it.id, it.amount)} className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">수정</button>
//                       <button onClick={() => handleDelete(it.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">삭제</button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}

//               {filtered.length === 0 && (
//                 <tr>
//                   <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
//                     결과가 없습니다.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default IngredientPage;
// // ...existing code...