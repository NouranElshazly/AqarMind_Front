import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaTrash,
  FaSearch,
  FaFilter,
  FaCommentDots,
  FaHeart,
  FaEye,
  FaPaperPlane,
  FaCheckCircle,
  FaHistory,
  FaTimes,
  FaBookmark,
  FaMapMarkerAlt,
  FaDollarSign,
  FaExclamationTriangle,
  FaImage,
  FaClock,
  FaArrowLeft,
} from "react-icons/fa";
import {
  getUserHistory,
  deleteHistoryItem,
  clearUserHistory,
} from "../services/pyapi";
import "../styles/UserHistory.css";

// --- دوال المساعدة ---
const getUserInfo = () => {
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const role = localStorage.getItem("role");
  if (!userId) return null;
  return { userId, userName: userName || "User", role: role || "user" };
};

// --- مودال تأكيد الحذف (تصميم محسّن) ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div
        className="history-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="history-modal-body">
          <div className="history-modal-icon">
            <FaExclamationTriangle />
          </div>
          <h3 className="history-modal-title">
            {title || "Delete Confirmation"}
          </h3>
          <p className="history-modal-text">
            {message || "Are you sure? This action cannot be undone."}
          </p>
        </div>
        <div className="history-modal-footer">
          <button onClick={onClose} className="modal-btn modal-btn-cancel">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="modal-btn modal-btn-delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- المكون الرئيسي ---
