import React from "react";
import "../css/ProfileStats.css";

export default function ProfileStats({ stats }) {
  return (
    <div className="stats-container">
      <div className="stats-grid">

        {/* 저장 레시피 */}
        <div className="stats-card">
          <div className="stats-number">{stats.saved}</div>
          <div className="stats-label">저장한 레시피</div>
        </div>

        {/* 올린 레시피 */}
        <div className="stats-card">
          <div className="stats-number">{stats.uploaded}</div>
          <div className="stats-label">올린 레시피</div>
        </div>

        {/* 즐겨찾기 */}
        <div className="stats-card">
          <span className="stats-icon">⭐</span>
          <div className="stats-label">즐겨찾기</div>
        </div>

        {/* 체크리스트 */}
        <div className="stats-card">
          <span className="stats-icon">🛒</span>
          <div className="stats-label">{stats.checklist} 체크리스트</div>
        </div>

      </div>
    </div>
  );
}