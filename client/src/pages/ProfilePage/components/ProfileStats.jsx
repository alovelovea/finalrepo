import React from "react";
import "../css/ProfileStats.css";

export default function ProfileStats({ stats, onShoppingClick }) {
  return (
    <div className="profile-stats-container">
      
      <div className="profile-stat-card">
        <div className="stat-value">{stats.totalRecipes}</div>
        <div className="stat-label">총 레시피</div>
      </div>

      <div className="profile-stat-card clickable" onClick={onShoppingClick}>
        <div className="stat-value">{stats.shoppingHistory}</div>
        <div className="stat-label">쇼핑 내역</div>
      </div>

    </div>
  );
}
