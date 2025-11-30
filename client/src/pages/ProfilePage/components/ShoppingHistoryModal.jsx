import React, { useMemo } from "react";
import "../css/ShoppingHistoryModal.css";

export default function ShoppingHistoryModal({ onClose, items }) {
  
  
  const grouped = useMemo(() => {
    const map = {};

    items.forEach((item) => {
      const date = item.date;
      if (!map[date]) map[date] = [];
      map[date].push(item);
    });

    
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [items]);

  return (
    <div className="modal-overlay">
      <div className="shopping-modal">
        <h2>🛒 쇼핑 내역</h2>

        <div className="shopping-list">

          {grouped.length === 0 ? (
            <p className="empty">쇼핑 내역이 없습니다.</p>
          ) : (
            grouped.map(([date, list], idx) => (
              <div key={idx} className="date-group">
                
                
                <div className="date-header">{date}</div>

                
                {list.map((item, i) => (
                  <div key={i} className="shopping-item">

                    <img
                      src={item.img}
                      alt={item.ingredient}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />

                    <div className="info">
                      <div className="name">{item.ingredient}</div>
                      <div className="detail">
                        {item.quantity}개 · {item.price}원
                      </div>
                    </div>

                  </div>
                ))}

              </div>
            ))
          )}

        </div>

        <button className="close-btn" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
