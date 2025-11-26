// ...existing code...
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

function formatKRW(n) {
  const num = Number(n ?? 0);   // null/undefined면 0으로
  if (Number.isNaN(num)) return '₩0';
  return '₩' + num.toLocaleString('ko-KR');
}

const ShoppingPage = () => {
  const [products, setProducts] = useState([]); // 초기값 빈 배열
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]); // {id, productId, qty}

 useEffect(() => {
  const fetchIngredients = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/shoppingingredient/');

      const mappedProducts = response.data.ingredients.map((ing) => ({
        id: ing.ingredient_id,
        name: ing.name,
        price: ing.price,
        image: `/INGREDIENT/${ing.img}`,   // ⭐ public/INGREDIENT 안에서 찾음
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('재료 목록을 가져오는데 실패했습니다.', error);
    }
  };

  fetchIngredients();
}, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const addToCart = (productId) => {
    setCart((prev) => {
      const found = prev.find((c) => c.productId === productId);
      if (found) {
        return prev.map((c) =>
          c.productId === productId ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [{ id: Date.now(), productId, qty: 1 }, ...prev];
    });
  };

  const changeQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.productId === productId
            ? { ...c, qty: Math.max(0, c.qty + delta) }
            : c
        )
        .filter((c) => c.qty > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const cartItems = cart.map((c) => {
    const prod = products.find((p) => p.id === c.productId) || {};
    return { ...c, product: prod };
  });

  const totalPrice = cartItems.reduce(
    (s, it) => s + (it.product.price || 0) * it.qty,
    0
  );

  const handleBuy = async () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    const purchaseData = cartItems.map((item) => ({
      ingredient_id: item.productId, // API는 ingredient_id를 기대
      quantity: item.qty,
    }));

    try {
      const response = await axios.post('http://localhost:8000/api/shopping/', {
        user_id:  localStorage.user_id, 
        items: purchaseData,
      });

      alert(response.data.message);
      setCart([]);
    } catch (error) {
      console.error(
        '구매 처리 중 오류 발생:',
        error.response ? error.response.data : error
      );
      alert(
        '구매 처리 중 오류가 발생했습니다: ' +
          (error.response ? error.response.data.error : error.message)
      );
    }
  };

  return (
    <div className="p-8 pt-20">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 검색영역 */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex justify-center">
            <div className="w-72">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="식재료 검색"
                className="w-full border rounded-full px-4 py-2 text-sm shadow-sm"
              />
            </div>
          </div>

          {/* 제품 리스트 */}
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 p-3 border rounded"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {/* ✅ 실제 이미지 표시 */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 이미지 없을 때 기본 텍스트
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.textContent = '이미지';
                    }}
                  />
                </div>

                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatKRW(p.price)}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => addToCart(p.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="p-6 text-center text-gray-500 border rounded">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 장바구니 요약 */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-3">장바구니</h3>

          <div className="space-y-3">
            {cartItems.map((it) => (
              <div
                key={it.productId}
                className="flex items-center border rounded p-3"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={it.product.image}
                    alt={it.product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.textContent = '이미지';
                    }}
                  />
                </div>

                <div className="flex-1 px-4">
                  <div className="font-medium">{it.product.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatKRW(it.product.price)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center border rounded">
                    <button
                      onClick={() => changeQty(it.productId, -1)}
                      className="px-2 py-1"
                    >
                      [-]
                    </button>
                    <div className="px-4 py-1">{it.qty}</div>
                    <button
                      onClick={() => changeQty(it.productId, 1)}
                      className="px-2 py-1"
                    >
                      [+]
                    </button>
                  </div>
                  <div className="w-28 text-right font-semibold">
                    {formatKRW((it.product.price || 0) * it.qty)}
                  </div>
                  <button
                    onClick={() => removeFromCart(it.productId)}
                    className="ml-3 text-xs text-red-600"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}

            {cartItems.length === 0 && (
              <div className="p-4 text-center text-gray-500 border rounded">
                장바구니에 상품이 없습니다.
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-4">
            <div className="text-lg font-semibold">
              총 가격: {formatKRW(totalPrice)}
            </div>
            <button
              onClick={handleBuy}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;
// ...existing code...
