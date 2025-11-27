import React, { useState, useRef } from "react";
import "../css/ImageUploadBox.css";

export default function ImageUploadBox({ onImageSelect }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);

  // 파일 선택 처리
  const handleSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageSelect(file);          // Django FormData로 넘길 원본 파일 전달
      setPreview(URL.createObjectURL(file)); // 미리보기 표시 (너 디자인 유지)
    }
  };

  return (
    <label className="upload-container" onClick={() => fileRef.current.click()}>
      <div className="upload-box dynamic">

        {preview ? (
          <img src={preview} alt="preview" className="upload-preview-auto" />
        ) : (
          <>
            <span className="upload-icon">📷</span>
            <span className="upload-text">이미지 업로드</span>
          </>
        )}

      </div>

      <input
        type="file"
        ref={fileRef}
        hidden
        accept="image/*"
        onChange={handleSelect}
      />
    </label>
  );
}