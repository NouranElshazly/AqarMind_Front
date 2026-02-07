import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaRocket,
  FaStar,
  FaArrowRight,
  FaPlay,
  FaCheck,
  FaUsers,
  FaCity,
  FaHeart,
  FaShieldAlt,
  FaSearch,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaPhone,
  FaHeadset,
  FaLock,
  FaPercentage,
  FaBuilding,
  FaHotel,
  FaMobileAlt,
  FaMoneyCheckAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCalendarAlt,
  FaAlignLeft,
  FaDollarSign,
} from "react-icons/fa";
import API_BASE_URL from "../services/ApiConfig";
import Navbar from "../components/Navbar";
import AdPopup from "../components/AdPopup";
import "../styles/Home.css";

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCounter();
        }
      },
      { threshold: 0.1 },
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current);
      }
    };
  }, []);

  const startCounter = () => {
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  return <span ref={countRef}>{count.toLocaleString()}</span>;
};

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [adData, setAdData] = useState(null);
  const [showAdPopup, setShowAdPopup] = useState(false);

  useEffect(() => {
    fetchFeaturedProperties();
    
    // Delay fetching ad to handle redirect cases (e.g. after login)
    // If the user is redirected immediately, the component will unmount and clear this timeout
    const adTimer = setTimeout(() => {
      fetchAd();
    }, 800);

    return () => clearTimeout(adTimer);
  }, []);

  const fetchAd = async () => {
    // Check if ad has already been shown in this session
    if (sessionStorage.getItem('adShown')) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/ads/popup`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data) {
        setAdData(res.data);
        setShowAdPopup(true);
        // Mark ad as shown in this session
        sessionStorage.setItem('adShown', 'true');
      }
    } catch (error) {
      console.error("Error fetching ad:", error);
    }
  };

  const fetchFeaturedProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/Tenant/all-posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const featured = res.data.slice(0, 6);
      setFeaturedProperties(featured);

      // Initialize current image index for each property
      const initialIndexes = {};
      featured.forEach((property) => {
        initialIndexes[property.postId] = 0;
      });
      setCurrentImageIndexes(initialIndexes);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setFeaturedProperties(sampleProperties);

      // Initialize indexes for sample properties too
      const initialIndexes = {};
      sampleProperties.forEach((property) => {
        initialIndexes[property.postId] = 0;
      });
      setCurrentImageIndexes(initialIndexes);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = (propertyId, imagesLength) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]: (prev[propertyId] + 1) % imagesLength,
    }));
  };

  const prevImage = (propertyId, imagesLength) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]:
        prev[propertyId] === 0 ? imagesLength - 1 : prev[propertyId] - 1,
    }));
  };

  const goToImage = (propertyId, index) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]: index,
    }));
  };

  const sampleProperties = [
    {
      id: 1,
      postId: 1,
      title: "Skyline Penthouse",
      location: "Brooklyn, New York",
      price: 2450,
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      type: "FOR SALE",
      userName: "Michael Scott",
      datePost: "2023-10-15T10:00:00Z",
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      ],
      featured: true,
    },
    {
      id: 2,
      postId: 2,
      title: "Cedar Creek Villa",
      location: "Austin, Texas",
      price: 8500,
      bedrooms: 4,
      bathrooms: 3,
      area: 320,
      type: "FOR RENT",
      userName: "Pam Beesly",
      datePost: "2023-10-12T14:30:00Z",
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      ],
      featured: true,
    },
    {
      id: 3,
      postId: 3,
      title: "Urban Loft Suite",
      location: "Chicago, Illinois",
      price: 6825,
      bedrooms: 2,
      bathrooms: 2,
      area: 150,
      type: "NEW LISTING",
      userName: "Jim Halpert",
      datePost: "2023-10-18T09:15:00Z",
      images: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      ],
      featured: true,
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Jenkins",
      comment:
        "You've found home with the right Agent. This was my first home and I appreciated the patience shown to me.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      role: "Real Estate Investor",
    },
    {
      id: 2,
      name: "Marcus Rhone",
      comment:
        "The gym/builder support team was incredibly accommodating every step of the way. They listened to what I wanted.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      role: "Product Manager",
    },
    {
      id: 3,
      name: "Elena Rodriguez",
      comment:
        "Transparency is what I really appreciate. No hidden fees, very clear terms, and great communication from agents.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      role: "Business Manager",
    },
  ];

  const features = [
    {
      icon: <FaLock />,
      title: "100% Verified Listings",
      description: "Every property is thoroughly vetted to ensure accuracy",
    },
    {
      icon: <FaPercentage />,
      title: "Lowest Commission",
      description: "We offer the most competitive rates in the market",
    },
    {
      icon: <FaRocket />,
      title: "Fast Track Closings",
      description: "Complete your property deal up to 50% faster",
    },
  ];

  const propertyTypes = [
    {
      title: "Luxury Villas",
      count: "200+ Listings",
      icon: <FaBuilding />,
    },
    {
      title: "Apartments",
      count: "3,280+ Listings",
      icon: <FaHotel />,
    },
    {
      title: "Offices",
      count: "500+ Listings",
      icon: <FaBuilding />,
    },
    {
      title: "Land Plots",
      count: "100+ Listings",
      icon: <FaCity />,
    },
  ];

  const supportFeatures = [
    {
      icon: <FaHeadset />,
      title: "Online Night Support",
      description:
        "Buying a home is a big step. Our talented night team is available around the clock.",
    },
    {
      icon: <FaPhone />,
      title: "Call Us Now",
      description:
        "Get immediate assistance from our expert property consultants anytime.",
    },
    {
      icon: <FaMobileAlt />,
      title: "Live Chat",
      description:
        "Connect instantly with our support team through our mobile app.",
    },
    {
      icon: <FaUsers />,
      title: "14 Agents",
      description:
        "A dedicated team ready to help you find your perfect property.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-background">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920"
            alt="Hero background"
          />
        </div>
        <div className="home-hero-overlay" />

        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Find Your <span className="home-hero-title-accent">Dream Home</span>
            <br />
            With Ease
          </h1>
          <p className="home-hero-subtitle">
            Search over 50,000 verified listings across the country with our
            expert local guidance, available anytime and day.
          </p>

          {/* Search Box */}
          <div className="home-search">
            <div className="home-search-container">
              <div className="home-search-input-group">
                <FaMapMarkerAlt />
                <input
                  type="text"
                  placeholder="Location"
                  className="home-search-input"
                />
              </div>

              <div className="home-search-input-group">
                <FaBuilding />
                <input
                  type="text"
                  placeholder="Property Type"
                  className="home-search-input"
                />
              </div>

              <button className="home-search-btn">
                <FaSearch />
                Search Properties
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="home-featured">
        <div className="container">
          <div className="home-featured-header">
            <h2>Featured Properties</h2>
            <p>Explore our handpicked selection of premium properties</p>
            <Link to="/show-all-post" className="home-featured-link">
              View All <FaArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="home-loading">
              <div className="home-loading-spinner" />
            </div>
          ) : (
            <div className="home-properties-grid">
              {featuredProperties.map((property) => {
                const propertyKey = property.postId;
                const currentIndex = currentImageIndexes[propertyKey] ;
                const images =property.images ;
                const hasMultipleImages = images && images.length > 1;

                return (
                  <Link
                    key={propertyKey}
                    to={`/properties/${property.postId}`}
                    className="home-property-card-link"
                  >
                    <div className="home-property-card">
                      <div className="home-property-image">
                        <img
                          src={
                            images && images.length > 0
                              ? images[currentIndex].startsWith("http")
                                ? images[currentIndex]
                                : `${API_BASE_URL}/${images[currentIndex]}`
                              : property.image &&
                                  property.image.startsWith("http")
                                ? property.image
                                : `${API_BASE_URL}/${property.image}`
                          }
                          alt={property.title}
                        />
                        <div className="home-property-badge">
                          {property.status === -1
                            ? "Sold"
                            : property.status === 0
                              ? "Available"
                              : property.status === 1
                                ? "Under Negotiation"
                                : property.status}
                        </div>

                        {/* Image Navigation Arrows */}
                        {hasMultipleImages && (
                          <>
                            <button
                              className="home-property-nav home-property-nav-prev"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                prevImage(propertyKey, images.length);
                              }}
                            >
                              <FaChevronLeft />
                            </button>
                            <button
                              className="home-property-nav home-property-nav-next"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                nextImage(propertyKey, images.length);
                              }}
                            >
                              <FaChevronRight />
                            </button>
                          </>
                        )}

                        {/* Image Indicators */}
                        {hasMultipleImages && (
                          <div className="home-property-indicators">
                            {images.map((_, index) => (
                              <button
                                key={index}
                                className={`home-property-indicator ${index === currentIndex ? "active" : ""}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  goToImage(propertyKey, index);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="home-property-content">
                        <div className="home-property-price">
                          <h3 className="home-property-title">
                            {property.title}
                          </h3>
                          <div className="home-property-description">
                            <i class="fa-solid fa-angle-right"></i>
                            <span>{property.description}</span>
                          </div>
                          <div className="home-price-row">
                            <FaDollarSign className="home-price-icon" />{" "}
                            {property.price?.toLocaleString()}
                          </div>
                        </div>

                        <div className="home-property-meta-small">
                          <div className="home-property-user">
                            <FaUser />
                            <span>{property.userName}</span>
                          </div>
                          <div className="home-property-date">
                            <FaCalendarAlt />
                            <span>
                              {property.datePost
                                ? new Date(
                                    property.datePost,
                                  ).toLocaleDateString()
                                : "Just now"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Property Types Section */}
      <section className="home-property-types">
        <div className="container">
          <div className="home-property-types-header">
            <h2>Explore Our Property Types</h2>
            <p>
              Browse through our diverse portfolio of residential and commercial
              spaces catered for every lifestyle.
            </p>
          </div>

          <div className="home-property-types-grid">
            {propertyTypes.map((type, index) => (
              <div key={index} className="home-property-type-card">
                <div className="home-property-type-icon">{type.icon}</div>
                <h3 className="home-property-type-title">{type.title}</h3>
                <p className="home-property-type-count">{type.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="home-support">
        <div className="container">
          <div className="home-support-header">
            <h2>24/7 Premium Technical Support</h2>
            <p>
              Buying a home is a big step. Our technical team is available
              around the clock to help with any inquiries, passwordless status,
              or any platform queries you might have.
            </p>
          </div>

          <div className="home-support-grid">
            {supportFeatures.map((feature, index) => (
              <div key={index} className="home-support-card">
                <div className="home-support-icon">{feature.icon}</div>
                <h3 className="home-support-title">{feature.title}</h3>
                <p className="home-support-description">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="container">
          <div className="home-features-header">
            <h2>Why Choose Our Platform?</h2>
            <p>We combine cutting-edge technology with exceptional service</p>
          </div>

          <div className="home-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="home-feature-card">
                <div className="home-feature-icon">{feature.icon}</div>
                <h3 className="home-feature-title">{feature.title}</h3>
                <p className="home-feature-description">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="home-testimonials">
        <div className="container">
          <div className="home-testimonials-header">
            <h2>What Our Dreamers Say</h2>
            <p>
              Join thousands of satisfied clients who found their dream homes
              with us
            </p>
          </div>

          <div className="home-testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="home-testimonial-card">
                <div className="home-testimonial-rating">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <p className="home-testimonial-text">"{testimonial.comment}"</p>
                <div className="home-testimonial-author">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="home-testimonial-avatar"
                  />
                  <div className="home-testimonial-info">
                    <h4 className="home-testimonial-name">
                      {testimonial.name}
                    </h4>
                    <p className="home-testimonial-role">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta">
        <div className="home-cta-content">
          <h2 className="home-cta-title">Ready to Find Your Place?</h2>
          <p className="home-cta-description">
            Join over <AnimatedCounter end={50000} />+ users who found their
            perfect homes through PropTech. Start your journey today with a free
            account.
          </p>

          <div className="home-cta-buttons">
            <Link to="/show-all-post" className="home-cta-btn-primary">
              Get Started Now
              <FaArrowRight />
            </Link>
            <Link to="/show-all-post" className="home-cta-btn-secondary">
              <FaPlay />
              Browse Listings
            </Link>
          </div>

          <div className="home-trust-badges">
            <div className="home-trust-badge">🔒 Secure Platform</div>
            <div className="home-trust-badge">⭐ 5-Star Reviews</div>
            <div className="home-trust-badge">🚀 Instant Booking</div>
            <div className="home-trust-badge">💎 Premium Quality</div>
            <div className="home-trust-badge">🏦 Bank Partnerships</div>
            <div className="home-trust-badge">📞 24/7 Support</div>
          </div>
        </div>
      </section>
      
      <AdPopup 
        isOpen={showAdPopup} 
        onClose={() => setShowAdPopup(false)} 
        ad={adData} 
      />
    </div>
  );
};

export default Home;
