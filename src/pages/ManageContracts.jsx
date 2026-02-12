import React, { useState, useEffect } from "react";
import { 
  FaFileContract, 
  FaCalendarAlt, 
  FaChevronRight, 
  FaFileSignature, 
  FaHome,
  FaEye,
  FaUser,
  FaPhone,
  FaMoneyBillWave
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/ApiConfig";
import "../styles/ManageContracts.css";
import { RingLoader } from "react-spinners";

const ManageContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/contracts/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle response data - assuming it might be wrapped or direct array
      const data = Array.isArray(response.data) ? response.data : (response.data.contracts || []);
      setContracts(data);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "draft";
    const lowerStatus = status.toString().toLowerCase();
    if (lowerStatus.includes("accept") || lowerStatus === "1") return "accepted";
    if (lowerStatus.includes("reject") || lowerStatus === "-1") return "rejected";
    if (lowerStatus.includes("pending") || lowerStatus === "0") return "pending";
    return "draft";
  };

  const getStatusLabel = (status) => {
    if (!status) return "Draft";
    const lowerStatus = status.toString().toLowerCase();
    if (lowerStatus === "draft") return "Draft";
    if (lowerStatus === "signed") return "Signed";
    if (lowerStatus === "cancelled") return "Cancelled";
    return status;
  };

  const filterContracts = () => {
    if (activeTab === "All") return contracts;
    
    return contracts.filter(contract => {
      const status = getStatusLabel(contract.status).toLowerCase();
      if (activeTab === "Draft") return status === "draft";
      if (activeTab === "Signed") return status === "signed";
      return true;
    });
  };

  const filteredContracts = filterContracts();
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const currentContracts = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContractTypeLabel = (type) => {
    if (type === "SaleCash") return "Sale (Cash)";
    if (type === "SaleInstallment") return "Sale (Installment)";
    if (type === "Rent") return "Rent";
    return type;
  };

  return (
    <div className="manage-contracts-page">
      <div className="contracts-container">
        {/* Header */}
        <div className="contracts-header">
          <div className="header-title-row">
            <div className="header-icon">
              <FaFileContract />
            </div>
            <div>
              <h1>My Contracts</h1>
              <p className="header-subtitle">
                View and manage your contracts below.<br />
                Track status, open details, and finalize your agreements.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="contracts-tabs">
          {["All", "Draft", "Signed"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="contracts-list">
          {loading ? (
            <div className="loading-state">
              <RingLoader color="#f59e0b" size={60} />
              <p style={{ marginTop: "1rem" }}>Loading contracts...</p>
            </div>
          ) : currentContracts.length > 0 ? (
            currentContracts.map((contract, index) => (
              <div key={contract.contractId || index} className="contract-card">
                <div className="card-header">
                  <div className="card-icon-title">
                    <div className={`card-icon ${contract.type?.startsWith("Sale") ? "sale" : "rent"}`}>
                      {contract.type?.startsWith("Sale") ? <FaHome /> : <FaFileContract />}
                    </div>
                    <div>
                      <span className="card-title">
                        {getContractTypeLabel(contract.type)}
                      </span>
                      <div className="property-title-subtitle">
                        {contract.property?.title }
                      </div>
                    </div>
                  </div>
                  <div className="header-right-side">
                    
                    <span className={`status-badge ${getStatusColor(contract.status)}`}>
                      {getStatusLabel(contract.status)}
                    </span>
                  </div>
                </div>

                <div className="card-body-content">
                  <div className="card-info-grid">
                    <div className="info-item">
                      <span className="info-label">My Role</span>
                      <span className="info-value role-badge">
                        {contract.ui?.myRole || contract.myRole}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Other Party</span>
                      <span className="info-value other-party-info">
                        <div className="party-name"><FaUser size={12} /> {contract.otherParty?.name || "N/A"}</div>
                        <div className="party-phone"><FaPhone size={12} /> {contract.otherParty?.phone || "N/A"}</div>
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Created At</span>
                      <span className="info-value date-text">
                        <FaCalendarAlt size={12} /> {formatDate(contract.createdAt)}
                      </span>
                    </div>
                    {contract.property?.price && (
                      <div className="info-item">
                        <span className="info-label">Price</span>
                        <span className="info-value price-text">
                          <FaMoneyBillWave size={12} /> {contract.property.price.toLocaleString()} EGP
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="signatures-status">
                    <div className={`signature-check ${contract.signatures?.buyerSigned || contract.buyerSigned ? "signed" : "unsigned"}`}>
                      <div className="check-circle">
                        {(contract.signatures?.buyerSigned || contract.buyerSigned) && <FaFileSignature />}
                      </div>
                      <span>Buyer Signed</span>
                    </div>
                    <div className={`signature-check ${contract.signatures?.sellerSigned || contract.sellerSigned ? "signed" : "unsigned"}`}>
                      <div className="check-circle">
                        {(contract.signatures?.sellerSigned || contract.sellerSigned) && <FaFileSignature />}
                      </div>
                      <span>Seller Signed</span>
                    </div>
                  </div>
                  
                  {(contract.ui?.nextAction || contract.nextAction) && (
                    <div className="next-action-tip">
                      <span className="tip-label">Next Action:</span>
                      <span className="tip-value">{contract.ui?.nextAction || contract.nextAction}</span>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button 
                    className="view-details-btn-enhanced"
                    onClick={() => navigate(`/contract-details/${contract.contractId}`)}
                  >
                    <span>View Contract Details</span>
                    <FaChevronRight className="arrow-icon" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <FaFileSignature className="empty-icon" />
              <h3>No contracts found</h3>
              <p>You don't have any contracts in this category yet.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className="page-btn" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageContracts;
