import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_BASE_URL from "../services/ApiConfig";
import { toast } from "react-toastify";
import {
  Eye,
  DollarSign,
  User,
  Calendar,
  Tag,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Megaphone,
} from "lucide-react";
import "../styles/ManageAds.css";

const getStatusLabel = (status) => {
  switch (status) {
    case 0:
      return "Available";
    case 1:
      return "Under Negotiation";
    case -1:
      return "Sold";
    default:
      return "Unknown";
  }
};

const getPendingStatusLabel = (status) => {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Accepted";
    case 2:
      return "Refused";
    default:
      return "Unknown";
  }
};

const ManageAds = () => {
  const [ads, setAds] = useState([]);
  const [createdAds, setCreatedAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createdAdsLoading, setCreatedAdsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    priority: 0,
    maxImpressionsPerUserPerDay: 0,
    startAt: "",
    endAt: "",
  });

  const handleCreateAd = (post) => {
    setSelectedPost(post);
    
    // Use local time for datetime-local inputs
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localStart = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    const localEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 - tzOffset).toISOString().slice(0, 16);

    setFormData({
      title: post.title || "",
      body: "",
      priority: 0,
      maxImpressionsPerUserPerDay: 5,
      startAt: localStart,
      endAt: localEnd,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateAdSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPost) return;

    setSubmitLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        postId: selectedPost.postId,
        title: formData.title,
        body: formData.body,
        priority: parseInt(formData.priority),
        maxImpressionsPerUserPerDay: parseInt(
          formData.maxImpressionsPerUserPerDay,
        ),
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
      };

      await axios.post(`${API_BASE_URL}/api/admin/ads`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Ad created successfully!");
      closeModal();
      fetchCreatedAds();
    } catch (err) {
      toast.error("Failed to create ad. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    fetchCreatedAds();
  }, []);

  const fetchCreatedAds = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/ads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCreatedAds(response.data);
    } catch (err) {
      console.error("Error fetching created ads:", err);
    } finally {
      setCreatedAdsLoading(false);
    }
  };

  const handleToggleAdStatus = async (adId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = !currentStatus;
      await axios.put(`${API_BASE_URL}/api/admin/ads/${adId}/toggle?isActive=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Ad ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      
      // Update local state
      setCreatedAds(prevAds => 
        prevAds.map(ad => 
          ad.adId === adId ? { ...ad, isActive: newStatus } : ad
        )
      );
    } catch (err) {
      console.error("Error toggling ad status:", err);
      toast.error("Failed to update ad status.");
    }
  };

  const fetchAds = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/ads/eligible-posts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const mappedAds = response.data.map((post) => ({
        ...post,
      }));
      setAds(mappedAds);
    } catch (err) {
      console.error("Error fetching eligible posts:", err);
      setError("Failed to load eligible posts.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Complete loading condition
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading eligible posts...</p>
      </div>
    );
  }

  // ✅ FIXED: Complete error condition
  if (error) {
    return (
      <div className="manage-ads-wrapper">
        <div className="manage-ads-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-ads-wrapper">
      <div className="manage-ads-container">
        <div className="manage-ads-header">
          <div>
            <h1 className="manage-ads-title">Eligible Posts for Ads</h1>
            <p className="manage-ads-subtitle">
              View and Create Ads for eligible property posts across the
              platform
            </p>
          </div>
        </div>

        {ads.length === 0 ? (
          <div className="no-ads">No eligible posts found.</div>
        ) : (
          <div className="ads-grid">
            {ads.map((ad) => (
              <div key={ad.postId} className="ad-card">
                <div className="ad-content">
                  <h3 className="ad-title">{ad.title}</h3>
                  <div className="ad-info">
                    <div className="ad-price">
                      <DollarSign size={16} /> {ad.price.toLocaleString()}
                    </div>
                    <div className="ad-detail-row">
                      <User size={16} /> <span>{ad.landlordName}</span>
                    </div>
                    <div className="ad-detail-row">
                      <Calendar size={16} />
                      <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="ad-detail-row">
                      <Tag size={16} />
                      <span>{ad.isAuction ? "Auction" : "Not Auction"}</span>
                      <span className="separator">•</span>
                      <span>{ad.type === 1 ? "Sale" : "Rent"}</span>
                    </div>
                    <div className="ad-detail-row">
                      <Info size={16} />
                      <span className={`status-text status-${ad.status}`}>
                        {getStatusLabel(ad.status)}
                      </span>
                      <span className="separator">•</span>
                      <span
                        className={`pending-status-text pending-${ad.pendingStatus}`}
                      >
                        Approval: {getPendingStatusLabel(ad.pendingStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="ad-actions">
                    <Link to={`/property/${ad.postId}`} className="btn-view">
                      <Eye size={16} /> View Details
                    </Link>
                    <button
                      className="btn-create"
                      onClick={() => handleCreateAd(ad)}
                    >
                      <Megaphone size={16} /> Create Ad
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="section-divider"></div>

        <div className="manage-ads-header">
          <div>
            <h1 className="manage-ads-title">Manage Ads</h1>
            <p className="manage-ads-subtitle">
              Manage and monitor currently running ads
            </p>
          </div>
        </div>

        {createdAdsLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading created ads...</p>
          </div>
        ) : createdAds.length === 0 ? (
          <div className="no-ads">No active advertisements found.</div>
        ) : (
          <div className="ads-grid">
            {createdAds.map((ad) => (
              <div key={ad.adId} className="ad-card">
                <div className="ad-id-badge">Ad #{ad.adId}</div>
                <div className="ad-content">
                  <h3 className="ad-title">{ad.title}</h3>
                  <p className="ad-body">{ad.body}</p>
                  <div className="ad-info">
                    <div className="ad-detail-row">
                      <Calendar size={16} />
                      <span>
                        Created: {new Date(ad.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="ad-detail-row">
                      <Clock size={16} />
                      <span>
                        Start:{" "}
                        {new Date(ad.startAt).toLocaleString([], {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="ad-detail-row">
                      <Clock size={16} />
                      <span>
                        End:{" "}
                        {new Date(ad.endAt).toLocaleString([], {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="ad-detail-row">
                      <CheckCircle size={16} />
                      <span>Priority: {ad.priority}</span>
                    </div>
                    <div className="ad-detail-row">
                      <Eye size={16} />
                      <span>
                        Max Impressions: {ad.maxImpressionsPerUserPerDay}
                      </span>
                    </div>
                    <div className="ad-detail-row" style={{ justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Info size={16} />
                        <span className={`status-text ${ad.isActive ? "status-active" : "status-inactive"}`}>
                          {ad.isActive ? "Active" : "InActive"}
                        </span>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={ad.isActive} 
                          onChange={() => handleToggleAdStatus(ad.adId, ad.isActive)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Ad Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Create Advertisement</h2>
                <button className="close-btn" onClick={closeModal}>
                  <XCircle size={24} />
                </button>
              </div>
              <form id="create-ad-form" onSubmit={handleCreateAdSubmit} className="ad-form">
                <div className="form-group">
                  <label>Post Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ad Content (Body)</label>
                  <textarea
                    name="body"
                    value={formData.body}
                    onChange={handleInputChange}
                    rows="4"
                    required
                    placeholder="Enter ad details..."
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <input
                      type="number"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Impressions / User / Day</label>
                    <input
                      type="number"
                      name="maxImpressionsPerUserPerDay"
                      value={formData.maxImpressionsPerUserPerDay}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date & Time</label>
                    <input
                      type="datetime-local"
                      name="startAt"
                      value={formData.startAt}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date & Time</label>
                    <input
                      type="datetime-local"
                      name="endAt"
                      value={formData.endAt}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </form>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="create-ad-form"
                  className="btn-submit"
                  disabled={submitLoading}
                >
                  {submitLoading ? "Creating..." : "Create Ad"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAds;
