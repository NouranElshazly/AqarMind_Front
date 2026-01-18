import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client"; 
import API_BASE_URL from "../services/ApiConfig";

// --- Face Login Modal Component (تصميم دائري فخم) ---
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

    // استخدام جودة مناسبة للمربع الدائري
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
        // رسم بجودة خفيفة للإرسال
        context.drawImage(videoRef.current, 0, 0, 200, 200);
        const base64 = canvasRef.current.toDataURL("image/jpeg", 0.5);
        
        socket.emit("login_frame", { frame: base64, name: usernameOrEmail });
      }
    }, 500); 

    return () => clearInterval(interval);
  }, [socket, usernameOrEmail]);

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      
      {/* ستايل الأنيميشن الخاص بالمسح الضوئي */}
      <style>{`
        @keyframes scanMove {
          0% { top: -10%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .scan-line {
          animation: scanMove 2s linear infinite;
        }
      `}</style>

      <div className="relative bg-white/10 border border-white/20 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl backdrop-blur-xl">
        
        {/* زر الإغلاق */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-all"
        >
            &times;
        </button>

        <h3 className="text-2xl font-bold mb-6 text-white tracking-wide">Face ID</h3>
        
        {/* حاوية الفيديو الدائرية الفخمة */}
        <div className="relative mx-auto w-64 h-64 mb-6">
            {/* الحلقة الخارجية المشعة */}
            <div className={`absolute inset-0 rounded-full border-[3px] ${isSuccessRef.current ? "border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)]" : "border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.6)]"} transition-all duration-500`}></div>
            
            {/* حلقة داخلية رفيعة */}
            <div className="absolute inset-2 rounded-full border border-white/20"></div>

            {/* الحاوية المقصوصة دائرياً */}
            <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                
                {/* تأثير المسح الضوئي (يظهر فقط أثناء البحث) */}
                {!isSuccessRef.current && !error && (
                    <div className="absolute w-full h-12 bg-gradient-to-b from-transparent via-blue-400/50 to-transparent scan-line shadow-[0_0_15px_rgba(96,165,250,0.8)]"></div>
                )}

                {/* طبقة نجاح خضراء شفافة */}
                {isSuccessRef.current && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-[2px]">
                         <svg className="w-16 h-16 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>

            {/* الكانفاس المخفي */}
            <canvas ref={canvasRef} width="200" height="200" className="hidden" />
        </div>

        {/* حالة النص */}
        <div className="h-8">
            {error ? (
                <span className="inline-block px-4 py-1 rounded-full bg-red-500/20 text-red-200 text-sm font-medium border border-red-500/30">
                    {error}
                </span>
            ) : (
                <span className={`inline-block px-6 py-1.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
                    isSuccessRef.current 
                    ? "bg-green-500/20 text-green-300 border border-green-500/30" 
                    : "bg-blue-500/20 text-blue-200 border border-blue-500/30 animate-pulse"
                }`}>
                    {status}
                </span>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Main Login Component (كما هي تماماً) ---
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
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-slate-700 via-slate-600 to-blue-500">
      
      {showFaceModal && (
          <FaceLoginModal 
            usernameOrEmail={formData.usernameOrEmail}
            onClose={() => setShowFaceModal(false)}
            onLoginSuccess={handleFaceLoginSuccess}
          />
      )}

      {/* Animated background overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse top-10 -left-20"></div>
        <div className="absolute w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse bottom-10 -right-20 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-5 gap-0">
          {/* Left Side - Branding */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-700 to-blue-600 p-10 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-20"></div>
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-white bg-opacity-20 backdrop-blur-sm">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-8">
                Sign in to access your real estate account and manage your properties.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                 
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:col-span-3 p-10">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Sign In</h3>
              <p className="text-gray-500 text-sm">Enter your credentials to continue</p>
            </div>

            {message.text && (
              <div className={`p-3 mb-5 rounded-lg text-center text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : message.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                {message.text}
              </div>
            )}

            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="usernameOrEmail" className="text-slate-700 font-semibold text-sm">Username or Email</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-gray-400 transition-colors peer-focus:fill-blue-500" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                  <input type="text" id="usernameOrEmail" name="usernameOrEmail" value={formData.usernameOrEmail} onChange={handleChange} placeholder="Enter username or email" required className="peer w-full py-3 pr-3 pl-11 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-slate-700 font-semibold text-sm">Password</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-gray-400 transition-colors peer-focus:fill-blue-500" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>
                  <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required className="peer w-full py-3 pr-3 pl-11 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                  <button onClick={handleSubmit} disabled={isLoading} className="flex-1 py-3.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold rounded-xl text-sm shadow-lg shadow-slate-700/20 transition-all duration-300 hover:from-slate-800 hover:to-slate-900 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed">
                    {isLoading ? "Signing in..." : "Sign In"}
                  </button>

                  <button onClick={startFaceLogin} disabled={isLoading} className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Face ID
                  </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center text-gray-400 text-xs my-4">
                <div className="flex-1 border-b border-gray-200"></div>
                <span className="px-3">or</span>
                <div className="flex-1 border-b border-gray-200"></div>
              </div>
              <button onClick={enterAsGuest} className="w-full py-3 px-4 bg-white text-slate-700 font-semibold rounded-xl text-sm border-2 border-slate-300 transition-all duration-300 hover:bg-slate-50 hover:border-slate-400">Continue as Guest</button>
              <p className="text-center text-gray-500 text-xs mt-4">Don't have an account? <a href="/register" className="text-blue-600 font-semibold hover:underline transition-all duration-200">Register</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;