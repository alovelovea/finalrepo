import React, { useState, useEffect } from "react";
import "../css/ProfileEdit.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProfileEdit() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(stored);

    setUser({
      ...parsed,
      isVegan: parsed.is_vegan,   // Django → React 변환
      user_id: parsed.user_id,   // ★ DB 실제 user_id
    });
  }, []);

  if (!user) return null;

  const allergyOptions = ["계란", "땅콩", "갑각류", "우유", "밀", "대두"];

  const toggleAllergy = (item) => {
    setUser((prev) => {
      const exists = prev.allergies?.includes(item);
      return {
        ...prev,
        allergies: exists
          ? prev.allergies.filter((a) => a !== item)
          : [...(prev.allergies || []), item],
      };
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put("http://127.0.0.1:8000/api/profile/update/", {
        user_id: user.user_id,          // ★ 진짜 key
        name: user.name,
        address: user.address,
        is_vegan: user.isVegan,
        allergies: user.allergies || [],
      });

      alert("개인정보 수정 완료!");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          is_vegan: user.isVegan,
        })
      );

      navigate("/profile");
    } catch (err) {
      console.error("❌ update_profile API error:", err.response?.data || err);
      alert("수정 실패! 다시 시도해주세요.");
    }
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
        {/* ★ user.user_id 가 맞는 값 */}
        <input type="text" value={user.user_id} disabled />

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
                checked={user.allergies?.includes(item)}
                onChange={() => toggleAllergy(item)}
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="edit-buttons">
        <button className="save-btn" onClick={handleSubmit}>
          저장
        </button>

        <button className="cancel-btn" onClick={() => navigate("/profile")}>
          취소
        </button>
      </div>
    </div>
  );
}
