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
  FaClock,
  FaHeart,
  FaCrown,
  FaShieldAlt,
  FaGem,
  FaAward,
  FaSearch,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaWallet,
  FaPhone,
  FaHeadset,
  FaCalendarAlt,
  FaLock,
  FaPercentage,
  FaBuilding,
  FaHotel,
  FaKey,
  FaHandHoldingUsd,
  FaUserShield,
  FaMobileAlt,
  FaMoneyCheckAlt
} from "react-icons/fa";
import API_BASE_URL from "../services/ApiConfig";

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
      { threshold: 0.1 }
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

  return (
    <span ref={countRef} className="font-black">
      {count.toLocaleString()}
    </span>
  );
};

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Auto rotate features
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 4);
    }, 3000);

    // Fetch featured properties
    fetchFeaturedProperties();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/Tenant/all-posts`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      
      // Take first 6 properties as featured
      const featured = res.data.slice(0, 6);
      setFeaturedProperties(featured);
    } catch (error) {
      console.error("Error fetching properties:", error);
      // Sample data for demo
      setFeaturedProperties(sampleProperties);
    } finally {
      setLoading(false);
    }
  };

  const sampleProperties = [
    {
      id: 1,
      title: "Luxury Apartment in New Cairo Compound",
      location: "New Cairo",
      price: 12000,
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      type: "Apartment",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      installment: true,
      featured: true
    },
    {
      id: 2,
      title: "Elegant Villa in Fifth Settlement",
      location: "Fifth Settlement",
      price: 25000,
      bedrooms: 4,
      bathrooms: 3,
      area: 320,
      type: "Villa",
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      installment: true,
      featured: true
    },
    {
      id: 3,
      title: "Modern Duplex in Nasr City",
      location: "Nasr City",
      price: 15000,
      bedrooms: 3,
      bathrooms: 2,
      area: 220,
      type: "Duplex",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      installment: false,
      featured: true
    },
    {
      id: 4,
      title: "Studio Apartment Downtown",
      location: "Downtown Cairo",
      price: 6000,
      bedrooms: 1,
      bathrooms: 1,
      area: 80,
      type: "Studio",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      installment: true,
      featured: false
    },
    {
      id: 5,
      title: "Penthouse with Nile View",
      location: "Zamalek",
      price: 35000,
      bedrooms: 4,
      bathrooms: 3,
      area: 280,
      type: "Penthouse",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      installment: true,
      featured: true
    },
    {
      id: 6,
      title: "Family Townhouse in Sheikh Zayed",
      location: "Sheikh Zayed",
      price: 18000,
      bedrooms: 3,
      bathrooms: 2,
      area: 200,
      type: "Townhouse",
      image: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      installment: false,
      featured: true
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Ahmed Mohamed",
      comment: "Found my perfect apartment within days. The installment system helped me a lot in managing my budget efficiently.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      role: "Software Engineer"
    },
    {
      id: 2,
      name: "Sarah Ali",
      comment: "Excellent user experience! The technical support was available 24/7 and helped me through every step. Highly recommended!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      role: "Marketing Manager"
    },
    {
      id: 3,
      name: "Youssef Ibrahim",
      comment: "The quality of properties and accuracy of information is amazing. The secure payment system made the process completely reliable.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "Architect"
    },
  ];

  const features = [
    {
      icon: <FaSearch className="w-8 h-8" />,
      title: "Smart Search",
      description: "Find your perfect property using intelligent and advanced search filters",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: "Verified Properties",
      description: "All properties are officially licensed and verified to ensure your rights",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      icon: <FaRocket className="w-8 h-8" />,
      title: "Instant Booking",
      description: "Book your favorite property immediately without waiting or complications",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      icon: <FaStar className="w-8 h-8" />,
      title: "24/7 Technical Support",
      description: "Technical support team available around the clock to assist you every step",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200"
    }
  ];

  const propertyTypes = [
    {
      title: "Apartments for Rent",
      description: "Various apartments with different spaces in the best neighborhoods and compounds",
      icon: <FaBuilding className="w-12 h-12" />,
      count: 25000,
      features: ["Family Apartments", "Studios", "Roof Gardens", "Duplex Apartments"]
    },
    {
      title: "Luxury Villas",
      description: "Elegant villas with spacious areas and integrated facilities in premium areas",
      icon: <FaHotel className="w-12 h-12" />,
      count: 8000,
      features: ["Independent Villas", "Townhouses", "Family Villas", "Sea View Villas"]
    },
    {
      title: "Easy Installment System",
      description: "Flexible installment plans that suit your financial needs with the best banks",
      icon: <FaPercentage className="w-12 h-12" />,
      count: 12,
      features: ["Installment up to 10 years", "Reasonable Down Payment", "Grace Periods", "Zero Interest Options"]
    },
    {
      title: "Technical Support",
      description: "Professional technical support for all your rental agreements and inquiries",
      icon: <FaHeadset className="w-12 h-12" />,
      count: 24,
      features: ["Phone Support", "Live Chat", "Email Support", "On-site Assistance"]
    }
  ];

  const installmentPlans = [
    {
      bank: "CIB Bank",
      duration: "Up to 10 years",
      downPayment: "20%",
      interest: "8.5%",
      features: ["No hidden fees", "Quick approval", "Online application"]
    },
    {
      bank: "QNB Alahli",
      duration: "Up to 8 years",
      downPayment: "15%",
      interest: "7.9%",
      features: ["Flexible payments", "Insurance included", "Mobile app management"]
    },
    {
      bank: "HSBC Egypt",
      duration: "Up to 7 years",
      downPayment: "25%",
      interest: "8.2%",
      features: ["International standards", "Professional advisory", "Multi-currency options"]
    }
  ];

  const stats = [
    { number: 50000, label: "Properties Available", icon: <FaHome /> },
    { number: 95, label: "Customer Satisfaction", icon: <FaStar /> },
    { number: 24, label: "Technical Support", icon: <FaHeadset /> },
    { number: 100, label: "Cities Covered", icon: <FaCity /> },
    { number: 12, label: "Partner Banks", icon: <FaMoneyCheckAlt /> },
    { number: 10000, label: "Happy Clients", icon: <FaUsers /> },
  ];

  const technicalSupportFeatures = [
    {
      icon: <FaPhone className="w-8 h-8" />,
      title: "Phone Support",
      description: "Direct phone line with experienced property consultants"
    },
    {
      icon: <FaMobileAlt className="w-8 h-8" />,
      title: "Live Chat",
      description: "Instant messaging support through our mobile app and website"
    },
    {
      icon: <FaUserShield className="w-8 h-8" />,
      title: "Legal Assistance",
      description: "Professional legal support for contracts and agreements"
    },
    {
      icon: <FaHandHoldingUsd className="w-8 h-8" />,
      title: "Financial Advisory",
      description: "Expert advice on installment plans and financial options"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg border border-gray-100">
            <FaAward className="w-5 h-5 text-amber-500" />
            <span className="text-gray-700 font-semibold text-sm">🏆 Trusted by <AnimatedCounter end={10000} />+ Users</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Find Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-cyan-600 bg-clip-text text-transparent">
              Dream Home
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover the perfect rental property with our curated collection of 
            <span className="font-semibold text-blue-600"> <AnimatedCounter end={50000} />+ verified listings </span>
            featuring apartments, villas, and flexible installment plans
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              to="/show-all-post"
              className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3"
            >
              <span>Explore Properties</span>
              <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/show-all-post"
              className="group bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-blue-300 flex items-center gap-3"
            >
              <FaPlay className="w-5 h-5 text-blue-500" />
              <span>Apply Now</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100 transition-all duration-300 hover:scale-110 hover:shadow-xl">
                  <div className="text-blue-500 mb-2 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-lg md:text-xl font-black text-gray-800 mb-1">
                    {stat.label.includes('%') || stat.label.includes('24/7') ? (
                      <>{stat.number}{stat.label.includes('%') ? '%' : '/7'}</>
                    ) : (
                      <AnimatedCounter end={stat.number} />
                    )}
                    {!stat.label.includes('%') && !stat.label.includes('24/7') && '+'}
                  </div>
                  <div className="text-gray-600 text-xs font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
              Featured{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Properties
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked selection of premium apartments, villas, and luxury residences
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <div
                  key={property.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                >
                  {/* Property Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {property.featured && (
                      <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                      </div>
                    )}
                    {property.installment && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Installment Available
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{property.title}</h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                      <span>{property.location}</span>
                    </div>

                    {/* Property Features */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <FaBed className="w-4 h-4" />
                          <span>{property.bedrooms} beds</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaBath className="w-4 h-4" />
                          <span>{property.bathrooms} baths</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaRulerCombined className="w-4 h-4" />
                          <span>{property.area} m²</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Type */}
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-black text-blue-600">
                        ${property.price.toLocaleString()}
                        <span className="text-sm text-gray-500 font-normal">/month</span>
                      </div>
                      <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {property.type}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to="/show-all-post"
                      className="block w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Properties Button */}
          <div className="text-center mt-12">
            <Link
              to="/show-all-post"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-blue-50"
            >
              <span>View All Properties</span>
              <FaArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
              Explore Our{" "}
              <span className="bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">
                Property Types
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Wide variety of residential properties to suit every lifestyle and budget
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {propertyTypes.map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 text-center shadow-lg border border-gray-100 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                <div className="text-blue-500 mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {service.description}
                </p>
                <div className="text-2xl font-black text-blue-600 mb-4">
                  <AnimatedCounter end={service.count} />
                  {service.title !== "Technical Support" && '+'}
                  {service.title === "Technical Support" && '/7'}
                </div>
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCheck className="w-3 h-3 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installment Plans Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
              Flexible{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Installment Plans
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Partnering with top banks to offer you the best financing solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {installmentPlans.map((plan, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-100 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaMoneyCheckAlt className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800">{plan.bank}</h3>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold text-gray-800">{plan.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Down Payment</span>
                    <span className="font-semibold text-gray-800">{plan.downPayment}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-semibold text-green-600">{plan.interest}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCheck className="w-3 h-3 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/show-all-post"
                  className="block w-full mt-6 bg-blue-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-blue-600 hover:scale-105 text-center"
                >
                  Apply Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Support Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
              24/7{" "}
              <span className="bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">
                Technical Support
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our dedicated support team is always here to help you with any inquiries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technicalSupportFeatures.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 text-center shadow-lg border border-gray-100 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                <div className="text-green-500 mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Support Contact */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
              <h3 className="text-2xl font-black text-gray-800 mb-4">Need Immediate Assistance?</h3>
              <p className="text-gray-600 mb-6">Our support team is available around the clock</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2 bg-blue-50 px-6 py-3 rounded-xl">
                  <FaPhone className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-gray-800">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-6 py-3 rounded-xl">
                  <FaHeadset className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-gray-800">Live Chat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Our Platform?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge technology with exceptional service to make your property search effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group text-center p-8 rounded-3xl border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                  index === activeIndex 
                    ? `${feature.bgColor} ${feature.borderColor} scale-105 shadow-xl` 
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className={`mb-6 transform transition-all duration-500 ${
                  index === activeIndex ? 'scale-110 rotate-12' : 'group-hover:scale-110'
                }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-4 ${
                  index === activeIndex ? feature.color : 'text-gray-800'
                }`}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
              What Our{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Clients Say
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied users who found their perfect home with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-100 transition-all duration-500 hover:scale-105 hover:shadow-xl"
              >
                {/* Rating Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating
                          ? "text-amber-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed text-center italic">
                  "{testimonial.comment}"
                </p>

                <div className="flex items-center justify-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-200"
                  />
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-blue-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Find Your New Home?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join our community of <AnimatedCounter end={10000} />+ satisfied users and discover the perfect property today with our flexible installment plans and premium support
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/show-all-post"
              className="bg-white text-blue-600 px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center gap-3"
            >
              <span>Start Exploring</span>
              <FaArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/show-all-post"
              className="bg-transparent text-white px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-white transition-all duration-300 hover:scale-105 hover:bg-white/10 flex items-center gap-3"
            >
              <FaPlay className="w-5 h-5" />
              <span>Apply Now</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-16">
            {[
              "🔒 Secure Platform",
              "⭐ 5-Star Reviews", 
              "🚀 Instant Booking",
              "💎 Premium Quality",
              "🏦 Bank Partnerships",
              "📞 24/7 Support"
            ].map((badge, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20"
              >
                <span className="text-white font-semibold text-sm">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;