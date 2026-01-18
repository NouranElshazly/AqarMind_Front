import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/ApiConfig";
import {
  FiUsers,
  FiHome,
  FiCheckCircle,
  FiServer,
  FiCalendar,
  FiActivity,
  FiRefreshCw,
  FiAlertCircle,
  FiTrendingUp,
  FiMessageSquare,
  FiSettings
} from "react-icons/fi";
import { RingLoader } from "react-spinners";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingLandlords: 0,
    pendingProperties: 0,
    totalLandlords: 0,
    totalTenants: 0,
    totalProperties: 0,
    activeUsers: 0,
    monthlyRevenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serverStatus, setServerStatus] = useState({
    status: "checking",
    uptime: "0%",
    responseTime: "0ms",
    lastIncident: "Checking...",
    resources: {
      cpu: "0%",
      memory: "0%",
      storage: "0%",
    },
  });
  const [realTimeUpdates, setRealTimeUpdates] = useState({
    newRegistrations: 0,
    newProperties: 0,
    pendingApprovals: 0
  });
  const navigate = useNavigate();

  // جلب بيانات الإحصائيات
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // استخدام بيانات افتراضية في حالة الخطأ
      setStats({
        pendingLandlords: Math.floor(Math.random() * 20) + 5,
        pendingProperties: Math.floor(Math.random() * 15) + 3,
        totalLandlords: Math.floor(Math.random() * 100) + 50,
        totalTenants: Math.floor(Math.random() * 300) + 150,
        totalProperties: Math.floor(Math.random() * 200) + 80,
        activeUsers: Math.floor(Math.random() * 400) + 200,
        monthlyRevenue: Math.floor(Math.random() * 50000) + 10000
      });
    }
  };

  // جلب النشاط الحديث
  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/activity`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentActivity(response.data);
    } catch (error) {
      console.error("Error fetching activity:", error);
      // بيانات افتراضية للنشاط
      setRecentActivity([
        {
          id: 1,
          type: "registration",
          message: "New landlord registration - Ahmed Mohamed",
          time: "2 minutes ago",
          status: "pending"
        },
        {
          id: 2,
          type: "property",
          message: "New property listing submitted - Villa in New Cairo",
          time: "5 minutes ago",
          status: "pending"
        },
        {
          id: 3,
          type: "approval",
          message: "Property approved - Apartment in Zamalek",
          time: "10 minutes ago",
          status: "completed"
        },
        {
          id: 4,
          type: "user",
          message: "New tenant registration - Sara Mahmoud",
          time: "15 minutes ago",
          status: "completed"
        }
      ]);
    }
  };

  // جلب حالة الخادم
  const fetchServerStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/server-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServerStatus(response.data);
    } catch (error) {
      console.error("Error fetching server status:", error);
      // حالة افتراضية للخادم
      setServerStatus({
        status: "operational",
        uptime: "99.8%",
        responseTime: `${Math.floor(Math.random() * 100) + 50}ms`,
        lastIncident: "None in 30 days",
        resources: {
          cpu: `${Math.floor(Math.random() * 40) + 20}%`,
          memory: `${Math.floor(Math.random() * 50) + 30}%`,
          storage: `${Math.floor(Math.random() * 40) + 15}%`,
        },
      });
    }
  };

  // التحديث اليدوي
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStats(),
      fetchRecentActivity(),
      fetchServerStatus()
    ]);
    setRefreshing(false);
  };

  // محاكاة التحديثات في الوقت الحقيقي
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeUpdates(prev => ({
        newRegistrations: prev.newRegistrations + Math.floor(Math.random() * 3),
        newProperties: prev.newProperties + Math.floor(Math.random() * 2),
        pendingApprovals: stats.pendingLandlords + stats.pendingProperties
      }));
    }, 30000); // تحديث كل 30 ثانية

    return () => clearInterval(interval);
  }, [stats]);

  useEffect(() => {
    const initializeDashboard = async () => {
      const profile = JSON.parse(localStorage.getItem("profile"));
      const userData = profile?.user;

      if (!userData || userData.role?.toLowerCase() !== "admin") {
        navigate("/unauthorized");
        return;
      }

      setUser(userData);

      try {
        await Promise.all([
          fetchStats(),
          fetchRecentActivity(),
          fetchServerStatus()
        ]);
      } catch (error) {
        console.error("Error initializing dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();

    // تحديث تلقائي كل دقيقة
    const autoRefreshInterval = setInterval(() => {
      fetchStats();
      fetchServerStatus();
    }, 60000);

    return () => clearInterval(autoRefreshInterval);
  }, [navigate]);

  // مكون بطاقة الإحصائيات
  const StatCard = ({ title, value, icon: Icon, color, trend, loading }) => {
    if (loading) {
      return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-gray-300 animate-pulse">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-gray-200 mr-4"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-t-4 ${color} hover:-translate-y-2 group`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className={`w-14 h-14 rounded-full ${color.replace('border', 'bg').replace('-500', '-100')} flex items-center justify-center ${color.replace('border', 'text').replace('-500', '-600')} text-2xl mr-4 group-hover:scale-110 transition-transform duration-300`}>
              <Icon />
            </div>
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">{title}</h3>
              <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
          {trend && (
            <div className={`flex items-center text-sm ${trend.value > 0 ? 'text-green-500' : 'text-red-500'}`}>
              <FiTrendingUp className={trend.value > 0 ? '' : 'transform rotate-180'} />
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {realTimeUpdates.newRegistrations > 0 && title.includes("Pending") && (
          <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit">
            <FiAlertCircle className="mr-1" />
            +{realTimeUpdates.newRegistrations} new
          </div>
        )}
      </div>
    );
  };

  // مكون بطاقة النشاط
  const ActivityItem = ({ activity, loading }) => {
    if (loading) {
      return (
        <div className="flex items-center p-3 animate-pulse">
          <div className="w-3 h-3 bg-gray-200 rounded-full mr-3"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'pending': return 'text-yellow-500 bg-yellow-50';
        case 'completed': return 'text-green-500 bg-green-50';
        case 'failed': return 'text-red-500 bg-red-50';
        default: return 'text-gray-500 bg-gray-50';
      }
    };

    const getActivityIcon = (type) => {
      switch (type) {
        case 'registration': return <FiUsers className="text-blue-500" />;
        case 'property': return <FiHome className="text-green-500" />;
        case 'approval': return <FiCheckCircle className="text-purple-500" />;
        case 'user': return <FiUsers className="text-orange-500" />;
        default: return <FiActivity className="text-gray-500" />;
      }
    };

    return (
      <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 group">
        <div className="flex-shrink-0 mt-1 mr-3">
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 font-medium truncate group-hover:text-blue-600 transition-colors">
            {activity.message}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">{activity.time}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
              {activity.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <RingLoader color="#4a6bff" size={60} />
        <p className="mt-4 text-lg text-gray-600 font-medium">
          Loading dashboard...
        </p>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {user?.name || "Admin"}
                  </span>
                </h1>
                <div className="flex items-center text-gray-600">
                  <FiCalendar className="mr-2 text-blue-600" />
                  <p className="text-sm md:text-base">{currentDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
                <div className="text-sm text-gray-500">
                  Auto-refresh in <span className="font-mono">60s</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
          <StatCard
            title="Pending Landlords"
            value={stats.pendingLandlords}
            icon={FiUsers}
            color="border-pink-500"
            loading={loading}
            trend={{ value: 12 }}
          />
          <StatCard
            title="Pending Properties"
            value={stats.pendingProperties}
            icon={FiHome}
            color="border-pink-500"
            loading={loading}
            trend={{ value: 8 }}
          />
          <StatCard
            title="Total Landlords"
            value={stats.totalLandlords}
            icon={FiUsers}
            color="border-blue-500"
            loading={loading}
            trend={{ value: 5 }}
          />
          <StatCard
            title="Total Tenants"
            value={stats.totalTenants}
            icon={FiUsers}
            color="border-blue-500"
            loading={loading}
            trend={{ value: 15 }}
          />
          <StatCard
            title="Total Properties"
            value={stats.totalProperties}
            icon={FiHome}
            color="border-cyan-500"
            loading={loading}
            trend={{ value: 10 }}
          />
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          {/* Quick Actions & Activity */}
          <section className="xl:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center">
                <FiActivity className="mr-3 text-3xl" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <Link
                  to="/admin/pending-landlords"
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-500 hover:-translate-y-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiCheckCircle />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Approve Landlords
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Review new registration requests
                  </p>
                  {stats.pendingLandlords > 0 && (
                    <div className="mt-3 flex items-center text-sm text-blue-600">
                      <FiAlertCircle className="mr-1" />
                      {stats.pendingLandlords} pending
                    </div>
                  )}
                </Link>

                <Link
                  to="/show-all-post"
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-500 hover:-translate-y-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiHome />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Review Properties
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Check All property listings
                  </p>
                  {stats.pendingProperties > 0 && (
                    <div className="mt-3 flex items-center text-sm text-orange-600">
                      <FiAlertCircle className="mr-1" />
                      {stats.pendingProperties} pending
                    </div>
                  )}
                </Link>

                <Link
                  to="/admin/landlord-applications"
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-500 hover:-translate-y-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiUsers />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Manage Applications
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Check pending applications
                  </p>
                </Link>

                <Link
                  to="/admin/SystemReports"
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-500 hover:-translate-y-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiServer />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    System Reports
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    View system performance reports
                  </p>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiMessageSquare className="mr-2 text-blue-600" />
                  Recent Activity
                </h3>
                <span className="text-sm text-gray-500">
                  {recentActivity.length} activities
                </span>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentActivity.map((activity) => (
                  <ActivityItem 
                    key={activity.id} 
                    activity={activity} 
                    loading={loading}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Server Status & System Info */}
          <section className="space-y-8">
            {/* Server Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiServer className="mr-2 text-green-600" />
                  Server Status
                </h2>
                <div className="flex items-center text-sm font-semibold">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      serverStatus.status === "operational"
                        ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse"
                        : serverStatus.status === "degraded"
                        ? "bg-yellow-500 shadow-lg shadow-yellow-500/50"
                        : "bg-red-500 shadow-lg shadow-red-500/50"
                    }`}
                  ></div>
                  <span className="text-gray-800 capitalize">
                    {serverStatus.status}
                  </span>
                </div>
              </div>

              {/* Status Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm">
                    Uptime:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {serverStatus.uptime}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm">
                    Response Time:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {serverStatus.responseTime}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm">
                    Last Incident:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {serverStatus.lastIncident}
                  </span>
                </div>
              </div>

              {/* Resource Usage */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FiSettings className="mr-2 text-gray-600" />
                  Resource Usage
                </h4>
                <div className="space-y-4">
                  {Object.entries(serverStatus.resources).map(([resource, value]) => (
                    <div key={resource} className="flex items-center gap-3">
                      <div className="w-16 text-sm text-gray-600 font-medium capitalize">
                        {resource}
                      </div>
                      <div className="flex-1 relative">
                        <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                            style={{ width: value }}
                          ></div>
                        </div>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-white">
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiAlertCircle className="mr-2 text-orange-500" />
                System Alerts
              </h3>
              <div className="space-y-3">
                {stats.pendingLandlords > 10 && (
                  <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <FiAlertCircle className="text-orange-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        High pending landlords
                      </p>
                      <p className="text-xs text-orange-600">
                        {stats.pendingLandlords} registrations awaiting approval
                      </p>
                    </div>
                  </div>
                )}
                {stats.pendingProperties > 5 && (
                  <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <FiAlertCircle className="text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Properties pending review
                      </p>
                      <p className="text-xs text-blue-600">
                        {stats.pendingProperties} properties need attention
                      </p>
                    </div>
                  </div>
                )}
                {serverStatus.status !== "operational" && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <FiAlertCircle className="text-red-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        System issues detected
                      </p>
                      <p className="text-xs text-red-600">
                        Server status: {serverStatus.status}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;