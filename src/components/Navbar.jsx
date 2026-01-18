import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { useDarkMode } from "../App";
import logo2 from "../assets/AqarMindLogo-removebg-preview.png";

// SVG Icons Components
const HomeIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SearchIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const KeyIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const UserPlusIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const DashboardIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const BuildingIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const HeartIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ChatIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const BusinessIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
  </svg>
);

const ComputerIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const DocumentIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const HistoryIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClipboardIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const LogoutIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const CloseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Sun and Moon Icons for Dark/Light Mode
const SunIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

// Logout Modal Component
const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-500"
        onClick={onCancel}
      />

      <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl shadow-2xl shadow-black/60 border border-slate-600/30 p-8 max-w-sm w-full mx-4 overflow-hidden transform scale-95 animate-modal-appear">
        <div className="absolute inset-0 bg-gradient-to-tr from-red-500/5 via-transparent to-pink-500/5 pointer-events-none" />

        <div className="flex justify-center mb-6 relative">
          <div className="absolute inset-0 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-full blur-2xl animate-pulse" />
          </div>
          <div className="relative w-16 h-16 bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-full flex items-center justify-center border border-red-400/50 shadow-lg shadow-red-500/20 animate-bounce-slow">
            <LogoutIcon className="w-8 h-8 text-red-300" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-3">
            Sign Out?
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to logout? You'll need to login again to
            access your account.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 flex-col-reverse sm:flex-row relative z-10">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-700/40 hover:bg-slate-700/60 text-gray-100 font-semibold transition-all duration-300 border border-slate-600/40 hover:border-slate-500/60 hover:shadow-lg hover:shadow-slate-700/20 transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold transition-all duration-300 shadow-lg shadow-red-500/40 hover:shadow-red-500/60 hover:-translate-y-1 active:translate-y-0 border border-red-400/30 transform hover:scale-105"
          >
            Logout
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6 border-t border-slate-700/50 pt-6 relative z-10">
          Your data will remain safe. You can login anytime.
        </p>
      </div>
    </div>
  );
};

