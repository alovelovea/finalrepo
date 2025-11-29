import React from 'react';
import fridgeImg from '../../../image/fridge-removebg-preview.png';
import '../css/Fridge.css';

const Fridge = ({ onSelectSection = () => {}, selectedSection = null }) => {
  return (
    <div className="fridge-container">
      <div className="fridge-image-wrapper">
        <div
          className="fridge-background"
          style={{ backgroundImage: `url(${fridgeImg})` }}
        />

        <button
          aria-label="section-1"
          onClick={() => onSelectSection(1)}
          className={`fridge-section-button section-1 ${selectedSection === 1 ? 'selected' : ''}`}
        />
        <button
          aria-label="section-2"
          onClick={() => onSelectSection(2)}
          className={`fridge-section-button section-2 ${selectedSection === 2 ? 'selected' : ''}`}
        />
        <button
          aria-label="section-3"
          onClick={() => onSelectSection(3)}
          className={`fridge-section-button section-3 ${selectedSection === 3 ? 'selected' : ''}`}
        />
        <button
          aria-label="section-4"
          onClick={() => onSelectSection(4)}
          className={`fridge-section-button section-4 ${selectedSection === 4 ? 'selected' : ''}`}
        />
      </div>
    </div>
  );
};

export default Fridge;