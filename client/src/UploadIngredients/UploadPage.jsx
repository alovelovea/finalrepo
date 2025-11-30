import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
  const navigate = useNavigate();

  const onDrop = useCallback(acceptedFiles => {
    
    console.log(acceptedFiles);
    
    navigate('/recognized-ingredients');
  }, [navigate]);

  const { getRootProps, getInputProps, open } = useDropzone({ 
    onDrop,
    noClick: true,
    noKeyboard: true
  });

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">사진 업로드</h2>
        <div {...getRootProps({className: 'w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 mb-6'})}>
          <input {...getInputProps()} />
          <p className="text-center">이미지를 클릭하거나 끌어다 놓으세요</p>
        </div>
        <div className="flex justify-end space-x-4">
          <button onClick={() => navigate('/')} className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg">
            건너뛰기
          </button>
          <button onClick={open} className="bg-green-500 text-white py-2 px-6 rounded-lg">
            파일 선택
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;