// Enhanced Hamburger Menu Component for ALL screens
const HamburgerMenu = ({ isOpen, user, onClose, onLogout, darkMode, toggleDarkMode }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Animated Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-900/95 backdrop-blur-xl transition-all duration-700"
        onClick={onClose}
      />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 10 + 's',
              animationDuration: Math.random() * 15 + 10 + 's'
            }}
          />
        ))}
      </div>

      {/* Main Menu Panel - Centered for all screens */}
      <div 
        ref={menuRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-4xl h-5/6 max-h-[800px] bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-blue-900/90 rounded-3xl shadow-2xl shadow-black/60 border border-white/10 backdrop-blur-2xl overflow-hidden transition-all duration-700"
        style={{ 
          transform: isOpen ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.9)',
          opacity: isOpen ? 1 : 0
        }}
      >
        {/* Header with User Info */}
        <div className="relative p-8 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-blue-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/40 animate-pulse-slow">
                  <span className="text-white font-bold text-xl">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-2xl">{user?.name || 'Welcome'}</p>
                <p className="text-slate-300 text-lg capitalize bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {user?.role || 'Guest'}
                </p>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-500 hover:rotate-180 hover:scale-110 border border-white/20 hover:border-white/40"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Menu Content Grid */}
        <div className="p-8 overflow-y-auto h-[calc(100%-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {!user ? (
              <>
                <MenuCard 
                  to="/" 
                  label="Home" 
                  icon={<HomeIcon className="w-7 h-7" />}
                  description="Discover amazing properties"
                  onClick={onClose}
                />
                <MenuCard 
                  to="/show-all-post" 
                  label="Browse Properties" 
                  icon={<SearchIcon className="w-7 h-7" />}
                  description="Explore all available listings"
                  onClick={onClose}
                />
                <MenuCard 
                  to="/login" 
                  label="Login" 
                  icon={<KeyIcon className="w-7 h-7" />}
                  description="Access your account"
                  onClick={onClose}
                />
                <MenuCard 
                  to="/register" 
                  label="Register" 
                  icon={<UserPlusIcon className="w-7 h-7" />}
                  description="Join our community"
                  onClick={onClose}
                  isPrimary
                />
              </>
            ) : (
              <>
                {/* Common Links for All Users */}
                {(user?.role === "Tenant" || user?.role === "Landlord") && (
                  <>
                    <MenuCard 
                      to={user?.role === "Landlord" ? "/landlord/dashboard" : "/tenant/dashboard"} 
                      label="Dashboard" 
                      icon={<DashboardIcon className="w-7 h-7" />}
                      description="Your personal space"
                      onClick={onClose}
                    />

                    <MenuCard 
                      to="/show-all-post" 
                      label="Browse Properties" 
                      icon={<BuildingIcon className="w-7 h-7" />}
                      description="Find your perfect place"
                      onClick={onClose}
                    />

                    <MenuCard 
                      to="/saved-posts" 
                      label="Saved Posts" 
                      icon={<HeartIcon className="w-7 h-7" />}
                      description="Your favorite properties"
                      onClick={onClose}
                    />

                    <MenuCard 
                      to="/messages" 
                      label="Messages" 
                      icon={<ChatIcon className="w-7 h-7" />}
                      description="Connect with others"
                      onClick={onClose}
                    />
                  </>
                )}

                {/* Admin Specific Links */}
                {user?.role === "Admin" && (
                  <>
                    <MenuCard 
                      to="/admin/dashboard" 
                      label="Dashboard" 
                      icon={<DashboardIcon className="w-7 h-7" />}
                      description="Admin overview and controls"
                      onClick={onClose}
                    />

                    <MenuCard 
                      to="/show-all-post" 
                      label="Browse Properties" 
                      icon={<SearchIcon className="w-7 h-7" />}
                      description="Explore all available listings"
                      onClick={onClose}
                    />
                    <MenuCard 
                      to="/admin/pending-landlords" 
                      label="Pending Landlords" 
                      icon={<BusinessIcon className="w-7 h-7" />}
                      description="Review landlord applications"
                      onClick={onClose}
                    />
                    <MenuCard 
                      to="/admin/AdminChatDashboard" 
                      label="Chat Dashboard" 
                      icon={<ComputerIcon className="w-7 h-7" />}
                      description="Manage all conversations"
                      onClick={onClose}
                    />
                    <MenuCard 
                      to="/admin/landlord-applications" 
                      label="Pending Properties" 
                      icon={<DocumentIcon className="w-7 h-7" />}
                      description="Approve new listings"
                      onClick={onClose}
                    />
                  </>
                )}

                {/* Landlord Specific Links */}
                {user?.role === "Landlord" && (
                  <>
                    <MenuCard 
                      to="/landlord/properties" 
                      label="My Properties" 
                      icon={<BuildingIcon className="w-7 h-7" />}
                      description="Manage your listings"
                      onClick={onClose}
                    />
                    <MenuCard 
                      to="/landlord/proposals" 
                      label="Proposals" 
                      icon={<ClipboardIcon className="w-7 h-7" />}
                      description="View rental proposals"
                      onClick={onClose}
                    />
                  </>
                )}

                {/* Tenant Specific Links */}
                {user?.role === "Tenant" && (
                  <>
                    <MenuCard 
                      to="/UserHistory" 
                      label="History" 
                      icon={<HistoryIcon className="w-7 h-7" />}
                      description="Your activity timeline"
                      onClick={onClose}
                    />
                    <MenuCard 
                      to="/UserProperties" 
                      label="Your Applications" 
                      icon={<DocumentIcon className="w-7 h-7" />}
                      description="Track your applications"
                      onClick={onClose}
                    />
                  </>
                )}

                {/* Dark Mode Toggle Card */}
                <div 
                  onClick={toggleDarkMode}
                  className="group cursor-pointer bg-gradient-to-br from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 rounded-2xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-amber-500/20 group-hover:bg-amber-500/30 flex items-center justify-center transition-colors duration-500">
                      {darkMode ? (
                        <SunIcon className="w-7 h-7 text-amber-400 group-hover:text-amber-300" />
                      ) : (
                        <MoonIcon className="w-7 h-7 text-amber-400 group-hover:text-amber-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-amber-300 group-hover:text-white font-bold text-lg mb-1 transition-colors duration-300">
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </h3>
                      <p className="text-amber-400/70 group-hover:text-amber-300/80 text-sm transition-colors duration-300">
                        Switch to {darkMode ? 'light' : 'dark'} theme
                      </p>
                    </div>
                    <div className="text-2xl text-amber-400 group-hover:text-amber-300 group-hover:translate-x-2 transition-all duration-300">
                      →
                    </div>
                  </div>
                </div>

                {/* Logout Card */}
                <div 
                  onClick={onLogout}
                  className="group cursor-pointer bg-gradient-to-br from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 rounded-2xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-red-500/20 group-hover:bg-red-500/30 flex items-center justify-center transition-colors duration-500">
                      <LogoutIcon className="w-7 h-7 text-red-400 group-hover:text-red-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-red-300 group-hover:text-white font-bold text-lg mb-1 transition-colors duration-300">
                        Logout
                      </h3>
                      <p className="text-red-400/70 group-hover:text-red-300/80 text-sm transition-colors duration-300">
                        Securely sign out of your account
                      </p>
                    </div>
                    <div className="text-2xl text-red-400 group-hover:text-red-300 group-hover:translate-x-2 transition-all duration-300">
                      →
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-gradient-to-r from-slate-800/50 to-blue-700/30">
          <div className="flex justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2025 AqarMind. Crafted with excellence.
            </p>
            <div className="flex gap-4">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Menu Card Component
const MenuCard = ({ to, label, icon, description, onClick, isPrimary = false }) => {
  if (isPrimary) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className="group bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 border border-blue-400/30 hover:border-blue-300/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-colors duration-500">
            <div className="text-white">
              {icon}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1">{label}</h3>
            <p className="text-white/80 text-sm">{description}</p>
          </div>
          <div className="text-2xl text-white/60 group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
            →
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 hover:from-slate-600/50 hover:to-slate-700/50 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 backdrop-blur-sm"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors duration-500">
          <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-200 transition-colors duration-300">
            {label}
          </h3>
          <p className="text-slate-300 group-hover:text-slate-200 text-sm transition-colors duration-300">
            {description}
          </p>
        </div>
        <div className="text-2xl text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-2 transition-all duration-300">
          →
        </div>
      </div>
    </Link>
  );
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    sessionStorage.clear();
    localStorage.clear();
    navigate("/login");
    setIsMenuOpen(false);
    setShowLogoutModal(false);
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className={`sticky top-0 z-40 transition-all duration-700 ${
        scrolled 
          ? 'bg-gradient-to-r from-slate-900/95 via-blue-900/90 to-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-slate-900/60 border-b border-white/10 py-2' 
          : 'bg-gradient-to-r from-slate-800/90 via-blue-800/85 to-slate-800/90 backdrop-blur-xl shadow-xl shadow-slate-900/50 border-b border-white/10 py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Brand Logo */}
            <Link 
              to="/" 
              className="group relative transition-all duration-500 hover:scale-105"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                src={logo2}
                alt="AqarMind Logo"
                className="h-16 w-auto object-contain relative z-10 filter drop-shadow-2xl"
              />
            </Link>

            {/* Right Side Controls */}
            <div className="flex items-center gap-4">
              {/* Dark/Light Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="relative w-14 h-14 flex items-center justify-center group transition-all duration-500"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {/* Animated Background */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                  darkMode 
                    ? 'bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500/20 group-hover:border-amber-500/40' 
                    : 'bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20 group-hover:border-blue-500/40'
                } border backdrop-blur-sm`} />
                
                {/* Pulsing Effect */}
                <div className={`absolute inset-0 rounded-2xl scale-110 transition-all duration-500 ${
                  darkMode ? 'bg-amber-500/20' : 'bg-blue-500/20'
                } ${darkMode ? 'animate-pulse-slow' : ''}`} />
                
                {/* Icon Container */}
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
                  darkMode 
                    ? 'bg-amber-500/20 text-amber-300 group-hover:bg-amber-500/30' 
                    : 'bg-blue-500/20 text-blue-300 group-hover:bg-blue-500/30'
                }`}>
                  {darkMode ? (
                    <SunIcon className="w-5 h-5 transition-all duration-500 group-hover:rotate-180" />
                  ) : (
                    <MoonIcon className="w-5 h-5 transition-all duration-500 group-hover:rotate-180" />
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-slate-600">
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </div>
              </button>

              {/* Enhanced Hamburger Button for ALL screens */}
              <button
                className="relative w-16 h-16 flex flex-col items-center justify-center gap-2 group"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {/* Animated Bars */}
                <div className={`w-8 h-1 bg-gradient-to-r from-white to-slate-200 rounded-full transition-all duration-700 ${
                  isMenuOpen ? 'rotate-45 translate-y-3' : ''
                } group-hover:from-cyan-400 group-hover:to-blue-400`} />
                <div className={`w-8 h-1 bg-gradient-to-r from-white to-slate-200 rounded-full transition-all duration-500 ${
                  isMenuOpen ? 'opacity-0 -translate-x-4' : ''
                } group-hover:from-cyan-400 group-hover:to-blue-400`} />
                <div className={`w-8 h-1 bg-gradient-to-r from-white to-slate-200 rounded-full transition-all duration-700 ${
                  isMenuOpen ? '-rotate-45 -translate-y-3' : ''
                } group-hover:from-cyan-400 group-hover:to-blue-400`} />
                
                {/* Animated Border */}
                <div className={`absolute inset-0 border-2 rounded-2xl transition-all duration-500 ${
                  isMenuOpen 
                    ? 'border-cyan-400/50 bg-cyan-400/10 scale-110' 
                    : 'border-white/20 group-hover:border-cyan-400/30 group-hover:bg-cyan-400/5'
                }`} />
                
                {/* Pulsing Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-cyan-400/20 scale-110 transition-all duration-500 ${
                  isMenuOpen ? 'animate-ping opacity-20' : 'opacity-0'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hamburger Menu for ALL screens */}
      <HamburgerMenu
        isOpen={isMenuOpen}
        user={user}
        onClose={closeMenu}
        onLogout={openLogoutModal}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <style jsx>{`
        @keyframes modal-appear {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-modal-appear {
          animation: modal-appear 0.5s ease-out forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default Navbar;