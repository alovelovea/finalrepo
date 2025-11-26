import React, { useRef } from "react";
import "../css/ImageUploadBox.css";

export default function ImageUploadBox({ onImageSelect }) {
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) onImageSelect(file);
  };

  return (
    <div className="upload-box" onClick={() => fileRef.current.click()}>
      <input
        type="file"
        ref={fileRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFile}
      />

      <div className="upload-inner">
        <span className="camera-icon">📷</span>
        <p>이미지 업로드</p>
      </div>
    </div>
  );
}
