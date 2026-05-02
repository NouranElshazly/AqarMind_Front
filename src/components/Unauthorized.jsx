import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLock, FaHome, FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import "../styles/Unauthorized.css";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="unauthorized-shell">
      <div className="unauthorized-ambient-glow" />

      <div className="unauthorized-container">
        <div className="unauthorized-card">
          <div className="unauthorized-icon-wrapper">
            <div className="icon-circle shadow-glow">
              <FaLock className="lock-icon" />
            </div>
            <div className="shield-badge">
              <FaShieldAlt />
            </div>
          </div>

          <h1 className="unauthorized-title">Access Denied</h1>

          <div className="unauthorized-divider">
            <div className="divider-line" />
            <span className="divider-dot" />
            <div className="divider-line" />
          </div>

          <p className="unauthorized-description">
            It seems you don't have the required permissions to access this page.
            This area is restricted to authorized personnel only.
          </p>

          <div className="unauthorized-actions">
            <button
              onClick={() => navigate(-1)}
              className="unauthorized-btn secondary"
            >
              <FaArrowLeft /> Go Back
            </button>

            <button
              onClick={handleReturnHome}
              className="unauthorized-btn primary"
            >
              <FaHome /> Return to Home
            </button>
          </div>

          <div className="unauthorized-footer">
            <p>If you believe this is an error, please <Link to="/contact">contact support</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
