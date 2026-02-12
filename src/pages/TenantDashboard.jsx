import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaFileAlt,
  FaComments,
  FaCreditCard,
  FaUser,
  FaSearch,
  FaEnvelope,
  FaCalendarAlt,
  FaBookmark,
  FaEye,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaStar,
  FaChartLine,
  FaClock,
  FaShieldAlt,
  FaRocket,
  FaRegBookmark,
  FaArrowRight,
  FaFileContract
} from "react-icons/fa";
import API_BASE_URL from "../services/ApiConfig";
import "../styles/TenantDashboard.css";

// Helper functions
const getUserId = () => localStorage.getItem("userId");
const getToken = () => localStorage.getItem("token");
const getAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json"
});

const TenantDashboard = () => {
  const [user, setUser] = useState(null);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [stats, setStats] = useState({
    savedCount: 0,
    applicationsCount: 0,
    viewsCount: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingStates, setSavingStates] = useState({});
  const navigate = useNavigate();
  const userId = getUserId();
  const token = getToken();

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("profile"));
    const userData = profile?.user;

    if (!userData || userData.role?.toLowerCase() !== "tenant") {
      navigate("/unauthorized");
      return;
    }

    setUser(userData);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch featured properties
      const propertiesResponse = await axios.get(
        `${API_BASE_URL}/api/Tenant/all-posts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const allProperties = propertiesResponse.data || [];
      
      // Get saved posts to check which ones are saved
      const savedResponse = await axios.get(
        `${API_BASE_URL}/api/Tenant/My-saved-posts/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const savedPostIds = (savedResponse.data || []).map(post => String(post.postId));
      
      // Get user's applications
      const applicationsResponse = await axios.get(
        `${API_BASE_URL}/api/Tenant/my-proposals/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const applications = applicationsResponse.data || [];

      // Get user's history for views
      const historyResponse = await axios.get(
        `http://localhost:5000/api/history/${userId}`,
        { headers: getAuthHeaders() }
      );

      const userHistory = historyResponse.data || [];

      // Process featured properties with real data
      const featured = allProperties.slice(0, 6).map(property => {
        const propertyViews = userHistory.filter(item => 
          item.activity_type === 'view' && item.details?.post_id === String(property.postId)
        ).length;

        return {
          ...property,
          image: property.fileBase64 ? `data:image/png;base64,${property.fileBase64}` : null,
          isSaved: savedPostIds.includes(String(property.postId)),
          views: propertyViews,
          bedrooms: property.bedrooms || Math.floor(Math.random() * 5) + 1,
          bathrooms: property.bathrooms || Math.floor(Math.random() * 3) + 1,
          size: property.size || Math.floor(Math.random() * 2000) + 800,
          rating: (Math.random() * 2 + 3).toFixed(1)
        };
      });

      setFeaturedProperties(featured);

      // Calculate real stats
      const savedCount = savedPostIds.length;
      const applicationsCount = applications.length;
      
      const viewsCount = userHistory.filter(item => 
        item.activity_type === 'view'
      ).length;

      setStats({
        savedCount,
        applicationsCount,
        viewsCount
      });

      // Generate recent activity from real history
      const activity = userHistory
        .slice(0, 4)
        .map(item => {
          let action = "";
          let property = "";
          
          switch(item.activity_type) {
            case 'view':
              action = "Property viewed";
              property = item.details?.post_title || "Unknown Property";
              break;
            case 'save':
              action = "Property saved";
              property = item.details?.post_title || "Unknown Property";
              break;
            case 'comment':
              action = "Comment posted";
              property = item.details?.post_title || "Unknown Property";
              break;
            case 'apply':
              action = "Application submitted";
              property = item.details?.post_title || "Unknown Property";
              break;
            case 'like':
              action = "Property liked";
              property = item.details?.post_title || "Unknown Property";
              break;
            default:
              action = "Activity performed";
              property = "Property";
          }

          return {
            action,
            property,
            time: new Date(item.timestamp).toLocaleDateString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            type: item.activity_type
          };
        });

      setRecentActivity(activity.length > 0 ? activity : [
        { action: "Welcome to Rentify!", property: "Start exploring properties", time: "Just now", type: "welcome" }
      ]);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProperty = async (propertyId, isCurrentlySaved) => {
    if (!userId || !token) {
      alert("Please login to save properties");
      navigate("/login");
      return;
    }

    setSavingStates(prev => ({ ...prev, [propertyId]: true }));

    try {
      if (isCurrentlySaved) {
        // Unsave property
        await axios.delete(
          `${API_BASE_URL}/api/Tenant/${userId}/cancel-save/${propertyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update local state
        setFeaturedProperties(prev => 
          prev.map(property => 
            property.postId === propertyId 
              ? { ...property, isSaved: false }
              : property
          )
        );
        
        setStats(prev => ({ ...prev, savedCount: prev.savedCount - 1 }));
        
        // Record unsave activity
        await axios.post(
          `http://localhost:5000/api/history/${userId}`,
          {
            activity_type: 'unsave',
            details: {
              post_id: propertyId,
              post_title: featuredProperties.find(p => p.postId === propertyId)?.title
            }
          },
          { headers: getAuthHeaders() }
        );

      } else {
        // Save property
        await axios.post(
          `${API_BASE_URL}/api/Tenant/${userId}/save-post/${propertyId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update local state
        setFeaturedProperties(prev => 
          prev.map(property => 
            property.postId === propertyId 
              ? { ...property, isSaved: true }
              : property
          )
        );
        
        setStats(prev => ({ ...prev, savedCount: prev.savedCount + 1 }));

        // Record save activity
        const property = featuredProperties.find(p => p.postId === propertyId);
        await axios.post(
          `http://localhost:5000/api/history/${userId}`,
          {
            activity_type: 'save',
            details: {
              post_id: propertyId,
              post_title: property?.title,
              post_price: property?.price,
              post_location: property?.location,
              post_image: property?.fileBase64
            }
          },
          { headers: getAuthHeaders() }
        );
      }

      // Refresh recent activity
      const historyResponse = await axios.get(
        `http://localhost:5000/api/history/${userId}`,
        { headers: getAuthHeaders() }
      );
      
      const userHistory = historyResponse.data || [];
      const newActivity = userHistory
        .slice(0, 4)
        .map(item => ({
          action: getActivityText(item.activity_type),
          property: item.details?.post_title || "Unknown Property",
          time: new Date(item.timestamp).toLocaleDateString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          type: item.activity_type
        }));

      setRecentActivity(newActivity);

    } catch (error) {
      console.error("Error saving property:", error);
      alert("Failed to save property. Please try again.");
    } finally {
      setSavingStates(prev => ({ ...prev, [propertyId]: false }));
    }
  };

  const getActivityText = (activityType) => {
    switch(activityType) {
      case 'view': return "Property viewed";
      case 'save': return "Property saved";
      case 'unsave': return "Property unsaved";
      case 'comment': return "Comment posted";
      case 'apply': return "Application submitted";
      case 'like': return "Property liked";
      default: return "Activity performed";
    }
  };

  const handlePropertyClick = async (propertyId) => {
    // Navigate to property details
    navigate(`/properties/${propertyId}`);
    
    // Record view activity
    try {
      const property = featuredProperties.find(p => p.postId === propertyId);
      await axios.post(
        `http://localhost:5000/api/history/${userId}`,
        {
          activity_type: 'view',
          details: {
            post_id: propertyId,
            post_title: property?.title,
            post_price: property?.price,
            post_location: property?.location,
            post_image: property?.fileBase64
          }
        },
        { headers: getAuthHeaders() }
      );

      // Update views count
      setStats(prev => ({ ...prev, viewsCount: prev.viewsCount + 1 }));
      
      // Refresh featured properties to update views
      setFeaturedProperties(prev => 
        prev.map(property => 
          property.postId === propertyId 
            ? { ...property, views: (property.views || 0) + 1 }
            : property
        )
      );

    } catch (error) {
      console.error("Error recording view:", error);
    }
  };

  const handleQuickAction = async (actionType) => {
    // Record quick action activity
    try {
      await axios.post(
        `http://localhost:5000/api/history/${userId}`,
        {
          activity_type: 'quick_action',
          details: {
            action: actionType,
            timestamp: new Date().toISOString()
          }
        },
        { headers: getAuthHeaders() }
      );
    } catch (error) {
      console.error("Error recording quick action:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-dashboard">
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome back, <span className="hero-name">{user?.name || "Tenant"}</span>! 
              <span className="hero-emoji">🏠</span>
            </h1>
            <p className="hero-subtitle">
              Your dream home is just a click away. Explore thousands of verified properties, 
              track your applications, and find the perfect place to call home.
            </p>
            
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-number">{stats.savedCount}</div>
                <div className="hero-stat-label">Saved Properties</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">{stats.applicationsCount}</div>
                <div className="hero-stat-label">Applications</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">{stats.viewsCount}</div>
                <div className="hero-stat-label">Properties Viewed</div>
              </div>
            </div>

            <div className="hero-actions">
              <Link to="/show-all-post" className="hero-btn hero-btn-primary">
                <FaSearch />
                Find Properties
              </Link>
              <Link to="/saved-posts" className="hero-btn hero-btn-secondary">
                <FaBookmark />
                View Saved
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-avatar">
              <div className="avatar-ring"></div>
              <div className="avatar-content">
                {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
              </div>
              <div className="avatar-status">
                <FaShieldAlt />
              </div>
            </div>
            
            <div className="hero-badges">
              <div className="hero-badge">
                <FaCalendarAlt />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                  })}
                </span>
              </div>
              <div className="hero-badge active">
                <FaRocket />
                <span>Active Tenant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hero-scroll">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              Welcome back, {user?.name || "Tenant"}! 👋
            </h1>
            <p className="dashboard-subtitle">
              Ready to find your perfect home? Explore thousands of verified properties and make your dream a reality.
            </p>
            <div className="header-badges">
              <div className="date-badge">
                <FaCalendarAlt />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
              <div className="status-badge">
                <FaRocket />
                <span>Active Tenant</span>
              </div>
            </div>
          </div>

          <div className="header-profile">
            <div className="tenant-profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
              <div className="profile-status">
                <FaShieldAlt />
              </div>
            </div>
          </div>
        </div>

       

        {/* Featured Properties */}
        <section className="featured-section">
          <div className="section-header">
            <div className="header-content">
              <div className="section-badge">
                <FaStar />
                <span>Handpicked for You</span>
              </div>
              <h2 className="section-title">
                Featured Properties
              </h2>
              <p className="section-subtitle">Discover amazing properties that match your preferences and budget</p>
            </div>
            <Link
              to="/show-all-post"
              onClick={() => handleQuickAction('view_all_properties')}
              className="view-all-btn"
            >
              <span>View All Properties</span>
              <div className="btn-icon">
                <FaSearch />
              </div>
            </Link>
          </div>

          <div className="properties-grid enhanced">
            {featuredProperties.map((property, index) => (
              <div
                key={property.postId}
                className="property-card enhanced"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Property Image */}
                <div 
                  className="property-image"
                  onClick={() => handlePropertyClick(property.postId)}
                >
                  {property.image ? (
                    <img
                      src={property.image}
                      alt={property.title}
                    />
                  ) : (
                    <div className="property-placeholder">
                      <FaHome />
                      <span>No Image Available</span>
                    </div>
                  )}
                  
                  {/* Property Overlay */}
                  <div className="property-overlay">
                    <button className="quick-view-btn">
                      <FaEye />
                      <span>Quick View</span>
                    </button>
                  </div>
                  
                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveProperty(property.postId, property.isSaved);
                    }}
                    className={`save-btn ${property.isSaved ? 'saved' : ''}`}
                    disabled={savingStates[property.postId]}
                  >
                    {savingStates[property.postId] ? (
                      <div className="loading-spinner" style={{ width: '1rem', height: '1rem' }}></div>
                    ) : property.isSaved ? (
                      <FaBookmark />
                    ) : (
                      <FaRegBookmark />
                    )}
                  </button>

                  {/* Property Badges */}
                  <div className="property-badges">
                    <div className="rating-badge">
                      <FaStar />
                      {property.rating}
                    </div>
                    <div className="views-badge">
                      <FaEye />
                      {property.views || 0}
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="property-content">
                  <div className="property-header">
                    <h3 
                      className="property-title"
                      onClick={() => handlePropertyClick(property.postId)}
                    >
                      {property.title}
                    </h3>
                    {property.isSaved && (
                      <div className="saved-indicator">
                        <FaBookmark />
                      </div>
                    )}
                  </div>

                  <div className="property-location">
                    <FaMapMarkerAlt />
                    <span>{property.location}</span>
                  </div>

                  <div className="property-price">
                    <span className="price-amount">
                      ${property.price?.toLocaleString()}
                    </span>
                    <span className="price-period">/month</span>
                  </div>

                  {/* Property Features */}
                  <div className="property-features">
                    <div className="feature-item">
                      <FaBed />
                      <span>{property.bedrooms}</span>
                      <label>Beds</label>
                    </div>
                    <div className="feature-item">
                      <FaBath />
                      <span>{property.bathrooms}</span>
                      <label>Baths</label>
                    </div>
                    <div className="feature-item">
                      <FaRulerCombined />
                      <span>{property.size}</span>
                      <label>Sqft</label>
                    </div>
                  </div>

                  {/* Property Actions */}
                  <div className="property-actions">
                    <button 
                      className="action-btn primary"
                      onClick={() => handlePropertyClick(property.postId)}
                    >
                      <FaEye />
                      View Details
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add contact functionality here
                      }}
                    >
                      <FaEnvelope />
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions & Recent Activity */}
        <div className="bottom-grid enhanced">
          {/* Quick Actions */}
          <section className="dashboard-section actions-section">
            <div className="section-header-small">
              <div className="section-badge">
                <FaRocket />
                <span>Quick Access</span>
              </div>
              <h2 className="section-title-small">Quick Actions</h2>
              <p className="section-subtitle-small">Everything you need at your fingertips</p>
            </div>
            <div className="actions-grid enhanced">
              {[
                { icon: FaFileContract, label: "My Contracts", path: "/tenant/contracts", color: "blue", action: "my_contracts", description: "View and manage contracts" },
                 { icon: FaFileAlt, label: "My Applications", path: "/UserProposals", color: "purple", action: "my_applications", description: "Track progress" },
                { icon: FaCreditCard, label: "Payment Plans", path: "/tenant/payment-plans", color: "orange", action: "payment_plans", description: "Manage your payments" },
                { icon: FaEnvelope, label: "Messages", path: "/messages", color: "green", action: "messages", description: "Chat with agents" },
              ].map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  onClick={() => handleQuickAction(action.action)}
                  className="action-item enhanced"
                >
                  <div className="action-header">
                    <div className={`action-icon ${action.color}`}>
                      <action.icon />
                    </div>
                    <div className="action-indicator">
                      <FaArrowRight />
                    </div>
                  </div>
                  <div className="action-content">
                    <span className="action-label">{action.label}</span>
                    <span className="action-description">{action.description}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="dashboard-section activity-section">
            <div className="section-header-small">
              <div className="section-badge">
                <FaChartLine />
                <span>Your Activity</span>
              </div>
              <h2 className="section-title-small">Recent Activity</h2>
              <p className="section-subtitle-small">Keep track of your property journey</p>
            </div>
            <div className="activity-list enhanced">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item enhanced">
                  <div className={`activity-icon ${
                    activity.type === 'view' ? 'view' :
                    activity.type === 'save' ? 'save' :
                    activity.type === 'apply' ? 'apply' :
                    'default'
                  }`}>
                    {activity.type === 'view' ? <FaEye /> :
                     activity.type === 'save' ? <FaBookmark /> :
                     activity.type === 'apply' ? <FaFileAlt /> :
                     <FaClock />}
                  </div>
                  <div className="activity-content">
                    <p className="activity-action">{activity.action}</p>
                    <p className="activity-property">{activity.property}</p>
                  </div>
                  <div className="activity-meta">
                    <span className="activity-time">{activity.time}</span>
                    <div className="activity-status">
                      <div className="status-dot"></div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* View All Activity Button */}
              <Link to="/UserHistory" className="view-all-activity">
                <FaChartLine />
                <span>View Complete History</span>
                <FaArrowRight />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;