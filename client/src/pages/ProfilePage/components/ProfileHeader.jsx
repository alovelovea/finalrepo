import React from "react";
import "../css/ProfileHeader.css";

export default function ProfileHeader({ user }) {
  return (
    <div className="profile-header-box">
      <img
        className="profile-avatar"
        src="https://i.ibb.co/9w0D1Bt/default-avatar.png"
        alt="avatar"
      />

      <div className="profile-header-text">
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-desc">
          {user.isVegan 
            ? "비건을 실천하고 있어요" 
            : "일반식 식단을 즐겨요"}
        </p>
      </div>
    </div>
  );
}