import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import '../../AddIngredientPage/components/AddIngredientDialog.css'; // 스타일 재사용
import '../../AddIngredientPage/css/UploadPage.css'; // 업로드 페이지 관련 스타일
import loadingGif from '../../AddIngredientPage/assets/loading.gif';

const ImageUploadDialog = ({ onCancel, onSuccess }) => {
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
          throw new Error(`서버 응답 오류: ${res.status}`);
        }

        const text = await res.text();
        const data = JSON.parse(text);
        const items = Array.isArray(data.items) ? data.items : [];
        
        onSuccess(items); // 성공 시 인식된 아이템들을 부모로 전달

      } catch (err) {
        console.error('이미지 분석 중 오류 발생:', err);
        alert('이미지 분석 중 오류가 발생했습니다.');
        setLoading(false); // 오류 발생 시 로딩 상태 해제
      }
      // finally 블록은 성공/실패 모두 실행되므로 onSuccess 호출 후 다이얼로그가 바로 닫히는 것을 방지하기 위해 로직 이동
    },
    [onSuccess]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    multiple: false,
    accept: { 'image/*': [] },
  });

  return (
    <div className="dialog-backdrop">
      <div className="dialog-container">
        {loading && (
          <div className="loading-overlay">
            <img src={loadingGif} alt="loading" className="loading-gif" />
            <p className="loading-text">이미지 분석 중...</p>
          </div>
        )}
        
        <button onClick={onCancel} className="dialog-close">×</button>
        <h2 className="dialog-title">이미지로 재료 추가</h2>
        
        <div {...getRootProps({ className: 'upload-dropzone' })} style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          <input {...getInputProps()} />
          <p className="upload-dropzone-text">
            이미지를 끌어다 놓거나 아래 "파일 선택" 버튼을 눌러 업로드하세요
          </p>
        </div>

        <div className="dialog-actions" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            onClick={onCancel}
            className="dialog-btn dialog-btn--gray"
          >
            취소
          </button>
          <button
            onClick={open}
            className="dialog-btn dialog-btn--blue" 
            disabled={loading}
          >
            파일 선택
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadDialog;