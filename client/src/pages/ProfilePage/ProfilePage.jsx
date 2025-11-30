import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/ProfilePage.css";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import ProfileInfo from "./components/ProfileInfo";
import ShoppingHistoryModal from "./components/ShoppingHistoryModal";   

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

 
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [shoppingHistory, setShoppingHistory] = useState(0);


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

    
    fetch(`http://127.0.0.1:8000/api/recipes/?user_id=${parsed.user_id}`)
      .then((res) => res.json())
      .then((data) => setTotalRecipes(data.recipes.length))
      .catch((err) => console.error("레시피 개수 로드 실패", err));

   
    fetch(`http://127.0.0.1:8000/api/shopping/history/?user_id=${parsed.user_id}`)
      .then((res) => res.json())
      .then((data) => {
        setShoppingHistory(data.items?.length || 0);
      })
      .catch((err) => console.error("쇼핑 히스토리 로드 실패", err));
  }, []);

 
  
const openShoppingHistoryModal = async () => {
  if (!user) return;   

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/shopping/history/?user_id=${user.user_id}`
    );
    const data = await res.json();
    setShoppingList(data.items || []); 
    setShowShoppingModal(true); 
  } catch (err) {
    console.error("쇼핑 내역 불러오기 실패", err);
  }
};


  if (!user) return null;

  return (
    <div className="profile-page">
      
      <ProfileHeader user={user} />

      
      <ProfileStats
        stats={{
          totalRecipes,
          shoppingHistory,
        }}
        onShoppingClick={openShoppingHistoryModal}   
      />

      
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

      
      {showShoppingModal && (
        <ShoppingHistoryModal
          items={shoppingList}
          onClose={() => setShowShoppingModal(false)}
        />
      )}
    </div>
  );
}
