import React from "react";
import "../css/CancelConfirmModal.css";

export default function CancelConfirmModal({ onClose, onConfirm }) {
  return (
    <div className="cancel-modal-backdrop">
      <div className="cancel-modal-box">
        <h3 className="cancel-modal-title">정말 취소하시겠어요?</h3>
        <p className="cancel-modal-message">
          입력한 내용이 모두 초기화됩니다.
        </p>

        <div className="cancel-modal-buttons">
          <button className="btn-gray small" onClick={onClose}>
            아니요
          </button>

          <button className="btn-red small" onClick={onConfirm}>
            예, 취소합니다
          </button>
        </div>
      </div>
    </div>
  );
}
