import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile, updatePassword, tokenizeCard, getUserCards, deleteCard, setDefaultCard } from '../services/api';
import API_BASE_URL from '../services/ApiConfig';
import '../styles/profile.css';
import { 
  FaCreditCard,
  FaTrash,
  FaCheckCircle,
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCamera, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaIdCard,
  FaCheck,
  FaLock,
  FaEye,
  FaEyeSlash
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

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Credit Card state
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardData, setCardData] = useState({
    CardNumber: '',
    CardHolderName: '',
    ExpiryMonth: '',
    ExpiryYear: '',
    CVV: ''
  });
  const [cardError, setCardError] = useState('');
  const [cardSuccess, setCardSuccess] = useState('');
  const [savingCard, setSavingCard] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);

  const [previewImage, setPreviewImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [isTemporaryImage, setIsTemporaryImage] = useState(false);

  // Get userId from localStorage
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchUserCards();
    } else {
      setError('User not logged in');
      setLoading(false);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [userId, navigate]);

  const fetchUserCards = async () => {
    setLoadingCards(true);
    try {
      const response = await getUserCards(userId);
      setSavedCards(response.data);
    } catch (err) {
      console.error("Failed to fetch cards:", err);
      // Don't set main error, just log it as it's a secondary feature
    } finally {
      setLoadingCards(false);
    }
  };

  const handleDeleteCard = async (card) => {
    // Try to find the ID from various common property names
    const cardId = card.id || card.Id || card.paymentCardId || card.PaymentCardId || card.cardId || card.CardId;
    
    if (!cardId) {
      console.error("Could not determine card ID from object:", card);
      setCardError("Error: Could not determine card ID.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete this card ending in ${card.maskedCardNumber ? String(card.maskedCardNumber).slice(-4) : '****'}?`)) {
      // Optimistic update: Remove card from UI immediately
      const previousCards = [...savedCards];
      setSavedCards(cards => cards.filter(c => 
        (c.id || c.Id || c.paymentCardId || c.PaymentCardId || c.cardId || c.CardId) !== cardId
      ));

      try {
        await deleteCard(userId, cardId);
        setCardSuccess('Card deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setCardSuccess('');
        }, 3000);
      } catch (err) {
        console.error("Failed to delete card:", err);
        // Revert optimistic update on error
        setSavedCards(previousCards);

        // Log detailed error for debugging
        if (err.response) {
             console.error("Error response:", err.response.status, err.response.data);
             if (err.response.status === 404) {
                  setCardError('Card not found or already deleted.');
             } else {
                  setCardError(`Failed to delete card: ${err.response.data?.message || 'Server error'}`);
             }
        } else {
             setCardError('Failed to delete card. Please check your connection.');
        }
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          setCardError('');
        }, 3000);
      }
    }
  };

  const handleSetDefaultCard = async (card) => {
    const cardId = card.id || card.Id || card.paymentCardId || card.PaymentCardId || card.cardId || card.CardId;
    
    if (!cardId) return;
    
    // Don't do anything if it's already default
    if (card.isDefault || card.IsDefault) return;

    try {
      // Optimistic UI update
      const updatedCards = savedCards.map(c => ({
        ...c,
        isDefault: (c.id || c.Id || c.paymentCardId || c.PaymentCardId || c.cardId || c.CardId) === cardId
      }));
      setSavedCards(updatedCards);

      await setDefaultCard(userId, cardId);
      setCardSuccess('Default card updated successfully');
      setTimeout(() => setCardSuccess(''), 3000);
    } catch (err) {
      console.error("Failed to set default card:", err);
      setCardError("Failed to set default card.");
      fetchUserCards(); // Revert to server state
      setTimeout(() => setCardError(''), 3000);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
   
      const response = await getMyProfile(userId);

      
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
      
     
      
      if (savedUserImage) {
        // Always use the user's uploaded image if it exists (never delete it)
       
        setPreviewImage(savedUserImage);
        setIsTemporaryImage(false);
      } else if (serverImagePath) {
        // Use server image only if no user image is saved
        let imageUrl = serverImagePath;
        
        if (!serverImagePath.startsWith('http') && !serverImagePath.startsWith('data:')) {
          imageUrl = `${API_BASE_URL}${serverImagePath.startsWith('/') ? '' : '/'}${serverImagePath}`;
        }
        
       
        setPreviewImage(imageUrl);
        setIsTemporaryImage(false);
      } else {
     
        setPreviewImage(null);
        setIsTemporaryImage(false);
      }
    } catch (err) {
      setError('Failed to load profile');
     
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setPasswordError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      setSavingPassword(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      setSavingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      setSavingPassword(false);
      return;
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from old password');
      setSavingPassword(false);
      return;
    }

    try {
      await updatePassword(userId, passwordData);
      setPasswordSuccess('Password updated successfully!');
      
      // Reset password form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Close password change section after 2 seconds
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      // Display server error message or fallback message
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.response?.data || 
                          'Failed to update password';
      setPasswordError(errorMessage);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
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
   
          
          setPreviewImage(imageDataUrl);
          
          // Save the image permanently in localStorage (won't be deleted automatically)
          const userImageKey = `user_profile_image_${userId}`;
          localStorage.setItem(userImageKey, imageDataUrl);

          
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

     

      await updateMyProfile(userId, updateData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh profile data
      const response = await getMyProfile(userId);
  
      
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
       
        setPreviewImage(savedUserImage);
        setIsTemporaryImage(false);
      } else if (hasUploadedImage && currentPreviewImage) {
        // Keep the newly uploaded image preview
       
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
        
        setIsTemporaryImage(false);
      } else {
        setPreviewImage(null);
        
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
      
    }
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setCardError('');
    setCardSuccess('');
    setSavingCard(true);

    try {
      await tokenizeCard(userId, {
        ...cardData,
        ExpiryMonth: parseInt(cardData.ExpiryMonth),
        ExpiryYear: parseInt(cardData.ExpiryYear)
      });
      setCardSuccess('Credit card added successfully');
      setCardData({
        CardNumber: '',
        CardHolderName: '',
        ExpiryMonth: '',
        ExpiryYear: '',
        CVV: ''
      });
      setIsAddingCard(false);
      // Clear success message after 3 seconds
      setTimeout(() => setCardSuccess(''), 3000);
      
      // Refresh cards list
      fetchUserCards();
    } catch (err) {
      console.error(err);
      setCardError(err.response?.data?.error || 'Failed to add credit card');
    } finally {
      setSavingCard(false);
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
                    
                    // Try to use temporary image if available
                    const tempImage = localStorage.getItem(`temp_profile_image_${userId}`);
                    if (tempImage && e.target.src !== tempImage) {
                     
                      e.target.src = tempImage;
                      setIsTemporaryImage(true);
                    } else {
                      // Hide the broken image and show default avatar
                      
                      e.target.style.display = 'none';
                      setPreviewImage(null);
                      setIsTemporaryImage(false);
                    }
                  }}
                  onLoad={(e) => {
                   
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
                      title="Remove Profile Image"
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
                    placeholder="Ex: +20 68 XXX XXXX"
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
                    placeholder="Ex: 6 October , Giza"
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

        {/* Credit Card Section */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-title">
              <FaCreditCard className="card-icon" />
              <h2>Credit Cards</h2>
            </div>
            {!isAddingCard && (
              <button 
                type="button" 
                className="btn-edit"
                onClick={() => setIsAddingCard(true)}
              >
                <FaEdit /> Add New Card
              </button>
            )}
          </div>

          {isAddingCard ? (
            <div className="profile-card-body">
              {cardError && (
                <div className="alert alert-error">
                  <FaTimes /> {cardError}
                </div>
              )}
              {cardSuccess && (
                <div className="alert alert-success">
                  <FaCheck /> {cardSuccess}
                </div>
              )}
              <form onSubmit={handleCardSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input 
                      type="text"
                      name="CardNumber"
                      value={cardData.CardNumber}
                      onChange={handleCardChange}
                      className="form-control"
                      placeholder="XXXX XXXX XXXX XXXX"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Card Holder Name</label>
                    <input 
                      type="text"
                      name="CardHolderName"
                      value={cardData.CardHolderName}
                      onChange={handleCardChange}
                      className="form-control"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label className="form-label">Expiry Month</label>
                      <input 
                        type="number"
                        name="ExpiryMonth"
                        value={cardData.ExpiryMonth}
                        onChange={handleCardChange}
                        className="form-control"
                        placeholder="MM"
                        min="1"
                        max="12"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expiry Year</label>
                      <input 
                        type="number"
                        name="ExpiryYear"
                        value={cardData.ExpiryYear}
                        onChange={handleCardChange}
                        className="form-control"
                        placeholder="YYYY"
                        min={new Date().getFullYear()}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input 
                        type="text"
                        name="CVV"
                        value={cardData.CVV}
                        onChange={handleCardChange}
                        className="form-control"
                        placeholder="XXX"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="profile-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setIsAddingCard(false)}
                    disabled={savingCard}
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-save"
                    disabled={savingCard}
                  >
                    {savingCard ? 'Saving...' : <><FaSave /> Save Card</>}
                  </button>
                </div>
              </form>
            </div>
          ) : (
             <div className="profile-card-body">
               {cardSuccess && (
                 <div className="alert alert-success">
                   <FaCheck /> {cardSuccess}
                 </div>
               )}
               
               {/* Display Saved Cards */}
               <div className="saved-cards-list">
                 {loadingCards ? (
                   <div className="cards-loading">Loading cards...</div>
                 ) : savedCards.length > 0 ? (
                   <div className="cards-grid">
                     {savedCards.map((card, index) => {
                      const isDefault = card.isDefault || card.IsDefault;
                      return (
                        <div 
                          key={index} 
                          className={`saved-card-item ${isDefault ? 'default-card' : ''}`}
                          onClick={() => handleSetDefaultCard(card)}
                          style={{ cursor: 'pointer' }}
                        >
                          {isDefault && (
                            <div className="default-badge">
                              <FaCheckCircle /> Default
                            </div>
                          )}
                          <button 
                            className="delete-card-btn" 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCard(card);
                            }}
                            title="Delete Card"
                          >
                            <FaTrash />
                          </button>
                          <div className="card-icon-display">
                            <FaCreditCard />
                          </div>
                          <div className="card-details">
                           <div className="card-number">•••• •••• •••• { card.maskedCardNumber.slice(-4) }</div>
                           <div className="card-expiry">Expires: {card.expiryMonth || card.ExpiryMonth}/{card.expiryYear || card.ExpiryYear}</div>
                            
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                   <p className="no-cards-message">No saved cards found.</p>
                 )}
               </div>

               <p className="security-info">
                 <FaLock className="info-icon" />
                 Manage your payment methods securely.
               </p>
            </div>
          )}
        </div>

        {/* Security Settings Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-title">
              <FaLock className="card-icon" />
              <h2>Security Settings</h2>
            </div>
            {!isChangingPassword && (
              <button 
                type="button" 
                className="btn-edit"
                onClick={() => setIsChangingPassword(true)}
              >
                <FaEdit /> Change Password
              </button>
            )}
          </div>

          {isChangingPassword && (
            <div className="profile-card-body">
              
              {/* Password Alert Messages */}
              {passwordError && (
                <div className="alert alert-error">
                  <FaTimes /> {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="alert alert-success">
                  <FaCheck /> {passwordSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="form-grid">
                  
                  {/* Old Password */}
                  <div className="form-group">
                    <label className="form-label">
                      <FaLock className="input-icon" />
                      Current Password
                    </label>
                    <div className="password-input-wrapper">
                      <input 
                        type={showPasswords.oldPassword ? "text" : "password"}
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        className="form-control"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('oldPassword')}
                      >
                        {showPasswords.oldPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="form-group">
                    <label className="form-label">
                      <FaLock className="input-icon" />
                      New Password
                    </label>
                    <div className="password-input-wrapper">
                      <input 
                        type={showPasswords.newPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="form-control"
                        placeholder="Enter new password (min 6 characters)"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('newPassword')}
                      >
                        {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
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
                        type={showPasswords.confirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="form-control"
                        placeholder="Re-enter new password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                      >
                        {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Password Change Actions */}
                <div className="profile-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={handleCancelPasswordChange}
                    disabled={savingPassword}
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-save"
                    disabled={savingPassword}
                  >
                    {savingPassword ? (
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
          )}

          {!isChangingPassword && (
            <div className="profile-card-body">
              <p className="security-info">
                <FaLock className="info-icon" />
                Keep your account secure by using a strong password and changing it regularly as recommended.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;