import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import {
  Home,
  MapPin,
  DollarSign,
  Upload,
  Plus,
  X,
  Bed,
  Bath,
  Square,
  Building,
  Car,
  Sofa,
  Calendar,
  Tag,
  FileText,
  Image as ImageIcon,
  Gavel,
} from "lucide-react";
import "../styles/AddProperty.css";

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    locationPath: "",
    numOfRooms: "",
    numOfBathrooms: "",
    area: "",
    totalUnitsInBuilding: "",
    isFurnished: false,
    hasGarage: false,
    floorNumber: "",
    type: 0, // 0 = Rent, 1 = Sale
    startRentalDate: "",
    endRentalDate: "",
    tags: [],
    postDocFile: null,
    images: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [docPreview, setDocPreview] = useState(null);

  // Handle text inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : name === "type" ? Number(value) : value,
    }));
  };

  // Handle document upload
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, postDocFile: file }));
      setDocPreview(file.name);
    }
  };

  // Handle images upload
  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle tags
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get userId - try multiple methods
      const profile = localStorage.getItem("profile");
      console.log("📦 Profile from localStorage:", profile);

      let userId = null;

      // Method 1: من profile.user._id (الطريقة الموجودة عندك)
      if (profile) {
        try {
          const parsedProfile = JSON.parse(profile);
          console.log("📋 Parsed Profile:", parsedProfile);

          // Try user._id first (your structure)
          if (parsedProfile.user && parsedProfile.user._id) {
            userId = parsedProfile.user._id;
            console.log("✅ Found userId in user._id:", userId);
          }
          // Try direct userId
          else if (parsedProfile.userId) {
            userId = parsedProfile.userId;
            console.log("✅ Found userId directly:", userId);
          }
          // Try user.id
          else if (parsedProfile.user && parsedProfile.user.id) {
            userId = parsedProfile.user.id;
            console.log("✅ Found userId in user.id:", userId);
          }
        } catch (e) {
          console.error("❌ Error parsing profile:", e);
        }
      }

      // Method 2: من userId مباشرة
      if (!userId) {
        userId = localStorage.getItem("userId");
        if (userId)
          console.log("✅ Found userId directly in localStorage:", userId);
      }

      console.log("👤 Final User ID:", userId);

      if (!userId) {
        throw new Error("User not authenticated. Please login again.");
      }

      // Validation
      console.log("✅ Starting Validation...");
      console.log("Form Data:", formData);

      if (
        !formData.title ||
        !formData.description ||
        !formData.price ||
        !formData.location ||
        !formData.locationPath ||
        !formData.numOfRooms ||
        !formData.numOfBathrooms ||
        !formData.area
      ) {
        throw new Error("Please fill in all required fields");
      }

      if (!formData.postDocFile) {
        throw new Error("Property document is required");
      }

      console.log("✅ Validation passed!");

      // Create FormData
      const submitData = new FormData();

      // Append basic fields
      submitData.append("Title", formData.title);
      submitData.append("Description", formData.description);
      submitData.append("Price", formData.price);
      submitData.append("Location", formData.location);
      submitData.append("LocationPath", formData.locationPath);
      submitData.append("NumOfRooms", formData.numOfRooms);
      submitData.append("NumOfBathrooms", formData.numOfBathrooms);
      submitData.append("Area", formData.area);
      submitData.append("IsFurnished", formData.isFurnished);
      submitData.append("HasGarage", formData.hasGarage);
      submitData.append("IsAuction", formData.isAuction);
      submitData.append("Type", formData.type);

      console.log("📋 Basic fields added to FormData");

      // Optional fields
      if (formData.totalUnitsInBuilding) {
        submitData.append(
          "TotalUnitsInBuilding",
          formData.totalUnitsInBuilding,
        );
        console.log(
          "🏢 Added TotalUnitsInBuilding:",
          formData.totalUnitsInBuilding,
        );
      }
      if (formData.floorNumber) {
        submitData.append("FloorNumber", formData.floorNumber);
        console.log("🔢 Added FloorNumber:", formData.floorNumber);
      }
      if (formData.startRentalDate) {
        submitData.append("StartRentalDate", formData.startRentalDate);
        console.log("📅 Added StartRentalDate:", formData.startRentalDate);
      }
      if (formData.endRentalDate) {
        submitData.append("EndRentalDate", formData.endRentalDate);
        console.log("📅 Added EndRentalDate:", formData.endRentalDate);
      }

      // Tags
      if (formData.tags && formData.tags.length > 0) {
        formData.tags.forEach((tag) => submitData.append("Tags", tag));
        console.log("🏷️ Added Tags:", formData.tags);
      }

      // Document file (Required)
      submitData.append("PostDocFile", formData.postDocFile);
      console.log(
        "📄 Added Document:",
        formData.postDocFile.name,
        "Size:",
        formData.postDocFile.size,
      );

      // Images
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((img, index) => {
          submitData.append("Images", img);
          console.log(
            `🖼️ Added Image ${index + 1}:`,
            img.name,
            "Size:",
            img.size,
          );
        });
      }

      // Log all FormData entries
      console.log("📦 Final FormData contents:");
      for (let pair of submitData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], "→ FILE:", pair[1].name);
        } else {
          console.log(pair[0], "→", pair[1]);
        }
      }

      // Call API using axios directly with full URL
      const apiUrl = `${API_BASE_URL}/api/Landlord/create-post/${userId}`;
      console.log("🚀 Sending POST request to:", apiUrl);

      const response = await axios.post(apiUrl, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("✅ Success! Response:", response.data);

      // Navigate directly to dashboard without success screen
      navigate("/landlord/dashboard", { 
        state: { 
          refresh: true, 
          message: "Property added successfully!" 
        } 
      });
    } catch (err) {
      console.error("❌ Error:", err);
      console.error("❌ Error Response:", err.response?.data);
      console.error("❌ Error Message:", err.message);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create property. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="add-property-container">
        <div className="add-property-header">
          <div className="header-content">
            <Home className="header-icon" size={40} />
            <div>
              <h1 className="header-title">Add New Property</h1>
              <p className="header-subtitle">
                Processing your request...
              </p>
            </div>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">
              Submitting property details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-property-container">
      <div className="add-property-header">
        <div className="header-content">
          <Home className="header-icon" size={40} />
          <div>
            <h1 className="header-title">Add New Property</h1>
            <p className="header-subtitle">
              Fill in the details to list your property
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="add-property-form">
        {error && (
          <div className="alert alert-error">
            <X size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Basic Information */}
        <div className="form-section">
          <div className="section-header">
            <FileText size={24} />
            <h2>Basic Information</h2>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">
                <Home size={18} />
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g., Modern 3BR Apartment in Downtown"
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <FileText size={18} />
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control"
                rows="4"
                placeholder="Describe your property in detail..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <DollarSign size={18} />
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="form-control"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Home size={18} />
                Property Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value={0}>For Rent</option>
                <option value={1}>For Sale</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rental Dates (Only for Rent) */}
        {formData.type === 0 && (
          <div className="form-section">
            <div className="section-header">
              <Calendar size={24} />
              <h2>Rental Period</h2>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={18} />
                  Start Date
                </label>
                <input
                  type="date"
                  name="startRentalDate"
                  value={formData.startRentalDate}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={18} />
                  End Date
                </label>
                <input
                  type="date"
                  name="endRentalDate"
                  value={formData.endRentalDate}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="form-section">
          <div className="section-header">
            <MapPin size={24} />
            <h2>Location</h2>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">
                <MapPin size={18} />
                Address *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Full address"
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <MapPin size={18} />
                Google Maps Link
              </label>
              <input
                type="text"
                name="locationPath"
                value={formData.locationPath}
                onChange={handleInputChange}
                className="form-control"
                placeholder="https://maps.google.com/..."
                required
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="form-section">
          <div className="section-header">
            <Building size={24} />
            <h2>Property Details</h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <Bed size={18} />
                Bedrooms *
              </label>
              <input
                type="number"
                name="numOfRooms"
                value={formData.numOfRooms}
                onChange={handleInputChange}
                className="form-control"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Bath size={18} />
                Bathrooms *
              </label>
              <input
                type="number"
                name="numOfBathrooms"
                value={formData.numOfBathrooms}
                onChange={handleInputChange}
                className="form-control"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Square size={18} />
                Area (m²) *
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="form-control"
                placeholder="0"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Building size={18} />
                Floor Number
              </label>
              <input
                type="number"
                name="floorNumber"
                value={formData.floorNumber}
                onChange={handleInputChange}
                className="form-control"
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Building size={18} />
                Total Units in Building
              </label>
              <input
                type="number"
                name="totalUnitsInBuilding"
                value={formData.totalUnitsInBuilding}
                onChange={handleInputChange}
                className="form-control"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Features */}
          <div className="features-grid">
            <div className="feature-checkbox">
              <input
                type="checkbox"
                id="isFurnished"
                name="isFurnished"
                checked={formData.isFurnished}
                onChange={handleInputChange}
              />
              <label htmlFor="isFurnished" className="feature-label">
                <Sofa size={20} />
                <span>Furnished</span>
              </label>
            </div>

            <div className="feature-checkbox">
              <input
                type="checkbox"
                id="hasGarage"
                name="hasGarage"
                checked={formData.hasGarage}
                onChange={handleInputChange}
              />
              <label htmlFor="hasGarage" className="feature-label">
                <Car size={20} />
                <span>Has Garage</span>
              </label>
            </div>

            <div className="feature-checkbox">
              <input
                type="checkbox"
                id="isAuction"
                name="isAuction"
                checked={formData.isAuction}
                onChange={handleInputChange}
              />
              <label htmlFor="isAuction" className="feature-label">
                <Gavel size={20} />
                <span>Auction</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="form-section">
          <div className="section-header">
            <Tag size={24} />
            <h2>Tags</h2>
          </div>

          <div className="tags-input-container">
            <div className="tags-input-wrapper">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                className="form-control"
                placeholder="Add tags (e.g., parking, pool, gym)"
              />
              <button type="button" onClick={addTag} className="btn-add-tag">
                <Plus size={20} />
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="tags-list">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="tag-remove"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="form-section">
          <div className="section-header">
            <Upload size={24} />
            <h2>Documents & Images</h2>
          </div>

          <div className="upload-section">
            <div className="upload-group">
              <label className="upload-label">
                <FileText size={20} />
                <span>Property Document *</span>
              </label>
              <div className="upload-area">
                <input
                  type="file"
                  id="docUpload"
                  onChange={handleDocumentUpload}
                  accept=".pdf,.doc,.docx"
                  required
                  hidden
                />
                <label htmlFor="docUpload" className="upload-box">
                  <Upload size={40} />
                  <p>{docPreview || "Click to upload document"}</p>
                  <span className="upload-hint">PDF, DOC, DOCX (Max 10MB)</span>
                </label>
              </div>
            </div>

            <div className="upload-group">
              <label className="upload-label">
                <ImageIcon size={20} />
                <span>Property Images</span>
              </label>
              <div className="upload-area">
                <input
                  type="file"
                  id="imagesUpload"
                  onChange={handleImagesUpload}
                  accept="image/*"
                  multiple
                  hidden
                />
                <label htmlFor="imagesUpload" className="upload-box">
                  <ImageIcon size={40} />
                  <p>Click to upload images</p>
                  <span className="upload-hint">JPG, PNG (Max 5MB each)</span>
                </label>
              </div>

              {previewImages.length > 0 && (
                <div className="images-preview">
                  {previewImages.map((img, index) => (
                    <div key={index} className="preview-image">
                      <img src={img} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/landlord/dashboard")}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              <>
                <Plus size={20} />
                Add Property
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;