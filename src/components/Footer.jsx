import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".footer-element").forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const socialLinks = [
    { icon: "fab fa-facebook-f", url: "#", label: "Facebook" },
    { icon: "fab fa-twitter", url: "#", label: "Twitter" },
    { icon: "fab fa-instagram", url: "#", label: "Instagram" },
    { icon: "fab fa-linkedin-in", url: "#", label: "LinkedIn" },
    { icon: "fab fa-tiktok", url: "#", label: "TikTok" }
  ];

  const exploreLinks = [
    { name: "Premium Properties", path: "/premium-properties" },
    { name: "Luxury Villas", path: "/luxury-villas" },
    { name: "City Apartments", path: "/apartments" },
    { name: "Beach Houses", path: "/beach-houses" },
    { name: "Investment Opportunities", path: "/investment" }
  ];

  const contactInfo = [
    {
      icon: "fas fa-envelope",
      text: "hello@proptech.com",
      subtext: "Quick responses guaranteed"
    },
    {
      icon: "fas fa-phone",
      text: "+1 (555) 123-4567",
      subtext: "24/7 Support available"
    },
    {
      icon: "fas fa-map-marker-alt",
      text: "123 Luxury Avenue",
      subtext: "Metropolis, MP 12345"
    },
    {
      icon: "fas fa-clock",
      text: "Mon - Sun: 9AM - 9PM",
      subtext: "Extended business hours"
    }
  ];

  return (
    <footer ref={footerRef} className="footer">
      {/* Animated Background Elements */}
      <div className="footer-background">
        {/* Floating Particles */}
        <div>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="footer-particle"
              style={{
                width: Math.random() * 8 + 2 + "px",
                height: Math.random() * 8 + 2 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animationDelay: Math.random() * 20 + "s",
                animationDuration: Math.random() * 20 + 20 + "s"
              }}
            />
          ))}
        </div>

        {/* Gradient Orbs */}
        <div className="footer-orb footer-orb-1" />
        <div className="footer-orb footer-orb-2" />
      </div>

      {/* Main Wave Separator */}
      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".8"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".6"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            opacity=".4"
          />
        </svg>
      </div>

      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-element footer-brand">
            <div className="footer-brand-logo">
              <div className="footer-brand-logo-glow" />
              <h3 className="footer-brand-title">
                Aqar<span className="footer-brand-accent">Mind</span>
              </h3>
              <div className="footer-brand-ping" />
            </div>

            <p className="footer-brand-description">
              Redefining luxury living through exceptional rental experiences and unparalleled service.
            </p>

            {/* Social Links */}
            <div className="footer-social">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="footer-social-link footer-element"
                  style={{ transitionDelay: `${index * 100 + 500}ms` }}
                  aria-label={social.label}
                >
                  <i className={social.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-element footer-column" style={{ transitionDelay: "200ms" }}>
            <h4 className="footer-column-title">
              <span className="footer-column-title-text">Explore</span>
            </h4>
            <div className="footer-links">
              {exploreLinks.map((link, index) => (
                <Link key={index} to={link.path} className="footer-link">
                  <i className="fas fa-chevron-right footer-link-icon" />
                  <span className="footer-link-text">{link.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="footer-element footer-column" style={{ transitionDelay: "400ms" }}>
            <h4 className="footer-column-title">
              <span className="footer-column-title-text">Connect</span>
            </h4>
            <div className="footer-contact">
              {contactInfo.map((contact, index) => (
                <div key={index} className="footer-contact-item">
                  <div className="footer-contact-icon">
                    <i className={contact.icon} />
                  </div>
                  <div className="footer-contact-info">
                    <p className="footer-contact-text">{contact.text}</p>
                    <p className="footer-contact-subtext">{contact.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="footer-element footer-column" style={{ transitionDelay: "600ms" }}>
            <h4 className="footer-column-title">
              <span className="footer-column-title-text">Stay Updated</span>
            </h4>
            <div className="footer-newsletter">
              <p className="footer-newsletter-description">
                Get exclusive access to premium listings and market insights before anyone else.
              </p>

              <div className="footer-newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="footer-newsletter-input"
                />
                <button className="footer-newsletter-button">
                  Subscribe
                </button>
              </div>

              <p className="footer-newsletter-privacy">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-container">
            {/* Copyright */}
            <div className="footer-bottom-left">
              <p className="footer-copyright">
                &copy; {new Date().getFullYear()} AqarMind. Crafted with excellence.
              </p>
              <div className="footer-bottom-links">
                <Link to="/privacy" className="footer-bottom-link">
                  Privacy
                </Link>
                <Link to="/terms" className="footer-bottom-link">
                  Terms
                </Link>
                <Link to="/cookies" className="footer-bottom-link">
                  Cookies
                </Link>
              </div>
            </div>

            {/* Scroll to Top */}
            <button onClick={scrollToTop} className="scroll-to-top">
              <div className="scroll-to-top-gradient" />
              <span className="scroll-to-top-content">
                Back to Top
                <i className="fas fa-arrow-up scroll-to-top-icon" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-element {
          opacity: 0;
          transform: translateY(2rem);
          transition: all 0.7s ease;
        }

        .footer-element.animate {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;