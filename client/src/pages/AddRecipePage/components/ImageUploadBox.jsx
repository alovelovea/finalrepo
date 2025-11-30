import React, { useState, useRef, useEffect } from "react";
import "../css/ImageUploadBox.css";

export default function ImageUploadBox({ file, setFile }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);


  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);


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

     
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="upload-preview-auto"
            onClick={(e) => e.stopPropagation()}   
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
