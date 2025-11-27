import React from 'react';
import fridgeImg from '../../image/fridge-removebg-preview.png';
const Fridge = ({ onSelectSection = () => {}, selectedSection = null }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-96 rounded-lg mb-4 relative">
        {/* 배경으로 냉장고 이미지 사용 (public/fridge.png 에 파일을 넣어두세요) */}
        <div
          className="w-full h-full bg-center bg-no-repeat bg-contain rounded-lg border border-gray-200"
          style={{ backgroundImage: `url(${fridgeImg})` }}
        />

        {/* 4개 클릭 영역: 각 영역은 절대위치로 사분면을 차지 */}
        <button
          aria-label="section-1"
          onClick={() => onSelectSection(1)}
          className={`absolute top-0 left-0 w-1/2 h-1/2 focus:outline-none ${
            selectedSection === 1 ? 'ring-2 ring-green-300' : 'hover:bg-green-50/40'
          }`}
        />
        <button
          aria-label="section-2"
          onClick={() => onSelectSection(2)}
          className={`absolute top-0 right-0 w-1/2 h-1/2 focus:outline-none ${
            selectedSection === 2 ? 'ring-2 ring-green-300' : 'hover:bg-green-50/40'
          }`}
        />
        <button
          aria-label="section-3"
          onClick={() => onSelectSection(3)}
          className={`absolute bottom-0 left-0 w-1/2 h-1/2 focus:outline-none ${
            selectedSection === 3 ? 'ring-2 ring-green-300' : 'hover:bg-green-50/40'
          }`}
        />
        <button
          aria-label="section-4"
          onClick={() => onSelectSection(4)}
          className={`absolute bottom-0 right-0 w-1/2 h-1/2 focus:outline-none ${
            selectedSection === 4 ? 'ring-2 ring-green-300' : 'hover:bg-green-50/40'
          }`}
        />
      </div>


    </div>
  );
};

export default Fridge;