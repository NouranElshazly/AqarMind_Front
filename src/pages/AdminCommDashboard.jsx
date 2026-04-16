import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ShieldAlert,
  Trash2,
  Filter,
  AlertTriangle,
  CheckCircle,
  Bomb,
  RefreshCw,
  User,
  ExternalLink,
  ImageIcon,
  Lock,
  Unlock,
  Ban,
} from "lucide-react";
import "./../styles/AdminCommDashboard.css";
import {
  getAdminMonitorComments,
  togglePostLock as apiTogglePostLock,
  wipePostComments as apiWipePostComments,
  deleteComment,
} from "../services/pyapi";

const AdminCommDashboard = () => {
  const [allComments, setAllComments] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, red: 0, yellow: 0, green: 0 });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await getAdminMonitorComments();
      const data = response.data;
      // Handle different response formats (object with comments array or array directly)
      const commentsList = data.comments || (Array.isArray(data) ? data : []);

      setAllComments(commentsList);
      calculateStats(commentsList);
      applyFilter(commentsList, filter);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (data, currentFilter) => {
    if (currentFilter === "all") {
      setComments(data);
    } else {
      setComments(data.filter((c) => c.risk_status === currentFilter));
    }
  };

  const calculateStats = (data) => {
    const red = data.filter((c) => c.risk_status === "red").length;
    const yellow = data.filter((c) => c.risk_status === "yellow").length;
    const green = data.filter((c) => c.risk_status === "green").length;
    setStats({ total: data.length, red, yellow, green });
  };

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("profile"));
    const userData = profile?.user;

    if (!userData || userData.role?.toLowerCase() !== "admin") {
      navigate("/unauthorized");
      return;
    }
    setUser(userData);
   
    fetchComments();
  }, [navigate]);

  useEffect(() => {
    applyFilter(allComments, filter);
  }, [filter, allComments]);

  const deleteCommentPermanently = async (commentId) => {
    try {
      const res = await deleteComment(commentId);
      if (res.status === 200 || res.status === 204) {
        setAllComments((prev) => prev.filter((c) => c._id !== commentId));
        toast.success("Comment deleted successfully");
      }
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  const wipePostComments = async (postId) => {
    try {
      const res = await apiWipePostComments(postId);
      if (res.status === 200 || res.status === 204) {
        toast.success("Post cleaned successfully");
        fetchComments();
      }
    } catch (err) {
      toast.error("Failed to wipe post comments");
    }
  };

  const togglePostLock = async (postId, currentStatus) => {
    const action = currentStatus ? "Unlock" : "Lock";
    try {
      const res = await apiTogglePostLock(postId);
      const data = res.data;

      if (res.status === 200) {
        setAllComments((prevComments) =>
          prevComments.map((c) => {
            if (c.post_id === postId) {
              return { ...c, post_is_locked: data.is_locked };
            }
            return c;
          }),
        );
        toast.success(
          `Post ${data.is_locked ? "locked" : "unlocked"} successfully`,
        );
      }
    } catch (err) {
      toast.error(`Failed to ${action.toLowerCase()} post`);
    }
  };

  const openPost = (postId) => {
    window.open(`${window.location.origin}/properties/${postId}`, "_blank");
  };

  return (
    <div className="admin-comm-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <div className="header-icon">
              <ShieldAlert size={32} />
            </div>
            <div className="header-info">
              <h1>Comment Tracker</h1>
              <p>Content Moderation & Risk Analysis</p>
            </div>
          </div>
          <button className="btn-action btn-secondary" onClick={fetchComments}>
            <RefreshCw size={18} /> Refresh
          </button>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <Filter size={24} color="#667eea" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Comments</span>
            </div>
          </div>

          <div
            className="stat-card"
            style={{ borderLeftColor: stats.red > 0 ? "#ef4444" : "#10b981" }}
          >
            <div
              className="stat-icon-wrapper"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            >
              <AlertTriangle size={24} color="#ef4444" />
            </div>
            <div className="stat-info">
              <span className="stat-value" style={{ color: "#ef4444" }}>
                {stats.red}
              </span>
              <span className="stat-label">High Risk</span>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: "#f59e0b" }}>
            <div
              className="stat-icon-wrapper"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <ShieldAlert size={24} color="#f59e0b" />
            </div>
            <div className="stat-info">
              <span className="stat-value" style={{ color: "#f59e0b" }}>
                {stats.yellow}
              </span>
              <span className="stat-label">Suspicious</span>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: "#10b981" }}>
            <div
              className="stat-icon-wrapper"
              style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
            >
              <CheckCircle size={24} color="#10b981" />
            </div>
            <div className="stat-info">
              <span className="stat-value" style={{ color: "#10b981" }}>
                {stats.green}
              </span>
              <span className="stat-label">Safe Content</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-bar">
          <div className="filter-group">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === "red" ? "active" : ""}`}
              style={
                filter === "red"
                  ? { background: "#ef4444", color: "white" }
                  : {}
              }
              onClick={() => setFilter("red")}
            >
              High Risk
            </button>
            <button
              className={`filter-btn ${filter === "yellow" ? "active" : ""}`}
              style={
                filter === "yellow"
                  ? { background: "#f59e0b", color: "white" }
                  : {}
              }
              onClick={() => setFilter("yellow")}
            >
              Suspicious
            </button>
            <button
              className={`filter-btn ${filter === "green" ? "active" : ""}`}
              style={
                filter === "green"
                  ? { background: "#10b981", color: "white" }
                  : {}
              }
              onClick={() => setFilter("green")}
            >
              Safe
            </button>
          </div>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Analyzing comments...</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="loader-container">
                <CheckCircle size={64} color="#10b981" />
                <h3>All Clear!</h3>
                <p>No comments match your current filters.</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className={`comment-card risk-${comment.risk_status} ${comment.is_hidden ? "is-hidden" : ""}`}
                >
                  {comment.is_hidden && (
                    <div className="halted-badge">
                      <Ban size={14} /> AI Auto-Halted
                    </div>
                  )}

                  <div className="card-header">
                    <div className="user-info">
                      <div className="user-name">
                        <User size={16} />
                        {comment.user_name}
                      </div>
                      <div className="comment-date">
                        <RefreshCw size={14} />{" "}
                        {new Date(comment.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="comment-body">
                    {comment.comment_description}
                  </div>

                  {comment.image_data && (
                    <div className="attachment-preview">
                      <img
                        src={
                          comment.image_data.startsWith("data:")
                            ? comment.image_data
                            : `data:image/jpeg;base64,${comment.image_data}`
                        }
                        alt="Attachment"
                        className="attachment-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#94a3b8",
                          marginTop: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <ImageIcon size={14} /> Image Attachment
                      </div>
                    </div>
                  )}

                  <div className="card-actions">
                    <div className="risk-label">
                      {comment.risk_status === "green" ? (
                        <>
                          <CheckCircle size={16} /> Safe Content
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} />
                          {comment.risk_status === "red"
                            ? "High Risk"
                            : "Suspicious"}
                        </>
                      )}
                    </div>
                    <button
                      className="btn-action btn-primary header-view-btn"
                      onClick={() => openPost(comment.post_id)}
                    >
                      <ExternalLink size={16} /> View Post
                    </button>
                    <button
                      className={`btn-action ${comment.post_is_locked ? "btn-warning" : "btn-secondary"}`}
                      onClick={() =>
                        togglePostLock(comment.post_id, comment.post_is_locked)
                      }
                    >
                      {comment.post_is_locked ? (
                        <>
                          <Lock size={16} /> Unlock Post
                        </>
                      ) : (
                        <>
                          <Unlock size={16} /> Lock Post
                        </>
                      )}
                    </button>

                    <button
                      className="btn-action btn-danger"
                      onClick={() => wipePostComments(comment.post_id)}
                    >
                      <Bomb size={16} /> Wipe Post
                    </button>

                    <button
                      className="btn-action btn-danger-solid"
                      onClick={() => deleteCommentPermanently(comment._id)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommDashboard;
