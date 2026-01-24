import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import { 
  FaTrash, FaSearch, FaHome, FaMapMarkerAlt, 
  FaBed, FaBath, FaRulerCombined, FaBookmark,
  FaExclamationTriangle, FaTimes, FaCheck, FaEye
} from "react-icons/fa";
import '../styles/SavedPosts.css';

const getTenantRole = () => {
  return localStorage.getItem("role");
};
const getTenantId = () => {
  return localStorage.getItem("userId");
};

const tenantId = getTenantId();
const tenantRole = getTenantRole();

// مودال تأكيد الحذف
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message, isBulkDelete = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-body">
          <div className="modal-header-flex">
            <div className="modal-icon-wrapper">
              <FaExclamationTriangle className="modal-icon" />
            </div>
            <div className="modal-text-content">
              <h3 className="modal-title">
                {title || "Delete Confirmation"}
              </h3>
              <div className="mt-2">
                <p className="modal-message">
                  {message || "Are you sure you want to delete this property?"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
            <button
              type="button"
              className="modal-btn modal-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="modal-btn modal-btn-delete"
              onClick={onConfirm}
            >
              {isBulkDelete ? "Delete All" : "Delete"}
            </button>
        </div>
      </div>
    </div>
  );
};

const SavedPosts = () => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    propertyId: null, 
    propertyTitle: "" 
  });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/Tenant/My-saved-posts/${tenantId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setSavedProperties(res.data);
      } catch (err) {
        setMessage("");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProperties();
  }, []);

  const removeSavedProperty = async (propertyId, e) => {
    if (e) e.stopPropagation();
    try {
      await axios.delete(
        `${API_BASE_URL}/api/Tenant/${tenantId}/cancel-save/${propertyId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSavedProperties(
        savedProperties.filter((prop) => prop.postId !== propertyId)
      );
      setDeleteModal({ isOpen: false, propertyId: null, propertyTitle: "" });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to remove saved property"
      );
    }
  };

  const removeAllSavedProperties = async () => {
    try {
      // حذف جميع البوستات المحفوظة واحداً تلو الآخر
      const deletePromises = savedProperties.map(property =>
        axios.delete(
          `${API_BASE_URL}/api/Tenant/${tenantId}/cancel-save/${property.postId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        )
      );

      await Promise.all(deletePromises);
      setSavedProperties([]);
      setBulkDeleteModal(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to remove all saved properties"
      );
    }
  };

  const openDeleteModal = (propertyId, propertyTitle, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      propertyId,
      propertyTitle
    });
  };

  const openBulkDeleteModal = () => {
    if (savedProperties.length === 0) return;
    setBulkDeleteModal(true);
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  // فلترة البوستات بناءً على البحث
  const filteredProperties = savedProperties.filter(property =>
    property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p className="loading-text">Loading saved properties...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="saved-posts-container">
        <div className="saved-posts-wrapper">
          <div className="empty-state">
            <div className="empty-state-card">
              <div className="empty-state-icon">
                <FaTimes className="text-5xl" style={{ color: '#ef4444' }} />
              </div>
              <h2 className="empty-state-title">Error Loading Properties</h2>
              <p className="empty-state-description">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="browse-btn"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="saved-posts-container">
      <div className="saved-posts-wrapper">
        {/* Header Section */}
        <div className="saved-posts-header">
          <div className="saved-posts-icon">
            <FaBookmark className="text-3xl" />
          </div>
          <h1 className="saved-posts-title">
            Your Saved Properties
          </h1>
          <p className="saved-posts-subtitle">
            All your favorite properties in one place
          </p>
        </div>

        {/* Search and Actions Bar */}
        {savedProperties.length > 0 && (
          <div className="saved-posts-controls">
            <div className="controls-grid">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search saved properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <button
                onClick={openBulkDeleteModal}
                disabled={savedProperties.length === 0}
                className="clear-all-btn"
              >
                <FaTrash />
                Delete All
              </button>
            </div>
            
            <div className="results-info">
              <div className="results-count">
                Showing <span className="results-count-highlight">{filteredProperties.length}</span> of{' '}
                <span className="results-count-highlight">{savedProperties.length}</span> properties
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="clear-search-btn"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="posts-grid">
            {filteredProperties.map((property, index) => (
              <div
                key={property.postId}
                className="post-card"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handlePropertyClick(property.postId)}
              >
                {/* Image Section */}
                <div className="post-image-container">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={`${API_BASE_URL}/${property.images[0]}`}
                      alt={property.title || "property"}
                      className="post-image"
                    />
                  ) : property.fileBase64 ? (
                    <img
                      src={`data:image/png;base64,${property.fileBase64}`}
                      alt={property.title || "property"}
                      className="post-image"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <FaHome className="text-6xl mx-auto mb-3" />
                        <p className="text-lg font-medium">No image available</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="post-overlay">
                    <div className="post-price">
                      ${property.price?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="post-content">
                  <h3 className="post-title">
                    {property.title}
                  </h3>

                  <p className="post-description">
                    {property.description?.length > 120
                      ? `${property.description.substring(0, 120)}...`
                      : property.description}
                  </p>

                  <div className="post-actions">
                    <button className="action-btn view-btn">
                      <FaEye />
                      View Details
                    </button>
                    <button
                      className="action-btn remove-btn"
                      onClick={(e) => openDeleteModal(property.postId, property.title, e)}
                    >
                      <FaTrash />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : savedProperties.length > 0 ? (
          // No search results
          <div className="empty-state">
            <div className="empty-state-card">
              <div className="empty-state-icon">
                <FaSearch className="text-5xl text-gray-400" />
              </div>
              <h3 className="empty-state-title">No properties found</h3>
              <p className="empty-state-description">
                No saved properties match your search criteria. Try different keywords.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="browse-btn"
              >
                Clear Search
              </button>
            </div>
          </div>
        ) : (
          // No saved properties
          <div className="empty-state">
            <div className="empty-state-card">
              <div className="empty-state-icon">
                <FaBookmark className="text-5xl" />
              </div>
              <h3 className="empty-state-title">No Saved Properties Yet</h3>
              <p className="empty-state-description">
                Start exploring and save your favorite properties to see them here!
                Your saved properties will appear in this collection for easy access.
              </p>
              <button
                onClick={() => navigate("/show-all-post")}
                className="browse-btn"
              >
                <FaSearch />
                Browse Properties
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modals */}
        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, propertyId: null, propertyTitle: "" })}
          onConfirm={() => removeSavedProperty(deleteModal.propertyId)}
          title="Remove Saved Property"
          message={`Are you sure you want to remove "${deleteModal.propertyTitle}" from your saved properties?`}
        />

        <ConfirmDeleteModal
          isOpen={bulkDeleteModal}
          onClose={() => setBulkDeleteModal(false)}
          onConfirm={removeAllSavedProperties}
          title="Remove All Saved Properties"
          message={`Are you sure you want to remove all ${savedProperties.length} saved properties? This action cannot be undone.`}
          isBulkDelete={true}
        />
      </div>
    </div>
  );
};

export default SavedPosts;