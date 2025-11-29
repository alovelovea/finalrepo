import React, { useState, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from "react-router-dom";
import './css/ShoppingPage.css';

function formatKRW(n) {
  const num = Number(n ?? 0);
  if (Number.isNaN(num)) return '₩0';
  return '₩' + num.toLocaleString('ko-KR');
}

const ShoppingPage = () => {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);

  const location = useLocation();

  // ⭐ RecipeDetailPage에서 전달한 부족 재료 객체 배열
  const missingItems = location.state?.missingItems || [];

  // -----------------------
  // 1) 재료 API 불러오기
  // -----------------------
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/shoppingingredient/');

        const mappedProducts = response.data.ingredients.map((ing) => ({
          id: ing.ingredient_id,
          name: ing.name,
          price: ing.price,
          unit: ing.unit,
          baseUnit: ing.base_unit,
          image: `/INGREDIENT/${ing.img}`,
        }));

        setProducts(mappedProducts);
      } catch (error) {
        console.error('재료 목록을 가져오는데 실패했습니다.', error);
      }
    };

    fetchIngredients();
  }, []);

  // -----------------------
  // 2) 부족 재료 자동 장바구니 추가
  // -----------------------
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    if (missingItems.length === 0 || products.length === 0) return;

    effectRan.current = true;

    // 백엔드가 준 JSON 그대로 사용
    missingItems.forEach((item) => {
      const prod = products.find((p) => p.id === item.ingredient_id);
      if (!prod) return;

      // purchase_qty 만큼 장바구니에 추가
      for (let i = 0; i < item.purchase_qty; i++) {
        addToCart(item.ingredient_id);
      }
    });
  }, [missingItems, products]);


  // -----------------------
  // 3) 검색
  // -----------------------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  // -----------------------
  // 4) 장바구니 기능
  // -----------------------
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

  // -----------------------
  // 5) 구매(DB 저장)
  // -----------------------
  const handleBuy = async () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    const purchaseData = cartItems.map((item) => ({
      ingredient_id: item.productId,
      quantity: item.qty,
    }));

    try {
      const response = await axios.post('http://localhost:8000/api/shopping/', {
        user_id: localStorage.user_id,
        items: purchaseData,
      });

      alert(response.data.message);
      setCart([]);
    } catch (error) {
      console.error('구매 처리 오류:', error.response ? error.response.data : error);
      alert('구매 처리 중 오류가 발생했습니다.');
    }
  };

  // -----------------------
  // 6) UI 렌더링
  // -----------------------
  return (
    <div className="shopping-page-container">
      <div className="shopping-page-content">

        {/* 검색 영역 */}
        <div className="card">
          <div className="search-container">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="식재료 검색"
              className="search-input"
            />
          </div>

          {/* 제품 리스트 */}
          <div className="product-list">
            {filtered.map((p) => (
              <div key={p.id} className="product-item">

                {/* 이미지 */}
                <div className="product-image-container">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="product-image"
                  />
                </div>

                {/* 이름 + 단위 */}
                <div className="product-info">
                  <div className="product-name">{p.name}</div>
                  <div className="product-price">
                    {formatKRW(p.price)} / {p.baseUnit}{p.unit}
                  </div>
                </div>

                {/* 버튼 */}
                <button
                  onClick={() => addToCart(p.id)}
                  className="add-to-cart-btn"
                >
                  ADD TO CART
                </button>

              </div>
            ))}
          </div>
        </div>

        {/* 장바구니 */}
        <div className="card">
          <h3 className="cart-title">장바구니</h3>

          <div className="cart-items-container">
            {cartItems.map((it) => (
              <div key={it.productId} className="cart-item">

                {/* 이미지 */}
                <div className="cart-item-image-container">
                  <img
                    src={it.product.image}
                    alt={it.product.name}
                    className="cart-item-image"
                  />
                </div>

                {/* 상품명 & 단위 */}
                <div className="cart-item-info">
                  <div className="product-name">{it.product.name}</div>
                  <div className="product-price">
                    {formatKRW(it.product.price)} / {it.product.baseUnit}{it.product.unit}
                  </div>
                </div>

                {/* 수량 조절 */}
                <div className="cart-item-controls">
                  <div className="quantity-control">
                    <button onClick={() => changeQty(it.productId, -1)} className="quantity-button">[-]</button>
                    <div className="quantity-display">{it.qty}</div>
                    <button onClick={() => changeQty(it.productId, 1)} className="quantity-button">[+]</button>
                  </div>

                  {/* 가격 + 총량(수량 × baseUnit) */}
                  <div className="cart-item-price-details">
                    <span>
                      {formatKRW((it.product.price || 0) * it.qty)}
                    </span>

                    <span className="cart-item-total-quantity">
                      {it.qty * (it.product.baseUnit || 1)}
                      {it.product.unit}
                    </span>
                  </div>

                  {/* 삭제 */}
                  <button
                    onClick={() => removeFromCart(it.productId)}
                    className="remove-from-cart-btn"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}

            {cartItems.length === 0 && (
              <div className="empty-cart-message">
                장바구니에 상품이 없습니다.
              </div>
            )}
          </div>

          {/* BUY */}
          <div className="buy-section">
            <div className="total-price">
              총 가격: {formatKRW(totalPrice)}
            </div>
            <button
              onClick={handleBuy}
              className="buy-now-btn"
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
