import React, { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import PropertyDetail from "./pages/PropertyDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import PendingApprovals from "./pages/PendingApprovals";
import LandlordApplicationDetail from "./pages/LandlordApplicationDetail";
import LandlordDashboard from "./pages/LandlordDashboard";
import ManageProperties from "./pages/ManageProperties";
import AddProperty from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
import PropertyProposals from "./pages/PropertyProposals";
import TenantDashboard from "./pages/TenantDashboard";
import SavedPosts from "./pages/SavedPosts";
import Messages from "./pages/Messages";
import Contact from "./pages/contact";
import Unauthorized from "./components/Unauthorized";
import UserProperties from "./pages/UserProperties";
import SystemReports from "./pages/SystemReports";
import ShowAllPost from "./pages/ShowAllPosts";
import ManageAdmins from "./pages/ManageAdmins";
import AdminPendingApprovals from "./pages/AdminPendingApprovals";
import UserHistory from "./pages/UserHistory";
import AdminChatDashboard from "./pages/AdminChatDashboard";
import AdminManageComplaints from "./pages/AdminManageComplaints";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/Changepassword";
import LandlordProposalManage from "./pages/LandlordProposalManage"

// Create DarkMode Context
const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return true;
    }
    return false; // Default to light mode
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    // Apply dark mode to entire page
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark-mode");
      document.body.style.backgroundColor = "#0f172a";
      document.body.style.color = "#f1f5f9";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark-mode");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#1e293b";
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to role dashboard if user has a session
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    const guestMode = localStorage.getItem("guestMode");

    // Only redirect when landing on the home page and not in guest mode
    if (location.pathname !== "/" || guestMode === "true") return;

    if (token && role) {
      if (role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (role === "landlord")
        navigate("/landlord/dashboard", { replace: true });
      else if (role === "tenant")
        navigate("/tenant/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  const hideNavbarFooter =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/unauthorized" ||
    location.pathname === "/admin/AdminChatDashboard" ||
    location.pathname.startsWith("/messages");

  const [showSplash, setShowSplash] = useState(true);

  // Check if splash screen should be shown
  useEffect(() => {
    const hasSeenSplash = localStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    localStorage.setItem("hasSeenSplash", "true");
  };

  return (
    <DarkModeProvider>
      <AuthProvider>
        <div className="app min-h-screen transition-all duration-300">
          {!hideNavbarFooter && <Navbar />}

          <main
            className={`main-content ${
              showSplash ? "hidden" : "block"
            } min-h-screen`}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/properties/:postId" element={<PropertyDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/show-all-post" element={<ShowAllPost />} />
              <Route path="/UserHistory" element={<UserHistory />} />
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route
                path="/admin/pending-landlords"
                element={<PendingApprovals />}
              />
              <Route
                path="/admin/pending-approvals"
                element={<AdminPendingApprovals />}
              />{" "}
              {/* ← هنا */}
              <Route
                path="/admin/landlord-applications"
                element={<LandlordApplicationDetail />}
              />
              <Route path="/admin/SystemReports" element={<SystemReports />} />
              <Route path="/admin/manage-admins" element={<ManageAdmins />} />
              <Route
                path="/admin/AdminChatDashboard"
                element={<AdminChatDashboard />}
              />
              <Route
                path="/admin/manage-complaints"
                element={<AdminManageComplaints />}
              />
              {/* Landlord Routes */}
              <Route
                path="/landlord/dashboard"
                element={<LandlordDashboard />}
              />
              <Route
                path="/landlord/properties"
                element={<ManageProperties />}
              />
              <Route path="/landlord/add-property" element={<AddProperty />} />
              <Route
                path="/landlord/properties/:id/edit"
                element={<EditProperty />}
              />
              <Route
                path="/landlord/proposals"
                element={<PropertyProposals />}
              />
              <Route
                path="/landlord/manage-proposals"
                element={<LandlordProposalManage />}
              />
              {/* Tenant Routes */}
              <Route path="/tenant/dashboard" element={<TenantDashboard />} />
              <Route path="/saved-posts" element={<SavedPosts />} />
              <Route path="/UserProperties" element={<UserProperties />} />
              {/* Messages Routes */}
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:receiverId" element={<Messages />} />
              {/* Profile Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold mb-4">404</h1>
                      <p className="text-xl">Page Not Found</p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>

          {!hideNavbarFooter && <Footer />}
          
          {/* Global Scroll to Top Button */}
          <ScrollToTop />
        </div>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
