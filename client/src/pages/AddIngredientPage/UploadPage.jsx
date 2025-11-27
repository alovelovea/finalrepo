// src/pages/AddIngredientPage/UploadPage.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useLocation } from 'react-router-dom';
import './css/UploadPage.css';
import loadingGif from './assets/loading.gif';

const UploadPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // ✅ 어디서 왔는지 확인 (signup / ingredient / 기타)
  const from = location.state?.from;

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('image', file);

      setLoading(true);

      try {
        const res = await fetch('http://127.0.0.1:8000/classify/', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          console.error('HTTP error', res.status);
          alert('서버 응답 오류입니다. (status: ' + res.status + ')');
          return;
        }

        const text = await res.text();
        console.log('RAW /classify RESPONSE:', text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('응답 JSON 파싱 실패:', e);
          alert('서버 응답 형식이 올바르지 않습니다.');
          return;
        }

        const items = Array.isArray(data.items) ? data.items : [];
        console.log('PARSED /classify items:', items);

        // ✅ 인식된 재료 페이지로
        navigate('/recognized-ingredients', {
          state: { items, raw: data },
        });
      } catch (err) {
        console.error('fetch 자체 에러:', err);
        alert('이미지 분석 중 네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: false,  // 클릭해도 파일 선택 가능
    noKeyboard: true,
    multiple: false,
    accept: { 'image/*': [] },
  });

  // ✅ 건너뛰기 클릭시 이동 로직
  const handleSkip = () => {
    if (from === 'signup') {
      // 회원가입 → 업로드로 왔으면 → 홈으로
      navigate('/home');
    } else {
      // 그 외(예: ingredient에서 왔을 때)는 → 재료 관리로
      navigate('/ingredient');
    }
  };

  return (
    <div className="upload-page">
      {/* 로딩 오버레이 */}
      {loading && (
        <div className="loading-overlay">
          <img src={loadingGif} alt="loading" className="loading-gif" />
          <p className="loading-text">이미지 분석 중...</p>
        </div>
      )}

      <div className="upload-container">
        <h2 className="upload-title">사진 업로드</h2>

        {/* 클릭 + 드래그 모두 가능 */}
        <div {...getRootProps({ className: 'upload-dropzone' })}>
          <input {...getInputProps()} />
          <p className="upload-dropzone-text">
            이미지를 클릭하거나 끌어다 놓아 업로드하세요
          </p>
        </div>

        <div className="upload-actions">
          {/* 🔥 건너뛰기: from에 따라 분기 */}
          <button
            onClick={handleSkip}
            className="upload-btn upload-btn--gray"
          >
            건너뛰기
          </button>

          <button
            onClick={open}
            className="upload-btn upload-btn--green"
            disabled={loading}
          >
            파일 선택
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
