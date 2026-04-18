import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, Loader2 } from 'lucide-react';
import '../styles/ConfirmationModal.css';

/**
 * Enhanced Confirmation Modal
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {function} onConfirm - Function to call when confirmed
 * @param {string} title - Modal title
 * @param {string} message - Modal body message
 * @param {boolean} isLoading - Whether the confirm action is in progress
 * @param {string} confirmText - Text for the confirm button
 * @param {string} cancelText - Text for the cancel button
 * @param {string} type - 'danger' (red), 'success' (green), 'info' (blue), 'warning' (yellow)
 */
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  isLoading = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // danger, success, info, warning
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="icon-lg" />;
      case 'info': return <Info className="icon-lg" />;
      case 'warning': return <AlertTriangle className="icon-lg" />;
      case 'danger':
      default: return <AlertTriangle className="icon-lg" />;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose} />
      
      <div className={`modal-content modal-type-${type}`}>
        <div className="modal-icon-container">
          <div className="modal-icon-glow" />
          <div className="modal-icon">
            {getIcon()}
          </div>
        </div>

        <div className="modal-body">
          <h2 className="modal-title">{title}</h2>
          <p className="modal-description">{message}</p>
        </div>

        <div className="modal-actions">
          <button 
            className="modal-btn modal-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className={`modal-btn modal-btn-confirm btn-${type}`} 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="spinner" size={18} />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>

        <p className="modal-footer-text">
          This action can be undone if needed by contacting support.
        </p>
      </div>
    </div>
  );
};

export default ConfirmationModal;
