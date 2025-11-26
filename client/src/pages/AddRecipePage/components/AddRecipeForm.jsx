import React, { useState, useEffect } from "react";
import ImageUploadBox from "./ImageUploadBox";
import IngredientSelector from "./IngredientSelector";
import axios from "axios";
import "../css/AddRecipePage.css";

export default function AddRecipeForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [image, setImage] = useState(null);
  const [dbIngredients, setDbIngredients] = useState([]);
  const [category, setCategory] = useState("한식"); // 🔥 기본값 변경

  // 🔥 Django DB에서 재료 목록 불러오기
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/ingredients/")
      .then((res) => setDbIngredients(res.data.ingredients))
      .catch((err) => console.log("재료 목록 불러오기 실패:", err));
  }, []);

  const handleSelectIngredient = (ingredient) => {
    setIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  // 🔥 레시피 저장
  const handleSubmit = async () => {
    if (!name || !description) {
      alert("메뉴 이름과 조리법은 필수입니다.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("category", category);

    if (image) formData.append("image", image);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/add_recipe/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("레시피 저장 완료!");
      console.log("서버 응답:", res.data);

      // 초기화
      setName("");
      setDescription("");
      setIngredients([]);
      setImage(null);
      setCategory("한식"); // 초기화 시 한식으로 돌아감

    } catch (err) {
      alert("레시피 저장 실패");
      console.log("레시피 저장 에러:", err.response?.data);
    }
  };

  return (
    <div className="add-box">
      <h1 className="title-text">메뉴 추가</h1>

      {/* 메뉴 이름 */}
      <div className="form-row">
        <label>메뉴 이름</label>
        <input
          className="input-text"
          placeholder="예: 김치찌개, 된장찌개 등"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* 카테고리 */}
      <div className="form-row">
        <label>카테고리</label>
        <select
          className="input-text"
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
      <div className="form-row">
        <label>메뉴 사진</label>
        <ImageUploadBox onImageSelect={setImage} />
      </div>

      {/* 구성 재료 */}
      <IngredientSelector
        ingredients={dbIngredients}
        selected={ingredients}
        onSelect={handleSelectIngredient}
      />

      {/* 조리법 */}
      <div className="form-row-block">
        <label>요리법</label>
        <textarea
          className="input-desc"
          placeholder="예: 1. 재료 손질 → 2. 양념 배합 → 3. 조리"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* 버튼 */}
      <div className="btn-area">
        <button className="btn-save" onClick={handleSubmit}>
          레시피 저장
        </button>
        <button className="btn-cancel">취소</button>
      </div>
    </div>
  );
}
