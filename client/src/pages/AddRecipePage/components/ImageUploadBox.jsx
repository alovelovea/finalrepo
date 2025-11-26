import React, { useState, useRef, useEffect } from "react";
import "../css/ImageUploadBox.css";

export default function ImageUploadBox({ file, setFile }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);

  // 🔥 file 변경 시 preview 갱신
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // 🔥 파일 선택 처리
  const handleSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  return (
    <div
      className="upload-container"
      onClick={() => fileRef.current.click()}
      style={{ cursor: "pointer" }}
    >
      <div className="upload-box dynamic">

        {/* 이미지 미리보기 */}
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="upload-preview-auto"
            onClick={(e) => e.stopPropagation()}   // ← 이미지 눌러도 파일창 안 열림
          />
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
    </div>
  );
}
