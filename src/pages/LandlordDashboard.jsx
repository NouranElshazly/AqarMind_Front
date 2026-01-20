import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import API_BASE_URL from "../services/ApiConfig";
import {
  Home,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import "../styles/LandlordDashboard.css";

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, pending, accepted, rejected
  const [properties, setProperties] = useState({
    all: [],
    pending: [],
    accepted: [],
    rejected: [],
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  // Get userId from localStorage
  const getUserId = () => {
    try {
      const profile = localStorage.getItem("profile");
      if (profile) {
        const parsedProfile = JSON.parse(profile);
        // Try user._id first
        if (parsedProfile.user && parsedProfile.user._id) {
          return parsedProfile.user._id;
        }
        // Try direct userId
        if (parsedProfile.userId) {
          return parsedProfile.userId;
        }
      }
      // Try direct userId in localStorage
      const directUserId = localStorage.getItem("userId");
      if (directUserId) return directUserId;

      return null;
    } catch (e) {
      console.error("Error getting userId:", e);
      return null;
    }
  };

  const userId = getUserId();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);

      // Fetch all posts using the existing API
      const allResponse = await API.get(
        `${API_BASE_URL}/api/Landlord/get-my-posts/${userId}`
      );
      const allPosts = allResponse.data || [];

      // Filter posts by status locally
      const pendingPosts = allPosts.filter((post) => post.pendingStatus === 0);
      const acceptedPosts = allPosts.filter((post) => post.pendingStatus === 1);
      const rejectedPosts = allPosts.filter(
        (post) => post.pendingStatus === -1
      );

      setProperties({
        all: allPosts,
        pending: pendingPosts,
        accepted: acceptedPosts,
        rejected: rejectedPosts,
      });

      setStats({
        total: allPosts.length,
        pending: pendingPosts.length,
        accepted: acceptedPosts.length,
        rejected: rejectedPosts.length,
      });
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await API.delete(`${API_BASE_URL}/api/Landlord/delete-post/${postId}`);
        fetchProperties(); // Refresh list
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("Failed to delete property");
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      0: { label: "Pending", color: "warning", icon: Clock },
      1: { label: "Accepted", color: "success", icon: CheckCircle },
      "-1": { label: "Rejected", color: "error", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig[0];
    const Icon = config.icon;

    return (
      <span className={`status-badge status-${config.color}`}>
        <Icon size={16} />
        {config.label}
      </span>
    );
  };

  const PropertyCard = ({ property }) => {
    // Handle image path properly
    let imageSrc = "/placeholder.jpg";

    if (property.postImages && property.postImages.length > 0) {
      const firstImage = property.postImages[0].imagePath;

      // Check if path already includes full URL or API_BASE_URL
      if (firstImage.startsWith("http")) {
        imageSrc = firstImage;
      } else if (firstImage.startsWith("/")) {
        // Path starts with / - remove duplicate slash
        imageSrc = `${API_BASE_URL}${firstImage}`;
      } else {
        // Path doesn't start with / - add it
        imageSrc = `${API_BASE_URL}/${firstImage}`;
      }
    }

    console.log("🖼️ Property Image:", {
      propertyId: property.postId,
      imagePath: property.postImages?.[0]?.imagePath,
      finalSrc: imageSrc,
    });

    return (
      <div className="property-card fade-in">
        <div className="property-image">
          <img
            src={imageSrc}
            alt={property.title}
            onError={(e) => {
              console.error("❌ Image failed to load:", imageSrc);
              e.target.src =
                "https://via.placeholder.com/400x300?text=No+Image";
            }}
          />
          <div className="property-status-overlay">
            {getStatusBadge(property.pendingStatus)}
          </div>
          <div className="property-type-badge">
            {property.type === 0 ? "For Rent" : "For Sale"}
          </div>
        </div>

        <div className="property-content">
          <h3 className="property-title">{property.title}</h3>
          <p className="property-location">
            <MapPin size={16} />
            {property.location}
          </p>

          <div className="property-features">
            <div className="feature-item">
              <Bed size={18} />
              <span>{property.numberOfRooms} Beds</span>
            </div>
            <div className="feature-item">
              <Bath size={18} />
              <span>{property.numberOfBathrooms} Baths</span>
            </div>
            <div className="feature-item">
              <Square size={18} />
              <span>{property.area} m²</span>
            </div>
          </div>

          <div className="property-footer">
            <div className="property-price">
              <DollarSign size={20} />
              <span>${property.price.toLocaleString()}</span>
            </div>

            <div className="property-actions">
              <button
                onClick={() => navigate(`/property/${property.postId}`)}
                className="btn-icon btn-view"
                title="View Details"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() =>
                  navigate(`/landlord/edit-property/${property.postId}`)
                }
                className="btn-icon btn-edit"
                title="Edit"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDelete(property.postId)}
                className="btn-icon btn-delete"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ tab }) => {
    const messages = {
      all: "You haven't added any properties yet",
      pending: "No properties pending approval",
      accepted: "No accepted properties yet",
      rejected: "No rejected properties",
    };

    return (
      <div className="empty-state">
        <Home size={80} className="empty-icon" />
        <h3>{messages[tab]}</h3>
        <p>Start by adding your first property</p>
        <button
          onClick={() => navigate("/landlord/add-property")}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Add Property
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your properties...</p>
      </div>
    );
  }

  return (
    <div className="landlord-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">My Properties</h1>
            <p className="dashboard-subtitle">Manage your property listings</p>
          </div>
          <button
            onClick={() => navigate("/landlord/add-property")}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Add Property
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-total">
              <Home size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Properties</p>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-pending">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Pending Approval</p>
              <p className="stat-value">{stats.pending}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-approved">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Accepted</p>
              <p className="stat-value">{stats.accepted}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-rejected">
              <XCircle size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Rejected</p>
              <p className="stat-value">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <Home size={18} />
          All ({stats.total})
        </button>
        <button
          className={`tab-button ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <Clock size={18} />
          Pending ({stats.pending})
        </button>
        <button
          className={`tab-button ${activeTab === "accepted" ? "active" : ""}`}
          onClick={() => setActiveTab("accepted")}
        >
          <CheckCircle size={18} />
          Accepted ({stats.accepted})
        </button>
        <button
          className={`tab-button ${activeTab === "rejected" ? "active" : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          <XCircle size={18} />
          Rejected ({stats.rejected})
        </button>
      </div>

      {/* Info Alert for Pending */}
      {activeTab === "pending" && stats.pending > 0 && (
        <div className="info-alert">
          <AlertCircle size={20} />
          <p>
            Your properties are waiting for admin approval. This usually takes
            24-48 hours.
          </p>
        </div>
      )}

      {/* Properties Grid */}
      <div className="properties-container">
        {properties[activeTab].length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="properties-grid">
            {properties[activeTab].map((property) => (
              <PropertyCard key={property.postId} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordDashboard;
