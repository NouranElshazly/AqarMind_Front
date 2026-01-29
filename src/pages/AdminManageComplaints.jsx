import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Search,
  MessageSquareWarning,
  User,
  AlertCircle,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  Phone,
  Mail,
  XCircle,
  TriangleAlert,
  Ban,
  Clock,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import "../styles/AdminManageComplaints.css";

const NotificationToast = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`notification-toast ${type}`}>
      {type === "success" ? (
        <CheckCircle size={20} />
      ) : (
        <AlertCircle size={20} />
      )}
      <span>{message}</span>
    </div>
  );
};

const RefuseConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-icon-wrapper">
            <TriangleAlert size={24} />
          </div>
          <h3 className="modal-title">Refuse Complaint</h3>
        </div>
        <p className="modal-message">
          Are you sure you want to refuse this complaint? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button onClick={onClose} className="modal-btn cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="modal-btn confirm">
            Yes, Refuse
          </button>
        </div>
      </div>
    </div>
  );
};

const BanConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-icon-wrapper ban-icon-wrapper">
            <Ban size={24} />
          </div>
          <h3 className="modal-title">Ban User</h3>
        </div>
        <p className="modal-message">
          Are you sure you want to ban this user? This action will block their access and resolve the complaint.
        </p>
        <div className="modal-actions">
          <button onClick={onClose} className="modal-btn cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="modal-btn ban-confirm">
            Yes, Ban User
          </button>
        </div>
      </div>
    </div>
  );
};

const SuspendConfirmModal = ({ isOpen, onClose, onConfirm, days, setDays }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-icon-wrapper suspend-icon-wrapper">
            <Clock size={24} />
          </div>
          <h3 className="modal-title">Suspend User</h3>
        </div>
        <p className="modal-message">
          How many days do you want to suspend this user? This will temporarily restrict their access and resolve the complaint.
        </p>
        <div className="modal-input-group">
          <label htmlFor="suspendDays" className="modal-label">
            Suspension Duration (days)
          </label>
          <input
            id="suspendDays"
            type="number"
            min="1"
            max="365"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="modal-input"
            placeholder="Enter number of days"
          />
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="modal-btn cancel">
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="modal-btn suspend-confirm"
            disabled={!days || days < 1}
          >
            Yes, Suspend User
          </button>
        </div>
      </div>
    </div>
  );
};

const getComplaintType = (type) => {
  switch (type) {
    case 0:
      return "Spam";
    case 1:
      return "Harassment";
    case 2:
      return "Fraud";
    case 3:
      return "Other";
    default:
      return "Unknown";
  }
};

const getComplaintStatus = (status) => {
  switch (status) {
    case 1:
      return "Pending";
    case 2:
      return "Action Taken";
    case 3:
      return "Rejected";
    default:
      return "Unknown";
  }
};

