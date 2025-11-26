export const recipes = [
  { id: 1, name: '김치찌개', ingredients: ['김치', '돼지고기', '두부', '대파', '돼지고기', '두부', '대파', '돼지고기', '두부', '대파'], image: '/images/recipe-1.png' },
  { id: 2, name: '된장찌개', ingredients: ['된장', '호박', '감자', '양파'], image: '/images/recipe-2.png' },
  { id: 3, name: '불고기', ingredients: ['소고기', '간장', '설탕', '마늘'], image: '/images/recipe-3.png' },
];

export function getRecipeById(id) {
  return recipes.find(r => r.id === Number(id));
}