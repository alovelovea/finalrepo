import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [sliderStyle, setSliderStyle] = useState({});
  const [activeSliderStyle, setActiveSliderStyle] = useState({});
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);
  const isScrolling = useRef(false);
  const navRef = useRef(null);
  const addRecipeRef = useRef(null);
  const recipeListRef = useRef(null);
  const ingredientRef = useRef(null);
  const shoppingRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      isScrolling.current = true;
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 150);

      const currentScrollY = window.scrollY;
      // Only hide if scrolling down more than 10px and past the 100px threshold
      if (currentScrollY > lastScrollY.current + 10 && currentScrollY > 100) {
        setIsHeaderVisible(false);
      // Only show if scrolling up more than 10px
      } else if (currentScrollY < lastScrollY.current - 10) {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    const handleMouseMove = (e) => {
      if (!isScrolling.current) {
        if (e.clientY < 80) {
          setIsHeaderVisible(true);
        } else {
          setIsHeaderVisible(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    let currentRef = null;
    if (location.pathname === '/add-recipe') {
      currentRef = addRecipeRef.current;
    } else if (location.pathname === '/recipe-list') {
      currentRef = recipeListRef.current;
    } else if (location.pathname === '/ingredient') {
      currentRef = ingredientRef.current;
    } else if (location.pathname === '/shopping') {
      currentRef = shoppingRef.current;
    }

    if (currentRef) {
      const { offsetLeft, offsetWidth } = currentRef;
      setActiveSliderStyle({ left: offsetLeft, width: offsetWidth });
    } else {
      setActiveSliderStyle({});
    }
  }, [location.pathname]);

  const handleMouseEnter = (e) => {
    const { offsetLeft, offsetWidth } = e.target;
    setSliderStyle({ left: offsetLeft, width: offsetWidth });
  };

  const handleMouseLeave = () => {
    setSliderStyle({});
  };

  return (
    <header
      className={`bg-green shadow-sm p-4 fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav ref={navRef} className="container mx-auto flex justify-between items-center relative" onMouseLeave={handleMouseLeave}>
        <NavLink to="/home" className={({ isActive }) => (isActive ?
          'text-green-500' :'text-gray-600 hover:shadow-md hover:underline')}>                                                                   
          <FaHome size={24} />
        </NavLink>

        <NavLink ref={addRecipeRef} to="/add-recipe" onMouseEnter={handleMouseEnter} className={({ isActive }) => (isActive ? 'text-green-500 font-bold' : 'text-gray-600')}>
          Add Recipe
        </NavLink>
        <NavLink ref={recipeListRef} to="/recipe-list" onMouseEnter={handleMouseEnter} className={({ isActive }) => (isActive ? 'text-green-500 font-bold' : 'text-gray-600')}>
          Recipe List
        </NavLink>
        <NavLink ref={ingredientRef} to="/ingredient" onMouseEnter={handleMouseEnter} className={({ isActive }) => (isActive ? 'text-green-500 font-bold' : 'text-gray-600')}>
          Ingredient
        </NavLink>
        <NavLink ref={shoppingRef} to="/shopping" onMouseEnter={handleMouseEnter} className={({ isActive }) => (isActive ? 'text-green-500 font-bold' : 'text-gray-600')}>
          Shopping
        </NavLink>

        <NavLink to="/profile" className="text-gray-600 hover:shadow-md hover:underline">
          <FaUserCircle size={24} />
        </NavLink>

        <div
          className="absolute bottom-[-10px] h-1 bg-green-500 transition-all duration-300"
          style={sliderStyle.width ? sliderStyle : activeSliderStyle}
        />
      </nav>
    </header>
  );
};

export default Header;