import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Home,
  FileText,
  DollarSign,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Download,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import "../styles/SystemReports.css";

const SystemReports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState("");

  const COLORS = ["#fbbf24", "#1e3a8a", "#10b981", "#ef4444", "#8b5cf6", "#f59e0b"];

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/Dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStatistics(response.data);
      console.log("Statistics:", response.data);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Failed to load statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchStatistics();
  };

  if (loading) {
    return (
      <div className="system-reports-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Statistics...</h2>
          <p>Please wait while we fetch the system data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="system-reports-error">
        <div className="error-content">
          <AlertCircle size={64} />
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={refreshData} className="btn btn-primary">
            <RefreshCw size={20} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  // Prepare chart data
  const userDistributionData = [
    { name: "Landlords", value: statistics.users.landlords },
    { name: "Tenants", value: statistics.users.tenants },
    { name: "Admins", value: statistics.users.admins },
  ];

  const postsStatusData = [
    { name: "Waiting", value: statistics.posts.waiting },
    { name: "Accepted", value: statistics.posts.accepted },
    { name: "Refused", value: statistics.posts.refused },
    { name: "Sold", value: statistics.posts.sold },
  ];

  const proposalsData = [
    { name: "Approved", value: statistics.proposals.approved },
    { name: "Waiting", value: statistics.proposals.waiting },
    { name: "Rejected", value: statistics.proposals.rejected },
  ];

  const complaintsData = [
    { name: "Spam", value: statistics.complaints.spam },
    { name: "Harassment", value: statistics.complaints.harassment },
    { name: "Fraud", value: statistics.complaints.fraud },
    { name: "Other", value: statistics.complaints.other },
  ];

  const priceDistributionData = [
    { name: "Very Low", value: statistics.posts.veryLowPrices },
    { name: "Low", value: statistics.posts.lowPrices },
    { name: "Acceptable", value: statistics.posts.acceptablePrices },
    { name: "High", value: statistics.posts.highPrices },
    { name: "Very High", value: statistics.posts.veryHighPrices },
  ];

  return (
    <div className="system-reports-container">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="header-title">System Reports & Analytics</h1>
            <p className="header-subtitle">
              Comprehensive overview of platform statistics and performance
            </p>
          </div>
          <button onClick={refreshData} className="btn btn-primary refresh-btn" disabled={loading}>
            <RefreshCw size={20} className={loading ? "spinning" : ""} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <TrendingUp size={18} />
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={18} />
          Users
        </button>
        <button
          className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          <Home size={18} />
          Properties
        </button>
        <button
          className={`tab-button ${activeTab === "financial" ? "active" : ""}`}
          onClick={() => setActiveTab("financial")}
        >
          <DollarSign size={18} />
          Financial
        </button>
        <button
          className={`tab-button ${activeTab === "complaints" ? "active" : ""}`}
          onClick={() => setActiveTab("complaints")}
        >
          <AlertCircle size={18} />
          Complaints
        </button>
      </div>

      {/* Content */}
      <div className="reports-content">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="tab-content fade-in">
            <div className="stats-grid">
              <div className="stat-card stat-users">
                <div className="stat-icon">
                  <Users size={32} />
                </div>
                <div className="stat-info">
                  <h3>Total Users</h3>
                  <p className="stat-value">{statistics.users.totalUsers}</p>
                  <span className="stat-change positive">
                    +{statistics.users.newUsersLastMonth} this month
                  </span>
                </div>
              </div>

              <div className="stat-card stat-posts">
                <div className="stat-icon">
                  <Home size={32} />
                </div>
                <div className="stat-info">
                  <h3>Total Properties</h3>
                  <p className="stat-value">{statistics.posts.total}</p>
                  <span className="stat-change positive">
                    +{statistics.posts.newLastMonth} this month
                  </span>
                </div>
              </div>

              <div className="stat-card stat-proposals">
                <div className="stat-icon">
                  <FileText size={32} />
                </div>
                <div className="stat-info">
                  <h3>Total Proposals</h3>
                  <p className="stat-value">{statistics.proposals.total}</p>
                  <span className="stat-change">
                    {statistics.proposals.approved} approved
                  </span>
                </div>
              </div>

              <div className="stat-card stat-revenue">
                <div className="stat-icon">
                  <DollarSign size={32} />
                </div>
                <div className="stat-info">
                  <h3>Gross Revenue</h3>
                  <p className="stat-value">${statistics.transactions.grossRevenue.toLocaleString()}</p>
                  <span className="stat-change">
                    {statistics.transactions.total} transactions
                  </span>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">User Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">Properties Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={postsStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="tab-content fade-in">
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Users</h4>
                <p className="stat-number">{statistics.users.totalUsers}</p>
              </div>
              <div className="stat-card">
                <h4>Landlords</h4>
                <p className="stat-number">{statistics.users.landlords}</p>
              </div>
              <div className="stat-card">
                <h4>Tenants</h4>
                <p className="stat-number">{statistics.users.tenants}</p>
              </div>
              <div className="stat-card">
                <h4>Admins</h4>
                <p className="stat-number">{statistics.users.admins}</p>
              </div>
              <div className="stat-card">
                <h4>New Users (Month)</h4>
                <p className="stat-number">{statistics.users.newUsersLastMonth}</p>
              </div>
              <div className="stat-card">
                <h4>Waiting Landlords</h4>
                <p className="stat-number">{statistics.users.waitingLandlords}</p>
              </div>
            </div>

            <div className="chart-card full-width">
              <h3 className="chart-title">User Distribution by Role</h3>
              <div className="chart-note">
                <AlertCircle size={16} />
                <p>Note: Users can have multiple roles. The sum of roles may exceed total users.</p>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="tab-content fade-in">
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Properties</h4>
                <p className="stat-number">{statistics.posts.total}</p>
              </div>
              <div className="stat-card">
                <h4>Waiting Approval</h4>
                <p className="stat-number">{statistics.posts.waiting}</p>
              </div>
              <div className="stat-card">
                <h4>Accepted</h4>
                <p className="stat-number">{statistics.posts.accepted}</p>
              </div>
              <div className="stat-card">
                <h4>Refused</h4>
                <p className="stat-number">{statistics.posts.refused}</p>
              </div>
              <div className="stat-card">
                <h4>Sold</h4>
                <p className="stat-number">{statistics.posts.sold}</p>
              </div>
              <div className="stat-card">
                <h4>Available</h4>
                <p className="stat-number">{statistics.posts.available}</p>
              </div>
              <div className="stat-card">
                <h4>New This Month</h4>
                <p className="stat-number">{statistics.posts.newLastMonth}</p>
              </div>
              <div className="stat-card">
                <h4>Fraudulent</h4>
                <p className="stat-number">{statistics.posts.fraudulent}</p>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">Properties by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={postsStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#1e3a8a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">Price Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="info-cards">
              <div className="info-card warning">
                <AlertCircle size={24} />
                <div>
                  <h4>Uncertain Files</h4>
                  <p>{statistics.posts.uncertainFile} properties with uncertain documentation</p>
                </div>
              </div>
              <div className="info-card warning">
                <AlertCircle size={24} />
                <div>
                  <h4>Abnormal Prices</h4>
                  <p>{statistics.posts.abnormalPrices} properties with abnormal pricing</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === "financial" && (
          <div className="tab-content fade-in">
            <div className="stats-grid">
              <div className="stat-card stat-revenue">
                <h4>Gross Revenue</h4>
                <p className="stat-number">${statistics.transactions.grossRevenue.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h4>Total Transactions</h4>
                <p className="stat-number">{statistics.transactions.total}</p>
              </div>
              <div className="stat-card">
                <h4>Succeeded</h4>
                <p className="stat-number">{statistics.transactions.succeeded}</p>
              </div>
              <div className="stat-card">
                <h4>Pending</h4>
                <p className="stat-number">{statistics.transactions.pending}</p>
              </div>
              <div className="stat-card">
                <h4>Failed</h4>
                <p className="stat-number">{statistics.transactions.failed}</p>
              </div>
              <div className="stat-card">
                <h4>Fee Amount</h4>
                <p className="stat-number">${statistics.transactions.feeAmount.toLocaleString()}</p>
              </div>
            </div>

            <h3 className="section-title">Revenue Breakdown</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Rent Revenue</h4>
                <p className="stat-number">${statistics.transactions.rentRevenue.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h4>Sale Cash Revenue</h4>
                <p className="stat-number">${statistics.transactions.saleCashRevenue.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h4>Sale Installment</h4>
                <p className="stat-number">${statistics.transactions.saleInstallmentRevenue.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h4>Subscription Revenue</h4>
                <p className="stat-number">${statistics.transactions.subscriptionRevenue.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h4>Monthly Subscription</h4>
                <p className="stat-number">${statistics.transactions.monthlySubscriptionRevenue.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h4>Active Subscriptions</h4>
                <p className="stat-number">{statistics.transactions.activeSubscriptionCount}</p>
              </div>
            </div>

            <h3 className="section-title">Payment Plans</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Plans</h4>
                <p className="stat-number">{statistics.payments.totalPlans}</p>
              </div>
              <div className="stat-card">
                <h4>Active Plans</h4>
                <p className="stat-number">{statistics.payments.activePlans}</p>
              </div>
              <div className="stat-card">
                <h4>Completed Plans</h4>
                <p className="stat-number">{statistics.payments.completedPlans}</p>
              </div>
              <div className="stat-card">
                <h4>Cancelled Plans</h4>
                <p className="stat-number">{statistics.payments.cancelledPlans}</p>
              </div>
              <div className="stat-card">
                <h4>Overdue Installments</h4>
                <p className="stat-number">{statistics.payments.overdueInstallments}</p>
              </div>
              <div className="stat-card">
                <h4>On-Time Rate</h4>
                <p className="stat-number">{statistics.payments.onTimeRate}%</p>
              </div>
            </div>

            <h3 className="section-title">Proposals</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Proposals</h4>
                <p className="stat-number">{statistics.proposals.total}</p>
              </div>
              <div className="stat-card">
                <h4>Approved</h4>
                <p className="stat-number">{statistics.proposals.approved}</p>
              </div>
              <div className="stat-card">
                <h4>Waiting</h4>
                <p className="stat-number">{statistics.proposals.waiting}</p>
              </div>
              <div className="stat-card">
                <h4>Rejected</h4>
                <p className="stat-number">{statistics.proposals.rejected}</p>
              </div>
              <div className="stat-card">
                <h4>Posts with Proposals</h4>
                <p className="stat-number">{statistics.proposals.postsWithProposals}</p>
              </div>
              <div className="stat-card">
                <h4>Conversion Rate</h4>
                <p className="stat-number">{statistics.proposals.postsToProposalsPercentage}%</p>
              </div>
            </div>

            <div className="chart-card full-width">
              <h3 className="chart-title">Proposals Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={proposalsData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {proposalsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === "complaints" && (
          <div className="tab-content fade-in">
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Complaints</h4>
                <p className="stat-number">{statistics.complaints.total}</p>
              </div>
              <div className="stat-card">
                <h4>Spam</h4>
                <p className="stat-number">{statistics.complaints.spam}</p>
              </div>
              <div className="stat-card">
                <h4>Harassment</h4>
                <p className="stat-number">{statistics.complaints.harassment}</p>
              </div>
              <div className="stat-card">
                <h4>Fraud</h4>
                <p className="stat-number">{statistics.complaints.fraud}</p>
              </div>
              <div className="stat-card">
                <h4>Other</h4>
                <p className="stat-number">{statistics.complaints.other}</p>
              </div>
            </div>

            <h3 className="section-title">Complaint Status</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Pending</h4>
                <p className="stat-number">{statistics.complaints.pending}</p>
              </div>
              <div className="stat-card">
                <h4>Action Taken</h4>
                <p className="stat-number">{statistics.complaints.actionTaken}</p>
              </div>
              <div className="stat-card">
                <h4>Rejected</h4>
                <p className="stat-number">{statistics.complaints.rejected}</p>
              </div>
            </div>

            <div className="chart-card full-width">
              <h3 className="chart-title">Complaints by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complaintsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemReports;