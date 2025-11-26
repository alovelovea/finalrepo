import React, { useState, useEffect } from "react";
import ImageUploadBox from "./ImageUploadBox";
import AddRecipeIngredientDialog from "./AddRecipeIngredientDialog";
import axios from "axios";

export default function AddRecipeForm() {
  const [menuName, setMenuName] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [dbIngredients, setDbIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const [category, setCategory] = useState("한식");

  // 🔥 새로운: 모달 열림 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/ingredients/")
      .then((res) => setDbIngredients(res.data.ingredients))
      .catch((err) => console.log("재료 불러오기 실패:", err));
  }, []);

 const handleSubmit = async () => {
  if (!menuName || !recipeText) {
    alert("메뉴 이름과 요리법은 필수입니다.");
    return;
  }

  const formData = new FormData();
  formData.append("name", menuName);
  formData.append("description", recipeText);

  // 🔥 수량 포함한 재료 구조 생성
  const refinedIngredients = selectedIngredients.map((ing) => ({
    id: ing.ingredient_id,
    name: ing.name,
    quantity: ing.quantity || 1,
    unit: ing.unit || ""
  }));

  formData.append("ingredients", JSON.stringify(refinedIngredients));
  formData.append("category", category);

  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/add_recipe/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    alert("레시피 저장 완료!");

    setMenuName("");
    setRecipeText("");
    setSelectedIngredients([]);
    setCategory("한식");
    setImageFile(null);

  } catch (err) {
    console.log("레시피 저장 에러:", err.response?.data);
    alert("레시피 저장 실패");
  }
};



  return (
    <div className="add-recipe-card">
      <h2 className="add-recipe-header">메뉴 추가</h2>

      {/* 메뉴 이름 */}
      <div className="form-row">
        <label className="input-label">메뉴 이름</label>
        <input
          className="input-box"
          placeholder="예: 김치찌개, 된장찌개 등"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
        />
      </div>

      {/* 카테고리 */}
      <div className="form-row">
        <label className="input-label">카테고리</label>
        <select
          className="input-box"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="한식">한식</option>
          <option value="양식">양식</option>
          <option value="일식">일식</option>
          <option value="중식">중식</option>
        </select>
      </div>

      {/* 이미지 업로드 */}
      <div className="form-row-image">
        <label className="input-label upload-label">메뉴 사진</label>

  <div className="upload-wrapper-full">
    <ImageUploadBox file={imageFile} setFile={setImageFile} />
  </div>
</div>

      {/* 🔥 재료 선택 버튼 */}
      <div className="form-row-block">
        <label className="input-label">재료</label>
        <button
          className="btn-add-ingredient"
          onClick={() => setIsDialogOpen(true)}
          style={{
            padding: "10px 16px",
            background: "#79AC78",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          재료 선택하기
        </button>
        
        {/* 🔥 선택된 재료 미리보기 UI */}
  {selectedIngredients.length > 0 && (
    <div style={{ marginTop: "10px" }}>
      <p style={{ fontSize: "14px", color: "#444", marginBottom: "6px" }}>
      선택된 재료 {selectedIngredients.length}개
      </p>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginTop: "6px",
      }}
    >
      {selectedIngredients.map((ing) => (
        <div
          key={ing.ingredient_id}
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f7f7f7",
            padding: "6px 10px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            gap: "10px",
          }}
        >
          {/* 이미지 */}
          <img
            src={ing.img}
            alt={ing.name}
            style={{
              width: "26px",
              height: "26px",
              objectFit: "cover",
              borderRadius: "6px",
            }}
          />

          {/* 재료명 + 수량 */}
          <span style={{ fontSize: "14px", color: "#333" }}>
            {ing.name} x {ing.quantity || 1}
            {ing.unit || "개"}
          </span>

          {/* ❌ 삭제 버튼 */}
          <button
            onClick={() =>
              setSelectedIngredients((prev) =>
                prev.filter((i) => i.ingredient_id !== ing.ingredient_id)
              )
            }
            style={{
              marginLeft: "4px",
              background: "transparent",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
)}


      </div>

      {/* 요리법 */}
      <div className="form-row-block">
        <label className="input-label">요리법</label>
        <textarea
          className="textarea-box"
          placeholder="예: 1. 재료 손질 → 2. 양념 배합 → 3. 조리"
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
        />
      </div>

      {/* 버튼 */}
      <div className="btn-area">
        <div className="btn-center">
          <button className="btn-submit" onClick={handleSubmit}>
            레시피 저장
          </button>
        </div>

        <div className="btn-right">
          <button className="btn-cancel">취소</button>
        </div>
      </div>

      {/* 🔥 재료 선택 dialog */}
      {isDialogOpen && (
        <AddRecipeIngredientDialog
        ingredients={dbIngredients}
        selectedDefault={selectedIngredients}   // ⭐ 추가!
        onConfirm={(selectedList) => {
        setSelectedIngredients(selectedList);
        setIsDialogOpen(false);
      }}
      onClose={() => setIsDialogOpen(false)}
      />
      )}
    </div>
  );
}
