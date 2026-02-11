import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  User,
  Phone,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  File,
  Home,
  Calendar,
} from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/LandlordProposalManage.css";

const LandlordProposalManage = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    action: null,
    proposalId: null,
    confirmText: "Confirm",
    confirmColor: "bg-blue-600" // Optional if modal supports it, but standard props are enough
  });

  // Helper for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Status mapping helper
  const getStatusInfo = (status) => {
    switch (status) {
      case 1:
        return {
          label: "Accepted",
          class: "status-accepted",
          icon: CheckCircle,
        };
      case 2:
        return { label: "Rejected", class: "status-rejected", icon: XCircle };
      case 0:
      default:
        return { label: "Pending", class: "status-pending", icon: Clock };
    }
  };

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId) {
          throw new Error("User ID not found. Please log in.");
        }

        // Direct API call as requested
        const response = await axios.get(
          `https://localhost:7119/api/Landlord/proposals`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          },
        );

        // Handle both array and message object responses
        if (
          response.data &&
          typeof response.data === "object" &&
          response.data.message
        ) {
          // Backend returned a message (e.g., "No posts found for this landlord.")
          setProposals([]);
        } else {
          // Ensure we have an array
          const data = Array.isArray(response.data) ? response.data : [];
          setProposals(data);
        }
      } catch (err) {
        // Handle error responses
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Failed to load proposals.");
        }
        setProposals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const handleAccept = (proposalId) => {
    setModalConfig({
      title: "Accept Proposal",
      message: "Are you sure you want to accept this proposal?",
      action: "accept",
      proposalId: proposalId,
      confirmText: "Accept"
    });
    setModalOpen(true);
  };

  const handleReject = (proposalId) => {
    setModalConfig({
      title: "Reject Proposal",
      message: "Are you sure you want to reject this proposal?",
      action: "reject",
      proposalId: proposalId,
      confirmText: "Reject"
    });
    setModalOpen(true);
  };

  const performAction = async () => {
    const { action, proposalId } = modalConfig;
    if (!action || !proposalId) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      let url = "";
      let newStatus = 0;

      if (action === "accept") {
        url = `https://localhost:7119/api/Landlord/accept-waiting-proposal/${proposalId}`;
        newStatus = 1;
      } else if (action === "reject") {
        url = `https://localhost:7119/api/Landlord/reject-waiting-proposal/${proposalId}`;
        newStatus = 2;
      }

      await axios.put(
        url,
        {},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state to reflect change
      setProposals((prev) =>
        prev.map((p) =>
          p.proposalId === proposalId ? { ...p, proposalStatus: newStatus } : p
        )
      );
      
      setModalOpen(false);
    } catch (err) {
      console.error(`Error ${action}ing proposal:`, err);
      alert(`Failed to ${action} proposal. Please try again.`);
      setModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );

  // Only show error alert if it's not a "not found" type message
  if (error && !error.toString().toLowerCase().includes("no posts found")) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="proposal-manage-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">Manage Proposals</h1>
            <p className="dashboard-subtitle">
              Review offers from potential tenants
            </p>
          </div>
        </div>
      </div>

      <div className="proposals-grid">
        {proposals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-container">
              <Home size={48} strokeWidth={1.5} />
            </div>
            <h3>No Proposals Found</h3>
            <p>You haven't received any proposals yet.</p>
          </div>
        ) : (
          proposals.map((proposal) => {
            const status = getStatusInfo(proposal.proposalStatus);
            const StatusIcon = status.icon;

            return (
              <div key={proposal.proposalId} className="proposal-card">
                <div className="card-header">
                  <div className="tenant-info">
                    <div className="avatar-placeholder">
                      <User size={20} />
                    </div>
                    <div>
                      <h3>{proposal.tenantName}</h3>
                      <span className="post-title">
                        Property: {proposal.title}
                      </span>
                    </div>
                  </div>
                  <div className={`status-badge ${status.class}`}>
                    <StatusIcon size={14} />
                    {status.label}
                  </div>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <div className="info-item">
                      <span className="label">Offered Price:</span>
                      <span className="value price">
                        {proposal.offeredPrice?.toLocaleString()} EGP
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Phone:</span>
                      <span className="value">{proposal.phone}</span>
                    </div>
                  </div>

                  {(proposal.startRentalDate || proposal.endRentalDate) && (
                    <div className="info-row">
                      {proposal.startRentalDate && (
                        <div className="info-item">
                          <span className="label">Start Date:</span>
                          <span className="value">
                            <Calendar size={14} className="inline-icon" />
                            {formatDate(proposal.startRentalDate)}
                          </span>
                        </div>
                      )}
                      {proposal.endRentalDate && (
                        <div className="info-item">
                          <span className="label">End Date:</span>
                          <span className="value">
                            <Calendar size={14} className="inline-icon" />
                            {formatDate(proposal.endRentalDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="description-box">
                    <p>{proposal.description || "No description provided."}</p>
                  </div>

                  {proposal.filePath && (
                    <a
                      href={`https://localhost:7119/${proposal.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-link"
                    >
                      <File size={16} />
                      View Attachment
                    </a>
                  )}
                </div>

                {proposal.proposalStatus === 0 && (
                  <div className="card-actions">
                    <button
                      className="btn btn-accept"
                      onClick={() => handleAccept(proposal.proposalId)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-reject"
                      onClick={() => handleReject(proposal.proposalId)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => !isProcessing && setModalOpen(false)}
        onConfirm={performAction}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default LandlordProposalManage;
