import React from 'react';
import { AlertTriangle } from 'lucide-react';
import '../styles/ConfirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  isLoading = false,
  confirmText = "Delete",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">
            <AlertTriangle size={24} />
          </div>
          <h3 className="modal-title">{title}</h3>
        </div>
        
        <p className="modal-message">{message}</p>
        
        <div className="modal-actions">
          <button 
            className="modal-btn modal-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className="modal-btn modal-btn-confirm" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
