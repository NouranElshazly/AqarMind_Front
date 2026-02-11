import { useState, useEffect } from "react";
import { approveLandlord, rejectLandlord } from "../services/api";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import "../styles/PendingApprovals.css";
import {
  Search,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Eye,
  Check,
  XCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  File,
  Download,
} from "lucide-react";

const PendingApprovals = () => {
  const [pendingLandlords, setPendingLandlords] = useState([]);
  const [filteredLandlords, setFilteredLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentType, setDocumentType] = useState("");

  useEffect(() => {
    const fetchPendingLandlords = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/waitingLandlords`,
        );
        setPendingLandlords(response.data);
        setFilteredLandlords(response.data);
      } catch (err) {
        setMessage("No data available");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingLandlords();
  }, []);

  // Filter landlords based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLandlords(pendingLandlords);
    } else {
      const filtered = pendingLandlords.filter(
        (landlord) =>
          landlord.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          landlord.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredLandlords(filtered);
    }
  }, [searchTerm, pendingLandlords]);

  const handleLandlordAction = async (userId, action) => {
    console.log(`Attempting to ${action} landlord with User ID:`, userId);
    if (!userId) {
      setError(`Invalid user ID. Cannot ${action}.`);
      return;
    }

    const originalLandlords = [...pendingLandlords];

    setPendingLandlords((prev) =>
      prev.filter((landlord) => landlord.userId !== userId),
    );

    try {
      if (action === "accept") {
        await approveLandlord(userId);
      } else if (action === "reject") {
        await rejectLandlord(userId);
      }
      setSuccessMessage(`Landlord ${action}ed successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(`Error ${action}ing landlord:`, err);
      setError(`Failed to ${action} landlord.`);
      // Restore original list on error
      setPendingLandlords(originalLandlords);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Document Modal Component
  const DocumentModal = () => {
    if (!selectedDocument) return null;

    const buildFileUrl = (path) => {
      if (!path) return "";
      // If it's a base64 string (starts with data:), return as is
      if (path.startsWith("data:")) return path;
      // If it's a full URL, return as is
      if (path.startsWith("http")) return path;
      // Otherwise prepend API_BASE_URL
      return `${API_BASE_URL}/${path}`;
    };

    const getFileType = (path) => {
      if (!path) return "unknown";
      // Remove query params and trim
      const cleanPath = path.split("?")[0].trim().toLowerCase();
      if (cleanPath.endsWith(".pdf")) return "pdf";
      if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(cleanPath)) return "image";
      return "unknown";
    };

    const fileUrl = buildFileUrl(selectedDocument);
    const fileType = getFileType(selectedDocument);

    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <button
            onClick={() => setSelectedDocument(null)}
            className="modal-close-btn"
          >
            <X size={24} />
          </button>

          <div className="modal-content w-full h-full flex items-center justify-center">
            {fileType === "pdf" ? (
              <iframe
                src={fileUrl}
                className="w-full h-[80vh] min-w-[80vw] border-0"
                title="Document Viewer"
              />
            ) : fileType === "image" ? (
              <img
                src={fileUrl}
                alt="Document Preview"
                className="modal-image"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg">
                <File size={64} className="text-gray-400 mb-4" />
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Preview not available
                </p>
                <p className="text-gray-500">
                  This file type cannot be previewed directly.
                </p>
              </div>
            )}
          </div>

          <div className="modal-action-wrapper flex gap-4 justify-center">
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="modal-action-btn flex items-center gap-2 no-underline"
              style={{ textDecoration: "none" }}
            >
              <Download size={20} />
              Download / Open
            </a>
            <button
              onClick={() => setSelectedDocument(null)}
              className="modal-action-btn bg-gray-600"
              style={{ background: "#4b5563" }}
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-wrapper">
          <div className="spinner-ring"></div>
          <div className="spinner-segment"></div>
        </div>
        <p className="loading-text">Loading pending landlords...</p>
        <p className="loading-subtext">Please wait</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-alert">
          <AlertCircle className="error-icon" />
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-approvals-wrapper">
      <DocumentModal />

      {/* Header */}
      <div className="header-section">
        <h1 className="page-title">Pending Landlord Approvals</h1>
        <p className="page-subtitle">
          Review and approve landlord registration requests
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search landlords by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Search className="search-icon" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="clear-search-btn"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <p className="search-stats">
          {filteredLandlords.length} landlord(s) found
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-alert">
          <CheckCircle className="success-icon" />
          <p className="success-text">{successMessage}</p>
        </div>
      )}

      {/* Landlords Grid */}
      {filteredLandlords.length > 0 ? (
        <div className="landlords-grid">
          {filteredLandlords.map((landlord) => (
            <div key={landlord.userId} className="landlord-card">
              {/* Card Header */}
              <div className="card-header-gradient">
                <h3 className="landlord-name">{landlord.userName}</h3>
                <span className="status-badge">
                  <Clock size={12} className="mr-1" />
                  Pending
                </span>
              </div>

              {/* Card Body */}
              <div className="card-body">
                <div className="info-group">
                  <div className="info-item">
                    <Mail className="info-icon" />
                    <div className="info-content">
                      <p className="info-value">{landlord.email}</p>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="documents-section">
                  <h4 className="documents-title">
                    <FileText size={16} />
                    Documents
                  </h4>
                  <div className="info-group">
                    {landlord.ownershipDocPath && (
                      <button
                        onClick={() => {
                          setSelectedDocument(landlord.ownershipDocPath);
                          setDocumentType("ownership");
                        }}
                        className="doc-button"
                      >
                        <FileText size={20} />
                        View Ownership Document
                      </button>
                    )}
                    {landlord.nidPath && (
                      <button
                        onClick={() => {
                          setSelectedDocument(landlord.nidPath);
                          setDocumentType("nid");
                        }}
                        className="doc-button"
                      >
                        <User size={20} />
                        View National ID
                      </button>
                    )}
                    {landlord.identityDocumentPath && !landlord.nidPath && (
                      <button
                        onClick={() => {
                          setSelectedDocument(landlord.identityDocumentPath);
                          setDocumentType("identity");
                        }}
                        className="doc-button"
                      >
                        <Eye size={20} />
                        View ID Document
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="card-actions">
                <button
                  onClick={() =>
                    handleLandlordAction(landlord.userId, "accept")
                  }
                  className="action-btn btn-approve"
                >
                  <Check size={20} />
                  Approve
                </button>
                <button
                  onClick={() =>
                    handleLandlordAction(landlord.userId, "reject")
                  }
                  className="action-btn btn-reject"
                >
                  <X size={20} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search className="empty-state-icon" />
          <p className="empty-state-text">
            {searchTerm
              ? "No landlords found matching your search"
              : "No pending landlord"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
