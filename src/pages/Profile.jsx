import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile, updatePassword } from '../services/api';
import API_BASE_URL from '../services/ApiConfig';
import '../styles/profile.css';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCamera, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaIdCard,
  FaCheck
} from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    profilePhoto: null,
    nidFile: null
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [isTemporaryImage, setIsTemporaryImage] = useState(false);

  // Get userId from localStorage
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetchProfile();
    } else {
      setError('User not logged in');
      setLoading(false);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [userId, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile for userId:', userId);
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Full URL will be:', `${API_BASE_URL}/api/Profile/me/${userId}`);
      const response = await getMyProfile(userId);
      console.log('Profile response:', response);
      console.log('Profile photo path from server:', response.data.profilePhotoPath);
      
      setProfile(response.data);
      setFormData({
        username: response.data.fullName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        profilePhoto: null,
        nidFile: null
      });
      
      // Handle profile image - always preserve user's uploaded image
      const serverImagePath = response.data.profilePhotoPath;
      const savedUserImage = localStorage.getItem(`user_profile_image_${userId}`);
      
      console.log('Server returned profilePhotoPath:', serverImagePath);
      console.log('Saved user image exists:', !!savedUserImage);
      
      if (savedUserImage) {
        // Always use the user's uploaded image if it exists (never delete it)
        console.log('Using saved user image');
        setPreviewImage(savedUserImage);
        setIsTemporaryImage(false);
      } else if (serverImagePath) {
        // Use server image only if no user image is saved
        let imageUrl = serverImagePath;
        
        if (!serverImagePath.startsWith('http') && !serverImagePath.startsWith('data:')) {
          imageUrl = `${API_BASE_URL}${serverImagePath.startsWith('/') ? '' : '/'}${serverImagePath}`;
        }
        
        console.log('Using server image:', imageUrl);
        setPreviewImage(imageUrl);
        setIsTemporaryImage(false);
      } else {
        console.log('No image available');
        setPreviewImage(null);
        setIsTemporaryImage(false);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      
      // Validate file type for profile photo
      if (name === 'profilePhoto') {
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(file.type)) {
          setError('Please select a valid image file (JPEG, PNG, or GIF)');
          return;
        }
        
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          setError('Image file size must be less than 5MB');
          return;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Preview image for profile photo
      if (name === 'profilePhoto') {
        setImageUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageDataUrl = reader.result;
          console.log('=== IMAGE UPLOAD DEBUG ===');
          console.log('File selected:', file.name, file.size, file.type);
          console.log('Image data URL length:', imageDataUrl.length);
          
          setPreviewImage(imageDataUrl);
          
          // Save the image permanently in localStorage (won't be deleted automatically)
          const userImageKey = `user_profile_image_${userId}`;
          localStorage.setItem(userImageKey, imageDataUrl);
          console.log('Saved user image permanently to localStorage');
          
          setImageUploading(false);
          setIsTemporaryImage(false); // It's now a permanent user image
        };
        reader.onerror = () => {
          setError('Failed to read image file');
          setImageUploading(false);
        };
        reader.readAsDataURL(file);
      }
      
      // Clear any previous errors
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Only send fields that have been changed
      const updateData = {};
      if (formData.username !== profile.fullName) updateData.username = formData.username;
      if (formData.email !== profile.email) updateData.email = formData.email;
      if (formData.phone !== profile.phone) updateData.phone = formData.phone;
      if (formData.address !== profile.address) updateData.address = formData.address;
      if (formData.profilePhoto) updateData.profilePhoto = formData.profilePhoto;
      if (formData.nidFile) updateData.nidFile = formData.nidFile;

      // Store current preview image before API call
      const currentPreviewImage = previewImage;
      const hasUploadedImage = !!formData.profilePhoto;

      console.log('=== PROFILE UPDATE DEBUG ===');
      console.log('Update data:', updateData);
      console.log('Has uploaded image:', hasUploadedImage);
      console.log('Current preview image:', currentPreviewImage);

      await updateMyProfile(userId, updateData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh profile data
      const response = await getMyProfile(userId);
      console.log('Server response after update:', response.data);
      console.log('Server profilePhotoPath:', response.data.profilePhotoPath);
      
      setProfile(response.data);
      
      // Update form data but preserve the preview image if it was uploaded
      setFormData({
        username: response.data.fullName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        profilePhoto: null,
        nidFile: null
      });
      
      // Always preserve user's uploaded image - never delete it
      const savedUserImage = localStorage.getItem(`user_profile_image_${userId}`);
      
      if (savedUserImage) {
        // Always keep the user's uploaded image
        console.log('Keeping user uploaded image after save');
        setPreviewImage(savedUserImage);
        setIsTemporaryImage(false);
      } else if (hasUploadedImage && currentPreviewImage) {
        // Keep the newly uploaded image preview
        console.log('Keeping newly uploaded image preview after save');
        setPreviewImage(currentPreviewImage);
        setIsTemporaryImage(false);
      } else if (response.data.profilePhotoPath) {
        // Use server response only if no user image exists
        const serverImagePath = response.data.profilePhotoPath;
        let imageUrl = serverImagePath;
        if (!serverImagePath.startsWith('http') && !serverImagePath.startsWith('data:')) {
          imageUrl = `${API_BASE_URL}${serverImagePath.startsWith('/') ? '' : '/'}${serverImagePath}`;
        }
        setPreviewImage(imageUrl);
        console.log('Using server image after save:', imageUrl);
        setIsTemporaryImage(false);
      } else {
        setPreviewImage(null);
        console.log('No image available after save');
        setIsTemporaryImage(false);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    
    // Reset form data but keep the user's uploaded image
    setFormData({
      username: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      profilePhoto: null,
      nidFile: null
    });
    
    // Always preserve user's uploaded image
    const savedUserImage = localStorage.getItem(`user_profile_image_${userId}`);
    if (savedUserImage) {
      setPreviewImage(savedUserImage);
    } else {
      setPreviewImage(profile.profilePhotoPath || null);
    }
    
    setError('');
  };

  const handleRemoveImage = () => {
    // Only remove image if user explicitly wants to
    if (window.confirm('هل تريد حذف الصورة الشخصية؟')) {
      localStorage.removeItem(`user_profile_image_${userId}`);
      setPreviewImage(null);
      setFormData(prev => ({
        ...prev,
        profilePhoto: null
      }));
      console.log('User removed profile image');
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="private-profile-container">
      <div className="private-profile-wrapper">
        
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="private-profile-avatar-wrapper">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Profile" 
                  className="private-profile-avatar"
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src);
                    // Try to use temporary image if available
                    const tempImage = localStorage.getItem(`temp_profile_image_${userId}`);
                    if (tempImage && e.target.src !== tempImage) {
                      console.log('Trying temporary image as fallback');
                      e.target.src = tempImage;
                      setIsTemporaryImage(true);
                    } else {
                      // Hide the broken image and show default avatar
                      console.log('Hiding broken image, showing default avatar');
                      e.target.style.display = 'none';
                      setPreviewImage(null);
                      setIsTemporaryImage(false);
                    }
                  }}
                  onLoad={(e) => {
                    console.log('Image loaded successfully:', e.target.src);
                    e.target.style.display = 'block';
                  }}
                />
              ) : (
                <div className="default-avatar">
                  <span className="avatar-initials">
                    {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              {isTemporaryImage && (
                <div className="temp-image-indicator" title="Image pending server sync">
                  <span>⏳</span>
                </div>
              )}
              {isEditing && (
                <>
                  <label className="profile-avatar-upload">
                    <FaCamera />
                    <input 
                      type="file" 
                      name="profilePhoto"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleFileChange}
                      hidden
                    />
                  </label>
                  {previewImage && (
                    <button 
                      type="button"
                      className="remove-image-btn"
                      onClick={handleRemoveImage}
                      title="حذف الصورة"
                    >
                      <FaTimes />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="profile-header-info">
            <h1 className="private-profile-name">{profile?.fullName}</h1>
            <p className="profile-role">
              Premium Investor • Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
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

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info" style={{ 
            background: 'var(--bg-secondary)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1rem',
            fontSize: '0.875rem',
            fontFamily: 'monospace'
          }}>
            <strong>Debug Info:</strong><br/>
            User ID: {userId}<br/>
            API Base URL: {API_BASE_URL}<br/>
            Profile Photo Path: {profile?.profilePhotoPath || 'null'}<br/>
            Preview Image: {previewImage ? 'Set' : 'null'}<br/>
            Is Temporary: {isTemporaryImage ? 'Yes' : 'No'}<br/>
            Temp Image in Storage: {localStorage.getItem(`temp_profile_image_${userId}`) ? 'Yes' : 'No'}<br/>
            <button 
              onClick={() => {
                console.log('=== MANUAL API TEST ===');
                fetchProfile();
              }}
              style={{ 
                marginTop: '0.5rem', 
                padding: '0.25rem 0.5rem', 
                fontSize: '0.75rem',
                background: 'var(--brand-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Test API Call
            </button>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Personal Information Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-title">
                <FaUser className="card-icon" />
                <h2>Personal Information</h2>
              </div>
              {!isEditing && (
                <button 
                  type="button" 
                  className="btn-edit"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>

            <div className="profile-card-body">
              <div className="form-grid">
                
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label">
                    <FaUser className="input-icon" />
                    Full Name
                  </label>
                  <input 
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">
                    <FaEnvelope className="input-icon" />
                    Email Address
                    <span className="badge-verified">VERIFIED</span>
                  </label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={!isEditing}
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label className="form-label">
                    <FaPhone className="input-icon" />
                    Phone Number
                  </label>
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={!isEditing}
                    placeholder="+1 (555) 000-1234"
                  />
                </div>

                {/* Address */}
                <div className="form-group">
                  <label className="form-label">
                    <FaMapMarkerAlt className="input-icon" />
                    Physical Address
                  </label>
                  <input 
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={!isEditing}
                    placeholder="742 Evergreen Terrace, Springfield"
                  />
                </div>

              </div>

              {/* NID Upload (only when editing) */}
              {isEditing && (
                <div className="form-group mt-3">
                  <label className="form-label">
                    <FaIdCard className="input-icon" />
                    National ID Document
                  </label>
                  <div className="file-upload-wrapper">
                    <input 
                      type="file"
                      name="nidFile"
                      onChange={handleFileChange}
                      className="file-input"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {formData.nidFile && (
                      <span className="file-name">{formData.nidFile.name}</span>
                    )}
                  </div>
                  {profile?.nidPath && (
                    <p className="file-info">
                      Current file: <a href={profile.nidPath} target="_blank" rel="noopener noreferrer">View Document</a>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="profile-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={handleCancel}
                disabled={saving}
              >
                <FaTimes /> Cancel
              </button>
              <button 
                type="submit" 
                className="btn-save"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="btn-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Deactivate Account */}
        {!isEditing && (
          <div className="profile-danger-zone">
            <button className="btn-deactivate">
              <FaTimes /> Deactivate Account
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;