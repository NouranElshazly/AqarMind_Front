import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/ApiConfig";
import {
  Home,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Settings,
  Bell,
  Search,
  Calendar,
  DollarSign,
  Eye,
  MessageSquareWarning,
} from "lucide-react";
import axios from "axios";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingLandlords: 0,
    pendingProperties: 0,
    totalLandlords: 0,
    totalTenants: 0,
    totalProperties: 0,
    acceptedProperties: 0,
    rejectedProperties: 0,
    monthlyRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/dashboard/user-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch Recent Activity
  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/dashboard/activity`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setRecentActivity(response.data);
    } catch (error) {
      console.error("Error fetching activity:", error);
      setRecentActivity([
        {
          id: 1,
          type: "property",
          message: "New property submitted - Modern Villa in New Cairo",
          user: "Ahmed Hassan",
          time: "2 mins ago",
          status: "pending",
        },
        {
          id: 2,
          type: "landlord",
          message: "New landlord registration - Mohamed Ali",
          user: "Mohamed Ali",
          time: "5 mins ago",
          status: "pending",
        },
        {
          id: 3,
          type: "approval",
          message: "Property approved - Luxury Apartment",
          user: "Sara Ahmed",
          time: "10 mins ago",
          status: "approved",
        },
        {
          id: 4,
          type: "rejection",
          message: "Property rejected - Incomplete documentation",
          user: "Khaled Mahmoud",
          time: "15 mins ago",
          status: "rejected",
        },
      ]);
    }
  };

  // Handle Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchRecentActivity()]);
    setRefreshing(false);
  };

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
        await Promise.all([fetchStats(), fetchRecentActivity()]);
      } catch (error) {
        console.error("Error initializing dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();

    // Auto refresh every minute
    const autoRefreshInterval = setInterval(() => {
      fetchStats();
    }, 60000);

    return () => clearInterval(autoRefreshInterval);
  }, [navigate]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
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
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="welcome-section">
            <h1 className="dashboard-title">
              Welcome back,{" "}
              <span className="highlight">{user?.name || "Admin"}</span>
            </h1>
            <p className="dashboard-date">
              <Calendar size={18} />
              {currentDate}
            </p>
          </div>
        </div>

        <div className="header-right">
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? "spinning" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}

      <div className="stats-grid">
        <div className="stat-card stat-approved">
          <div className="stat-icon">
            <CheckCircle size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Admins</p>
            <h3 className="stat-value">{stats.admins}</h3>
            <span className="stat-trend positive">
              <TrendingUp size={14} />
              +15% from last month
            </span>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Tenants</p>
            <h3 className="stat-value">{stats.tenants}</h3>
            <span className="stat-trend positive">
              <TrendingUp size={14} />
              +12% from last week
            </span>
          </div>
        </div>

        <div className="stat-card stat-landlords">
          <div className="stat-icon">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Landlords</p>
            <h3 className="stat-value">{stats.owners}</h3>
            <span className="stat-trend positive">
              <TrendingUp size={14} />
              +8% from last week
            </span>
          </div>
        </div>

        <div className="stat-card stat-users">
          <div className="stat-icon">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Users</p>
            <h3 className="stat-value">{stats.totalUsers}</h3>
            <span className="stat-trend positive">
              <TrendingUp size={14} />
              +20% from last month
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Quick Actions */}
        <div className="quick-actions-section">
          <div className="section-header">
            <h2 className="section-title">
              <Activity size={24} />
              Quick Actions
            </h2>
          </div>

          <div className="actions-grid">
            <Link
              to="/admin/pending-approvals"
              className="action-card action-properties"
            >
              <div className="action-icon">
                <Home size={32} />
              </div>
              <div className="action-content">
                <h3>Pending Properties</h3>
                <p>Review and approve property listings</p>
                {stats.pendingProperties > 0 && (
                  <span className="action-badge">
                    <AlertCircle size={14} />
                    {stats.pendingProperties} waiting
                  </span>
                )}
              </div>
            </Link>

            <Link
              to="/admin/pending-landlords"
              className="action-card action-landlords"
            >
              <div className="action-icon">
                <Users size={32} />
              </div>
              <div className="action-content">
                <h3>Approve Landlords</h3>
                <p>Review new registration requests</p>
                {stats.pendingLandlords > 0 && (
                  <span className="action-badge">
                    <AlertCircle size={14} />
                    {stats.pendingLandlords} pending
                  </span>
                )}
              </div>
            </Link>

            <Link to="/show-all-post" className="action-card action-view">
              <div className="action-icon">
                <Eye size={32} />
              </div>
              <div className="action-content">
                <h3>All Properties</h3>
                <p>View all property listings</p>
              </div>
            </Link>

            <Link
              to="/admin/manage-complaints"
              className="action-card action-reports"
            >
              {" "}
              <div className="action-icon">
                <MessageSquareWarning size={32} />
              </div>
              <div className="action-content">
                <h3>Complaints</h3>
                <p>View and manage complaints</p>
              </div>
            </Link>

            <Link
              to="/admin/SystemReports"
              className="action-card action-reports"
            >
              <div className="action-icon">
                <BarChart3 size={32} />
              </div>
              <div className="action-content">
                <h3>System Reports</h3>
                <p>View analytics and reports</p>
              </div>
            </Link>

            <Link
              to="/admin/showAnalytics"
              className="action-card action-analytics"
            >
              <div className="action-icon">
                <TrendingUp size={32} />
              </div>
              <div className="action-content">
                <h3>Analytics</h3>
                <p>View detailed analytics</p>
              </div>
            </Link>

            <Link
              to="/admin/landlord-applications"
              className="action-card action-applications"
            >
              <div className="action-icon">
                <Settings size={32} />
              </div>
              <div className="action-content">
                <h3>Manage Applications</h3>
                <p>Check pending applications</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <div className="section-header">
            <h2 className="section-title">
              <Activity size={24} />
              Recent Activity
            </h2>
            <span className="activity-count">
              {recentActivity.length} activities
            </span>
          </div>

          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className={`activity-item activity-${activity.status}`}
              >
                <div className="activity-icon">
                  {activity.status === "pending" && <Clock size={20} />}
                  {activity.status === "approved" && <CheckCircle size={20} />}
                  {activity.status === "rejected" && <XCircle size={20} />}
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <div className="activity-meta">
                    <span className="activity-user">{activity.user}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
                <span className={`activity-status status-${activity.status}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {(stats.pendingProperties > 10 || stats.pendingLandlords > 10) && (
        <div className="alerts-section">
          <div className="section-header">
            <h2 className="section-title">
              <AlertCircle size={24} />
              System Alerts
            </h2>
          </div>

          <div className="alerts-grid">
            {stats.pendingProperties > 10 && (
              <div className="alert-card alert-warning">
                <AlertCircle size={24} />
                <div className="alert-content">
                  <h4>High Pending Properties</h4>
                  <p>
                    {stats.pendingProperties} properties waiting for approval
                  </p>
                </div>
              </div>
            )}

            {stats.pendingLandlords > 10 && (
              <div className="alert-card alert-info">
                <AlertCircle size={24} />
                <div className="alert-content">
                  <h4>High Pending Landlords</h4>
                  <p>
                    {stats.pendingLandlords} registrations awaiting approval
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
