import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import {
  Home,
  MapPin,
  FileText,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "../styles/EditProperty.css";

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Landlord/get-post/${id}`,
        );
        const { title, description, location } = response.data;

        setFormData((prev) => ({
          ...prev,
          title: title || "",
          description: description || "",
          location: location || "",
        }));
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage("");

    try {
      const formDataToSend = new FormData();

      // إضافة الحقول فقط إذا كانت تحتوي على قيم
      if (formData.title) formDataToSend.append("Title", formData.title);
      if (formData.description)
        formDataToSend.append("Description", formData.description);
      if (formData.location)
        formDataToSend.append("Location", formData.location);

      const response = await axios.put(
        `${API_BASE_URL}/api/Landlord/edit-post/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setMessage("Property updated successfully!");
      setTimeout(() => {
        navigate("/landlord/dashboard");
      }, 1500);
    } catch (err) {
      console.log("Update error:", err.response);

      let errorMessage = "Failed to update property";
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          const errors = err.response.data.errors;
          errorMessage = Object.values(errors).flat().join(", ");
        }
      }

      setMessage(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  // الحل البديل: استخدام JSON بدلاً من FormData
  const handleSubmitJSON = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage("");

    try {
      const payload = {
        ...(formData.title && { Title: formData.title }),
        ...(formData.description && { Description: formData.description }),
        ...(formData.location && { Location: formData.location }),
      };

      console.log("Sending JSON payload:", payload);
      const response = await axios.put(
        `${API_BASE_URL}/api/Landlord/edit-post/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setMessage("Property updated successfully!");
      setTimeout(() => {
        navigate("/landlord/dashboard");
      }, 1500);
    } catch (err) {
      console.log("Update error:", err.response);
      setMessage(err.response?.data?.message || "Failed to update property");
    } finally {
      setSubmitLoading(false);
    }
  };

  // الحل الثالث: استخدام PATCH request إذا كان الخادم يدعمه
  const handleSubmitPatch = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage("");

    try {
      const payload = {};

      // إضافة الحقول التي تم تغييرها فقط
      if (formData.title) payload.Title = formData.title;
      if (formData.description) payload.Description = formData.description;
      if (formData.location) payload.Location = formData.location;

      setMessage("Property updated successfully!");
      setTimeout(() => {
        navigate("/landlord/dashboard");
      }, 1500);
    } catch (err) {
      console.log("Update error:", err.response);
      setMessage(err.response?.data?.message || "Failed to update property");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-property-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Property Data...</h2>
          <p>Please wait while we fetch your property information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-property-container">
      {/* Header Section */}
      <div className="edit-property-header">
        <div className="header-content">
          <div className="header-icon">
            <FileText size={40} />
          </div>
          <div className="header-text">
            <h1 className="header-title">Edit Property</h1>
            <p className="header-subtitle">
              Update your property information - all fields are optional
            </p>
          </div>
          <button
            onClick={() => navigate("/landlord/dashboard")}
            className="btn btn-secondary header-back-btn"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`alert ${message.includes("successfully") ? "alert-success" : "alert-error"}`}
        >
          <div className="alert-icon">
            {message.includes("successfully") ? (
              <CheckCircle size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
          </div>
          <span className="alert-text">{message}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="edit-property-form-container">
        <div className="form-header">
          <h2>Property Details</h2>
          <p>Only update the fields you want to change</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-property-form">
          <div className="form-grid">
            {/* Left Column - Form Fields */}
            <div className="form-column">
              {/* Title */}
              <div className="form-group">
                <label className="form-label">
                  <Home size={18} />
                  <span>Property Title</span>
                  <span className="optional-text">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Modern 2BR Apartment in Downtown"
                  className="form-control"
                />
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={18} />
                  <span>Location</span>
                  <span className="optional-text">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="New York, NY"
                  className="form-control"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  <FileText size={18} />
                  <span>Description</span>
                  <span className="optional-text">(Optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Describe your property's features, amenities, and unique selling points..."
                  className="form-control textarea"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/landlord/dashboard")}
              className="btn btn-secondary"
              disabled={submitLoading}
            >
              <ArrowLeft size={20} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="btn btn-primary"
            >
              {submitLoading ? (
                <>
                  <div className="btn-spinner"></div>
                  Updating Property...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Property
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
