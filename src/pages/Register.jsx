import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import API_BASE_URL from "../services/ApiConfig";
import AuthContext from "../context/AuthContext";
import "../styles/Messages.css";

// --- Face ID Modal Component ---
const FaceScanModal = ({ userData, onClose, onComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  
  const [instruction, setInstruction] = useState("Initializing...");
  const [instructionColor, setInstructionColor] = useState("blue");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");

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
        upgrade: false
    });
    setSocket(newSocket);

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => {
          console.error("Camera Error:", err);
          setError("Camera access denied");
      });

    newSocket.on("connect", () => {
      newSocket.emit("start_registration", {
        name: userData.username,
        email: userData.email,
        userId: userData.userId
      });
    });

    newSocket.on("update_instruction", (data) => {
      setInstruction(data.message);
      setInstructionColor(data.color === "green" ? "green" : "red");
    });

    newSocket.on("scan_complete", () => {
      setIsComplete(true);
      setInstruction("Registration Complete!");
      setInstructionColor("green");
      
      stopCamera();
      newSocket.disconnect();

      setTimeout(() => {
        onComplete();
      }, 1500);
    });

    return () => {
      stopCamera();
      newSocket.disconnect();
    };
  }, [userData, onComplete]);

  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(() => {
      if (isComplete || !socket.connected) return;

      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, 300, 225);
        const base64 = canvasRef.current.toDataURL("image/jpeg", 0.6);
        socket.emit("register_frame", { frame: base64 });
      }
    }, 200);

    return () => clearInterval(interval);
  }, [socket, isComplete]);

  const getBorderColor = () => {
      if (isComplete) return "face-scan-video-ring-complete";
      if (instructionColor === "green") return "face-scan-video-ring-green";
      if (instructionColor === "red") return "face-scan-video-ring-red";
      return "face-scan-video-ring-blue";
  };

  const getStatusClass = () => {
      if (isComplete) return "face-scan-status-complete";
      if (instructionColor === "green") return "face-scan-status-green";
      if (instructionColor === "red") return "face-scan-status-red";
      return "face-scan-status-blue";
  };

  return (
    <div className="face-scan-modal-overlay">
      <div className="face-scan-modal-content">
        
        <button onClick={onClose} className="face-scan-modal-close">
            &times;
        </button>

        <h3 className="face-scan-modal-title">Setup Face ID</h3>
        
        <div className="face-scan-video-container">
            <div className={`face-scan-video-ring ${getBorderColor()}`}></div>
            
            <div className="face-scan-video-inner-ring"></div>

            <div className="face-scan-video-wrapper">
                <video ref={videoRef} autoPlay playsInline muted className="face-scan-video" />
                
                {!isComplete && !error && (
                    <div className="face-scan-line"></div>
                )}

                {isComplete && (
                    <div className="face-scan-success-overlay">
                         <svg className="face-scan-success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>
            <canvas ref={canvasRef} width="300" height="225" style={{ display: 'none' }} />
        </div>

        <div className="face-scan-status-container">
            {error ? (
                <span className="face-scan-status-badge face-scan-status-red">
                    {error}
                </span>
            ) : (
                <span className={`face-scan-status-badge ${getStatusClass()}`}>
                    {instruction}
                </span>
            )}
        </div>
        
        {!isComplete && (
            <button onClick={onClose} className="face-scan-skip-btn">
                Skip Setup
            </button>
        )}
      </div>
    </div>
  );
};

// --- Main Register Component (Logic Updated, Design Kept) ---
const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Tenant",
  });

  const [useFaceId, setUseFaceId] = useState(false); 
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [propertyDocument, setPropertyDocument] = useState(null);
  const [nationalId, setNationalId] = useState(null); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    setPropertyDocument(e.target.files[0]);
    if (errors.propertyDocument) setErrors((prev) => ({ ...prev, propertyDocument: "" }));
  };

  const handleNationalIdChange = (e) => {
  const file = e.target.files[0];
  setNationalId(file); 
};

  const validateForm = () => {
    const newErrors = {};
if (!formData.name.trim()) {
    newErrors.name = "Name is required";
  } else if (formData.name.trim().length < 3) {
    newErrors.name = "Name must be at least 3 characters long";
  }    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Email is invalid";
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (!passwordRegex.test(formData.password)) {
    newErrors.password = "Must be 8+ characters, including uppercase, lowercase, number, and special character (@$!%*?&)";
  }

  if (!formData.confirmPassword) {
    newErrors.confirmPassword = "Please confirm your password";
  } else if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match";
  }
