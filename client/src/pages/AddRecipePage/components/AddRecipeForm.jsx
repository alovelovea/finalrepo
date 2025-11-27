import React, { useState, useEffect } from "react";
import ImageUploadBox from "./ImageUploadBox";
import IngredientSelector from "./IngredientSelector";
import axios from "axios";

export default function AddRecipeForm() {
  // 🔥 이름 / 설명 / 이미지 / 카테고리 / 재료 (Django 규격)
  const [menuName, setMenuName] = useState("");  // Django: name
  const [recipeText, setRecipeText] = useState(""); // Django: description
  const [imageFile, setImageFile] = useState(null); // Django: image

  // 🔥 DB 재료 목록 (Django에서 불러옴)
  const [dbIngredients, setDbIngredients] = useState([]);

  // 🔥 선택한 재료
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  // 🔥 카테고리 (기본값: 한식)
  const [category, setCategory] = useState("한식");

  // -------------------------------------------------
  // 🍀 1) Django ingredients 로드
  // -------------------------------------------------
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/ingredients/")
      .then((res) => setDbIngredients(res.data.ingredients))
      .catch((err) => console.log("재료 불러오기 실패:", err));
  }, []);

  // -------------------------------------------------
  // 🍀 2) 재료 선택 핸들러
  // -------------------------------------------------
  const handleSelectIngredient = (ing) => {
    setSelectedIngredients((prev) =>
      prev.includes(ing)
        ? prev.filter((i) => i !== ing)
        : [...prev, ing]
    );
  };

  // -------------------------------------------------
  // 🍀 3) Django로 레시피 저장 POST
  // -------------------------------------------------
  const handleSubmit = async () => {
    if (!menuName || !recipeText) {
      alert("메뉴 이름과 요리법은 필수입니다.");
      return;
    }

    const formData = new FormData();
    formData.append("name", menuName);
    formData.append("description", recipeText);
    formData.append("ingredients", JSON.stringify(selectedIngredients));
    formData.append("category", category);

    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/add_recipe/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("레시피 저장 완료!");

      // 초기화
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

      {/* 카테고리 추가 (UI 유지하면서 하나만 추가됨) */}
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
      <div className="form-row-block">
        <label className="input-label">메뉴 사진</label>
        <ImageUploadBox file={imageFile} setFile={setImageFile} />
      </div>

      {/* 구성 재료 (Django DB 기반) */}
      <div className="form-row-block">
        <IngredientSelector
          ingredients={dbIngredients}
          selected={selectedIngredients}
          onSelect={handleSelectIngredient}
        />
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
    </div>
  );
}