
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import './css/UploadPage.css';
import loadingGif from './assets/loading.gif';  
const UploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);  
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
    noClick: true,
    noKeyboard: true,
    multiple: false,
    accept: { 'image/*': [] },
  });

  return (
    <div className="upload-page">

      
      {loading && (
        <div className="loading-overlay">
          <img
            src={loadingGif}
            alt="loading"
            className="loading-gif"
          />
          <p className="loading-text">이미지 분석 중...</p>
        </div>
      )}

      <div className="upload-container">
        <h2 className="upload-title">사진 업로드</h2>

        <div {...getRootProps({ className: 'upload-dropzone' })}>
          <input {...getInputProps()} />
          <p className="upload-dropzone-text">
            이미지를 끌어다 놓거나 아래 "파일 선택" 버튼을 
            눌러 업로드하세요
          </p>
        </div>

        <div className="upload-actions">
          <button
            onClick={() => navigate('/home')}
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
