import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaFileAlt,
  FaComments,
  FaUser,
  FaHeart,
  FaSearch,
  FaEnvelope,
  FaCalendarAlt,
  FaBookmark,
  FaEye,
  FaMapMarkerAlt,
  FaDollarSign,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaStar,
  FaChartLine,
  FaClock,
  FaShieldAlt,
  FaRocket,
  FaRegBookmark
} from "react-icons/fa";
import API_BASE_URL from "../services/ApiConfig";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 animate-fade-in">
          <div className="flex-1">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Welcome back, {user?.name || "Tenant"}! 👋
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl">
              Ready to find your perfect home? Explore thousands of verified properties and make your dream a reality.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-2xl font-semibold text-gray-700 shadow-lg border border-gray-200">
                <FaCalendarAlt className="text-blue-600 text-sm" />
                <span className="text-sm">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg">
                <FaRocket className="text-lg" />
                <span className="font-semibold">Active Tenant</span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow-2xl ring-4 ring-white/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <FaShieldAlt className="text-white text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: FaBookmark,
              label: "Saved Properties",
              value: stats.savedCount,
              description: "Properties you've saved",
              color: "blue",
              gradient: "from-blue-500 to-blue-600"
            },
            {
              icon: FaFileAlt,
              label: "Applications",
              value: stats.applicationsCount,
              description: "Active applications",
              color: "purple",
              gradient: "from-purple-500 to-purple-600"
            },
            {
              icon: FaEye,
              label: "Properties Viewed",
              value: stats.viewsCount,
              description: "Properties you've explored",
              color: "green",
              gradient: "from-green-500 to-green-600"
            }
          ].map((stat, index) => (
            <div 
              key={index}
              className="group p-6 rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-2xl text-white shadow-lg`}>
                  <stat.icon />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Properties */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Featured Properties 🔥
              </h2>
              <p className="text-lg text-gray-600">Based on your preferences</p>
            </div>
            <Link
              to="/show-all-post"
              onClick={() => handleQuickAction('view_all_properties')}
              className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View All Properties
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property, index) => (
              <div
                key={property.postId}
                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 cursor-pointer animate-fade-in hover:-translate-y-2"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Property Image */}
                <div 
                  className="relative h-48 overflow-hidden"
                  onClick={() => handlePropertyClick(property.postId)}
                >
                  {property.image ? (
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <FaHome className="text-4xl text-gray-400" />
                    </div>
                  )}
                  
                  {/* Save Button - Changed to Bookmark */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveProperty(property.postId, property.isSaved);
                    }}
                    className={`absolute top-4 left-4 p-3 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                      property.isSaved 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-white/90 text-gray-600 hover:bg-white hover:text-blue-500'
                    }`}
                    disabled={savingStates[property.postId]}
                  >
                    {savingStates[property.postId] ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : property.isSaved ? (
                      <FaBookmark className="text-lg" />
                    ) : (
                      <FaRegBookmark className="text-lg" />
                    )}
                  </button>

                  {/* Rating and Views */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className="flex items-center gap-1 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      <FaStar className="text-yellow-400" />
                      {property.rating}
                    </div>
                    <div className="flex items-center gap-1 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      <FaEye className="text-xs" />
                      {property.views || 0}
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <h3 
                    className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer"
                    onClick={() => handlePropertyClick(property.postId)}
                  >
                    {property.title}
                  </h3>

                  <div className="flex items-center text-gray-600 mb-3">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      ${property.price?.toLocaleString()}
                      <span className="text-sm text-gray-500 font-normal">/month</span>
                    </span>
                    {property.isSaved && (
                      <div className="flex items-center gap-1 text-blue-600 text-sm font-semibold bg-blue-50 px-2 py-1 rounded-full">
                        <FaBookmark className="text-xs" />
                        Saved
                      </div>
                    )}
                  </div>

                  {/* Property Features */}
                  <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-1">
                      <FaBed className="text-blue-500" />
                      <span>{property.bedrooms} beds</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaBath className="text-green-500" />
                      <span>{property.bathrooms} baths</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRulerCombined className="text-purple-500" />
                      <span>{property.size} sqft</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Actions 🚀</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: FaSearch, label: "Find Properties", path: "/show-all-post", color: "blue", action: "find_properties" },
                { icon: FaBookmark, label: "Saved Homes", path: "/saved-posts", color: "pink", action: "saved_homes" },
                { icon: FaFileAlt, label: "My Applications", path: "/UserProperties", color: "purple", action: "my_applications" },
                { icon: FaEnvelope, label: "Messages", path: "/messages", color: "green", action: "messages" },
                { icon: FaUser, label: "Profile", path: "/profile", color: "orange", action: "profile" },
                { icon: FaComments, label: "Support", path: "/contact", color: "gray", action: "support" }
              ].map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  onClick={() => handleQuickAction(action.action)}
                  className="group flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-200 hover:border-blue-200"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-${action.color}-100 text-${action.color}-600 flex items-center justify-center text-xl mb-3 group-hover:bg-${action.color}-600 group-hover:text-white transition-colors duration-300`}>
                    <action.icon />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{action.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Recent Activity 📈</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-white transition-colors duration-200">
                  <div className={`w-10 h-10 rounded-xl ${
                    activity.type === 'view' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'save' ? 'bg-green-100 text-green-600' :
                    activity.type === 'apply' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  } flex items-center justify-center flex-shrink-0`}>
                    {activity.type === 'view' ? <FaEye /> :
                     activity.type === 'save' ? <FaBookmark /> :
                     activity.type === 'apply' ? <FaFileAlt /> :
                     <FaClock />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.property}</p>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TenantDashboard;