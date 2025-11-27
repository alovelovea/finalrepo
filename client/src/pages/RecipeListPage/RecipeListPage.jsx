import React, { useState, useEffect } from "react";
import RecipeCategory from "./components/RecipeCategory";
import "./css/RecipeListPage.css";
import { useNavigate } from "react-router-dom";

const RecipeListPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:8000/api/recipes/?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setRecipes(data.recipes);
      })
      .catch((err) => console.error("API Error:", err));
  }, [userId]);

  const toggleFavorite = (id) => {
    fetch(`http://localhost:8000/api/toggle_like/${id}/?user_id=${userId}`)
      .then(() => {
        setRecipes((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, favorite: !item.favorite } : item
          )
        );
      })
      .catch((err) => console.error("Toggle Error:", err));
  };

  const filtered = recipes.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortByFavorite = (list) => {
    return [...list].sort((a, b) => {
      if (a.favorite === b.favorite) return a.id - b.id;
      return b.favorite - a.favorite;
    });
  };

  const korean = sortByFavorite(
    filtered.filter((r) => r.category === "한식")
  );
  const western = sortByFavorite(
    filtered.filter((r) => r.category === "양식")
  );
  const japanese = sortByFavorite(
    filtered.filter((r) => r.category === "일식")
  );
  const chinese = sortByFavorite(
    filtered.filter((r) => r.category === "중식")
  );

  // 🔥 카드 클릭 시 상세 페이지로 이동
  const goDetail = (id) => {
    navigate(`/recipes/${id}`);
  };

  return (
    <div className="recipe-list-container">
      <div className="search-bar">
        <input
          placeholder="레시피 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>

      <RecipeCategory
        title="한식"
        items={korean}
        onFavoriteToggle={toggleFavorite}
        onCardClick={goDetail}
      />

      <RecipeCategory
        title="양식"
        items={western}
        onFavoriteToggle={toggleFavorite}
        onCardClick={goDetail}
      />

      <RecipeCategory
        title="일식"
        items={japanese}
        onFavoriteToggle={toggleFavorite}
        onCardClick={goDetail}
      />

      <RecipeCategory
        title="중식"
        items={chinese}
        onFavoriteToggle={toggleFavorite}
        onCardClick={goDetail}
      />
    </div>
  );
};

export default RecipeListPage;