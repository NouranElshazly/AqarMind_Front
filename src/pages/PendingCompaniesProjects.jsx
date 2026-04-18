import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API_BASE_URL from "../services/ApiConfig";
import API, { fetchWaitingProjects, approveCompanyProject, rejectCompanyProject } from "../services/api";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  DollarSign,
  FileText,
  Calendar,
  Building,
  User,
  Mail,
  Layers,
  Square,
  Bed,
  Bath,
  Shield,
  Car,
  Wind,
  Droplets,
  Trees,
  Lock,
} from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/AdminPendingApprovals.css";

const ProjectDetails = ({ project, onApprove, onReject, actionLoading }) => {
  return (
    <div className="post-details fade-in">
      <div className="details-header">
        <h2>{project.projectName}</h2>
        <div className="details-actions">
          <button
            onClick={() => onApprove(project.projectId)}
            disabled={actionLoading}
            className="btn btn-approve"
          >
            <CheckCircle size={20} />
            {actionLoading ? "Processing..." : "Approve"}
          </button>
          <button
            onClick={() => onReject(project.projectId)}
            disabled={actionLoading}
            className="btn btn-reject"
          >
            <XCircle size={20} />
            {actionLoading ? "Processing..." : "Reject"}
          </button>
        </div>
      </div>

      {/* Project Basic Info */}
      <div className="details-section">
        <h3>
          <FileText size={20} />
          Description
        </h3>
        <p>{project.description || "No description provided."}</p>
      </div>

      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Location</span>
          <span className="detail-value">
            <MapPin size={18} />
            {project.location}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Total Floors</span>
          <span className="detail-value">
            <Layers size={18} />
            {project.totalFloors}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Project Type</span>
          <span className="detail-value">
            {project.type === 0 ? "For Rent" : "For Sale"}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Elevator</span>
          <span className="detail-value">
            {project.hasElevator ? "✓ Yes" : "✗ No"}
          </span>
        </div>
      </div>

      {/* Unit Templates */}
      {project.unitTemplates && project.unitTemplates.length > 0 && (
        <div className="details-section">
          <h3>
            <Layers size={20} />
            Unit Templates ({project.unitTemplates.length})
          </h3>
          <div className="unit-templates-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {project.unitTemplates.map((unit, idx) => (
              <div key={idx} className="unit-template-item" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border-primary)' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--brand-primary)' }}>{unit.title} (Code: {unit.unitCode})</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{unit.description}</p>
                <div className="unit-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                   <div className="unit-meta" style={{ fontSize: '0.85rem' }}>
                     <strong>Area:</strong> {unit.area} m²
                   </div>
                   <div className="unit-meta" style={{ fontSize: '0.85rem' }}>
                     <strong>Base Price:</strong> ${unit.basePrice?.toLocaleString()}
                   </div>
                   <div className="unit-meta" style={{ fontSize: '0.85rem' }}>
                     <strong>Rooms:</strong> {unit.numberOfRooms}
                   </div>
                   <div className="unit-meta" style={{ fontSize: '0.85rem' }}>
                     <strong>Increase/Floor:</strong> ${unit.priceIncreasePerFloor}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Info */}
      <div className="details-section landlord-section">
        <h3>
          <Building size={20} />
          Company Information
        </h3>
        <div className="landlord-info">
          <div className="landlord-detail">
            <Building size={16} />
            <span>{project.companyName || "N/A"}</span>
          </div>
          <div className="landlord-detail">
            <Mail size={16} />
            <span>{project.email || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Document */}
      {project.projectDocPath && (
        <div className="details-section">
          <h3>
            <FileText size={20} />
            Project Document
          </h3>
          <a
            href={`${API_BASE_URL}/${project.projectDocPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="document-link"
          >
            <FileText size={18} />
            View Project Document (PDF)
          </a>
        </div>
      )}
    </div>
  );
};

const PendingCompaniesProjects = () => {
  const [loading, setLoading] = useState(true);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "",
    cancelText: "Cancel",
    type: "danger",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const closeConfirmationModal = () => {
    setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetchWaitingProjects();
      setPendingProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching pending projects:", error);
      toast.error("Failed to load pending projects");
    } finally {
      setLoading(false);
    }
  };

  const performApprove = async (projectId) => {
    try {
      setActionLoading(true);
      await approveCompanyProject(projectId);
      setPendingProjects((prev) => prev.filter((p) => p.projectId !== projectId));
      setSelectedProject(null);
      toast.success("Project approved successfully!");
    } catch (error) {
      console.error("Error approving project:", error);
      toast.error(error.response?.data?.message || "Failed to approve project");
    } finally {
      setActionLoading(false);
      closeConfirmationModal();
    }
  };

  const handleApprove = (projectId) => {
    setConfirmationModal({
      isOpen: true,
      title: "Approve Project",
      message: "Are you sure you want to approve this real estate project?",
      confirmText: "Approve",
      type: "success",
      onConfirm: () => performApprove(projectId),
    });
  };

  const performReject = async (projectId) => {
    try {
      setActionLoading(true);
      await rejectCompanyProject(projectId);
      setPendingProjects((prev) => prev.filter((p) => p.projectId !== projectId));
      setSelectedProject(null);
      toast.success("Project rejected successfully!");
    } catch (error) {
      console.error("Error rejecting project:", error);
      toast.error(error.response?.data?.message || "Failed to reject project");
    } finally {
      setActionLoading(false);
      closeConfirmationModal();
    }
  };

  const handleReject = (projectId) => {
    setConfirmationModal({
      isOpen: true,
      title: "Reject Project",
      message: "Are you sure you want to reject this real estate project?",
      confirmText: "Reject",
      type: "danger",
      onConfirm: () => performReject(projectId),
    });
  };

  const ProjectCard = ({ project }) => (
    <div
      className={`pending-card ${
        selectedProject?.projectId === project.projectId ? "selected" : ""
      }`}
      onClick={() => setSelectedProject(project)}
    >
      <div className="pending-card-header">
        <div className="pending-info">
          <h3 className="pending-title">{project.projectName}</h3>
          <p className="pending-location">
            <MapPin size={16} />
            {project.location}
          </p>
        </div>
        <div className="pending-price">
          <Layers size={20} />
          <span>{project.totalFloors} Floors</span>
        </div>
      </div>

      <div className="pending-meta">
        <span className="pending-date">
          <Calendar size={14} />
          {new Date(project.createdAt || project.datePost).toLocaleDateString()}
        </span>
        <span className={`pending-type ${project.type === 0 ? "rent" : "sale"}`}>
          {project.type === 0 ? "For Rent" : "For Sale"}
        </span>
      </div>

      <div className="pending-landlord">
        <Building size={14} />
        <span>By: {project.companyName || project.userName}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading pending projects...</p>
      </div>
    );
  }

  return (
    <div className="admin-pending-container">
      <div className="admin-header">
        <div className="header-content">
          <Building className="header-icon" size={40} />
          <div>
            <h1 className="header-title">Pending Project Approvals</h1>
            <p className="header-subtitle">
              Review and approve company project listings ({pendingProjects.length}{" "}
              pending)
            </p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="pending-list">
          {pendingProjects.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={60} className="empty-icon" />
              <h3>All Caught Up!</h3>
              <p>No pending projects to review</p>
            </div>
          ) : (
            pendingProjects.map((project) => (
              <ProjectCard key={project.projectId} project={project} />
            ))
          )}
        </div>

        <div className="details-panel">
          {selectedProject ? (
            <ProjectDetails 
              project={selectedProject} 
              onApprove={handleApprove} 
              onReject={handleReject} 
              actionLoading={actionLoading} 
            />
          ) : (
            <div className="no-selection">
              <Eye size={60} className="no-selection-icon" />
              <h3>Select a Project</h3>
              <p>Click on a project from the list to view details</p>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        type={confirmationModal.type}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default PendingCompaniesProjects;
