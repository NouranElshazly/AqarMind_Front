import React, { useState , useEffect} from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import "../styles/Contact.css";
import { createComplaint } from "../services/api";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    reportedUserName: "",
    complaintCategory: "0", // Default to 0 (Spam)
    image: null,
    message: "", // Content
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setErrorMessage("You must be logged in to submit a complaint.");
      setLoading(false);
      return;
    }

    try {
      const complaintPayload = {
        ReportedUserName: formData.reportedUserName,
        Type: parseInt(formData.complaintCategory),
        Content: formData.message,
        Image: formData.image,
      };

      await createComplaint(userId, complaintPayload);
      setSuccessMessage("Complaint submitted successfully.");

      // Reset form
      setFormData({
        reportedUserName: "",
        complaintCategory: "0",
        image: null,
        message: "",
      });
      
      // Reset file input
      const fileInput = document.getElementById("image");
      if (fileInput) fileInput.value = "";
    } catch (error) {
        setErrorMessage(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section
        className="contact-hero"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">
            Report a Complaint
          </h1>
          <p className="contact-hero-subtitle">
            We take your concerns seriously. Please provide details below.
          </p>
        </div>
      </section>

      <div className="contact-container">
        {/* Contact Info Cards - Optional to keep or remove, keeping as per "Contact" page context usually has info */}
        <section className="contact-cards-grid">
          {/* Phone Card */}
          <div className="contact-card">
            <div className="contact-card-icon">
              <FaPhone />
            </div>
            <h3 className="contact-card-title">Phone</h3>
            <p className="contact-card-text">+20 109 453 2054</p>
            <p className="contact-card-text">+20 155 807 2054</p>
          </div>

          {/* Email Card */}
          <div className="contact-card">
            <div className="contact-card-icon">
              <FaEnvelope />
            </div>
            <h3 className="contact-card-title">Email</h3>
            <p className="contact-card-text">info@realestate.com</p>
            <p className="contact-card-text">support@realestate.com</p>
          </div>

          {/* Address Card */}
          <div className="contact-card">
            <div className="contact-card-icon">
              <FaMapMarkerAlt />
            </div>
            <h3 className="contact-card-title">Address</h3>
            <p className="contact-card-text">123 Tahrir Street, Cairo, Egypt</p>
          </div>
        </section>

        {/* Map and Form Section */}
        <section className="contact-content-wrapper">
            {/* Map */}
            <div className="map-container">
              <iframe
                title="Our Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.123456789!2d31.233408!3d30.047987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458409a8f8f1e0d%3A0x8e6a5a5a5a5a5a5a!2sEgyptian%20Museum!5e0!3m2!1sen!2seg!4v1620000000000!5m2!1sen!2seg"
                className="map-frame"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>

            {/* Complaint Form */}
            <div className="contact-form-card">
              <h2 className="form-title">
                Submit a Complaint
              </h2>

              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="reportedUserName" className="form-label">
                    Reported User Name
                  </label>
                  <input
                    type="text"
                    id="reportedUserName"
                    name="reportedUserName"
                    value={formData.reportedUserName}
                    onChange={handleChange}
                    required
                    placeholder="Enter username to report"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="complaintCategory" className="form-label">
                    Complaint Category
                  </label>
                  <select
                    id="complaintCategory"
                    name="complaintCategory"
                    value={formData.complaintCategory}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="0">Spam</option>
                    <option value="1">Harassment</option>
                    <option value="2">Fraud</option>
                    <option value="3">Others</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="image" className="form-label">
                    Evidence Image (Optional)
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="message"
                    className="form-label"
                  >
                    Complaint Details
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Describe your complaint..."
                    className="form-control"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Complaint"}
                </button>
              </form>
            </div>
        </section>

        {/* Social Media Section */}
        <section className="social-section">
          <h2 className="social-title">
            Connect With Us on Social Media
          </h2>
          <div className="social-links">
            {/* Facebook */}
            <a
              href="#"
              className="social-icon facebook"
            >
              <FaFacebook />
            </a>

            {/* Twitter */}
            <a
              href="#"
              className="social-icon twitter"
            >
              <FaTwitter />
            </a>

            {/* Instagram */}
            <a
              href="#"
              className="social-icon instagram"
            >
              <FaInstagram />
            </a>

            {/* LinkedIn */}
            <a
              href="#"
              className="social-icon linkedin"
            >
              <FaLinkedin />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
