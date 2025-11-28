import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/ProfilePage.css";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import ProfileInfo from "./components/ProfileInfo";
import ShoppingHistoryModal from "./components/ShoppingHistoryModal";   // ⭐ 추가

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ⭐ 기존 상태값
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [shoppingHistory, setShoppingHistory] = useState(0);

  // ⭐ Step2: 모달 관련 상태 추가
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(stored);
    setUser(parsed);

    // ⭐ 총 레시피 개수 가져오기
    fetch(`http://127.0.0.1:8000/api/recipes/?user_id=${parsed.user_id}`)
      .then((res) => res.json())
      .then((data) => setTotalRecipes(data.recipes.length))
      .catch((err) => console.error("레시피 개수 로드 실패", err));

    // ⭐ 쇼핑 히스토리 숫자 가져오기
    fetch(`http://127.0.0.1:8000/api/shopping/history/?user_id=${parsed.user_id}`)
      .then((res) => res.json())
      .then((data) => {
        setShoppingHistory(data.items?.length || 0);
      })
      .catch((err) => console.error("쇼핑 히스토리 로드 실패", err));
  }, []);

  // ⭐ 쇼핑 상세 내역 가져오기 (모달 오픈용)
  
const openShoppingHistoryModal = async () => {
  if (!user) return;   // ← 중요! user가 준비되기 전 실행 방지

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/shopping/history/?user_id=${user.user_id}`
    );
    const data = await res.json();
    setShoppingList(data.items || []); // 리스트 저장
    setShowShoppingModal(true); // 모달 열기
  } catch (err) {
    console.error("쇼핑 내역 불러오기 실패", err);
  }
};


  if (!user) return null;

  return (
    <div className="profile-page">
      {/* 프로필 상단 */}
      <ProfileHeader user={user} />

      {/* ⭐ 통계 카드 (숫자 + 클릭 이벤트 추가) */}
      <ProfileStats
        stats={{
          totalRecipes,
          shoppingHistory,
        }}
        onShoppingClick={openShoppingHistoryModal}   // ⭐ 클릭하면 모달 오픈
      />

      {/* 내 정보 */}
      <ProfileInfo user={user} />

      {/* 버튼들 */}
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

      {/* ⭐ Step2: 쇼핑 내역 모달 렌더링 */}
      {showShoppingModal && (
        <ShoppingHistoryModal
          items={shoppingList}
          onClose={() => setShowShoppingModal(false)}
        />
      )}
    </div>
  );
}
