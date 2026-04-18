import { useState, useEffect } from "react";
import API, { fetchWaitingCompanies, approveCompany, rejectCompany } from "../services/api";
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
  Building,
} from "lucide-react";
import { toast } from "react-toastify";

const PendingApprovalsCompanies = () => {
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetchWaitingCompanies();
        setPendingCompanies(response.data);
        setFilteredCompanies(response.data);
      } catch (err) {
        setError("Failed to load pending companies.");
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  // Filter companies based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCompanies(pendingCompanies);
    } else {
      const filtered = pendingCompanies.filter(
        (company) =>
          company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [searchTerm, pendingCompanies]);

  const handleCompanyAction = async (userId, action) => {
    if (!userId) {
      toast.error(`Invalid user ID. Cannot ${action}.`);
      return;
    }
    const originalCompanies = [...pendingCompanies];
    setPendingCompanies((prev) =>
      prev.filter((company) => company.userId !== userId)
    );
    try {
      if (action === "accept") {
        await approveCompany(userId);
      } else if (action === "reject") {
        await rejectCompany(userId);
      }
      setSuccessMessage(`Company ${action}ed successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      toast.error(`Failed to ${action} company.`);
      setPendingCompanies(originalCompanies);
    }
  };

  const DocumentModal = () => {
    if (!selectedDocument) return null;

    const buildFileUrl = (path) => {
      if (!path) return "";
      if (path.startsWith("data:")) return path;
      if (path.startsWith("http")) return path;
      return `${API_BASE_URL}/${path}`;
    };

    const getFileType = (path) => {
      if (!path) return "unknown";
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
        <p className="loading-text">Loading pending companies...</p>
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

      <div className="header-section">
        <h1 className="page-title">Pending Company Approvals</h1>
        <p className="page-subtitle">
          Review and approve company registration requests
        </p>
      </div>

      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search companies by name or email..."
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
          {filteredCompanies.length} company(s) found
        </p>
      </div>

      {successMessage && (
        <div className="success-alert">
          <CheckCircle className="success-icon" />
          <p className="success-text">{successMessage}</p>
        </div>
      )}

      {filteredCompanies.length > 0 ? (
        <div className="landlords-grid">
          {filteredCompanies.map((company) => (
            <div key={company.userId} className="landlord-card">
              <div className="card-header-gradient">
                <h3 className="landlord-name">{company.companyName || company.userName}</h3>
                <span className="status-badge">
                  <Clock size={12} className="mr-1" />
                  Pending
                </span>
              </div>

              <div className="card-body">
                <div className="info-group">
                  <div className="info-item">
                    <Mail className="info-icon" />
                    <div className="info-content">
                      <p className="info-value">{company.email}</p>
                    </div>
                  </div>
                  {company.userName && company.companyName && (
                    <div className="info-item">
                      <User className="info-icon" />
                      <div className="info-content">
                        <p className="info-value">{company.userName}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="documents-section">
                  <h4 className="documents-title">
                    <FileText size={16} />
                    Documents
                  </h4>
                  <div className="info-group">
                    {(company.commercialRegisterDocPath || company.commercialRegisterFile) && (
                      <button
                        onClick={() => {
                          setSelectedDocument(company.commercialRegisterDocPath || company.commercialRegisterFile);
                        }}
                        className="doc-button"
                      >
                        <Building size={20} />
                        View Commercial Register
                      </button>
                    )}
                    {company.nidPath && (
                      <button
                        onClick={() => {
                          setSelectedDocument(company.nidPath);
                        }}
                        className="doc-button"
                      >
                        <User size={20} />
                        View National ID
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() =>
                    handleCompanyAction(company.userId, "accept")
                  }
                  className="action-btn btn-approve"
                >
                  <Check size={20} />
                  Approve
                </button>
                <button
                  onClick={() =>
                    handleCompanyAction(company.userId, "reject")
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
              ? "No companies found matching your search"
              : "No pending companies"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsCompanies;
