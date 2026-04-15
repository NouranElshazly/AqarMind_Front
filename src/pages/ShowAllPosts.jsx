import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import withDarkMode from "../components/withDarkMode";
import { addHistory } from "../services/pyapi";
import "../styles/ShowAllPosts.css";

import {
  FaHeart,
  FaRegHeart,
  FaUser,
  FaClock,
  FaHome,
  FaTimes,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaReply,
  FaUserTie,
  FaImage,
  FaTimesCircle,
  FaChevronDown,
  FaShareAlt,
  FaThumbtack,
  FaExclamationTriangle,
  FaStar,
  FaChartLine,
} from "react-icons/fa";

// --- دوال المساعدة (بدون تغيير) ---
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};
const getUserInfoFromToken = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  if (!token || !userId) return null;
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  return {
    userId: userId,
    userName: decoded.name || decoded.sub || "User",
    role:
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      localStorage.getItem("role"),
  };
};

const PropertyCardCarousel = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className="property-image-placeholder">
        <FaHome />
      </div>
    );
  }

  // Helper to format image source
  const getImgSrc = (img) => {
    if (typeof img === "string") {
      return img.startsWith("http") || img.startsWith("data:")
        ? img
        : `${API_BASE_URL}/${img}`;
    }
    return img?.url || img?.path || "";
  };

  return (
    <div className="property-image">
      <img
        src={getImgSrc(images[currentIndex])}
        alt={title}
        className="carousel-img"
      />

      {images.length > 1 && (
        <>
          <div className="image-counter">
            {currentIndex + 1} / {images.length}
          </div>
          <button className="carousel-arrow prev" onClick={prevImage}>
            <FaChevronDown style={{ transform: "rotate(90deg)" }} />
          </button>
          <button className="carousel-arrow next" onClick={nextImage}>
            <FaChevronDown style={{ transform: "rotate(-90deg)" }} />
          </button>
          <div className="carousel-dots">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`dot ${idx === currentIndex ? "active" : ""}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- المكون الرئيسي ---
const ShowAllPosts = () => {
  // ... (State variables without change) ...
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const userInfo = getUserInfoFromToken();
  const { role: userRole, userId, userName } = userInfo || {}; // 'userId' is the current user

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/Tenant/all-posts`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const initialPosts = res.data.map((post) => ({
          ...post,
          images: post.images || [],
          fileBase64: post.fileBase64 || null,
        }));

        // ✅ Show posts immediately
        setPosts(initialPosts);
        setFilteredPosts(initialPosts);
        setMessage("");
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setMessage("Failed to load posts or no posts available.");
        setPosts([]);
        setFilteredPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  const handleCardClick = (post, e) => {
    navigate(`/properties/${post.postId}`);
  };

  const handleSearch = async () => {
    const filtered = posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice =
        (minPrice ? post.price >= Number(minPrice) : true) &&
        (maxPrice ? post.price <= Number(maxPrice) : true);
      return matchesSearch && matchesPrice;
    });
    setFilteredPosts(filtered);
    setMessage(
      filtered.length === 0 ? "No posts found matching your criteria." : "",
    );
    if (searchQuery.trim() && userId) {
      await recordHistoryEvent(userId, "search", { query: searchQuery.trim() });
    }
  };

  // --- JSX Rendering (Main Page) ---
  if (loading)
    return (
      <div className="show-all-posts">
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading properties...</p>
          </div>
        </div>
      </div>
    );

  if (message && filteredPosts.length === 0 && !loading)
    return (
      <div className="show-all-posts">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Header with Search */}
          <div className="posts-hero">
            <div className="posts-hero-content">
              <h1 className="posts-hero-title">Available Properties</h1>
              <p className="posts-hero-subtitle">
                Discover your perfect home from our curated collection of
                properties
              </p>
              <div className="posts-hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-number">0</div>
                  <div className="hero-stat-label">Properties Found</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-number">∞</div>
                  <div className="hero-stat-label">Possibilities</div>
                </div>
              </div>

              {/* Hero Search Section */}
              <div className="hero-search-section">
                <div className="hero-search-container">
                  <div className="hero-search-grid">
                    <div className="hero-search-input-group">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search by title or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        className="hero-search-input"
                      />
                    </div>

                    <div className="hero-price-inputs">
                      <div className="hero-price-input-group">
                        <label className="hero-price-label">Min Price</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          min="0"
                          className="hero-price-input"
                        />
                      </div>
                      <div className="hero-price-input-group">
                        <label className="hero-price-label">Max Price</label>
                        <input
                          type="number"
                          placeholder="∞"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          min="0"
                          className="hero-price-input"
                        />
                      </div>
                    </div>

                    <div className="hero-search-actions">
                      <button
                        onClick={handleSearch}
                        className="hero-search-btn"
                      >
                        <FaSearch />
                        Search Properties
                      </button>
                      <button
                        onClick={handleSearch}
                        className="hero-filter-btn"
                      >
                        <FaFilter />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* No Results */}
          <div className="no-results">
            <FaExclamationTriangle className="no-results-icon" />
            <h3 className="no-results-title">No Properties Found</h3>
            <p className="no-results-message">{message}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="show-all-posts">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header with Search */}
        <div className="posts-hero">
          <div className="posts-hero-content">
            <h1 className="posts-hero-title">Available Properties</h1>
            <p className="posts-hero-subtitle">
              Discover your perfect home from our curated collection of
              properties
            </p>
            <div className="posts-hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-number">{filteredPosts.length}</div>
                <div className="hero-stat-label">Properties Available</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">{posts.length}</div>
                <div className="hero-stat-label">Total Listings</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">
                  {filteredPosts.reduce(
                    (sum, post) => sum + (post.likes_count || 0),
                    0,
                  )}
                </div>
                <div className="hero-stat-label">Total Likes</div>
              </div>
            </div>

            {/* Hero Search Section */}
            <div className="hero-search-section">
              <div className="hero-search-container">
                <div className="hero-search-grid">
                  <div className="hero-search-input-group">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by title or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="hero-search-input"
                    />
                  </div>

                  <div className="hero-price-inputs">
                    <div className="hero-price-input-group">
                      <label className="hero-price-label">Min Price</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        min="0"
                        className="hero-price-input"
                      />
                    </div>
                    <div className="hero-price-input-group">
                      <label className="hero-price-label">Max Price</label>
                      <input
                        type="number"
                        placeholder="∞"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        min="0"
                        className="hero-price-input"
                      />
                    </div>
                  </div>

                  <div className="hero-search-actions">
                    <button onClick={handleSearch} className="hero-search-btn">
                      <FaSearch />
                      Search Properties
                    </button>
                    <button onClick={handleSearch} className="hero-filter-btn">
                      <FaFilter />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* No Results Message */}
        {message && filteredPosts.length === 0 && (
          <div className="no-results">
            <FaExclamationTriangle className="no-results-icon" />
            <h3 className="no-results-title">No Properties Found</h3>
            <p className="no-results-message">{message}</p>
          </div>
        )}

        {/* Properties Grid */}
        <div className="properties-grid">
          {filteredPosts.map((post) => {
            const postUserIdStr = String(userId);

            const images = Array.isArray(post.images)
              ? post.images
              : post.image
                ? [post.image]
                : [];
            const hasMultipleImages =
              Array.isArray(images) && images.length > 1;
            const firstImage =
              Array.isArray(images) && images.length > 0
                ? images[0]
                : post.image || null;

            // Build imageSrc safely for string URLs, data URIs, or object shapes
            let imageSrc = "";
            if (firstImage) {
              if (typeof firstImage === "string") {
                imageSrc =
                  firstImage.startsWith("http") ||
                  firstImage.startsWith("data:")
                    ? firstImage
                    : `${API_BASE_URL}/${firstImage}`;
              } else if (
                typeof firstImage === "object" &&
                firstImage !== null
              ) {
                const possible =
                  firstImage.url ||
                  firstImage.path ||
                  firstImage.src ||
                  firstImage.fileName ||
                  firstImage.name ||
                  "";
                if (possible) {
                  imageSrc =
                    possible.startsWith("http") || possible.startsWith("data:")
                      ? possible
                      : `${API_BASE_URL}/${possible}`;
                } else {
                  // fallback to empty string to avoid runtime errors
                  imageSrc = "";
                }
              } else {
                imageSrc = "";
              }
            }

            return (
              <div
                key={post.postId}
                onClick={(e) => handleCardClick(post, e)}
                className="property-card"
              >
                {/* 1. The Carousel Base */}
                <PropertyCardCarousel
                  images={
                    Array.isArray(post.images)
                      ? post.images
                      : post.image
                        ? [post.image]
                        : []
                  }
                  title={post.title}
                />

                <div className="property-content">
                  <div className="property-header">
                    <div className="property-author">
                      <FaUser />
                      <span>{post.userName || post.user_name || "User"}</span>
                    </div>
                    <div className="property-date-top">
                      <FaClock />
                      {new Date(post.datePost).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 className="property-title">{post.title}</h3>
                  <p className="property-description">{post.description}</p>
                  <div className="property-price-location">
                    <span className="property-price">
                      ${post.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShowAllPosts;