const ComplaintDetails = ({ complaint, onRefuse, onBan, onSuspend }) => {
  return (
    <div className="post-details fade-in">
      <div className="details-header flex justify-between items-start">
        <div>
          <h2 className="details-title">Complaint Details</h2>
          <span className="complaint-date">
            <Calendar size={16} className="inline mr-1" />
            {new Date(complaint.createdAt).toLocaleString(undefined, {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onRefuse(complaint.complaintId)}
            className="refuse-btn"
          >
            <XCircle size={20} />
            Refuse Complaint
          </button>
          <button
            onClick={() => onSuspend(complaint.complaintId)}
            className="suspend-btn"
          >
            <Clock size={20} />
            Suspend User
          </button>
          <button
            onClick={() => onBan(complaint.complaintId)}
            className="ban-btn"
          >
            <Ban size={20} />
            Ban User
          </button>
        </div>
      </div>

      <div className="details-section">
        <h3>
          <AlertCircle size={20} />
          Content
        </h3>
        <p className="text-lg leading-relaxed">{complaint.content}</p>
      </div>

      {complaint.imagePath && (
        <div className="details-section">
          <h3>
            <ImageIcon size={20} />
            Attachment
          </h3>
          <img
            src={`${API_BASE_URL}/${complaint.imagePath}`}
            alt="Complaint Attachment"
            className="complaint-image"
            onError={(e) => (e.target.src = "/placeholder.jpg")}
          />
        </div>
      )}

      <div className="details-section">
        <h3>
          <User size={20} />
          Involved Parties
        </h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Reporter (Plaintiff)</span>
            <div className="detail-contact-group">
              <span className="detail-value with-icon">
                <User size={16} />
                {complaint.reporterName}
              </span>
              {complaint.reporterPhone && (
                <span className="detail-contact-info">
                  <Phone size={14} />
                  {complaint.reporterPhone}
                </span>
              )}
              {complaint.reporterEmail && (
                <span className="detail-contact-info">
                  <Mail size={14} />
                  {complaint.reporterEmail}
                </span>
              )}
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-label">Reported User (Defendant)</span>
            <span className="detail-value with-icon">
              <User size={16} />
              {complaint.reportedName}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Complaint Type</span>
            <span className="detail-value">
              {getComplaintType(complaint.type)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className="detail-value">
              {getComplaintStatus(complaint.status)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminManageComplaints = () => {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [complaintToRefuse, setComplaintToRefuse] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [complaintToBan, setComplaintToBan] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [complaintToSuspend, setComplaintToSuspend] = useState(null);
  const [suspendDays, setSuspendDays] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/Complaint/pending`,
        {
          withCredentials: true, // Include if you need cookies/auth
        },
      );
      setComplaints(response.data || []);
      setFilteredComplaints(response.data || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    let result = complaints;

    if (filter !== "all") {
      if (filter === "pending") result = result.filter((c) => c.status === 1);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.reporterName.toLowerCase().includes(lowerTerm) ||
          c.reportedName.toLowerCase().includes(lowerTerm) ||
          c.content.toLowerCase().includes(lowerTerm),
      );
    }

    setFilteredComplaints(result);
  }, [complaints, filter, searchTerm]);

  const handleSelectComplaint = async (complaint) => {
    setSelectedComplaint(complaint); // Show basic info immediately

    try {
      setDetailsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/Complaint/${complaint.complaintId}`,
        {
          withCredentials: true,
        },
      );
      if (response.data) {
        setSelectedComplaint(response.data);
      }
    } catch (error) {
      console.error("Error fetching complaint details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRefuse = (complaintId) => {
    setComplaintToRefuse(complaintId);
    setShowRefuseModal(true);
  };

  const handleBan = (complaintId) => {
    setComplaintToBan(complaintId);
    setShowBanModal(true);
  };

  const handleSuspend = (complaintId) => {
    setComplaintToSuspend(complaintId);
    setSuspendDays("");
    setShowSuspendModal(true);
  };

  const confirmRefuse = async () => {
    if (!complaintToRefuse) return;

    try {
      setDetailsLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/api/Complaint/refuse/${complaintToRefuse}`,
        {},
        {
          withCredentials: true,
        }
      );
      
      if (response.data && response.data.success) {
        showNotification(response.data.message, "success");
        setSelectedComplaint(null);
        setComplaints((prev) =>
          prev.filter((c) => c.complaintId !== complaintToRefuse)
        );
      }
    } catch (error) {
      showNotification("Failed to refuse complaint. Please try again.", "error");
    } finally {
      setDetailsLoading(false);
      setShowRefuseModal(false);
      setComplaintToRefuse(null);
    }
  };

  const confirmBan = async () => {
    if (!complaintToBan) return;

    try {
      setDetailsLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/api/Complaint/ban/${complaintToBan}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data && response.data.success) {
        showNotification(response.data.message, "success");
        setSelectedComplaint(null);
        setComplaints((prev) =>
          prev.filter((c) => c.complaintId !== complaintToBan)
        );
      }
    } catch (error) {
      console.error("Error banning user:", error);
      showNotification("Failed to ban user. Please try again.", "error");
    } finally {
      setDetailsLoading(false);
      setShowBanModal(false);
      setComplaintToBan(null);
    }
  };

  const confirmSuspend = async () => {
    if (!complaintToSuspend || !suspendDays || suspendDays < 1) return;

    try {
      setDetailsLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/api/Complaint/suspend/${complaintToSuspend}/${suspendDays}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data && response.data.success) {
        showNotification(response.data.message, "success");
        setSelectedComplaint(null);
        setComplaints((prev) =>
          prev.filter((c) => c.complaintId !== complaintToSuspend)
        );
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      showNotification("Failed to suspend user. Please try again.", "error");
    } finally {
      setDetailsLoading(false);
      setShowSuspendModal(false);
      setComplaintToSuspend(null);
      setSuspendDays("");
    }
  };

  const ComplaintCard = ({ complaint }) => (
    <div
      className={`complaint-card ${
        selectedComplaint?.complaintId === complaint.complaintId
          ? "selected"
          : ""
      }`}
      onClick={() => handleSelectComplaint(complaint)}
    >
      <div className="complaint-card-header">
        <span className="complaint-reporter">{complaint.reporterName}</span>
        <span className="complaint-date">
          {new Date(complaint.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="complaint-preview">{complaint.content}</p>
      <div className="complaint-meta">
        <span className="complaint-type">
          {getComplaintType(complaint.type)}
        </span>
        <span className="text-xs text-gray-500">
          vs {complaint.reportedName}
        </span>
      </div>
    </div>
  );

  return (
    <div className="complaints-container">
      <header className="complaints-header">
        <div className="header-content">
          <MessageSquareWarning className="header-icon" />
          <div>
            <h1 className="header-title">Manage Complaints</h1>
            <p className="header-subtitle">
              Review and resolve user complaints ({filteredComplaints.length}{" "}
              pending)
            </p>
          </div>
        </div>

        <div className="complaints-controls">
          <div className="control-group">
            <Search className="control-icon" size={20} />
            <input
              type="text"
              placeholder="Search by name or content..."
              className="control-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="refresh-btn"
            onClick={fetchComplaints}
            disabled={loading}
          >
            <RefreshCw
              className={`refresh-icon ${loading ? "animate-spin" : ""}`}
              size={20}
            />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </header>

      <div className="complaints-content">
        <div className="complaints-list">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="loading-spinner"></div>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} className="empty-icon" />
              <h3>No Complaints Found</h3>
              <p>Everything looks good!</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.complaintId}
                complaint={complaint}
              />
            ))
          )}
        </div>

        <div className="details-panel">
          {selectedComplaint ? (
            detailsLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <ComplaintDetails 
                complaint={selectedComplaint} 
                onRefuse={handleRefuse}
                onBan={handleBan}
                onSuspend={handleSuspend}
              />
            )
          ) : (
            <div className="no-selection">
              <Eye size={60} className="no-selection-icon" />
              <h3>Select a Complaint</h3>
              <p>Click on a complaint from the list to view details</p>
            </div>
          )}
        </div>
      </div>
      <RefuseConfirmModal 
        isOpen={showRefuseModal} 
        onClose={() => setShowRefuseModal(false)} 
        onConfirm={confirmRefuse} 
      />
      <BanConfirmModal 
        isOpen={showBanModal} 
        onClose={() => setShowBanModal(false)} 
        onConfirm={confirmBan} 
      />
      <SuspendConfirmModal 
        isOpen={showSuspendModal} 
        onClose={() => {
          setShowSuspendModal(false);
          setSuspendDays("");
        }} 
        onConfirm={confirmSuspend}
        days={suspendDays}
        setDays={setSuspendDays}
      />
      <NotificationToast
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default AdminManageComplaints;