import React, { useState, useEffect, useMemo, useCallback } from "react"; // added useCallback
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
      <div className="property-image">
        <div className="property-image-placeholder">
          <FaHome />
        </div>
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
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedroomsFilter, setBedroomsFilter] = useState("");
  const [bathroomsFilter, setBathroomsFilter] = useState("");
  const [garageFilter, setGarageFilter] = useState("any");
  const [furnishedFilter, setFurnishedFilter] = useState("any");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;
  const navigate = useNavigate();

  // Reset to first page when filtering changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredPosts]);

  // Pagination Logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const userInfo = getUserInfoFromToken();
  const { role: userRole, userId, userName } = userInfo || {};

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/Tenant/all-posts`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const initialPosts = res.data.map((post) => ({
          ...post,
          images:
            post.images && post.images.length > 0
              ? post.images
              : post.projectImages && post.projectImages.length > 0
                ? post.projectImages
                : post.image
                  ? [post.image]
                  : [],
          fileBase64: post.fileBase64 || null,
        }));

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

  const recordHistoryEvent = async (currentUserId, activityType, details) => {
    if (!currentUserId || !activityType || !details) return;
    try {
      await addHistory(currentUserId, { activity_type: activityType, details });
    } catch (error) {
      console.error(`Failed to record history event (${activityType}):`, error);
    }
  };

  const normalizeText = (value) => String(value || "").toLowerCase().trim();

  const getFirstNumber = (...values) => {
    for (const value of values) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return null;
  };

  const getBooleanValue = (value) => {
    if (
      value === true ||
      value === 1 ||
      value === "1" ||
      value === "true" ||
      value === "True"
    ) {
      return true;
    }
    if (
      value === false ||
      value === 0 ||
      value === "0" ||
      value === "false" ||
      value === "False"
    ) {
      return false;
    }
    return null;
  };

  const getSearchableText = (post) =>
    [
      post.title,
      post.location,
      post.locationPath,
      post.userName,
      post.user_name,
    ]
      .map((value) => normalizeText(value))
      .filter(Boolean)
      .join(" ");

  const locationSuggestions = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) return [];

    const uniqueLocations = [
      ...new Set(
        posts
          .flatMap((post) => [post.location, post.locationPath])
          .map((value) => String(value || "").trim())
          .filter(Boolean),
      ),
    ];

    return uniqueLocations
      .filter((location) => normalizeText(location).includes(query))
      .sort((a, b) => {
        const aStarts = normalizeText(a).startsWith(query);
        const bStarts = normalizeText(b).startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 8);
  }, [posts, searchQuery]);

  // ── Live filtering: wrapped in useCallback so the useEffect below
  //    only re-runs when the actual filter values change, not on every render ──
  const applyFilters = useCallback(() => {
    const filtered = posts.filter((post) => {
      const query = normalizeText(searchQuery);
      const searchableText = getSearchableText(post);
      const matchesSearch = !query || searchableText.includes(query);

      const matchesPrice =
        (minPrice ? post.price >= Number(minPrice) : true) &&
        (maxPrice ? post.price <= Number(maxPrice) : true);

      const postBedrooms = getFirstNumber(
        post.numOfRooms,
        post.numberOfRooms,
        post.bedrooms,
      );
      const postBathrooms = getFirstNumber(
        post.numOfBathrooms,
        post.numberOfBathrooms,
        post.bathrooms,
      );
      const postHasGarage = getBooleanValue(post.hasGarage);
      const postIsFurnished = getBooleanValue(post.isFurnished);

      const matchesBedrooms = bedroomsFilter
        ? postBedrooms === Number(bedroomsFilter)
        : true;
      const matchesBathrooms = bathroomsFilter
        ? postBathrooms === Number(bathroomsFilter)
        : true;

      const matchesGarage =
        garageFilter === "any"
          ? true
          : garageFilter === "yes"
            ? postHasGarage === true
            : postHasGarage === false;

      const matchesFurnished =
        furnishedFilter === "any"
          ? true
          : furnishedFilter === "yes"
            ? postIsFurnished === true
            : postIsFurnished === false;

      return (
        matchesSearch &&
        matchesPrice &&
        matchesBedrooms &&
        matchesBathrooms &&
        matchesGarage &&
        matchesFurnished
      );
    });

    setFilteredPosts(filtered);
    setMessage(
      filtered.length === 0 && posts.length > 0
        ? "No posts found matching your criteria."
        : "",
    );
  }, [
    posts,
    searchQuery,
    minPrice,
    maxPrice,
    bedroomsFilter,
    bathroomsFilter,
    garageFilter,
    furnishedFilter,
  ]);

  // ── Triggers applyFilters automatically on every filter change ──
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // ── Debounced history recording — fires 800ms after the user stops typing ──
  useEffect(() => {
    if (!searchQuery.trim() || !userId) return;
    const timer = setTimeout(() => {
      recordHistoryEvent(userId, "search", { query: searchQuery.trim() });
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery, userId]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setBedroomsFilter("");
    setBathroomsFilter("");
    setGarageFilter("any");
    setFurnishedFilter("any");
    setFilteredPosts(posts);
    setMessage("");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    bedroomsFilter !== "" ||
    bathroomsFilter !== "" ||
    garageFilter !== "any" ||
    furnishedFilter !== "any";

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
                        list="location-suggestions"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="hero-search-input"
                      />
                      <datalist id="location-suggestions">
                        {locationSuggestions.map((location) => (
                          <option key={location} value={location} />
                        ))}
                      </datalist>
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

                    <div className="hero-advanced-filters">
                      <div className="hero-price-input-group">
                        <label className="hero-price-label">Bedrooms</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Any"
                          value={bedroomsFilter}
                          onChange={(e) => setBedroomsFilter(e.target.value)}
                          className="hero-price-input"
                        />
                      </div>
                      <div className="hero-price-input-group">
                        <label className="hero-price-label">Bathrooms</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Any"
                          value={bathroomsFilter}
                          onChange={(e) => setBathroomsFilter(e.target.value)}
                          className="hero-price-input"
                        />
                      </div>
                      <div className="hero-price-input-group">
                        <label className="hero-price-label">Garage</label>
                        <select
                          value={garageFilter}
                          onChange={(e) => setGarageFilter(e.target.value)}
                          className="hero-feature-select"
                        >
                          <option value="any">Any</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div className="hero-price-input-group">
                        <label className="hero-price-label">Furnished</label>
                        <select
                          value={furnishedFilter}
                          onChange={(e) => setFurnishedFilter(e.target.value)}
                          className="hero-feature-select"
                        >
                          <option value="any">Any</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <div className="hero-search-actions">
                        <button
                          onClick={handleClearSearch}
                          className="hero-clear-btn"
                        >
                          <FaTimes />
                          Clear
                        </button>
                      </div>
                    )}
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
            </div>

            {/* Hero Search Section */}
            <div className="hero-search-section">
              <div className="hero-search-container">
                <div className="hero-search-grid">
                  <div className="hero-search-input-group">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by title or location or a Username..."
                      list="location-suggestions"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="hero-search-input"
                    />
                    <datalist id="location-suggestions">
                      {locationSuggestions.map((location) => (
                        <option key={location} value={location} />
                      ))}
                    </datalist>
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

                  <div className="hero-advanced-filters">
                    <div className="hero-price-input-group">
                      <label className="hero-price-label">Bedrooms</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Any"
                        value={bedroomsFilter}
                        onChange={(e) => setBedroomsFilter(e.target.value)}
                        className="hero-price-input"
                      />
                    </div>
                    <div className="hero-price-input-group">
                      <label className="hero-price-label">Bathrooms</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Any"
                        value={bathroomsFilter}
                        onChange={(e) => setBathroomsFilter(e.target.value)}
                        className="hero-price-input"
                      />
                    </div>
                    <div className="hero-price-input-group">
                      <label className="hero-price-label">Garage</label>
                      <select
                        value={garageFilter}
                        onChange={(e) => setGarageFilter(e.target.value)}
                        className="hero-feature-select"
                      >
                        <option value="any">Any</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="hero-price-input-group">
                      <label className="hero-price-label">Furnished</label>
                      <select
                        value={furnishedFilter}
                        onChange={(e) => setFurnishedFilter(e.target.value)}
                        className="hero-feature-select"
                      >
                        <option value="any">Any</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="hero-search-actions">
                      <button
                        onClick={handleClearSearch}
                        className="hero-clear-btn"
                      >
                        <FaTimes />
                        Clear
                      </button>
                    </div>
                  )}
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
          {currentPosts.map((post) => {
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
                    <span className="property-location-text">
                      {post.location || "Location not available"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <div className="pagination-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`pagination-number ${currentPage === i + 1 ? "active" : ""
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowAllPosts;