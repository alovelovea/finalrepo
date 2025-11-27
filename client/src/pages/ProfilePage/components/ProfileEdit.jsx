import React, { useState } from "react";
import "../css/ProfileEdit.css";
import { useNavigate } from "react-router-dom";

export default function ProfileEdit() {
  const navigate = useNavigate();

  const handleSubmit = () => {
  alert("개인정보 수정 완료!");
  navigate("/profile");
};

  // 임시 user 데이터 (나중에 실제 백엔드와 연결 가능)
  const [user, setUser] = useState({
    name: "한성",
    address: "서울특별시 성북구 안암로 16길 116",
    id: "hansung",
    pw: "1234",
    isVegan: false,
    allergies: ["우유", "새우"],
  });

  const allergyOptions = ["우유", "땅콩", "새우", "달걀", "생선", "밀"];

  // 체크박스 업데이트 로직
  const toggleAllergy = (item) => {
    setUser((prev) => {
      const exists = prev.allergies.includes(item);
      return {
        ...prev,
        allergies: exists
          ? prev.allergies.filter((a) => a !== item)
          : [...prev.allergies, item],
      };
    });
  };

  return (
    <div className="profile-edit-page">
      <h2 className="edit-title">개인정보 수정</h2>

      <div className="edit-box">
        <label>이름</label>
        <input
          type="text"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />

        <label>주소</label>
        <input
          type="text"
          value={user.address}
          onChange={(e) => setUser({ ...user, address: e.target.value })}
        />

        <label>ID</label>
        <input type="text" value={user.id} disabled />

        <label>비건 여부</label>
        <select
          value={user.isVegan ? "비건" : "일반식"}
          onChange={(e) =>
            setUser({ ...user, isVegan: e.target.value === "비건" })
          }
        >
          <option value="일반식">일반식</option>
          <option value="비건">비건</option>
        </select>

        <label>알레르기</label>
        <div className="allergy-list">
          {allergyOptions.map((item) => (
            <label key={item} className="allergy-item">
              <input
                type="checkbox"
                checked={user.allergies.includes(item)}
                onChange={() => toggleAllergy(item)}
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="edit-buttons">
        <button className="save-btn" onClick={handleSubmit}>저장</button>
        <button className="cancel-btn" onClick={() => navigate("/profile")}>
          취소
        </button>
      </div>
    </div>
  );
}