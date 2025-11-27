import React from "react";
import { useNavigate } from "react-router-dom";
import "./css/ProfilePage.css";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import ProfileInfo from "./components/ProfileInfo";

//import ProfileTag from "./components/ProfileTag";

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = {
    name: "한성",
    address: "서울특별시 성북구 안암로 16길 116",
    id: "hansung",
    pw: "1234",
    isVegan: false,
    allergies: ["우유", "새우"],
    manualTags: ["한식", "매운맛"],
  };

  const autoTags = [];
  if (user.isVegan) autoTags.push("비건");
  user.allergies.forEach((a) => autoTags.push(`${a}알러지`));
  const finalTags = [...user.manualTags, ...autoTags];

  return (
    <div className="profile-page">

      {/* 프로필 상단 */}
      <ProfileHeader user={user} />


      {/* 태그 리스트
      <div className="profile-tags-box">
        <div className="profile-tags">
          {finalTags.map((tag, idx) => (
            <ProfileTag key={idx} label={tag} />
          ))}
        </div>
      </div>
      */}

      {/* ⬆️ 여기에서 통계 카드 먼저 */}
      <ProfileStats
        stats={{
          saved: 12,
          uploaded: 4,
          checklist: 6,
        }}
      />

      {/* ⬇️ 그리고 이제 '내 정보' 아래로 이동 */}
      <ProfileInfo user={user} />

      {/* 버튼 */}
      <div className="profile-buttons">
        <button
          className="edit-btn"
          onClick={() => navigate("/profile-edit")}
        >
          개인정보 수정
        </button>
        <button className="logout-btn">로그아웃</button>
      </div>

    </div>
  );
}