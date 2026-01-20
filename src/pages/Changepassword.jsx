import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from '../services/api';
import '../styles/changepassword.css';
import { FaLock, FaEye, FaEyeSlash, FaSave, FaTimes, FaCheck } from 'react-icons/fa';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Get userId from localStorage
  const userId = localStorage.getItem("userId");

  // Check if user is logged in
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.oldPassword) {
      errors.oldPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (formData.newPassword === formData.oldPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Updating password for userId:', userId);
      await updatePassword(userId, {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      setSuccess('Password updated successfully!');
      
      // Clear form
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Password update error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
    setValidationErrors({});
  };

  return (
    <div className="change-password-container">
      <div className="change-password-wrapper">
        
        <div className="change-password-header">
          <div className="header-icon">
            <FaLock />
          </div>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your password to keep your account secure</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error">
            <FaTimes /> {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <FaCheck /> {success}
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="password-form">
          
          <div className="password-card">
            
            {/* Current Password */}
            <div className="form-group">
              <label className="form-label">
                <FaLock className="input-icon" />
                Current Password
              </label>
              <div className="password-input-wrapper">
                <input 
                  type={showPasswords.old ? "text" : "password"}
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  className={`form-control ${validationErrors.oldPassword ? 'error' : ''}`}
                  placeholder="Enter your current password"
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('old')}
                  tabIndex="-1"
                >
                  {showPasswords.old ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {validationErrors.oldPassword && (
                <span className="error-message">{validationErrors.oldPassword}</span>
              )}
            </div>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label">
                <FaLock className="input-icon" />
                New Password
              </label>
              <div className="password-input-wrapper">
                <input 
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`form-control ${validationErrors.newPassword ? 'error' : ''}`}
                  placeholder="Enter your new password"
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('new')}
                  tabIndex="-1"
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {validationErrors.newPassword && (
                <span className="error-message">{validationErrors.newPassword}</span>
              )}
              <div className="password-requirements">
                <small>Password must be at least 8 characters long</small>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">
                <FaLock className="input-icon" />
                Confirm New Password
              </label>
              <div className="password-input-wrapper">
                <input 
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-control ${validationErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your new password"
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirm')}
                  tabIndex="-1"
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <span className="error-message">{validationErrors.confirmPassword}</span>
              )}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="password-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              <FaTimes /> Cancel
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  Updating...
                </>
              ) : (
                <>
                  <FaSave /> Update Password
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ChangePassword;