import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaTrashAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHome,
  FaUser,
  FaPhone,
  FaSearch,
  FaChevronRight,
  FaDollarSign,
  FaCreditCard,
  FaQuestionCircle,
  FaTag,
} from "react-icons/fa";
import { RingLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/ApiConfig";
import "../styles/UserProposals.css";

const getUserId = () => localStorage.getItem("userId");
const getToken = () => localStorage.getItem("token");

const UserProposals = () => {
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const tenantId = getUserId();
  const token = getToken();

  useEffect(() => {
    const fetchMyProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Tenant/my-proposals/${tenantId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (Array.isArray(response.data)) {
          const sortedProposals = [...response.data].sort((a, b) => b.proposalId - a.proposalId);
          setMyProperties(sortedProposals);
        } else {
          setMyProperties([]);
        }
      } catch (err) {
        console.error("❌ Error fetching proposals:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load applications. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    if (tenantId && token) {
      fetchMyProperties();
    } else {
      setError("You need to login first");
      setLoading(false);
    }
  }, [tenantId, token]);

  const deleteProperty = async (proposalId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/api/Tenant/cancel-proposal/${proposalId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMyProperties(
          myProperties.filter((property) => property.proposalId !== proposalId)
        );
        toast.success("Proposal deleted successfully");
      } catch (err) {
        console.error("Error deleting property:", err);
        toast.error("Failed to delete property. Please try again later.");
      }
    }
  };

  const getProposalStatusLabel = (status) => {
    const numericStatus = Number(status);
    if (!isNaN(numericStatus) && status !== null && status !== "") {
      if (numericStatus === -1) return "Rejected";
      if (numericStatus === 0) return "Waiting";
      if (numericStatus === 1) return "Approved";
      if (numericStatus === 2) return "Uncertain";
    }
    return status;
  };

  const renderStatusBadge = (status) => {
    const label = getProposalStatusLabel(status);
    const statusConfig = {
      Waiting: { className: "property-status-pending", icon: <FaClock /> },
      Approved: { className: "property-status-approved", icon: <FaCheckCircle /> },
      Rejected: { className: "property-status-rejected", icon: <FaTimesCircle /> },
      Uncertain: { className: "property-status-uncertain", icon: <FaQuestionCircle /> },
    };

    const config = statusConfig[label] || { className: "property-status-default", icon: null };

    return (
      <div className={`property-status-badge ${config.className}`}>
        {config.icon}
        <span>{label}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="property-loading">
        <div className="property-spinner"></div>
        <p className="property-loading-text">Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="property-error">
        <div className="property-error-icon">
          <FaTimesCircle />
        </div>
        <h3 className="property-error-title">Oops! Something went wrong</h3>
        <p className="property-error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="property-error-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="user-properties-page">
      <header className="user-properties-header">
        <div className="user-properties-header-content">
          <h1 className="user-properties-title">My Proposals</h1>
          <p className="user-properties-subtitle">Track and manage your property applications</p>
        </div>
      </header>

      <main className="user-properties-container">
        {myProperties.length > 0 ? (
          <div className="user-properties-grid">
            {myProperties.map((property, index) => (
              <div
                key={property.proposalId}
                className="user-property-card"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="user-property-header">
                  <div className="user-property-header-info">
                    <div className="user-property-icon">
                      <FaHome />
                    </div>
                    <div className="user-property-meta">
                      <h3 className="user-property-id">Proposal #{property.proposalId}</h3>
                      <p className="user-property-date">
                        {property.createdDate ? new Date(property.createdDate).toLocaleDateString() : 'Recent Application'}
                      </p>
                    </div>
                  </div>
                  {renderStatusBadge(property.proposalStatus)}
                </div>

                <div className="user-property-details">
                  <div className="user-property-detail-item">
                    <div className="user-property-detail-icon"><FaPhone /></div>
                    <div className="user-property-detail-content">
                      <span className="user-property-detail-label">Contact</span>
                      <span className="user-property-detail-value">{property.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {property.landlordName && (
                    <div className="user-property-detail-item">
                      <div className="user-property-detail-icon"><FaUser /></div>
                      <div className="user-property-detail-content">
                        <span className="user-property-detail-label">Landlord</span>
                        <span className="user-property-detail-value">{property.landlordName}</span>
                      </div>
                    </div>
                  )}

                  <div className="user-property-detail-item">
                    <div className="user-property-detail-icon"><FaTag /></div>
                    <div className="user-property-detail-content">
                      <span className="user-property-detail-label">Property Type</span>
                      <span className="user-property-detail-value">
                        {property.propertyType === 1 ? "Sale" : "Rent"}
                      </span>
                    </div>
                  </div>

                  <div className="user-property-detail-item">
                    <div className="user-property-detail-icon"><FaCreditCard /></div>
                    <div className="user-property-detail-content">
                      <span className="user-property-detail-label">Payment Method</span>
                      <span className="user-property-detail-value">
                        {property.isInstallment === 1 ? "Installment" : "Cash"}
                      </span>
                    </div>
                  </div>

                  {(property.offeredPrice || property.Offeredprice) && (
                    <div className="user-property-detail-item">
                      <div className="user-property-detail-icon"><FaDollarSign /></div>
                      <div className="user-property-detail-content">
                        <span className="user-property-detail-label">Offered Price</span>
                        <span className="user-property-detail-value">
                          {(property.offeredPrice || property.Offeredprice).toLocaleString()} EGP
                        </span>
                      </div>
                    </div>
                  )}

                  {property.startRentalDate && property.endRentalDate && (
                    <div className="user-property-rental-period">
                      <div className="user-property-date-item">
                        <div className="user-property-date-icon start">
                          <FaCalendarAlt />
                        </div>
                        <div className="user-property-date-content">
                          <span className="user-property-date-label">Start Date</span>
                          <span className="user-property-date-value">
                            {new Date(property.startRentalDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="user-property-date-arrow"><FaChevronRight /></div>
                      <div className="user-property-date-item">
                        <div className="user-property-date-icon end">
                          <FaCalendarAlt />
                        </div>
                        <div className="user-property-date-content">
                          <span className="user-property-date-label">End Date</span>
                          <span className="user-property-date-value">
                            {new Date(property.endRentalDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="user-property-actions">
                  {property.proposalStatus === 1 && (
                    <button
                      className="user-property-btn user-property-btn-pay"
                    >
                      <FaCreditCard /> Initialize Payment
                    </button>
                  )}
                  <button
                    onClick={() => deleteProperty(property.proposalId)}
                    className="user-property-btn user-property-btn-danger"
                  >
                    <FaTrashAlt /> Delete Proposal
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="user-properties-empty">
            <div className="user-properties-empty-content">
              <div className="user-properties-empty-icon"><FaHome /></div>
              <h3 className="user-properties-empty-title">No Applications Yet</h3>
              <p className="user-properties-empty-text">
                You haven't applied to any properties yet. Start exploring and find your perfect home!
              </p>
              <button onClick={() => navigate("/properties")} className="user-properties-empty-btn">
                <FaSearch /> Browse Properties
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProposals;
