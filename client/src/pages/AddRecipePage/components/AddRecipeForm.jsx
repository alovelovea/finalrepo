import React, { useState, useEffect } from "react";
import ImageUploadBox from "./ImageUploadBox";
import AddRecipeIngredientDialog from "./AddRecipeIngredientDialog";
import IngredientPreview from "./IngredientPreview";
import CancelConfirmModal from "./CancelConfirmModal";
import axios from "axios";

export default function AddRecipeForm() {
  const [menuName, setMenuName] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [dbIngredients, setDbIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const [category, setCategory] = useState("한식");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/ingredients/")
      .then((res) => setDbIngredients(res.data.ingredients))
      .catch((err) => console.log("재료 불러오기 실패:", err));
  }, []);

  const handleCancel = () => {
    setMenuName("");
    setRecipeText("");
    setImageFile(null);
    setSelectedIngredients([]);
    setCategory("한식");
  };

  const handleSubmit = async () => {
    if (!menuName || !recipeText) {
      alert("메뉴 이름과 요리법은 필수입니다.");
      return;
    }

    const formData = new FormData();
    formData.append("name", menuName);
    formData.append("description", recipeText);
    formData.append("category", category);

    const refinedIngredients = selectedIngredients.map((ing) => ({
      id: ing.ingredient_id,
      name: ing.name,
      quantity: ing.quantity || 1,
      unit: ing.unit || "",
    }));

    formData.append("ingredients", JSON.stringify(refinedIngredients));
    if (imageFile) formData.append("image", imageFile);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/add_recipe/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("레시피 저장 완료!");
      handleCancel();
    } catch (err) {
      console.log(err);
      alert("레시피 저장 실패");
    }
  };

  return (
    <div className="arf-container">
      <h2 className="arf-title">레시피 추가</h2>

     
      <div className="arf-grid">

      
        <label className="arf-label">이름</label>
        <input
          className="arf-input"
          placeholder="예: 김치찌개, 된장찌개 등"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
        />

      
        <label className="arf-label">카테고리</label>
        <select
          className="arf-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="한식">한식</option>
          <option value="양식">양식</option>
          <option value="일식">일식</option>
          <option value="중식">중식</option>
        </select>

       
        <label className="arf-label">사진</label>
        <div className="arf-upload-wrapper">
          <ImageUploadBox file={imageFile} setFile={setImageFile} />
        </div>

        
        <label className="arf-label">재료</label>
        <div>
          <button
            className="arf-btn-select"
            onClick={() => setIsDialogOpen(true)}
          >
            재료 선택하기
          </button>

          <IngredientPreview
            items={selectedIngredients}
            onRemove={(id) =>
              setSelectedIngredients((prev) =>
                prev.filter((i) => i.ingredient_id !== id)
              )
            }
          />
        </div>

    
        <label className="arf-label">요리법</label>
        <textarea
          className="arf-textarea"
          placeholder="예: 1. 재료 손질 → 2. 양념 배합 → 3. 조리"
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
        ></textarea>

      </div>


      <div className="arf-btn-row">
        <button className="arf-btn-cancel" 
        onClick={() => setShowCancelModal(true)}> 취소 </button>
        <button className="arf-btn-submit" onClick={handleSubmit}>레시피 저장</button>
      </div>

      
      {isDialogOpen && (
        <AddRecipeIngredientDialog
          ingredients={dbIngredients}
          selectedDefault={selectedIngredients}
          onConfirm={(list) => {
            setSelectedIngredients(list);
            setIsDialogOpen(false);
          }}
          onClose={() => setIsDialogOpen(false)}
        />
      )}

      {showCancelModal && (
        <CancelConfirmModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={() => {
            handleCancel();
            setShowCancelModal(false);
          }}
        />
      )}
    </div>
  );
}
