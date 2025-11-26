import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation , Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import MainPage from './pages/MainPage/MainPage';
import UploadPage from './UploadIngredients/UploadPage';
import RecognizedIngredientsPage from './UploadIngredients/RecognizedIngredientsPage';
import AddRecipePage from './pages/AddRecipePage/AddRecipePage';
import RecipeListPage from './pages/RecipeListPage/RecipeListPage';
import IngredientPage from './pages/IngredientManagerPage/IngredientPage';
import ShoppingPage from './pages/ShoppingPage/ShoppingPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import RecipeDetailPage from './pages/MainPage/RecipeDetailPage';
import LoginPage from "./pages/LoginPage/LoginPage";
import MembershipPage from "./pages/LoginPage/MembershipPage";

const AppContent = () => {
  const location = useLocation();
  const showHeader = !(location.pathname.startsWith('/login') || location.pathname.startsWith('/signup'));

  return (
    <div className="bg-gray-50 min-h-screen">
      {showHeader && <Header />}
      <Routes>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<MembershipPage />} />
        <Route path="/home" element={<MainPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/add-recipe" element={<AddRecipePage />} />
        <Route path="/recipe-list" element={<RecipeListPage />} />
        <Route path="/ingredient" element={<IngredientPage />} />
        <Route path="/shopping" element={<ShoppingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/recipes/:recipeId" element={<RecipeDetailPage />} />
        <Route path="/recognized-ingredients" element={<RecognizedIngredientsPage />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
