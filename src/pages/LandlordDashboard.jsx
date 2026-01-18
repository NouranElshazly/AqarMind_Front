import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/ApiConfig";
import {
  FaHome,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaComments,
  FaPlus,
  FaClipboardList,
  FaInbox,
  FaBuilding,
  FaUsers,
  FaFileAlt,
  FaShieldAlt,
  FaChartLine,
  FaHandshake,
  FaUser,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import { RingLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";

const LandlordDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [properties, setProperties] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const navigate = useNavigate();

  // جلب بيانات المستخدم
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profile = JSON.parse(localStorage.getItem("profile"));
        const userData = profile?.user;

        if (!userData || userData.role?.toLowerCase() !== "landlord") {
          navigate("/unauthorized");
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  // // جلب الإحصائيات من الباكند
  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       setStatsLoading(true);
  //       const token = localStorage.getItem("token");
        
  //       const response = await fetch(`${API_BASE_URL}/api/landlord/stats`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (response.ok) {
  //         const data = await response.json();
  //         setStats(data);
  //         localStorage.setItem("landlordStats", JSON.stringify(data));
  //       } else {
  //         // استخدام بيانات افتراضية في حالة فشل الجلب
  //         setStats({
  //           totalProperties: 12,
  //           activeListings: 8,
  //           pendingApproval: 3,
  //           proposalsReceived: 5,
  //           unreadMessages: 2,
  //           occupiedProperties: 6,
  //           monthlyRevenue: 12500,
  //           revenueChange: 12.5,
  //           maintenanceRequests: 4,
  //           upcomingRenewals: 2
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error fetching stats:", error);
  //       // استخدام بيانات افتراضية في حالة الخطأ
  //       setStats({
  //         totalProperties: 12,
  //         activeListings: 8,
  //         pendingApproval: 3,
  //         proposalsReceived: 5,
  //         unreadMessages: 2,
  //         occupiedProperties: 6,
  //         monthlyRevenue: 12500,
  //         revenueChange: 12.5,
  //         maintenanceRequests: 4,
  //         upcomingRenewals: 2
  //       });
  //     } finally {
  //       setStatsLoading(false);
  //     }
  //   };

  //   if (user) {
  //     fetchStats();
  //   }
  // }, [user]);
  // جلب الإحصائيات (Static مؤقتًا)
useEffect(() => {
  // 🔴 API NOT READY YET
  // TODO: Replace with backend endpoint:
  // GET /api/landlord/stats

  if (!user) return;

  setStatsLoading(true);

  // ✅ Static / Dummy Stats
  const staticStats = {
    totalProperties: 12,
    activeListings: 8,
    pendingApproval: 3,
    proposalsReceived: 5,
    unreadMessages: 2,
    occupiedProperties: 6,
    monthlyRevenue: 12500,
    revenueChange: 12.5,
    maintenanceRequests: 4,
    upcomingRenewals: 2
  };

  setStats(staticStats);
  localStorage.setItem("landlordStats", JSON.stringify(staticStats));

  setStatsLoading(false);
}, [user]);


  // جلب أحدث النشاطات من الباكند
  // useEffect(() => {
  //   const fetchRecentActivity = async () => {
  //     try {
  //       setActivityLoading(true);
  //       const token = localStorage.getItem("token");
        
  //       const response = await fetch(`${API_BASE_URL}/api/landlord/activity`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (response.ok) {
  //         const data = await response.json();
  //         setRecentActivity(data);
  //         localStorage.setItem("recentActivity", JSON.stringify(data));
  //       } 
  //       else {
  //         // استخدام بيانات افتراضية في حالة فشل الجلب
  //         setRecentActivity([
  //           {
  //             id: 1,
  //             type: "proposal",
  //             message: "New rental proposal received for Downtown Apartment",
  //             time: "2 hours ago",
  //             read: false
  //           },
  //           {
  //             id: 2,
  //             type: "maintenance",
  //             message: "Maintenance request submitted for Garden Villa",
  //             time: "5 hours ago",
  //             read: true
  //           },
  //           {
  //             id: 3,
  //             type: "payment",
  //             message: "Rent payment received for Seaside Residence",
  //             time: "1 day ago",
  //             read: true
  //           },
  //           {
  //             id: 4,
  //             type: "inquiry",
  //             message: "New inquiry about Modern Loft",
  //             time: "2 days ago",
  //             read: false
  //           }
  //         ]);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching activity:", error);
  //       // استخدام بيانات افتراضية في حالة الخطأ
  //       setRecentActivity([
  //         {
  //           id: 1,
  //           type: "proposal",
  //           message: "New rental proposal received for Downtown Apartment",
  //           time: "2 hours ago",
  //           read: false
  //         },
  //         {
  //           id: 2,
  //           type: "maintenance",
  //           message: "Maintenance request submitted for Garden Villa",
  //           time: "5 hours ago",
  //           read: true
  //         },
  //         {
  //           id: 3,
  //           type: "payment",
  //           message: "Rent payment received for Seaside Residence",
  //           time: "1 day ago",
  //           read: true
  //         },
  //         {
  //           id: 4,
  //           type: "inquiry",
  //           message: "New inquiry about Modern Loft",
  //           time: "2 days ago",
  //           read: false
  //         }
  //       ]);
  //     } finally {
  //       setActivityLoading(false);
  //     }
  //   };

  //   if (user) {
  //     fetchRecentActivity();
  //   }
  // }, [user]);
  useEffect(() => {
  // 🔴 API NOT READY YET
  // TODO: Replace with backend endpoint: GET /api/landlord/activity

  if (!user) return;

  setActivityLoading(true);

  // ✅ Static / Dummy Data
  setRecentActivity([
    {
      id: 1,
      type: "proposal",
      message: "New rental proposal received for Downtown Apartment",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      type: "maintenance",
      message: "Maintenance request submitted for Garden Villa",
      time: "5 hours ago",
      read: true
    },
    {
      id: 3,
      type: "payment",
      message: "Rent payment received for Seaside Residence",
      time: "1 day ago",
      read: true
    },
    {
      id: 4,
      type: "inquiry",
      message: "New inquiry about Modern Loft",
      time: "2 days ago",
      read: false
    }
  ]);

  setActivityLoading(false);
}, [user]);


  // // جلب أحدث العقارات من الباكند
  // useEffect(() => {
  //   const fetchProperties = async () => {
  //     try {
  //       setPropertiesLoading(true);
  //       const token = localStorage.getItem("token");
        
  //       const response = await fetch(`${API_BASE_URL}/api/landlord/properties?limit=3`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (response.ok) {
  //         const data = await response.json();
  //         setProperties(data);
  //       } else {
  //         // استخدام بيانات افتراضية في حالة فشل الجلب
  //         setProperties([
  //           {
  //             id: 1,
  //             name: "Downtown Apartment",
  //             status: "active",
  //             image: "/images/property1.jpg",
  //             location: "New York, NY",
  //             price: 2500,
  //             beds: 2,
  //             baths: 2,
  //             area: 1200
  //           },
  //           {
  //             id: 2,
  //             name: "Garden Villa",
  //             status: "pending",
  //             image: "/images/property2.jpg",
  //             location: "Los Angeles, CA",
  //             price: 4200,
  //             beds: 4,
  //             baths: 3,
  //             area: 2200
  //           },
  //           {
  //             id: 3,
  //             name: "Seaside Residence",
  //             status: "occupied",
  //             image: "/images/property3.jpg",
  //             location: "Miami, FL",
  //             price: 3800,
  //             beds: 3,
  //             baths: 2,
  //             area: 1800
  //           }
  //         ]);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching properties:", error);
  //       // استخدام بيانات افتراضية في حالة الخطأ
  //       setProperties([
  //         {
  //           id: 1,
  //           name: "Downtown Apartment",
  //           status: "active",
  //           image: "/images/property1.jpg",
  //           location: "New York, NY",
  //           price: 2500,
  //           beds: 2,
  //           baths: 2,
  //           area: 1200
  //         },
  //         {
  //           id: 2,
  //           name: "Garden Villa",
  //           status: "pending",
  //           image: "/images/property2.jpg",
  //           location: "Los Angeles, CA",
  //           price: 4200,
  //           beds: 4,
  //           baths: 3,
  //           area: 2200
  //         },
  //         {
  //           id: 3,
  //           name: "Seaside Residence",
  //           status: "occupied",
  //           image: "/images/property3.jpg",
  //           location: "Miami, FL",
  //           price: 3800,
  //           beds: 3,
  //           baths: 2,
  //           area: 1800
  //         }
  //       ]);
  //     } finally {
  //       setPropertiesLoading(false);
  //       setLoading(false);
  //     }
  //   };

  //   if (user) {
  //     fetchProperties();
  //   }
  // }, [user]);
  // جلب أحدث العقارات (Static مؤقتًا)
useEffect(() => {
  // 🔴 API NOT READY YET
  // TODO: Replace with backend endpoint:
  // GET /api/landlord/properties?limit=3

  if (!user) return;

  setPropertiesLoading(true);

  // ✅ Static / Dummy Properties
  setProperties([
    {
      id: 1,
      name: "Downtown Apartment",
      status: "active",
      image: "/images/property1.jpg",
      location: "New York, NY",
      price: 2500,
      beds: 2,
      baths: 2,
      area: 1200
    },
    {
      id: 2,
      name: "Garden Villa",
      status: "pending",
      image: "/images/property2.jpg",
      location: "Los Angeles, CA",
      price: 4200,
      beds: 4,
      baths: 3,
      area: 2200
    },
    {
      id: 3,
      name: "Seaside Residence",
      status: "occupied",
      image: "/images/property3.jpg",
      location: "Miami, FL",
      price: 3800,
      beds: 3,
      baths: 2,
      area: 1800
    }
  ]);

  setPropertiesLoading(false);
  setLoading(false);
}, [user]);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <RingLoader color="#4a6bff" size={60} />
        <p className="mt-4 text-lg text-gray-600 font-medium">
          Loading dashboard...
        </p>
      </div>
    );
  }

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "occupied":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "proposal":
        return <FaClipboardList className="text-purple-500" />;
      case "maintenance":
        return <FaExclamationTriangle className="text-orange-500" />;
      case "payment":
        return <FaCheckCircle className="text-green-500" />;
      case "inquiry":
        return <FaEnvelope className="text-blue-500" />;
      default:
        return <FaComments className="text-gray-500" />;
    }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto my-8 px-5 font-sans bg-gradient-to-br from-white to-gray-50 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-8 border-b border-gray-200"
        variants={itemVariants}
      >
        <div className="mt-5 mb-6 md:mb-0">
          <h1 className="text-4xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {user.name || "Landlord"}
            </span>
            !
          </h1>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-600 font-medium">{formattedDate}</span>
          </div>
          <p className="text-gray-600 text-lg">
            Here's your property management overview
          </p>
        </div>
        <motion.div 
          className="flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-xl ring-4 ring-blue-100">
            {user.name ? user.name.charAt(0).toUpperCase() : "L"}
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        variants={containerVariants}
      >
        {statsLoading ? (
          // Skeleton loading for stats
          Array(4).fill(0).map((_, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
              variants={itemVariants}
            >
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </motion.div>
          ))
        ) : (
          <>
            <motion.div 
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
              variants={itemVariants}
              whileHover="hover"
              variants={cardHoverVariants}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Properties</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProperties}</p>
                  <p className="text-sm text-gray-500 mt-1">All your listed properties</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FaBuilding className="text-2xl text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
              variants={itemVariants}
              whileHover="hover"
              variants={cardHoverVariants}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Listings</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeListings}</p>
                  <p className="text-sm text-gray-500 mt-1">Available for rent</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <FaCheckCircle className="text-2xl text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
              variants={itemVariants}
              whileHover="hover"
              variants={cardHoverVariants}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Monthly Revenue</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${stats.monthlyRevenue?.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {stats.revenueChange > 0 ? (
                      <FaArrowUp className="text-green-500 mr-1" />
                    ) : (
                      <FaArrowDown className="text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${stats.revenueChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(stats.revenueChange)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FaChartLine className="text-2xl text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
              variants={itemVariants}
              whileHover="hover"
              variants={cardHoverVariants}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pending Actions</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingApproval + stats.maintenanceRequests}</p>
                  <p className="text-sm text-gray-500 mt-1">Require your attention</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <FaClock className="text-2xl text-orange-600" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <motion.div 
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Quick Actions</h2>
            <Link
              to="/landlord/properties"
              className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors duration-300 hover:underline"
            >
              View All Properties →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/landlord/properties/new"
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center no-underline text-gray-800 transition-all duration-300 shadow-md border border-blue-200 block hover:shadow-lg"
              >
                <div className="text-3xl mb-3 text-blue-600">
                  <FaPlus className="mx-auto" />
                </div>
                <h3 className="m-0 font-medium text-lg mb-2 text-gray-900">
                  Add New Property
                </h3>
                <p className="text-sm text-gray-600">List a new rental property</p>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/landlord/proposals"
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 text-center no-underline text-gray-800 transition-all duration-300 shadow-md border border-purple-200 block hover:shadow-lg"
              >
                <div className="text-3xl mb-3 text-purple-600">
                  <FaClipboardList className="mx-auto" />
                </div>
                <h3 className="m-0 font-medium text-lg mb-2 text-gray-900">
                  View Proposals
                </h3>
                <p className="text-sm text-gray-600">Review tenant applications</p>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/messages"
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center no-underline text-gray-800 transition-all duration-300 shadow-md border border-green-200 block hover:shadow-lg"
              >
                <div className="text-3xl mb-3 text-green-600">
                  <FaInbox className="mx-auto" />
                </div>
                <h3 className="m-0 font-medium text-lg mb-2 text-gray-900">
                  Check Messages
                </h3>
                <p className="text-sm text-gray-600">Communicate with tenants</p>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/landlord/properties"
                className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 text-center no-underline text-gray-800 transition-all duration-300 shadow-md border border-indigo-200 block hover:shadow-lg"
              >
                <div className="text-3xl mb-3 text-indigo-600">
                  <FaBuilding className="mx-auto" />
                </div>
                <h3 className="m-0 font-medium text-lg mb-2 text-gray-900">
                  Manage Properties
                </h3>
                <p className="text-sm text-gray-600">Edit your listings</p>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Properties */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          variants={itemVariants}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Recent Properties</h2>
            <Link
              to="/landlord/properties"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-300"
            >
              View All
            </Link>
          </div>
          
          {propertiesLoading ? (
            // Skeleton loading for properties
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {properties.map((property) => (
                  <motion.div 
                    key={property.id}
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="w-12 h-12 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden">
                      {property.image ? (
                        <img 
                          src={property.image} 
                          alt={property.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <FaHome className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-gray-900 truncate">{property.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{property.location}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-10"
        variants={itemVariants}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Recent Activity</h2>
          <Link
            to="/landlord/activity"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-300"
          >
            View All Activity
          </Link>
        </div>
        
        {activityLoading ? (
          // Skeleton loading for activity
          <div className="space-y-4">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {recentActivity.map((activity) => (
                <motion.div 
                  key={activity.id}
                  className={`flex items-start p-4 rounded-lg border ${activity.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'} hover:bg-gray-50 transition-colors`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex-shrink-0 mt-1 mr-4">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                  </div>
                  {!activity.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LandlordDashboard;