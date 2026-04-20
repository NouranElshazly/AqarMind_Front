import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API, { createCompanyProject } from "../services/api";
import API_BASE_URL from "../services/ApiConfig";
import {
  Building,
  MapPin,
  FileText,
  Upload,
  Plus,
  X,
  PlusCircle,
  Trash2,
  Calendar,
  Layout,
  Layers,
  CheckCircle,
  Tag,
  Square,
  DollarSign,
  Bed,
  Bath,
  Shield,
  Car,
  Wind,
  Droplets,
  Trees,
  Lock,
} from "lucide-react";
import "../styles/CompanyCreateProject.css";

const CompanyCreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    projectName: "",
    description: "",
    location: "",
    locationPath: "",
    totalFloors: "",
    hasElevator: false,
    type: "0", // 0 = Rent, 1 = Sale
    tags: "",
  });

  const [templates, setTemplates] = useState([
    {
      title: "",
      area: "",
      basePrice: "",
      numberOfRooms: "",
      numberOfBathrooms: "",
      hasGarage: false,
      isFurnished: false,
      hasGarden: false,
      hasPool: false,
      hasSecurity: false,
      hasParking: false,
      priceIncreasePerFloor: "",
      unitCode: "",
      description: "",
    },
  ]);

  const [file, setFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTemplateChange = (i, field, value) => {
    const updated = [...templates];
    updated[i][field] = value;
    setTemplates(updated);
  };

  const addUnit = () => {
    setTemplates([
      ...templates,
      {
        title: "",
        area: "",
        basePrice: "",
        numberOfRooms: "",
        numberOfBathrooms: "",
        hasGarage: false,
        isFurnished: false,
        hasGarden: false,
        hasPool: false,
        hasSecurity: false,
        hasParking: false,
        priceIncreasePerFloor: "",
        unitCode: "",
        description: "",
      },
    ]);
  };

  const removeUnit = (i) => {
    const updated = templates.filter((_, index) => index !== i);
    setTemplates(updated);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setDocPreview(selectedFile.name);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const profile = JSON.parse(localStorage.getItem("profile") || "{}");
      const userId =
        profile.user?._id || profile.userId || localStorage.getItem("userId");

      if (!userId) {
        throw new Error("User not authenticated. Please login again.");
      }

      if (!form.projectName || !form.location || !form.totalFloors || !file) {
        throw new Error(
          "Please fill in all required fields and upload the project document.",
        );
      }

      const data = new FormData();
      data.append("CompanyId", userId);
      data.append("ProjectName", form.projectName);
      data.append("Description", form.description);
      data.append("Location", form.location);
      data.append("LocationPath", form.locationPath);
      data.append("TotalFloors", Number(form.totalFloors));
      data.append("HasElevator", form.hasElevator);
      data.append("UnitsPerFloor", templates.length);
      data.append("Type", Number(form.type));

      if (form.tags) {
        form.tags.split(",").forEach((tag, i) => {
          if (tag.trim()) data.append(`Tags[${i}]`, tag.trim());
        });
      }

      templates.forEach((t, i) => {
        Object.keys(t).forEach((key) => {
          let val = t[key];
          if (typeof val === "boolean") {
            data.append(`UnitTemplates[${i}].${key}`, val);
          } else if (val !== "") {
            data.append(`UnitTemplates[${i}].${key}`, val);
          }
        });
      });

      data.append("ProjectDocFile", file);

      await API.post("/company/projects/create", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/company/dashboard", {
        state: { message: "Project created successfully!" },
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error occurred");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-property-container">
      <div className="add-property-header">
        <div className="header-content">
          <Building className="header-icon" size={40} />
          <div>
            <h1 className="header-title">Create New Project</h1>
            <p className="header-subtitle">
              Fill in the details to create your next masterpiece
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

        {/* Project Basic Info */}
        <div className="form-section">
          <div className="section-header">
            <Layout size={24} />
            <h2>Project Information</h2>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">
                <Building size={18} />
                Project Name *
              </label>
              <input
                type="text"
                name="projectName"
                value={form.projectName}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., AqarMind Luxury Towers"
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <FileText size={18} />
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="form-control"
                rows="4"
                placeholder="Describe your project..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={18} />
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="form-control"
                placeholder="City, Country"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={18} />
                Location Path
              </label>
              <input
                type="text"
                name="locationPath"
                value={form.locationPath}
                onChange={handleChange}
                className="form-control"
                placeholder="Detailed address or Map Link"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Layers size={18} />
                Total Floors *
              </label>
              <input
                type="number"
                name="totalFloors"
                value={form.totalFloors}
                onChange={handleChange}
                className="form-control"
                placeholder="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Tag size={18} />
                Project Type *
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="0">For Rent</option>
                <option value="1">For Sale</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label className="feature-checkbox">
                <input
                  type="checkbox"
                  name="hasElevator"
                  checked={form.hasElevator}
                  onChange={handleChange}
                />
                <div className="feature-label">
                  <Wind size={20} />
                  <span>Building has elevator</span>
                </div>
              </label>
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <Tag size={18} />
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="form-control"
                placeholder="Modern, Luxury, Downtown (comma separated)"
              />
            </div>
          </div>
        </div>

        {/* Unit Templates Section */}
        <div className="form-section">
          <div className="section-header">
            <Layers size={24} />
            <h2>Unit Templates</h2>
          </div>

          <div className="templates-container">
            {templates.map((t, i) => (
              <div key={i} className="template-card">
                <div className="template-header">
                  <h3>Unit Template {i + 1}</h3>
                  {templates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUnit(i)}
                      className="btn-remove-template"
                    >
                      <Trash2 size={18} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      value={t.title}
                      onChange={(e) =>
                        handleTemplateChange(i, "title", e.target.value)
                      }
                      className="form-control"
                      placeholder="e.g., Type A Apartment"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit Code *</label>
                    <input
                      type="text"
                      value={t.unitCode}
                      onChange={(e) =>
                        handleTemplateChange(i, "unitCode", e.target.value)
                      }
                      className="form-control"
                      placeholder="e.g., UA-01"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Description *</label>
                    <textarea
                      value={t.description}
                      onChange={(e) =>
                        handleTemplateChange(i, "description", e.target.value)
                      }
                      className="form-control"
                      rows="2"
                      placeholder="Unit details..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Square size={16} /> Area (sqm) *
                    </label>
                    <input
                      type="number"
                      value={t.area}
                      onChange={(e) =>
                        handleTemplateChange(i, "area", e.target.value)
                      }
                      className="form-control"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <DollarSign size={16} /> Base Price *
                    </label>
                    <input
                      type="number"
                      value={t.basePrice}
                      onChange={(e) =>
                        handleTemplateChange(i, "basePrice", e.target.value)
                      }
                      className="form-control"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Bed size={16} /> Rooms
                    </label>
                    <input
                      type="number"
                      value={t.numberOfRooms}
                      onChange={(e) =>
                        handleTemplateChange(i, "numberOfRooms", e.target.value)
                      }
                      className="form-control"
                      placeholder="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Bath size={16} /> Bathrooms
                    </label>
                    <input
                      type="number"
                      value={t.numberOfBathrooms}
                      onChange={(e) =>
                        handleTemplateChange(
                          i,
                          "numberOfBathrooms",
                          e.target.value,
                        )
                      }
                      className="form-control"
                      placeholder="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price Increase / Floor</label>
                    <input
                      type="number"
                      value={t.priceIncreasePerFloor}
                      onChange={(e) =>
                        handleTemplateChange(
                          i,
                          "priceIncreasePerFloor",
                          e.target.value,
                        )
                      }
                      className="form-control"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Amenities */}
                  <div className="form-group full-width">
                    <label className="form-label">Amenities</label>
                    <div className="features-grid">
                      <label className="feature-checkbox">
                        <input
                          type="checkbox"
                          checked={t.hasGarage}
                          onChange={(e) =>
                            handleTemplateChange(
                              i,
                              "hasGarage",
                              e.target.checked,
                            )
                          }
                        />
                        <div className="feature-label">
                          <Car size={18} />
                          <span>Garage</span>
                        </div>
                      </label>
                      <label className="feature-checkbox">
                        <input
                          type="checkbox"
                          checked={t.isFurnished}
                          onChange={(e) =>
                            handleTemplateChange(
                              i,
                              "isFurnished",
                              e.target.checked,
                            )
                          }
                        />
                        <div className="feature-label">
                          <Wind size={18} />
                          <span>Furnished</span>
                        </div>
                      </label>
                      <label className="feature-checkbox">
                        <input
                          type="checkbox"
                          checked={t.hasGarden}
                          onChange={(e) =>
                            handleTemplateChange(
                              i,
                              "hasGarden",
                              e.target.checked,
                            )
                          }
                        />
                        <div className="feature-label">
                          <Trees size={18} />
                          <span>Garden</span>
                        </div>
                      </label>
                      <label className="feature-checkbox">
                        <input
                          type="checkbox"
                          checked={t.hasPool}
                          onChange={(e) =>
                            handleTemplateChange(i, "hasPool", e.target.checked)
                          }
                        />
                        <div className="feature-label">
                          <Droplets size={18} />
                          <span>Pool</span>
                        </div>
                      </label>
                      <label className="feature-checkbox">
                        <input
                          type="checkbox"
                          checked={t.hasSecurity}
                          onChange={(e) =>
                            handleTemplateChange(
                              i,
                              "hasSecurity",
                              e.target.checked,
                            )
                          }
                        />
                        <div className="feature-label">
                          <Shield size={18} />
                          <span>Security</span>
                        </div>
                      </label>
                      <label className="feature-checkbox">
                        <input
                          type="checkbox"
                          checked={t.hasParking}
                          onChange={(e) =>
                            handleTemplateChange(
                              i,
                              "hasParking",
                              e.target.checked,
                            )
                          }
                        />
                        <div className="feature-label">
                          <Lock size={18} />
                          <span>Parking</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addUnit}
              className="btn-add-template"
            >
              <PlusCircle size={20} />
              Add Another Unit Template
            </button>
          </div>
        </div>

        {/* Project Document */}
        <div className="form-section">
          <div className="section-header">
            <Upload size={24} />
            <h2>Project Document</h2>
          </div>

          <div className="upload-group">
            <p className="upload-hint">
              Please upload the project legal documents or brochure (PDF only,
              max 10MB)
            </p>
            <div className="upload-area">
              <input
                type="file"
                id="projectDoc"
                onChange={handleFileChange}
                accept=".pdf"
                className="file-input"
                style={{ display: "none" }}
              />
              <label htmlFor="projectDoc" className="upload-box">
                {docPreview ? (
                  <div className="doc-preview">
                    <FileText size={40} />
                    <p>{docPreview}</p>
                  </div>
                ) : (
                  <>
                    <Upload size={40} />
                    <p>Click to upload Project PDF</p>
                    <span className="upload-hint">PDF up to 10MB</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/company/dashboard")}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyCreateProject;
