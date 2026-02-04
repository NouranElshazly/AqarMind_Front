import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API_BASE_URL from "../services/ApiConfig";
import API from "../services/api";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  FileText,
  Calendar,
  Building,
  User,
  Mail,
  Gavel,
} from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/AdminPendingApprovals.css";

const PostDetails = ({ post, onApprove, onReject, actionLoading }) => {
  const [activeImage, setActiveImage] = useState(null);

  // Normalize images
  const imageList = React.useMemo(() => {
    let imgs = [];
    if (post.images && post.images.length > 0) {
      imgs = post.images.map(img => (img.startsWith('http') ? img : `${API_BASE_URL}/${img}`));
    } else if (post.postImages && post.postImages.length > 0) {
      imgs = post.postImages.map(img => `${API_BASE_URL}/${img.imagePath}`);
    }
    return imgs;
  }, [post]);

  useEffect(() => {
    if (imageList.length > 0) {
      setActiveImage(imageList[0]);
    } else {
      setActiveImage(null);
    }
  }, [imageList]);

  return (
    <div className="post-details fade-in">
      <div className="details-header">
        <h2>{post.title}</h2>
        <div className="details-actions">
          <button
            onClick={() => onApprove(post.postId)}
            disabled={actionLoading}
            className="btn btn-approve"
          >
            <CheckCircle size={20} />
            {actionLoading ? "Processing..." : "Approve"}
          </button>
          <button
            onClick={() => onReject(post.postId)}
            disabled={actionLoading}
            className="btn btn-reject"
          >
            <XCircle size={20} />
            {actionLoading ? "Processing..." : "Reject"}
          </button>
        </div>
      </div>

      {/* Property Images */}
      {imageList.length > 0 && (
        <div className="details-images">
          <div className="main-image">
            <img
              src={activeImage || imageList[0]}
              alt={post.title}
              onError={(e) => (e.target.src = "/placeholder.jpg")}
            />
          </div>
          {imageList.length > 1 && (
            <div className="thumbnail-images">
              {imageList.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${post.title} ${idx + 1}`}
                  className={activeImage === img ? "active-thumb" : ""}
                  style={{ 
                    border: activeImage === img ? '2px solid var(--brand-primary, #3b82f6)' : '1px solid var(--border-primary)',
                    opacity: activeImage === img ? 1 : 0.7 
                  }}
                  onClick={() => setActiveImage(img)}
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Property Details */}
      <div className="details-section">
        <h3>
          <FileText size={20} />
          Description
        </h3>
        <p>{post.description}</p>
      </div>

      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Price</span>
          <span className="detail-value price-value">
            <DollarSign size={18} />${post.price?.toLocaleString()}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Property Type</span>
          <span className="detail-value">
            {post.type === 0 ? "For Rent" : "For Sale"}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Bedrooms</span>
          <span className="detail-value">
            <Bed size={18} />
            {post.numberOfRooms}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Bathrooms</span>
          <span className="detail-value">
            <Bath size={18} />
            {post.numberOfBathrooms}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Area</span>
          <span className="detail-value">
            <Square size={18} />
            {post.area} m²
          </span>
        </div>

        {post.floorNumber && (
          <div className="detail-item">
            <span className="detail-label">Floor Number</span>
            <span className="detail-value">
              <Building size={18} />
              {post.floorNumber}
            </span>
          </div>
        )}

        {post.totalUnitsInBuilding && (
          <div className="detail-item">
            <span className="detail-label">Total Units in the Building</span>
            <span className="detail-value">
              <Building size={18} />
              {post.totalUnitsInBuilding}
            </span>
          </div>
        )}

        <div className="detail-item">
          <span className="detail-label">Furnished</span>
          <span className="detail-value">
            {post.isFurnished ? "✓ Yes" : "✗ No"}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Has Garage</span>
          <span className="detail-value">
            {post.hasGarage ? "✓ Yes" : "✗ No"}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Auction</span>
          <span className="detail-value">
            {post.isAuction ? (
              <span className="status-yes">
                <Gavel size={16} /> Yes
              </span>
            ) : (
              "✗ No"
            )}
          </span>
        </div>
      </div>

      {/* Location */}
      <div className="details-section">
        <h3>
          <MapPin size={20} />
          Location
        </h3>
        <p className="location-text">
          <MapPin size={16} />
          {post.location}
        </p>
        {post.locationPath && (
          <a
            href={post.locationPath}
            target="_blank"
            rel="noopener noreferrer"
            className="location-link"
          >
            View on Google Maps
          </a>
        )}
      </div>

      {/* Rental Dates */}
      {post.type === 0 && (post.startRentalDate || post.endRentalDate) && (
        <div className="details-section">
          <h3>
            <Calendar size={20} />
            Rental Period
          </h3>
          <div className="date-range">
            {post.startRentalDate && (
              <div className="date-item">
                <span className="date-label">Start Date:</span>
                <span>
                  {new Date(post.startRentalDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {post.endRentalDate && (
              <div className="date-item">
                <span className="date-label">End Date:</span>
                <span>{new Date(post.endRentalDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      
      {/* Landlord Info */}
      <div className="details-section landlord-section">
        <h3>
          <User size={20} />
          Landlord Information
        </h3>
        <div className="landlord-info">
          <div className="landlord-detail">
            <User size={16} />
            <span>{post.userName || "N/A"}</span>
          </div>
          <div className="landlord-detail">
            <Mail size={16} />
            <span>{post.email || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Document */}
      {post.postDocPath && (
        <div className="details-section">
          <h3>
            <FileText size={20} />
            Property Document
          </h3>
          <a
            href={`${API_BASE_URL}/${post.postDocPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="document-link"
          >
            <FileText size={18} />
            View Document
          </a>
        </div>
      )}
    </div>
  );
};

const AdminPendingApprovals = () => {
  const [loading, setLoading] = useState(true);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "",
    cancelText: "Cancel",
  });

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const closeConfirmationModal = () => {
    setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
  };

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      // استخدام الـ API الموجود
      const response = await API.get(`${API_BASE_URL}/api/admin/waitingPosts`);
      setPendingPosts(response.data || []);
    } catch (error) {
      console.error("Error fetching pending posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const performApprove = async (postId) => {
    try {
      setActionLoading(true);
      // استخدام الـ API الموجود
      await API.put(`${API_BASE_URL}/api/admin/accept-post/${postId}`);

      // Remove from list
      setPendingPosts((prev) => prev.filter((post) => post.postId !== postId));
      setSelectedPost(null);
      toast.success("Property approved successfully!");
    } catch (error) {
      console.error("Error approving post:", error);
      toast.error(error.response?.data?.message || "Failed to approve property");
    } finally {
      setActionLoading(false);
      closeConfirmationModal();
    }
  };

  const handleApprove = (postId) => {
    setConfirmationModal({
      isOpen: true,
      title: "Approve Property",
      message: "Are you sure you want to approve this property?",
      confirmText: "Approve",
      onConfirm: () => performApprove(postId),
    });
  };

  const performReject = async (postId) => {
    try {
      setActionLoading(true);
      // استخدام الـ API الموجود
      await API.put(`${API_BASE_URL}/api/admin/reject-post/${postId}`);

      // Remove from list
      setPendingPosts((prev) => prev.filter((post) => post.postId !== postId));
      setSelectedPost(null);

      toast.success("Property rejected successfully!");
    } catch (error) {
      console.error("Error rejecting post:", error);
      toast.error(error.response?.data?.message || "Failed to reject property");
    } finally {
      setActionLoading(false);
      closeConfirmationModal();
    }
  };

  const handleReject = (postId) => {
    setConfirmationModal({
      isOpen: true,
      title: "Reject Property",
      message: "Are you sure you want to reject this property?",
      confirmText: "Reject",
      onConfirm: () => performReject(postId),
    });
  };

  const PostCard = ({ post }) => (
    <div
      className={`pending-card ${
        selectedPost?.postId === post.postId ? "selected" : ""
      }`}
      onClick={() => setSelectedPost(post)}
    >
      <div className="pending-card-header">
        <div className="pending-info">
          <h3 className="pending-title">{post.title}</h3>
          <p className="pending-location">
            <MapPin size={16} />
            {post.location}
          </p>
        </div>
        <div className="pending-price">
          <DollarSign size={20} />
          <span>${post.price?.toLocaleString()}</span>
        </div>
      </div>

      <div className="pending-meta">
        <span className="pending-date">
          <Calendar size={14} />
          {new Date(post.datePost).toLocaleDateString()}
        </span>
        <span className={`pending-type ${post.type === 0 ? "rent" : "sale"}`}>
          {post.type === 0 ? "For Rent" : "For Sale"}
        </span>
      </div>

      <div className="pending-landlord">
        <User size={14} />
        <span>By: {post.userName}</span>
      </div>
    </div>
  );



  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading pending approvals...</p>
      </div>
    );
  }

  return (
    <div className="admin-pending-container">
      <div className="admin-header">
        <div className="header-content">
          <Clock className="header-icon" size={40} />
          <div>
            <h1 className="header-title">Pending Approvals</h1>
            <p className="header-subtitle">
              Review and approve property listings ({pendingPosts.length}{" "}
              pending)
            </p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="pending-list">
          {pendingPosts.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={60} className="empty-icon" />
              <h3>All Caught Up!</h3>
              <p>No pending properties to review</p>
            </div>
          ) : (
            pendingPosts.map((post) => (
              <PostCard key={post.postId} post={post} />
            ))
          )}
        </div>

        <div className="details-panel">
          {selectedPost ? (
            <PostDetails 
              post={selectedPost} 
              onApprove={handleApprove} 
              onReject={handleReject} 
              actionLoading={actionLoading} 
            />
          ) : (
            <div className="no-selection">
              <Eye size={60} className="no-selection-icon" />
              <h3>Select a Property</h3>
              <p>Click on a property from the list to view details</p>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminPendingApprovals;
