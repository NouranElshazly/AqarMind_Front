import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API, { getCompanyProjects, deleteCompanyProject } from "../services/api";
import API_BASE_URL from "../services/ApiConfig";
import {
  Home,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Trash2,
  DollarSign,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Activity,
  Building,
} from "lucide-react";
import "../styles/LandlordDashboard.css"; // Reusing the same CSS

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const [projects, setProjects] = useState({
    all: [],
    pending: [],
    accepted: [],
    rejected: [],
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  const isDeletingRef = useRef(false);
  const lastFetchRef = useRef(0);

  // Get user profile and check role
  const getProfile = () => {
    try {
      const profile = localStorage.getItem("profile");
      if (profile) return JSON.parse(profile);
      return null;
    } catch (e) {
      console.error("Error getting profile:", e);
      return null;
    }
  };

  const profile = getProfile();
  const userData = profile?.user;
  const userId = userData?._id || localStorage.getItem("userId");

  useEffect(() => {
    // Role protection
    if (!userData || userData.role?.toLowerCase() !== "company") {
      navigate("/unauthorized");
      return;
    }
    fetchProjects();
  }, [navigate]);

  useEffect(() => {
    const handleFocus = () => {
      if (isDeletingRef.current) return;
      const now = Date.now();
      if (now - lastFetchRef.current < 5000) return;
      lastFetchRef.current = now;
      fetchProjects();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const fetchProjects = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Using company specific endpoint
      const response = await getCompanyProjects();
      const allProjects = response.data || [];

      // Assuming projects have a pendingStatus similar to landlord posts
      const pending = allProjects.filter((p) => p.pendingStatus === 0);
      const accepted = allProjects.filter((p) => p.pendingStatus === 1);
      const rejected = allProjects.filter((p) => p.pendingStatus === -1);

      setProjects({
        all: allProjects,
        pending: pending,
        accepted: accepted,
        rejected: rejected,
      });

      setStats({
        total: allProjects.length,
        pending: pending.length,
        accepted: accepted.length,
        rejected: rejected.length,
      });

      const initialIndexes = {};
      allProjects.forEach((p) => {
        initialIndexes[p.projectId] = 0;
      });
      setCurrentImageIndexes(initialIndexes);
    } catch (error) {
      console.error("Error fetching company projects:", error);
      toast.error("Failed to load your projects.");
    } finally {
      setLoading(false);
    }
  };

  const nextImage = (id, length, e) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [id]: (prev[id] + 1) % length,
    }));
  };

  const prevImage = (id, length, e) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [id]: prev[id] === 0 ? length - 1 : prev[id] - 1,
    }));
  };

  const handleDelete = async (projectId) => {
    if (isDeletingRef.current) return;

    if (window.confirm("Are you sure you want to delete this project?")) {
      isDeletingRef.current = true;
      try {
        await deleteCompanyProject(projectId);
        toast.success("Project deleted successfully");
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project");
      } finally {
        isDeletingRef.current = false;
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      0: { label: "Pending", color: "warning", icon: Clock },
      1: { label: "Accepted", color: "success", icon: CheckCircle },
      "-1": { label: "Rejected", color: "error", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig[0];
    const Icon = config.icon;

    return (
      <span className={`status-badge status-${config.color}`}>
        <Icon size={16} />
        {config.label}
      </span>
    );
  };

  const ProjectCard = ({ project }) => {
    const currentIndex = currentImageIndexes[project.projectId] || 0;
    
    // Process project images (projects might have different structure than landlord posts)
    let allImages = [];
    if (project.projectImages && project.projectImages.length > 0) {
      allImages = project.projectImages.map(img => {
        const path = img.imagePath || img;
        if (path.startsWith("http") || path.startsWith("data:")) return path;
        return `${API_BASE_URL}/${path.startsWith("/") ? path.slice(1) : path}`;
      });
    } else if (project.image) {
       const path = project.image;
       allImages = [path.startsWith("http") || path.startsWith("data:") ? path : `${API_BASE_URL}/${path.startsWith("/") ? path.slice(1) : path}`];
    }

    if (allImages.length === 0) {
      allImages = ["https://placehold.co/400x300/1e3a8a/ffffff?text=Project+Image"];
    }

    const currentImageSrc = allImages[currentIndex] || allImages[0];

    return (
      <div className="property-card fade-in">
        <div className="property-image">
          <img src={currentImageSrc} alt={project.projectName} />
          <div className="property-status-overlay">
            {getStatusBadge(project.pendingStatus)}
          </div>
          <div className="property-type-badge">
            {project.type === 0 ? "Rent" : "Sale"}
          </div>
          
          {allImages.length > 1 && (
            <>
              <button className="property-nav property-nav-prev" onClick={(e) => prevImage(project.projectId, allImages.length, e)}>
                <ChevronLeft size={20} />
              </button>
              <button className="property-nav property-nav-next" onClick={(e) => nextImage(project.projectId, allImages.length, e)}>
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        <div className="property-content">
          <div className="property-meta-header">
            <div className="property-meta-left">
              <div className="property-meta-item">
                <Building size={14} />
                <span>{project.projectName}</span>
              </div>
            </div>
            <div className="property-actions-header">
              <button onClick={() => navigate(`/company/projects/${project.projectId}/edit`)} className="btn-icon btn-edit">
                <Settings size={16} />
              </button>
              <button onClick={() => handleDelete(project.projectId)} className="btn-icon btn-delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <h3 className="property-title">{project.projectName}</h3>
          <p className="property-description-text">{project.description || "No description"}</p>
          <div className="property-footer">
            <div className="property-price">
              <MapPin size={16} className="mr-1" />
              {project.location}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-state-icon"><Building size={48} /></div>
      <h3>No Projects Found</h3>
      <p>Start by creating your first real estate project.</p>
      <button onClick={() => navigate("/company/add-project")} className="btn btn-primary mt-4">
        <Plus size={18} /> Add Project
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="landlord-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">Company Dashboard</h1>
            <p className="dashboard-subtitle">Manage your real estate projects and units</p>
          </div>
          <div className="dash-buttons">
            <button onClick={() => navigate("/company/add-project")} className="btn btn-primary">
              <Plus size={20} /> Add Project
            </button>
            <button
              onClick={() => navigate("/tenant/contracts")}
              className="btn btn-secondary"
              style={{ marginLeft: "10px" }}
            >
              <FileText size={20} />
              My Contracts
            </button>
            <button
              onClick={() => navigate("/landlord/manage-proposals")}
              className="btn btn-secondary"
              style={{ marginLeft: "10px" }}
            >
              <FileText size={20} />
              Manage Proposals
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab-button ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
          <Home size={18} /> All Projects <span className="tab-count">{stats.total}</span>
        </button>
        <button className={`tab-button ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>
          <Clock size={18} /> Pending <span className="tab-count">{stats.pending}</span>
        </button>
        <button className={`tab-button ${activeTab === "accepted" ? "active" : ""}`} onClick={() => setActiveTab("accepted")}>
          <CheckCircle size={18} /> Accepted <span className="tab-count">{stats.accepted}</span>
        </button>
        <button className={`tab-button ${activeTab === "rejected" ? "active" : ""}`} onClick={() => setActiveTab("rejected")}>
          <XCircle size={18} /> Rejected <span className="tab-count">{stats.rejected}</span>
        </button>
      </div>

      <div className="properties-container">
        {projects[activeTab].length === 0 ? (
          <EmptyState />
        ) : (
          <div className="properties-grid">
            {projects[activeTab]
              .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
              .map((p) => (
                <ProjectCard key={p.projectId} project={p} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Internal icon component for Location
const MapPin = ({ size, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default CompanyDashboard;