if (!nationalId) {
  newErrors.nationalId = "National ID is required for all users";
}

if (formData.role === "Landlord" && !propertyDocument) {
  newErrors.propertyDocument = "Property document is required for Landlords";
}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  setMessage({ text: "", type: "" });

  try {
    const form = new FormData();
    form.append("username", formData.name); 
    form.append("email", formData.email);
    form.append("Password", formData.password); 
    form.append("ConfirmPassword", formData.confirmPassword); 
    form.append("role_name", formData.role);

   if (nationalId) {
      form.append("NIDFile", nationalId); 
    }

if (formData.role=== "Landlord" && propertyDocument) {
      form.append("File", propertyDocument); 
    }

        
    

    const res = await axios.post(`${API_BASE_URL}/api/Auth/register`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const newUserId = res.data.userId || res.data.id; 

    if (useFaceId) {
      setRegisteredUser({
          username: res.data.username || formData.name,
          email: res.data.email || formData.email,
          userId: newUserId
      });validateForm
      setMessage({ text: "Account created! Proceeding to Face ID...", type: "success" });
      setIsLoading(false);
      setShowFaceModal(true); 
    } else {
      setMessage({ text: "Registration successful!", type: "success" });
      setTimeout(() => navigate("/login"), 2000);
    }

  } catch (error) {
    const backendMessage = error.response?.data?.errors 
      ? Object.values(error.response.data.errors).flat().join(" - ")
      : error.response?.data?.message;

    setMessage({
      text: backendMessage || "Registration failed. Please try again.",
      type: "error",
    });
    setIsLoading(false);
  }
};

  const enterAsGuest = () => {
    navigate("/");
  };

  return (
    <div className="register-container">
      
      {/* --- FACE ID MODAL RENDER --- */}
      {showFaceModal && registeredUser && (
        <FaceScanModal 
            userData={registeredUser} 
            onClose={() => navigate("/login")} 
            onComplete={() => navigate("/login")} 
        />
      )}

      {/* Animated background elements */}
      <div className="register-bg-element register-bg-element-1"></div>
      <div className="register-bg-element register-bg-element-2"></div>

      <div className="register-card">
        <div className="register-grid">
          {/* Left Side - Branding */}
          <div className="register-brand-panel">
            <div className="register-brand-overlay"></div>
            
            {/* Decorative elements */}
            <div className="register-decoration-1"></div>
            <div className="register-decoration-2"></div>
            
            <div className="register-brand-content">
              <div className="register-brand-icon">
                <svg viewBox="0 0 24 24" style={{ width: '3rem', height: '3rem', fill: 'white' }}>
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V16L13 18L15 16V11C16.1 11 17 10.1 17 9H21Z" />
                </svg>
              </div>
              <h2 className="register-brand-title">Join Our Community</h2>
              <p className="register-brand-description">
                Create your account to access exclusive real estate opportunities and connect with property owners.
              </p>
              <div className="register-feature-list">
                <div className="register-feature-item">
                  <div className="register-feature-dot"></div>
                  <span className="register-feature-text">Secure registration</span>
                </div>
                <div className="register-feature-item">
                  <div className="register-feature-dot"></div>
                  <span className="register-feature-text">Face ID setup</span>
                </div>
                <div className="register-feature-item">
                  <div className="register-feature-dot"></div>
                  <span className="register-feature-text">Property access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="register-form-panel">
            <div className="register-form-header">
              <h3 className="register-form-title">Create Account</h3>
              <p className="register-form-subtitle">Fill in your details to get started</p>
            </div>

            {message.text && (
              <div className={`register-message ${
                message.type === "success" 
                  ? "register-message-success" 
                  : message.type === "error" 
                    ? "register-message-error" 
                    : "register-message-info"
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form" noValidate>
              {/* Name and Email Row */}
              <div className="register-form-row">
                <div className="register-field">
                  <label htmlFor="name" className="register-label">
                    Full Name
                  </label>
                  <div className="register-input-wrapper">
                    <svg className="register-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="John Doe" 
                      required 
                      className={`register-input ${errors.name ? 'error' : ''}`} 
                    />
                  </div>
                  {errors.name && <span className="register-error">{errors.name}</span>}
                </div>

                <div className="register-field">
                  <label htmlFor="email" className="register-label">
                    Email Address
                  </label>
                  <div className="register-input-wrapper">
                    <svg className="register-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="your@email.com" 
                      required 
                      className={`register-input ${errors.email ? 'error' : ''}`} 
                    />
                  </div>
                  {errors.email && <span className="register-error">{errors.email}</span>}
                </div>
              </div>

              {/* Password Row */}
              <div className="register-form-row">
                <div className="register-field">
                  <label htmlFor="password" className="register-label">
                    Password
                  </label>
                  <div className="register-input-wrapper">
                    <svg className="register-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      placeholder="Min 8 characters" 
                      required 
                      className={`register-input register-input-with-toggle ${errors.password ? 'error' : ''}`} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="register-password-toggle"
                    >
                      {showPassword ? (
                        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <span className="register-error">{errors.password}</span>}
                </div>

                <div className="register-field">
                  <label htmlFor="confirmPassword" className="register-label">
                    Confirm Password
                  </label>
                  <div className="register-input-wrapper">
                    <svg className="register-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      placeholder="Repeat password" 
                      required 
                      className={`register-input register-input-with-toggle ${errors.confirmPassword ? 'error' : ''}`} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="register-password-toggle"
                    >
                      {showConfirmPassword ? (
                        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="register-error">{errors.confirmPassword}</span>}
                </div>
              </div>

              {/* National ID */}
              <div className="register-field">
                <label className="register-label">
                  National ID Card (Required)
                </label>
                <div className="register-file-upload">
                  <input 
                    type="file" 
                    onChange={(e) => setNationalId(e.target.files[0])} 
                    className="register-file-input"
                  />
                  <div className={`register-file-area ${errors.nationalId ? 'error' : ''}`}>
                    <div className="register-file-content">
                      <svg className="register-file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="register-file-text">
                        {nationalId ? nationalId.name : "Click to upload National ID"}
                      </p>
                      <p className="register-file-subtext">JPG, PNG, PDF up to 10MB</p>
                    </div>
                  </div>
                </div>
                {errors.nationalId && <span className="register-error">{errors.nationalId}</span>}
              </div>

              {/* Account Type */}
              <div className="register-field">
                <label htmlFor="role" className="register-label">
                  Account Type
                </label>
                <select 
                  id="role" 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange} 
                  className="register-select"
                >
                  <option value="Tenant">Tenant (Looking for property)</option>
                  <option value="Landlord">Landlord (List property)</option>
                </select>
              </div>

              {/* Property Document for Landlords */}
              {formData.role === "Landlord" && (
                <div className="register-field">
                  <label className="register-label">
                    Property Ownership Document
                  </label>
                  <div className="register-file-upload">
                    <input 
                      type="file" 
                      id="propertyDocument" 
                      name="propertyDocument" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      onChange={handleFileChange} 
                      required 
                      className="register-file-input"
                    />
                    <div className={`register-file-area ${errors.propertyDocument ? 'error' : ''}`}>
                      <div className="register-file-content">
                        <svg className="register-file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="register-file-text">
                          {propertyDocument ? propertyDocument.name : "Click to upload property document"}
                        </p>
                        <p className="register-file-subtext">JPG, PNG, PDF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                  {errors.propertyDocument && <span className="register-error">{errors.propertyDocument}</span>}
                </div>
              )}

              {/* Face ID Option */}
              <div className="register-face-id">
                <input 
                  type="checkbox" 
                  id="faceId" 
                  checked={useFaceId} 
                  onChange={(e) => setUseFaceId(e.target.checked)} 
                  className="register-checkbox" 
                />
                <label htmlFor="faceId" className="register-face-id-label">
                  <svg className="register-face-id-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Enable Face ID Login (Optional)
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading} 
                className="register-submit-btn"
              >
                {isLoading ? (
                  <>
                    <div className="register-loading-spinner"></div>
                    Processing...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="register-divider">
              <div className="register-divider-line">
                <div className="register-divider-border">
                  <div className="register-divider-border-line"></div>
                </div>
                <div className="register-divider-text">
                  <span>or</span>
                </div>
              </div>
              
              <button onClick={enterAsGuest} className="register-guest-btn">
                Continue as Guest
              </button>
              
              <p className="register-footer">
                Already have an account? 
                <a href="/login" className="register-footer-link">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;