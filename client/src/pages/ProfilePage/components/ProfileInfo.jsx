import React from "react";
import "../css/ProfileInfo.css";

export default function ProfileInfo({ user }) {
  return (
    <div className="info-box">
      <h3 className="info-title">내 정보</h3>

      <div className="info-row">
        <span className="info-label">이름</span>
        <span className="info-value">{user.name}</span>
      </div>

      <div className="info-row">
        <span className="info-label">주소</span>
        <span className="info-value">{user.address}</span>
      </div>

      <div className="info-row">
        <span className="info-label">ID</span>
        <span className="info-value">{user.user_id}</span>
      </div>

      <div className="info-row">
        <span className="info-label">비건 여부</span>
        <span className="info-value">
          {user.is_vegan ? "비건" : "일반식"}
        </span>
      </div>

      <div className="info-row">
        <span className="info-label">알레르기</span>
        <span className="info-value">
          {(user.allergies || []).length > 0
            ? (user.allergies || []).join(", ")
            : "없음"}
        </span>
      </div>
    </div>
  );
}