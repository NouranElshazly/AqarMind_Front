import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import API_BASE_URL from "../services/ApiConfig";
import {
  Home,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Trash2,
  DollarSign,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  Gavel,
} from "lucide-react";
import "../styles/LandlordDashboard.css";

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, pending, accepted, rejected
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
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

  const isDeletingRef = useRef(false);
  const lastFetchRef = useRef(0); // ✅ add this line

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

  // إعادة تحميل البيانات لما الصفحة ترجع تكون active
  useEffect(() => {
    const handleFocus = () => {
  if (isDeletingRef.current) return;
  const now = Date.now();
  if (now - lastFetchRef.current < 5000) return; // ✅ max once every 5 seconds
  lastFetchRef.current = now;
  fetchProperties();
};

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const fetchProperties = async () => {
    if (!userId) {
      console.warn("No userId found, skipping property fetch.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      // Fetch all posts using the main backend API
      const allResponse = await API.get(`/Landlord/get-my-posts`);
      const allPosts = allResponse.data || [];

      const pendingPosts = allPosts.filter((p) => p.pendingStatus === 0);
      const acceptedPosts = allPosts.filter((p) => p.pendingStatus === 1);
      const rejectedPosts = allPosts.filter((p) => p.pendingStatus === -1);

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

      // Initialize current image index for each property
      const initialIndexes = {};
      allPosts.forEach((property) => {
        initialIndexes[property.postId] = 0;
      });
      setCurrentImageIndexes(initialIndexes);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // Image navigation functions
  const nextImage = (propertyId, imagesLength, e) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]: (prev[propertyId] + 1) % imagesLength,
    }));
  };

  const prevImage = (propertyId, imagesLength, e) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]:
        prev[propertyId] === 0 ? imagesLength - 1 : prev[propertyId] - 1,
    }));
  };

  const goToImage = (propertyId, index, e) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]: index,
    }));
  };

  const handleDelete = async (postId) => {
    if (isDeletingRef.current) return;

    if (window.confirm("Are you sure you want to delete this property?")) {
      isDeletingRef.current = true;
      try {
        // Find which category the property belongs to
        const propertyToDelete = properties.all.find(
          (p) => p.postId === postId,
        );
        if (!propertyToDelete) {
          toast.warn("Property not found");
          isDeletingRef.current = false;
          return;
        }

        // Update state immediately - remove from all categories
        setProperties((prevProperties) => ({
          all: prevProperties.all.filter((p) => p.postId !== postId),
          pending: prevProperties.pending.filter((p) => p.postId !== postId),
          accepted: prevProperties.accepted.filter((p) => p.postId !== postId),
          rejected: prevProperties.rejected.filter((p) => p.postId !== postId),
        }));

        // Update stats based on the property's status
        setStats((prevStats) => {
          const newStats = { ...prevStats };
          newStats.total = Math.max(0, newStats.total - 1);

          if (propertyToDelete.pendingStatus === 0) {
            newStats.pending = Math.max(0, newStats.pending - 1);
          } else if (propertyToDelete.pendingStatus === 1) {
            newStats.accepted = Math.max(0, newStats.accepted - 1);
          } else if (propertyToDelete.pendingStatus === -1) {
            newStats.rejected = Math.max(0, newStats.rejected - 1);
          }

          return newStats;
        });

        // Make API call
        await API.delete(`${API_BASE_URL}/api/Landlord/delete-post/${postId}`);

        toast.success("Property deleted successfully");
        isDeletingRef.current = false;
      } catch (error) {
        console.error("Error deleting property:", error);
        const errorMessage =
          error.response?.data?.error || "Failed to delete property";
        toast.error(errorMessage);

        // Revert state on error by refetching
        fetchProperties();
        isDeletingRef.current = false;
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
    const currentIndex = currentImageIndexes[property.postId] || 0;

    // Get all images from the property
    let allImages = [];

    // Check if property has postImages array (like in LandlordDashboard)
    if (property.postImages && property.postImages.length > 0) {
      allImages = property.postImages.map((img) => {
        const imagePath = img.imagePath;
        if (imagePath.startsWith("http")) {
          return imagePath;
        } else if (imagePath.startsWith("data:")) {
          return imagePath;
        } else {
          return imagePath.startsWith("/")
            ? `${API_BASE_URL}${imagePath}`
            : `${API_BASE_URL}/${imagePath}`;
        }
      });
    }
    // Check if property has images array (like in Home.jsx)
    else if (property.images && property.images.length > 0) {
      allImages = property.images.map((img) => {
        if (img.startsWith("http")) {
          return img;
        } else if (img.startsWith("data:")) {
          return img;
        } else {
          return img.startsWith("/")
            ? `${API_BASE_URL}${img}`
            : `${API_BASE_URL}/${img}`;
        }
      });
    }
    // Check if property has single image property
    else if (property.image) {
      const singleImage = property.image;
      if (singleImage.startsWith("http")) {
        allImages = [singleImage];
      } else if (singleImage.startsWith("data:")) {
        allImages = [singleImage];
      } else {
        allImages = [
          singleImage.startsWith("/")
            ? `${API_BASE_URL}${singleImage}`
            : `${API_BASE_URL}/${singleImage}`,
        ];
      }
    }
    // Check for fileBase64 (base64 encoded image)
    else if (property.fileBase64) {
      allImages = [`data:image/png;base64,${property.fileBase64}`];
    }

    // Fallback to placeholder if no images
    if (allImages.length === 0) {
      allImages = ["https://placehold.co/400x300/1e3a8a/ffffff?text=No+Image"];
    }

    const currentImageSrc = allImages[currentIndex] || allImages[0];
    const hasMultipleImages = allImages.length > 1;

    return (
      <div className="property-card fade-in">
        <div className="property-image">
          <img
            src={currentImageSrc}
            alt={property.title || "Property"}
            onError={(e) => {
              console.warn(
                "⚠️ Image failed to load, using fallback:",
                currentImageSrc,
              );
              console.info(
                "💡 Tip: If this is a localhost SSL issue, visit https://localhost:7119/api/Landlord in a new tab and 'Accept the Risk'.",
              );
              e.target.onerror = null; // Prevent infinite loop
              e.target.src =
                "https://placehold.co/400x300/1e3a8a/ffffff?text=Image+Unavailable";
            }}
          />

          <div className="property-status-overlay">
            {getStatusBadge(property.pendingStatus)}
          </div>

          <div className="property-type-badge">
            {property.type === 0 ? "For Rent" : "For Sale"}
          </div>

          {/* Image Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                className="property-nav property-nav-prev"
                onClick={(e) => prevImage(property.postId, allImages.length, e)}
                title="Previous Image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="property-nav property-nav-next"
                onClick={(e) => nextImage(property.postId, allImages.length, e)}
                title="Next Image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Image Indicators */}
          {hasMultipleImages && (
            <div className="property-indicators">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  className={`property-indicator ${index === currentIndex ? "active" : ""}`}
                  onClick={(e) => goToImage(property.postId, index, e)}
                  title={`Image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="property-content">
          <div className="property-meta-header">
            <div className="property-meta-left">
              <div className="property-meta-item">
                <User size={14} />
                <span>{property.userName || "Landlord"}</span>
              </div>
              <div className="property-meta-item">
                <Clock size={14} />
                <span>
                  {property.datePost
                    ? new Date(property.datePost).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* نقل الأزرار هنا في الهيدر */}
            <div className="property-actions-header">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/landlord/properties/${property.postId}/edit`);
                }}
                className="btn-icon btn-edit"
                title="Edit"
              >
                <Settings size={16} />
                <span className="btn-text">✏️</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(property.postId);
                }}
                className="btn-icon btn-delete"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <h3 className="property-title">{property.title}</h3>

          <p className="property-description-text">
            {property.description || "No description available"}
          </p>

          <div
            className={`property-auction-badge ${property.isAuction == 1 ? "auction" : "not-auction"}`}
          >
            <Gavel size={14} />
            {property.isAuction == 1 ? "Auction" : "Not Auction"}
          </div>

          <div className="property-footer">
            <div className="property-price">
              <DollarSign size={20} />
              {property.price?.toLocaleString() || "N/A"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ tab }) => (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Home size={48} />
      </div>
      <h3>No Properties Found</h3>
      <p>You haven't added any properties yet.</p>
      <button
        onClick={() => navigate("/landlord/add-property")}
        className="btn btn-primary mt-4"
      >
        <Plus size={18} />
        Add Your First Property
      </button>
    </div>
  );

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
            <p className="dashboard-subtitle">
              Manage your properties and Proposals
            </p>
          </div>
          <div className="dash-buttons">
          <button
            onClick={() => navigate("/landlord/add-property")}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Add Property
          </button>
          <button
            onClick={() => navigate("/tenant/contracts")}
            className="btn btn-secondary"
            style={{ marginLeft: "10px" }}
          >
            <FileText size={20} />
            My Contracts
          </button>
          <button
            onClick={() => navigate("/landlord/manage-proposals")}
            className="btn btn-secondary"
            style={{ marginLeft: "10px" }}
          >
            <FileText size={20} />
            Manage Proposals
          </button>
          </div>
        </div>

      
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "all" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("all");
            setCurrentPage(1);
          }}
        >
          <Home size={18} />
          All Properties 
          <span className="tab-count">{stats.total}</span>
        </button>
        
        <button
          className={`tab-button ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("pending");
            setCurrentPage(1);
          }}
        >
          <Clock size={18} />
          Pending
          <span className="tab-count">{stats.pending}</span>
        </button>
        <button
          className={`tab-button ${activeTab === "accepted" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("accepted");
            setCurrentPage(1);
          }}
        >
          <CheckCircle size={18} />
          Accepted
          <span className="tab-count">{stats.accepted}</span>
        </button>
        <button
          className={`tab-button ${activeTab === "rejected" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("rejected");
            setCurrentPage(1);
          }}
        >
          <XCircle size={18} />
          Rejected
          <span className="tab-count">{stats.rejected}</span>
        </button>
      </div>

      {/* Properties Grid */}
      <div className="properties-container">
        {properties[activeTab].length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <>
            <div className="properties-grid">
              {properties[activeTab]
                .slice(
                  (currentPage - 1) * postsPerPage,
                  currentPage * postsPerPage,
                )
                .map((property) => (
                  <PropertyCard key={property.postId} property={property} />
                ))}
            </div>

            {/* Pagination Controls */}
            {properties[activeTab].length > postsPerPage && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => p - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                {[
                  ...Array(
                    Math.ceil(properties[activeTab].length / postsPerPage),
                  ),
                ].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="page-btn"
                  disabled={
                    currentPage ===
                    Math.ceil(properties[activeTab].length / postsPerPage)
                  }
                  onClick={() => {
                    setCurrentPage((p) => p + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LandlordDashboard;
