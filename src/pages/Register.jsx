import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import API_BASE_URL from "../services/ApiConfig";
import AuthContext from "../context/AuthContext";

// --- Face ID Modal Component (تصميم دائري فخم للتسجيل) ---
const FaceScanModal = ({ userData, onClose, onComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  
  // الحالة لتعليمات التسجيل
  const [instruction, setInstruction] = useState("Initializing...");
  const [instructionColor, setInstructionColor] = useState("blue"); // blue, green, red
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");

  // دالة إيقاف الكاميرا تماماً
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
      // تحويل الألوان القادمة من الباك اند لألوان الستايل
      // data.color usually sends 'green', 'red', or 'blue'
      setInstructionColor(data.color === "green" ? "green" : "red");
    });

    newSocket.on("scan_complete", () => {
      setIsComplete(true);
      setInstruction("Registration Complete!");
      setInstructionColor("green");
      
      stopCamera(); // إغلاق الكاميرا فوراً
      newSocket.disconnect();

      setTimeout(() => {
        onComplete();
      }, 1500);
    });

    return () => {
      stopCamera(); // إغلاق الكاميرا عند الخروج
      newSocket.disconnect();
    };
  }, [userData, onComplete]);

  // حلقة إرسال الصور
  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(() => {
      if (isComplete || !socket.connected) return;

      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        // رسم وإرسال بجودة مخففة للسرعة
        context.drawImage(videoRef.current, 0, 0, 300, 225);
        const base64 = canvasRef.current.toDataURL("image/jpeg", 0.6);
        socket.emit("register_frame", { frame: base64 });
      }
    }, 200); // سرعة مناسبة للتسجيل (تحتاج دقة أكثر قليلاً من اللوجين)

    return () => clearInterval(interval);
  }, [socket, isComplete]);

  // تحديد لون التوهج بناءً على التعليمات
  const getBorderColor = () => {
      if (isComplete) return "border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)]";
      if (instructionColor === "green") return "border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.5)]";
      if (instructionColor === "red") return "border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]";
      return "border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.6)]";
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      
      {/* أنيميشن المسح */}
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
        
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-all">
            &times;
        </button>

        <h3 className="text-2xl font-bold mb-6 text-white tracking-wide">Setup Face ID</h3>
        
        {/* حاوية الفيديو الدائرية */}
        <div className="relative mx-auto w-64 h-64 mb-6">
            {/* التوهج الملون حسب الحالة */}
            <div className={`absolute inset-0 rounded-full border-[3px] transition-all duration-300 ${getBorderColor()}`}></div>
            
            <div className="absolute inset-2 rounded-full border border-white/20"></div>

            <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                
                {/* خط المسح يظهر طالما لم ينته التسجيل */}
                {!isComplete && !error && (
                    <div className="absolute w-full h-12 bg-gradient-to-b from-transparent via-blue-400/50 to-transparent scan-line shadow-[0_0_15px_rgba(96,165,250,0.8)]"></div>
                )}

                {/* علامة الصح عند الاكتمال */}
                {isComplete && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-[2px]">
                         <svg className="w-16 h-16 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>
            <canvas ref={canvasRef} width="300" height="225" className="hidden" />
        </div>

        {/* شريط الحالة والتعليمات */}
        <div className="h-auto min-h-[2rem]">
            {error ? (
                <span className="inline-block px-4 py-1 rounded-full bg-red-500/20 text-red-200 text-sm font-medium border border-red-500/30">
                    {error}
                </span>
            ) : (
                <span className={`inline-block px-6 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
                    isComplete 
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : instructionColor === "green" 
                        ? "bg-green-500/20 text-green-200 border border-green-500/30"
                        : instructionColor === "red"
                            ? "bg-red-500/20 text-red-200 border border-red-500/30"
                            : "bg-blue-500/20 text-blue-200 border border-blue-500/30"
                }`}>
                    {instruction}
                </span>
            )}
        </div>
        
        {!isComplete && (
            <button onClick={onClose} className="mt-6 text-white/40 text-xs hover:text-white transition-colors underline">
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
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-slate-700 via-slate-600 to-blue-500">
      
      {/* --- FACE ID MODAL RENDER --- */}
      {showFaceModal && registeredUser && (
        <FaceScanModal 
            userData={registeredUser} 
            onClose={() => navigate("/login")} 
            onComplete={() => navigate("/login")} 
        />
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse top-10 -left-20"></div>
        <div className="absolute w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse bottom-10 -right-20 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-5 gap-0">
          {/* Left Side */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-700 to-blue-600 p-10 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-20"></div>
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-white bg-opacity-20 backdrop-blur-sm">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
              <p className="text-blue-100 text-sm leading-relaxed">Create your account to access exclusive real estate opportunities and connect with property owners.</p>
              <div className="mt-8 space-y-3">
                 <div className="flex items-center gap-3">

                 </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="md:col-span-3 p-10">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Create Account</h3>
              <p className="text-gray-500 text-sm">Fill in your details to get started</p>
            </div>

            {message.text && (
              <div className={`p-3 mb-5 rounded-lg text-center text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : message.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-slate-700 font-semibold text-sm">Full Name</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-gray-400 transition-colors peer-focus:fill-blue-500" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required className={`peer w-full py-3 pr-3 pl-11 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 ${errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}`} />
                  </div>
                  {errors.name && <span className="text-red-600 text-xs">{errors.name}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-slate-700 font-semibold text-sm">Email Address</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-gray-400 transition-colors peer-focus:fill-blue-500" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required className={`peer w-full py-3 pr-3 pl-11 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 ${errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}`} />
                  </div>
                  {errors.email && <span className="text-red-600 text-xs">{errors.email}</span>}
                </div>
              </div>

         {/* --- Row 2: Password & Confirm Password --- */}
<div className="grid md:grid-cols-2 gap-4">
  {/* Password Field */}
  <div className="flex flex-col gap-2">
    <label htmlFor="password" className="text-slate-700 font-semibold text-sm">Password</label>
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-gray-400 transition-colors" viewBox="0 0 24 24">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </svg>
      
      <input 
        type={showPassword ? "text" : "password"} 
        id="password" 
        name="password" 
        value={formData.password} 
        onChange={handleChange} 
        placeholder="Min 8 characters" 
        required 
        className={`peer w-full py-3 pr-12 pl-11 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 ${errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}`} 
      />

      {/* زر العين لحقل كلمة المرور */}
      <button 
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
      >
        {showPassword ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        )}
      </button>
    </div>
    {errors.password && <span className="text-red-600 text-xs mt-1">{errors.password}</span>}
  </div>

  {/* Confirm Password Field */}
  <div className="flex flex-col gap-2">
    <label htmlFor="confirmPassword" className="text-slate-700 font-semibold text-sm">Confirm Password</label>
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-gray-400 transition-colors" viewBox="0 0 24 24">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </svg>
      <input 
        type={showConfirmPassword ? "text" : "password"} 
        id="confirmPassword" 
        name="confirmPassword" 
        value={formData.confirmPassword} 
        onChange={handleChange} 
        placeholder="Repeat password" 
        required 
        className={`peer w-full py-3 pr-12 pl-11 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 ${errors.confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}`} 
      />

      {/* زر العين لحقل تأكيد كلمة المرور */}
      <button 
        type="button"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
      >
        {showConfirmPassword ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        )}
      </button>
    </div>
    {errors.confirmPassword && <span className="text-red-600 text-xs mt-1">{errors.confirmPassword}</span>}
  </div>
</div>

              <div className="flex flex-col gap-2">
  <label className="text-slate-700 font-semibold text-sm">National ID Card (Required)</label>
  <input 
    type="file" 
    onChange={(e) => setNationalId(e.target.files[0])} 
    className="text-sm block w-full border-2 border-gray-200 rounded-xl p-2"
  />
  {errors.nationalId && <span className="text-red-600 text-xs">{errors.nationalId}</span>}
</div>

              {/* --- Row 3: Role --- */}
              <div className="flex flex-col gap-2">
                  <label htmlFor="role" className="text-slate-700 font-semibold text-sm">Account Type</label>
                  <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none bg-no-repeat bg-right pr-10" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundPosition: "right 12px center", backgroundSize: "16px" }}>
                    <option value="Tenant">Tenant (Looking for property)</option>
                    <option value="Landlord">Landlord (List property)</option>
                  </select>
              </div>

              {formData.role === "Landlord" && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="propertyDocument" className="text-slate-700 font-semibold text-sm">Property Ownership Document</label>
                  <div className="relative">
                    <input type="file" id="propertyDocument" name="propertyDocument" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required className="absolute left-0 opacity-0 w-full h-full cursor-pointer" />
                    <label htmlFor="propertyDocument" className={`flex items-center p-4 border-2 border-dashed rounded-xl bg-gray-50 cursor-pointer transition-all duration-300 hover:border-blue-500 hover:bg-blue-50 ${errors.propertyDocument ? "border-red-300" : "border-gray-300"}`}>
                      <svg className="w-5 h-5 mr-3 fill-gray-500" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                      <span className="text-gray-600 text-sm">{propertyDocument ? propertyDocument.name : "Choose a file..."}</span>
                    </label>
                    {errors.propertyDocument && <span className="text-red-600 text-xs mt-2 block">{errors.propertyDocument}</span>}
                    <p className="mt-2 text-xs text-gray-500">Accepted formats: JPG, PNG, PDF</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 transition-all hover:bg-blue-100/50">
                <div className="relative flex items-center">
                    <input type="checkbox" id="faceId" checked={useFaceId} onChange={(e) => setUseFaceId(e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer" />
                </div>
                <label htmlFor="faceId" className="text-sm font-medium text-slate-700 cursor-pointer select-none flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Enable Face ID Login
                </label>
              </div>

              <button type="submit" disabled={isLoading} className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-slate-700 to-blue-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-700/20 transition-all duration-300 hover:from-slate-800 hover:to-blue-700 hover:shadow-xl hover:shadow-slate-700/30 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none">
                {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Processing...</> : "Create Account"}
              </button>
            </form>

            <div className="mt-6">
              <div className="flex items-center text-gray-400 text-xs my-4"><div className="flex-1 border-b border-gray-200"></div><span className="px-3">or</span><div className="flex-1 border-b border-gray-200"></div></div>
              <button onClick={enterAsGuest} className="w-full py-3 px-4 bg-white text-slate-700 font-semibold rounded-xl text-sm border-2 border-slate-300 transition-all duration-300 hover:bg-slate-50 hover:border-slate-400">Continue as Guest</button>
              <p className="text-center text-gray-500 text-xs mt-4">Already have an account? <a href="/login" className="text-blue-600 font-semibold hover:underline transition-all duration-200">Log in</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;