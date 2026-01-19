import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client"; 
import API_BASE_URL from "../services/ApiConfig";
import "../styles/Login.css";

// --- Face Login Modal Component ---
const FaceLoginModal = ({ usernameOrEmail, onClose, onLoginSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("Initializing...");
  const [error, setError] = useState("");
  
  const isSuccessRef = useRef(false);

  // Helper to stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket"], 
      upgrade: false,
      reconnection: false 
    });
    setSocket(newSocket);

    navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400, facingMode: "user" } }) 
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus("Scanning...");
      })
      .catch((err) => {
        console.error(err);
        setError("Camera access denied.");
      });

    newSocket.on("login_status", (data) => {
        if (!isSuccessRef.current) setStatus(data.message);
    });
    
    newSocket.on("login_success", (data) => {
      if (isSuccessRef.current) return; 
      
      isSuccessRef.current = true;
      setStatus(`Verified: ${data.name}`);
      
      stopCamera();
      newSocket.disconnect();
      setTimeout(() => onLoginSuccess(data), 800);
    });

    newSocket.on("login_fail", (data) => {
        if (!isSuccessRef.current) setStatus(`❌ ${data.message}`);
    });

    return () => {
      stopCamera();
      newSocket.disconnect();
    };
  }, [onLoginSuccess]);

  // Frame Loop
  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(() => {
      if (isSuccessRef.current || !socket.connected) return;

      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, 200, 200);
        const base64 = canvasRef.current.toDataURL("image/jpeg", 0.5);
        
        socket.emit("login_frame", { frame: base64, name: usernameOrEmail });
      }
    }, 500); 

    return () => clearInterval(interval);
  }, [socket, usernameOrEmail]);

  return (
    <div className="face-modal-overlay">
      <div className="face-modal-content">
        
        <button onClick={onClose} className="face-modal-close">
            &times;
        </button>

        <h3 className="face-modal-title">Face ID</h3>
        
        <div className="face-video-container">
            <div className={`face-video-ring ${isSuccessRef.current ? "face-video-ring-success" : "face-video-ring-scanning"}`}></div>
            
            <div className="face-video-inner-ring"></div>

            <div className="face-video-wrapper">
                <video ref={videoRef} autoPlay playsInline muted className="face-video" />
                
                {!isSuccessRef.current && !error && (
                    <div className="face-scan-line"></div>
                )}

                {isSuccessRef.current && (
                    <div className="face-success-overlay">
                         <svg className="face-success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} width="200" height="200" style={{ display: 'none' }} />
        </div>

        <div className="face-status-container">
            {error ? (
                <span className="face-status-badge face-status-error">
                    {error}
                </span>
            ) : (
                <span className={`face-status-badge ${
                    isSuccessRef.current 
                    ? "face-status-success" 
                    : "face-status-scanning"
                }`}>
                    {status}
                </span>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Main Login Component ---
const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ text: "", type: "" });
  };

  const handleFaceLoginSuccess = (pythonData) => {
    setShowFaceModal(false);
    setIsLoading(true);

    const userId = pythonData.userId;
    const name = pythonData.name;
    const email = pythonData.email;
    const role = (pythonData.role || "tenant").toLowerCase();
    const token = pythonData.token || ""; 

    const profileObject = {
        user: {
            _id: userId,
            name: name,
            email: email,
            role: role,
            landlordStatus: 0 
        },
        token: token
    };

    localStorage.setItem("profile", JSON.stringify(profileObject));
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("role", role);
    localStorage.setItem("guestMode", "false");

    if (role === "landlord") {
        localStorage.setItem("landlordId", userId);
    }

    setMessage({ text: "Face Verified! Redirecting...", type: "success" });
    
    setTimeout(() => {
        navigate(role === "admin" ? "/admin/dashboard" : role === "tenant" ? "/tenant/dashboard" : "/");
        // window.location.reload();
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post(`${API_BASE_URL}/api/Auth/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      const { user, token } = res.data;

      if (!user || !token) throw new Error("Invalid response from server");

      const userId = user.userId || user.id || user.Id || user._id;
      const role = user.role || "tenant";

      const profileObject = {
        user: { ...user, _id: userId },
        token: token
      };

      localStorage.setItem("role", role);
      localStorage.setItem("profile", JSON.stringify(profileObject));
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("guestMode", "false");

      if (role === "landlord") {
        localStorage.setItem("landlordId", userId);
        const statusRes = await axios.get(
          `${API_BASE_URL}/api/admin/landlord-status/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const landlordData = statusRes.data[0];
        const landlordStatus = landlordData.flagWaitingUser;

        if (landlordStatus === 0) {
          setMessage({ text: "Login successful! Redirecting...", type: "success" });
          setTimeout(() => { navigate("/landlord/dashboard"); window.location.reload(); }, 1500);
        } else if (landlordStatus === 1) {
          setMessage({ text: "Your landlord account is pending approval.", type: "info" });
        } else if (landlordStatus === 2) {
          setMessage({ text: "Your landlord account has been rejected.", type: "error" });
        }
      } else {
        setMessage({ text: "Login successful! Redirecting...", type: "success" });
        setTimeout(() => {
          navigate(role === "admin" ? "/admin/dashboard" : role === "Tenant" ? "/tenant/dashboard" : "/");
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error(error);
        const errorMessage = error.response?.data?.error ;
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const startFaceLogin = (e) => {
      e.preventDefault();
      if (!formData.usernameOrEmail) {
          setMessage({ text: "Please enter your Username or Email first.", type: "error" });
          return;
      }
      setShowFaceModal(true);
  };

  const enterAsGuest = () => {
    localStorage.setItem("guestMode", "true");
    navigate("/");
  };

  return (
    <div className="login-container">
      
      {showFaceModal && (
          <FaceLoginModal 
            usernameOrEmail={formData.usernameOrEmail}
            onClose={() => setShowFaceModal(false)}
            onLoginSuccess={handleFaceLoginSuccess}
          />
      )}

      {/* Animated background elements */}
      <div className="login-bg-element login-bg-element-1"></div>
      <div className="login-bg-element login-bg-element-2"></div>

      <div className="login-card">
        <div className="login-grid">
          {/* Left Side - Branding */}
          <div className="login-brand-panel">
            <div className="login-brand-overlay"></div>
            
            {/* Decorative elements */}
            <div className="login-decoration-1"></div>
            <div className="login-decoration-2"></div>
            
            <div className="login-brand-content">
              <div className="login-brand-icon">
                <svg viewBox="0 0 24 24" style={{ width: '3rem', height: '3rem', fill: 'white' }}>
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.11 7 14 7.89 14 9C14 10.11 13.11 11 12 11C10.89 11 10 10.11 10 9C10 7.89 10.89 7 12 7M12 14.5C14.67 14.5 16.94 16.14 17 18.5H7C7.06 16.14 9.33 14.5 12 14.5Z" />
                </svg>
              </div>
              <h2 className="login-brand-title">Welcome Back</h2>
              <p className="login-brand-description">
                Access your real estate dashboard and manage your properties with ease.
              </p>
              <div className="login-feature-list">
                <div className="login-feature-item">
                  <div className="login-feature-dot"></div>
                  <span className="login-feature-text">Secure authentication</span>
                </div>
                <div className="login-feature-item">
                  <div className="login-feature-dot"></div>
                  <span className="login-feature-text">Face ID technology</span>
                </div>
                <div className="login-feature-item">
                  <div className="login-feature-dot"></div>
                  <span className="login-feature-text">Property management</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="login-form-panel">
            <div className="login-form-header">
              <h3 className="login-form-title">Sign In</h3>
              <p className="login-form-subtitle">Enter your credentials to access your account</p>
            </div>

            {message.text && (
              <div className={`login-message ${
                message.type === "success" 
                  ? "login-message-success" 
                  : message.type === "error" 
                    ? "login-message-error" 
                    : "login-message-info"
              }`}>
                {message.text}
              </div>
            )}

            <div className="login-form">
              <div className="login-field">
                <label htmlFor="usernameOrEmail" className="login-label">
                  Username or Email
                </label>
                <div className="login-input-wrapper">
                  <svg className="login-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input 
                    type="text" 
                    id="usernameOrEmail" 
                    name="usernameOrEmail" 
                    value={formData.usernameOrEmail} 
                    onChange={handleChange} 
                    placeholder="Enter your username or email" 
                    required 
                    className="login-input" 
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password" className="login-label">
                  Password
                </label>
                <div className="login-input-wrapper">
                  <svg className="login-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Enter your password" 
                    required 
                    className="login-input" 
                  />
                </div>
              </div>

              <div className="login-buttons">
                <button 
                  onClick={handleSubmit} 
                  disabled={isLoading} 
                  className="login-btn login-btn-primary"
                >
                  {isLoading ? (
                    <>
                      <div className="login-loading-spinner"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <button 
                  onClick={startFaceLogin} 
                  disabled={isLoading} 
                  className="login-btn login-btn-face"
                >
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Face ID
                </button>
              </div>
            </div>

            <div className="login-divider">
              <div className="login-divider-line">
                <div className="login-divider-border">
                  <div className="login-divider-border-line"></div>
                </div>
                <div className="login-divider-text">
                  <span>or</span>
                </div>
              </div>
              
              <button onClick={enterAsGuest} className="login-guest-btn">
                Continue as Guest
              </button>
              
              <p className="login-footer">
                Don't have an account? 
                <a href="/register" className="login-footer-link">
                  Create one
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;