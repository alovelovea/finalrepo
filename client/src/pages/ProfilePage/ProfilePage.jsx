import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/ProfilePage.css";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import ProfileInfo from "./components/ProfileInfo";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(stored);
    setUser(parsed);
  }, []);

  if (!user) return null;

  // 자동 태그 생성 (optional)
  const autoTags = [];
  if (user.is_vegan) autoTags.push("비건");
  if (user.allergies) {
    user.allergies.forEach((a) => autoTags.push(`${a} 알러지`));
  }
  const finalTags = [...(user.manualTags || []), ...autoTags];

  return (
    <div className="profile-page">
      {/* 프로필 상단 */}
      <ProfileHeader user={user} />

      {/* 통계 카드 */}
      <ProfileStats
        stats={{
          saved: 12,
          uploaded: 4,
          checklist: 6,
        }}
      />

      {/* 내 정보 */}
      <ProfileInfo user={user} />

      <div className="profile-buttons">
        <button className="edit-btn" onClick={() => navigate("/profile-edit")}>
          개인정보 수정
        </button>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
