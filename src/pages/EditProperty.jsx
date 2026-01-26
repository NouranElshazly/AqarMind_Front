import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import {
  Home,
  MapPin,
  DollarSign,
  Upload,
  X,
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
    price: "",
    location: "",
    rentalStatus: "Available",
    image: null,
    existingImages: [],
    fileBase64: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Landlord/get-post/${id}`
        );
        const {
          title,
          description,
          price,
          location,
          rentalStatus,
          imagePath,
          fileBase64,
        } = response.data;

        setFormData((prev) => ({
          ...prev,
          title: title || "",
          description: description || "",
          price: price || "",
          location: location || "",
          rentalStatus: rentalStatus || "Available",
          existingImages: imagePath ? [imagePath] : [],
          fileBase64: fileBase64 || null,
        }));

        if (fileBase64) {
          setPreviewImage(`data:image/png;base64,${fileBase64}`);
        }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeNewImage = () => {
    setFormData({ ...formData, image: null });
    setPreviewImage(formData.fileBase64 ? `data:image/png;base64,${formData.fileBase64}` : null);
  };

  const removeOldImage = () => {
    setFormData({ ...formData, fileBase64: null, existingImages: [] });
    if (!formData.image) {
      setPreviewImage(null);
    }
  };

  // دالة لتحويل Base64 إلى File
  const base64ToFile = (base64, filename) => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage("");

    try {
      const formDataToSend = new FormData();
      
      // إضافة الحقول فقط إذا كانت تحتوي على قيم
      if (formData.title) formDataToSend.append("Title", formData.title);
      if (formData.description) formDataToSend.append("Description", formData.description);
      if (formData.price) formDataToSend.append("Price", formData.price);
      if (formData.location) formDataToSend.append("Location", formData.location);
      if (formData.rentalStatus) formDataToSend.append("RentalStatus", formData.rentalStatus);

      // التعامل مع الصورة - الحل الأول: إرسال الصورة الحالية إذا لم يتم تحميل صورة جديدة
      if (formData.image) {
        // إذا تم تحميل صورة جديدة
        formDataToSend.append("File", formData.image);
      } else if (formData.fileBase64) {
        // إذا لم توجد صورة جديدة ولكن توجد صورة حالية، نعيد إرسال الصورة الحالية
        const currentImageFile = base64ToFile(`data:image/png;base64,${formData.fileBase64}`, `property-${id}.png`);
        formDataToSend.append("File", currentImageFile);
      } else {
        // إذا لم توجد صورة حالية أو جديدة، نرسل ملف فارغ (قد يحتاج الخادم تعديلاً)
        formDataToSend.append("File", new File([""], "empty.txt", { type: "text/plain" }));
      }

      console.log("Sending form data...");
      const response = await axios.put(
        `${API_BASE_URL}/api/Landlord/edit-post/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Property updated successfully!");
      setTimeout(() => {
        navigate("/landlord/dashboard");
      }, 1500);
    } catch (err) {
      console.log("Update error:", err.response);
      
      let errorMessage = "Failed to update property";
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          const errors = err.response.data.errors;
          errorMessage = Object.values(errors).flat().join(', ');
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
        ...(formData.price && { Price: formData.price }),
        ...(formData.location && { Location: formData.location }),
        ...(formData.rentalStatus && { RentalStatus: formData.rentalStatus }),
        // إرسال الصورة الحالية إذا لم توجد صورة جديدة
        ...(formData.fileBase64 && !formData.image && { FileBase64: formData.fileBase64 }),
        // أو إرسال null للصورة إذا أردنا حذفها (حسب متطلبات الخادم)
      };

      console.log("Sending JSON payload:", payload);
      const response = await axios.put(
        `${API_BASE_URL}/api/Landlord/edit-post/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
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
      if (formData.price) payload.Price = formData.price;
      if (formData.location) payload.Location = formData.location;
      if (formData.rentalStatus) payload.RentalStatus = formData.rentalStatus;
      
      // التعامل مع الصورة
      if (formData.image) {
        // إذا كانت هناك صورة جديدة، نستخدم FormData
        const formDataToSend = new FormData();
        Object.keys(payload).forEach(key => {
          formDataToSend.append(key, payload[key]);
        });
        formDataToSend.append("File", formData.image);
        
        const response = await axios.patch(
          `${API_BASE_URL}/api/Landlord/edit-post/${id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // إذا لم تكن هناك صورة جديدة، نستخدم JSON
        const response = await axios.patch(
          `${API_BASE_URL}/api/Landlord/edit-post/${id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

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
        <div className={`alert ${message.includes("successfully") ? "alert-success" : "alert-error"}`}>
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

              {/* Price and Status Row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <DollarSign size={18} />
                    <span>Monthly Price</span>
                    <span className="optional-text">(Optional)</span>
                  </label>
                  <div className="price-input-wrapper">
                    <span className="price-currency">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="1500"
                      className="form-control price-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <CheckCircle size={18} />
                    <span>Rental Status</span>
                    <span className="optional-text">(Optional)</span>
                  </label>
                  <select
                    name="rentalStatus"
                    value={formData.rentalStatus}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                  </select>
                </div>
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

            {/* Right Column - Image Management */}
            <div className="form-column">
              <div className="image-section">
                <label className="form-label">
                  <ImageIcon size={18} />
                  <span>Property Image</span>
                  <span className="optional-text">(Optional)</span>
                </label>
                
                <div className="image-info-box">
                  <p>You can upload a new image to replace the current one, or leave it unchanged.</p>
                </div>
                
                {/* Upload Area */}
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-upload-input"
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="image-upload-label">
                    <Upload size={32} />
                    <span>Click to upload new image</span>
                    <small>PNG, JPG, GIF up to 10MB</small>
                  </label>
                </div>

                {/* Current Image */}
                {formData.fileBase64 && (
                  <div className="image-preview-section">
                    <h3 className="image-section-title">
                      <CheckCircle size={20} />
                      Current Image
                    </h3>
                    <div className="image-preview-card current-image">
                      <img
                        src={`data:image/png;base64,${formData.fileBase64}`}
                        alt="Current Property"
                        className="preview-image"
                      />
                      <div className="image-overlay">
                        <span className="image-badge current">Current Image</span>
                      </div>
                    </div>
                    <p className="image-note">
                      This image will be kept if no new image is selected
                    </p>
                  </div>
                )}

                {/* New Image Preview */}
                {previewImage && formData.image && (
                  <div className="image-preview-section">
                    <h3 className="image-section-title">
                      <Upload size={20} />
                      New Image Preview
                    </h3>
                    <div className="image-preview-card new-image">
                      <img
                        src={previewImage}
                        alt="New Preview"
                        className="preview-image"
                      />
                      <div className="image-overlay">
                        <span className="image-badge new">New Image</span>
                        <button
                          type="button"
                          onClick={removeNewImage}
                          className="remove-image-btn"
                          title="Remove new image"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="image-note">
                      This new image will replace the current one
                    </p>
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