const UserHistory = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userInfo = getUserInfo();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // جلب الهيستوري
  const fetchHistory = useCallback(async () => {
    if (!userInfo?.userId) {
      setError("Please log in to view your history.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getUserHistory(userInfo.userId);
      setHistoryItems(response.data || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Could not load your history. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [userInfo?.userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // فلترة وبحث
  const filteredAndSearchedItems = useMemo(() => {
    return historyItems.filter((item) => {
      const typeMatch =
        filterType === "all" || item.activity_type === filterType;
      let searchMatch = true;
      if (searchTerm.trim()) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        searchMatch =
          item.details?.post_title?.toLowerCase().includes(lowerSearchTerm) ||
          item.details?.query?.toLowerCase().includes(lowerSearchTerm) ||
          item.details?.comment_preview
            ?.toLowerCase()
            .includes(lowerSearchTerm) ||
          item.details?.post_location?.toLowerCase().includes(lowerSearchTerm);
      }
      return typeMatch && searchMatch;
    });
  }, [historyItems, filterType, searchTerm]);

  // دوال الحذف
  const performActualDelete = async (itemId) => {
    if (!userInfo?.userId || !itemId) return;
    const originalItems = [...historyItems];
    setHistoryItems((prev) => prev.filter((item) => item._id !== itemId));
    try {
      await deleteHistoryItem(userInfo.userId, itemId);
    } catch (err) {
      console.error("Failed to delete history item:", err);
      setHistoryItems(originalItems);
    }
  };

  const performActualDeleteAll = async () => {
    if (!userInfo?.userId || historyItems.length === 0) return;
    const originalItems = [...historyItems];
    setHistoryItems([]);
    try {
      await clearUserHistory(userInfo.userId);
    } catch (err) {
      console.error("Failed to delete all history:", err);
      setHistoryItems(originalItems);
    }
  };

  const handleDeleteItem = (itemId) => {
    setModalConfig({
      title: "Delete Activity",
      message:
        "Are you sure you want to delete this activity? This cannot be undone.",
      onConfirm: () => performActualDelete(itemId),
    });
    setIsModalOpen(true);
  };

  const handleDeleteAll = () => {
    if (historyItems.length === 0) return;
    setModalConfig({
      title: "Clear History",
      message: "Are you sure you want to clear your entire activity history?",
      onConfirm: performActualDeleteAll,
    });
    setIsModalOpen(true);
  };

  // عرض عنصر الهيستوري
  const renderHistoryItem = (item, index) => {
    let icon = <FaHistory />;
    let textPrefix = `Activity:`;
    let link = null;
    let themeColor = "var(--brand-secondary)";

    const postTitle = item.details?.post_title || "N/A";
    const postId = item.details?.post_id;
    const postPrice = item.details?.post_price;
    const postLocation = item.details?.post_location;
    const commentPreview = item.details?.comment_preview;
    const commentHasImage = item.details?.has_image;

    if (postId) link = `/properties/${postId}`;

    switch (item.activity_type) {
      case "save":
        icon = <FaBookmark />;
        textPrefix = "Saved";
        themeColor = "#3b82f6";
        break;
      case "comment":
        icon = <FaCommentDots />;
        textPrefix = "Commented";
        themeColor = "#8b5cf6";
        break;
      case "like":
        icon = <FaHeart />;
        textPrefix = "Liked";
        themeColor = "#ef4444";
        break;
      case "search":
        icon = <FaSearch />;
        textPrefix = "Searched";
        themeColor = "var(--brand-primary)";
        link = null;
        break;
      case "view":
        icon = <FaEye />;
        textPrefix = "Viewed";
        themeColor = "var(--brand-secondary)";
        break;
      case "apply":
        icon = <FaPaperPlane />;
        textPrefix = "Applied";
        themeColor = "#10b981";
        break;
      case "accepted":
        icon = <FaCheckCircle />;
        textPrefix = "Accepted";
        themeColor = "#059669";
        break;
      default:
        textPrefix = item.activity_type;
    }

    return (
      <div
        key={item._id}
        className="history-card-item animate-fadeInUp"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="history-card-content">
          <div className="history-item-left">
            {/* Icon */}
            <div
              className="history-item-icon-wrapper"
              style={{ "--item-color": themeColor }}
            >
              {icon}
            </div>

            {/* Details */}
            <div className="history-item-details">
              <div className="history-item-type" style={{ color: themeColor }}>
                {textPrefix}
              </div>

              <div className="history-item-main">
                {item.activity_type !== "search" ? (
                  <div className="history-item-post">
                    {link ? (
                      <Link to={link} className="history-post-link">
                        {postTitle}
                      </Link>
                    ) : (
                      <span className="history-post-title">{postTitle}</span>
                    )}
                    <div className="history-post-meta">
                      {postLocation && (
                        <span className="history-meta-badge">
                          <FaMapMarkerAlt /> {postLocation}
                        </span>
                      )}
                      {postPrice != null && (
                        <span className="history-meta-badge price">
                          <FaDollarSign /> {Number(postPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <h3 className="history-search-query">
                    "{item.details?.query || "N/A"}"
                  </h3>
                )}
              </div>

              {item.activity_type === "comment" && (
                <div className="history-comment-preview">
                  <span className="comment-label">Comment: </span>
                  <span className="comment-text">
                    {commentPreview ? `"${commentPreview}"` : "(Empty comment)"}
                    {commentHasImage && (
                      <FaImage className="inline-image-icon" />
                    )}
                  </span>
                </div>
              )}

              <div className="history-item-time">
                <FaClock />
                {new Date(item.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleDeleteItem(item._id)}
            className="history-delete-btn"
            title="Delete activity"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    );
  };

  if (!userInfo && !loading) {
    return (
      <div className="history-auth-required">
        <div className="auth-card">
          <div className="auth-icon-wrapper">
            <FaExclamationTriangle />
          </div>
          <h1>Login Required</h1>
          <p>Please log in to view your activity history.</p>
          <button onClick={() => navigate("/login")} className="auth-login-btn">
            Login Now
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (userInfo?.role === "Admin") navigate("/admin/dashboard");
    else if (userInfo?.role === "Landlord") navigate("/landlord/dashboard");
    else navigate("/tenant/dashboard");
  };

  return (
    <div className="user-history-container">
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
      />

      <div className="history-wrapper">
        <div className="history-header-section">
          <div className="header-navigation">
            <button onClick={handleBack} className="header-back-btn">
              <FaArrowLeft /> Back to Dashboard
            </button>
          </div>
          <div className="header-top">
            <div className="header-title-group">
              <div className="header-icon-main">
                <FaHistory />
              </div>
              <div>
                <h1 className="header-title">My Activity</h1>
                <p className="header-subtitle">
                  Manage and track your property journey
                </p>
              </div>
            </div>
            <button
              onClick={handleDeleteAll}
              disabled={historyItems.length === 0 || loading}
              className="header-clear-btn"
            >
              <FaTrash /> Clear All
            </button>
          </div>

          <div className="header-controls">
            <div className="search-box">
              <FaSearch className="search-icon-svg" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-box">
              <FaFilter className="filter-icon-svg" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Activities</option>
                <option value="view">Views</option>
                <option value="like">Likes</option>
                <option value="save">Saves</option>
                <option value="comment">Comments</option>
                <option value="apply">Applications</option>
                <option value="search">Searches</option>
              </select>
            </div>
          </div>

          <div className="header-stats">
            Showing <strong>{filteredAndSearchedItems.length}</strong> of{" "}
            {historyItems.length} activities
          </div>
        </div>

        <div className="history-list-section">
          {loading ? (
            <div className="history-loading">
              <div className="loading-spinner"></div>
              <p>Loading your history...</p>
            </div>
          ) : filteredAndSearchedItems.length === 0 ? (
            <div className="history-empty">
              <div className="empty-icon-wrapper">
                <FaHistory />
              </div>
              <h3>No activities found</h3>
              <p>
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Your history is currently empty"}
              </p>
            </div>
          ) : (
            <div className="history-items-grid">
              {filteredAndSearchedItems.map((item, index) =>
                renderHistoryItem(item, index),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHistory;
