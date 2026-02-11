import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { logout as logoutApi } from "../services/api";
import { useDarkMode } from "../App";
import "../styles/Navbar.css";

// SVG Icons Components
const HomeIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const SupportIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const SearchIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const KeyIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
    />
  </svg>
);

const UserPlusIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
);

const ProfileIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const DashboardIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

const HeartIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const ChatIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const HistoryIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const DocumentIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const BusinessIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

const ComputerIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const ClipboardIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);

const BuildingIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    />
  </svg>
);

const LogoutIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const CloseIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const SunIcon = ({ className = "icon-sm" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = ({ className = "icon-sm" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const CreditCardIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

// Logout Modal Component
const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onCancel} />
      <div className="modal-content">
        <div className="modal-icon-container">
          <div className="modal-icon-glow" />
          <div className="modal-icon">
            <LogoutIcon className="icon-lg" />
          </div>
        </div>

        <div className="modal-body">
          <h2 className="modal-title">Sign Out?</h2>
          <p className="modal-description">
            Are you sure you want to logout? You'll need to login again to
            access your account.
          </p>
        </div>

        <div className="modal-actions">
          <button onClick={onCancel} className="modal-btn modal-btn-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="modal-btn modal-btn-confirm">
            Logout
          </button>
        </div>

        <p className="modal-footer-text">
          Your data will remain safe. You can login anytime.
        </p>
      </div>
    </div>
  );
};

// Hamburger Menu Component
const HamburgerMenu = ({
  isOpen,
  user,
  onClose,
  onLogout,
  menuItems,
  location,
}) => {
  if (!isOpen) return null;

  // Add logout to menu items for mobile
  const mobileMenuItems = user
    ? [
        ...menuItems,
        { icon: <LogoutIcon />, label: "Logout", action: onLogout },
      ]
    : [
        ...menuItems,
        { icon: <KeyIcon />, label: "Login", path: "/login" },
        { icon: <UserPlusIcon />, label: "Register", path: "/register" },
      ];

  return (
    <div className="hamburger-menu">
      <div className="hamburger-backdrop" onClick={onClose} />
      <div className="hamburger-panel">
        <div className="hamburger-header">
          <h3 className="hamburger-title">Menu</h3>
          <button className="hamburger-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <nav className="hamburger-nav">
          {mobileMenuItems.map((item, index) =>
            item.action ? (
              <button
                key={index}
                onClick={item.action}
                className="hamburger-item"
              >
                <span className="hamburger-item-icon">{item.icon}</span>
                <span className="hamburger-item-label">{item.label}</span>
              </button>
            ) : (
              <Link
                key={index}
                to={item.path}
                className={`hamburger-item ${location.pathname === item.path ? "active" : ""}`}
                onClick={onClose}
              >
                <span className="hamburger-item-icon">{item.icon}</span>
                <span className="hamburger-item-label">{item.label}</span>
              </Link>
            ),
          )}
        </nav>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showQuickLinksDropdown, setShowQuickLinksDropdown] = useState(false);

  // Check role from localStorage for profile visibility
  const storedRole = localStorage.getItem("role");
  const shouldShowProfile =
    storedRole && ["tenant", "landlord", "admin"].includes(storedRole.toLowerCase());

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 200; // Maximum scroll distance for full transformation

      // Calculate scroll progress (0 to 1)
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);

      // Set scrolled state when progress > 0.5
      setScrolled(progress > 0.5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API failed:", error);
    }
    // Clear the ad shown flag on logout
    sessionStorage.removeItem('adShown');
    logout();
    setShowLogoutModal(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    if (!user) {
      return [
        { icon: <HomeIcon />, label: "Home", path: "/" },
        {
          icon: <SearchIcon />,
          label: "Browse Properties",
          path: "/show-all-post",
        },
      ];
    }

    const commonItems = [
      { icon: <HomeIcon />, label: "Home", path: "/" },
      {
        icon: <SearchIcon />,
        label: "Browse Properties",
        path: "/show-all-post",
      },
    ];

    // Role-specific items
    switch (user.role) {
      case "Admin":
        return [
          ...commonItems,
          {
            icon: <DashboardIcon />,
            label: "Dashboard",
            path: "/admin/dashboard",
          },
          {
            icon: <BusinessIcon />,
            label: "Pending Landlords",
            path: "/admin/pending-landlords",
          },
          {
            icon: <ComputerIcon />,
            label: "Chat Dashboard",
            path: "/admin/AdminChatDashboard",
          },
          {
            icon: <DocumentIcon />,
            label: "Pending Properties",
            path: "/admin/landlord-applications",
          },
        ];

      case "Landlord":
        return [
          ...commonItems,
          {
            icon: <DashboardIcon />,
            label: "Dashboard",
            path: "/landlord/dashboard",
          },
          {
            icon: <BuildingIcon />,
            label: "My Properties",
            path: "/landlord/properties",
          },
          {
            icon: <ClipboardIcon />,
            label: "Proposals",
            path: "/landlord/proposals",
          },
          { icon: <HeartIcon />, label: "Saved Posts", path: "/saved-posts" },
          { icon: <ChatIcon />, label: "Messages", path: "/messages" },
        ];

      case "Tenant":
        return [
          ...commonItems,
          {
            icon: <DashboardIcon />,
            label: "Dashboard",
            path: "/tenant/dashboard",
          },
          { icon: <HeartIcon />, label: "Saved Posts", path: "/saved-posts" },
          { icon: <ChatIcon />, label: "Messages", path: "/messages" },
          { icon: <HistoryIcon />, label: "History", path: "/UserHistory" },
          {
            icon: <DocumentIcon />,
            label: "Your Applications",
            path: "/UserProposals",
          },
        ];

      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  // Calculate dynamic styles based on scroll progress
  const getDynamicStyles = () => {
    const borderRadius = scrollProgress * 24; // 0 to 24px
    const marginHorizontal = scrollProgress * 16; // 0 to 16px (1rem)
    const marginTop = scrollProgress * 16; // 0 to 16px (1rem)
    const width = 100 - scrollProgress * 10; // 100% to 90%

    return {
      borderRadius: `${borderRadius}px`,
      marginLeft: `${marginHorizontal}px`,
      marginRight: `${marginHorizontal}px`,
      marginTop: `${marginTop}px`,
      width: `calc(${width}% - ${marginHorizontal * 2}px)`,
      transform: scrollProgress > 0.5 ? "translateX(-50%)" : "none",
      left: scrollProgress > 0.5 ? "50%" : "0",
      position: scrollProgress > 0.5 ? "fixed" : "absolute",
    };
  };

  return (
    <>
      <nav
        className={`navbar ${scrolled ? "scrolled" : ""}`}
        style={getDynamicStyles()}
      >
        <div className="navbar-content">
          {/* Brand Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">A</div>
            <div className="logo-text">
              Aqar<span className="logo-accent">Mind</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="navbar-nav">
            <Link
              to="/"
              className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            >
              Home
            </Link>

            <Link
              to="/show-all-post"
              className={`nav-link ${location.pathname === "/show-all-post" ? "active" : ""}`}
            >
              Browse Properties
            </Link>

            {/* Dashboard Link - Only show for logged in users */}
            {user && (
              <Link
                to={
                  user.role === "Admin"
                    ? "/admin/dashboard"
                    : user.role === "Landlord"
                      ? "/landlord/dashboard"
                      : "/tenant/dashboard"
                }
                className={`nav-link ${
                  location.pathname.includes("/dashboard") ? "active" : ""
                }`}
              >
                <DashboardIcon className="nav-icon" />
                Dashboard
              </Link>
            )}

            {/* Quick Links Dropdown - Only show for logged in users */}
            {user && (
              <div className="quick-links-dropdown">
                <button
                  className={`dropdown-trigger ${showQuickLinksDropdown ? "open" : ""}`}
                  onMouseEnter={() => setShowQuickLinksDropdown(true)}
                  onMouseLeave={() => setShowQuickLinksDropdown(false)}
                >
                  Quick Links
                  <svg
                    className="dropdown-chevron"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Quick Links Dropdown Menu */}
                <div
                  className={`dropdown-menu ${showQuickLinksDropdown ? "open" : ""}`}
                  onMouseEnter={() => setShowQuickLinksDropdown(true)}
                  onMouseLeave={() => setShowQuickLinksDropdown(false)}
                >
                  <Link to="/saved-posts" className="dropdown-item">
                    <div className="dropdown-item-icon">
                      <HeartIcon />
                    </div>
                    <div className="dropdown-item-content">
                      <div className="dropdown-item-title">Saved Posts</div>
                      <div className="dropdown-item-description">
                        Your favorite properties
                      </div>
                    </div>
                  </Link>

                  <Link to="/messages" className="dropdown-item">
                    <div className="dropdown-item-icon">
                      <ChatIcon />
                    </div>
                    <div className="dropdown-item-content">
                      <div className="dropdown-item-title">Messages</div>
                      <div className="dropdown-item-description">
                        Connect with others
                      </div>
                    </div>
                  </Link>

                  {user.role === "Tenant" && (
                    <Link to="/UserHistory" className="dropdown-item">
                      <div className="dropdown-item-icon">
                        <HistoryIcon />
                      </div>
                      <div className="dropdown-item-content">
                        <div className="dropdown-item-title">History</div>
                        <div className="dropdown-item-description">
                          Your activity timeline
                        </div>
                      </div>
                    </Link>
                  )}

                  {user.role === "Tenant" && (
                    <Link to="/UserProposals" className="dropdown-item">
                      <div className="dropdown-item-icon">
                        <DocumentIcon />
                      </div>
                      <div className="dropdown-item-content">
                        <div className="dropdown-item-title">
                          Your Applications
                        </div>
                        <div className="dropdown-item-description">
                          Track your applications
                        </div>
                      </div>
                    </Link>
                  )}

                  {user.role === "Landlord" && (
                    <Link to="/landlord/subscription-plans" className="dropdown-item">
                      <div className="dropdown-item-icon">
                        <CreditCardIcon />
                      </div>
                      <div className="dropdown-item-content">
                        <div className="dropdown-item-title">
                          Subscription Plans
                        </div>
                        <div className="dropdown-item-description">
                          View and manage plans
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Section */}
          <div className="navbar-user">
            {/* Dark Mode Toggle */}
            <button
              className="dark-mode-toggle"
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {!user ? (
              <div className="auth-buttons">
                <Link to="/login" className="auth-btn login-btn">
                  Login
                </Link>
                <Link to="/register" className="auth-btn register-btn">
                  Register
                </Link>
              </div>
            ) : (
              <div className="user-profile">
                <div className="profile-dropdown">
                  <div className="profile-info-section">
                    <div className="Home-profile-avatar">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="profile-info">
                      <div className="profile-name">{user.name}</div>
                      <div className="profile-role">
                        {localStorage.getItem("role") || user.role}
                      </div>
                    </div>
                  </div>
                  {shouldShowProfile && (
                    <>
                      <Link
                        to="/profile"
                        className="profile-btn-desktop"
                        title="Profile"
                      >
                        <ProfileIcon />
                      </Link>
                      <Link
                        to="/contact"
                        className="profile-btn-desktop"
                        title="Support"
                      >
                        <SupportIcon />
                      </Link>
                    </>
                  )}
                  <button
                    className="logout-btn-desktop"
                    onClick={() => setShowLogoutModal(true)}
                    title="Logout"
                  >
                    <LogoutIcon />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(true)}
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Overlay */}
      <div
        className={`menu-overlay ${isMenuOpen ? "open" : ""}`}
        onClick={closeMenu}
      />

      {/* Menu Panel */}
      <div className={`menu-panel ${isMenuOpen ? "open" : ""}`}>
        <div className="menu-header">
          <h2 className="menu-title">Navigation</h2>
          <button className="menu-close" onClick={closeMenu}>
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="menu-content">
          <div className="menu-grid">
            {!user ? (
              <>
                <Link to="/" className="menu-card" onClick={closeMenu}>
                  <div className="menu-card-icon">
                    <HomeIcon />
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">Home</div>
                    <div className="menu-card-description">
                      Discover amazing properties
                    </div>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </Link>

                {shouldShowProfile && (
                  <Link to="/profile" className="menu-card" onClick={closeMenu}>
                    <div className="menu-card-icon">
                      <ProfileIcon />
                    </div>
                    <div className="menu-card-content">
                      <div className="menu-card-title">Profile</div>
                      <div className="menu-card-description">
                        View and edit your profile
                      </div>
                    </div>
                    <div className="menu-card-arrow">→</div>
                  </Link>
                )}

                <Link
                  to="/show-all-post"
                  className="menu-card"
                  onClick={closeMenu}
                >
                  <div className="menu-card-icon">
                    <SearchIcon />
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">Browse Properties</div>
                    <div className="menu-card-description">
                      Explore all available listings
                    </div>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </Link>

                <Link to="/login" className="menu-card" onClick={closeMenu}>
                  <div className="menu-card-icon">
                    <KeyIcon />
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">Login</div>
                    <div className="menu-card-description">
                      Access your account
                    </div>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </Link>

                <Link
                  to="/register"
                  className="menu-card primary"
                  onClick={closeMenu}
                >
                  <div className="menu-card-icon">
                    <UserPlusIcon />
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">Register</div>
                    <div className="menu-card-description">
                      Join our community
                    </div>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={
                    user.role === "Admin"
                      ? "/admin/dashboard"
                      : user.role === "Landlord"
                        ? "/landlord/dashboard"
                        : "/tenant/dashboard"
                  }
                  className="menu-card"
                  onClick={closeMenu}
                >
                  <div className="menu-card-icon">
                    <DashboardIcon />
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">Dashboard</div>
                    <div className="menu-card-description">
                      Your personal space
                    </div>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </Link>

                <Link
                  to="/show-all-post"
                  className="menu-card"
                  onClick={closeMenu}
                >
                  <div className="menu-card-icon">
                    <SearchIcon />
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">Browse Properties</div>
                    <div className="menu-card-description">
                      Find your perfect place
                    </div>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </Link>

                <Link
                  to="/saved-posts"
                  className="menu-card"
                  onClick={closeMenu}
                >
                  <div className="menu-card-icon">
                    <HeartIcon />
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">Saved Posts</div>
                    <div className="menu-card-description">
                      Your favorite properties
                    </div>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </Link>

                <Link to="/messages" className="menu-card" onClick={closeMenu}>
                  <div className="menu-card-icon">
                    <ChatIcon />
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">Messages</div>
                    <div className="menu-card-description">
                      Connect with others
                    </div>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </Link>

                <Link
                  to="/UserHistory"
                  className="menu-card"
                  onClick={closeMenu}
                >
                  <div className="menu-card-icon">
                    <HistoryIcon />
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">History</div>
                    <div className="menu-card-description">
                      Your activity timeline
                    </div>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </Link>

                <Link
                  to="/UserProposals"
                  className="menu-card"
                  onClick={closeMenu}
                >
                  <div className="menu-card-icon">
                    <DocumentIcon />
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">Your Applications</div>
                    <div className="menu-card-description">
                      Track your applications
                    </div>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </Link>

                {/* Dark Mode Toggle */}
                <div
                  className="menu-card dark-mode-card"
                  onClick={toggleDarkMode}
                >
                  <div className="menu-card-icon dark-mode-icon">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                    >
                      {darkMode ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      )}
                    </svg>
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">
                      {darkMode ? "Light Mode" : "Dark Mode"}
                    </div>
                    <div className="menu-card-description">
                      Switch to {darkMode ? "light" : "dark"} theme
                    </div>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </div>

                {/* Logout */}
                <div className="menu-card logout-card" onClick={handleLogout}>
                  <div className="menu-card-icon logout-icon">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">Logout</div>
                    <div className="menu-card-description">
                      Securely sign out
                    </div>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div
            className="modal-backdrop"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="modal-content">
            <div className="modal-icon-container">
              <div className="modal-icon-glow" />
              <div className="modal-icon">
                <LogoutIcon className="icon-lg" />
              </div>
            </div>

            <div className="modal-body">
              <h2 className="modal-title">Sign Out?</h2>
              <p className="modal-description">
                Are you sure you want to logout? You'll need to login again to
                access your account.
              </p>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="modal-btn modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="modal-btn modal-btn-confirm"
              >
                Logout
              </button>
            </div>

            <p className="modal-footer-text">
              Your data will remain safe. You can login anytime.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
