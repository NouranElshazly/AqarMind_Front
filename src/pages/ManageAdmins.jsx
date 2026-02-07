import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import { UserPlus, AlertCircle, CheckCircle, Plus, X , Users , Trash2 } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/ManageAdmins.css";

const ManageAdmins = () => {
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [isViewingAdmins, setIsViewingAdmins] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [adminsError, setAdminsError] = useState("");
  
  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    UserName: "",
    Email: "",
    Password: "",
    ConfirmPassword: "",
    PrivilegeType: 4,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchAdmins = async () => {
    setIsLoadingAdmins(true);
    setAdminsError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/sys/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdmins(response.data || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setAdminsError("Failed to load administrators. Please try again.");
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const handleDeleteClick = (userId) => {
    setAdminToDelete(userId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/sys/${adminToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const successMessage = response.data?.message || "Administrator deleted successfully!";
      setSuccess(successMessage);
      fetchAdmins(); // Refresh the list
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting admin:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete administrator. Please try again.";
      setAdminsError(errorMessage);
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
      setAdminToDelete(null);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "PrivilegeType" ? parseInt(value) : value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear general error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Validate email on blur
    if (name === "Email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          Email: "Please enter a valid email address",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    const errors = {};
    if (!formData.UserName) errors.UserName = "Username is required";
    if (!formData.Email) errors.Email = "Email is required";
    if (!formData.Password) errors.Password = "Password is required";
    if (!formData.ConfirmPassword)
      errors.ConfirmPassword = "Confirm Password is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    // Client-side validation for password match
    if (formData.Password !== formData.ConfirmPassword) {
      setFieldErrors({ ConfirmPassword: "Passwords do not match" });
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!emailRegex.test(formData.Email)) {
      setFieldErrors({ Email: "Email must end with @gmail.com" });
      setError("Invalid email format");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Create FormData object
      const form = new FormData();
      form.append("UserName", formData.UserName);
      form.append("Email", formData.Email);
      form.append("Password", formData.Password);
      form.append("ConfirmPassword", formData.ConfirmPassword);
      form.append("PrivilegeType", formData.PrivilegeType);

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/sys/create`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        // Handle success message from API
        const successMessage =
          response.data?.message || "Admin created successfully!";
        setSuccess(successMessage);

        // Reset form
        setFormData({
          UserName: "",
          Email: "",
          Password: "",
          ConfirmPassword: "",
          PrivilegeType: 4,
        });

        // Close the collapsible section on success
        setIsCreatingAdmin(false);
        fetchAdmins(); // Refresh the list
      }
    } catch (err) {
      console.error("Error creating admin:", err);

      if (err.response?.data) {
        const data = err.response.data;

        // Handle validation errors (400 Bad Request with errors object)
        if (err.response.status === 400 && data.errors) {
          const errors = data.errors;
          const newFieldErrors = {};

          // Parse validation errors for each field
          Object.keys(errors).forEach((field) => {
            const errorMessages = errors[field];
            if (Array.isArray(errorMessages) && errorMessages.length > 0) {
              newFieldErrors[field] = errorMessages[0];
            }
          });

          setFieldErrors(newFieldErrors);

          // Set general error message
          if (data.title) {
            setError(data.title);
          }
        }
        // Handle other error responses
        else if (data.message) {
          setError(data.message);
        } else if (typeof data === "string") {
          setError(data);
        } else {
          setError("Failed to create admin. Please try again.");
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to create admin. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-admins-container">
      <div className="header">
        <h1>
          <UserPlus size={32} />
          Manage Admins
        </h1>
        <p>Create and manage system administrator accounts</p>
      </div>

      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-card-title">
            <UserPlus className="card-icon" />
            <h2>Create New Admin</h2>
          </div>
          {!isCreatingAdmin && (
            <button
              type="button"
              className="btn-edit"
              onClick={() => setIsCreatingAdmin(true)}
            >
              <Plus size={16} /> Create New Admin
            </button>
          )}
        </div>

        {isCreatingAdmin ? (
          <div className="profile-card-body">
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="toast-notification success">
                <CheckCircle size={20} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="UserName">Username *</label>
                <input
                  type="text"
                  id="UserName"
                  name="UserName"
                  value={formData.UserName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldErrors.UserName ? "input-error" : ""}
                  required
                />
                {fieldErrors.UserName && (
                  <span className="field-error-message">
                    <AlertCircle size={16} />
                    {fieldErrors.UserName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="Email">Email Address *</label>
                <input
                  type="email"
                  id="Email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldErrors.Email ? "input-error" : ""}
                  required
                />
                {fieldErrors.Email && (
                  <span className="field-error-message">
                    <AlertCircle size={16} />
                    {fieldErrors.Email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="Password">Password *</label>
                <input
                  type="password"
                  id="Password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  className={fieldErrors.Password ? "input-error" : ""}
                  required
                />
                {fieldErrors.Password && (
                  <span className="field-error-message">
                    <AlertCircle size={16} />
                    {fieldErrors.Password}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="ConfirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="ConfirmPassword"
                  name="ConfirmPassword"
                  value={formData.ConfirmPassword}
                  onChange={handleChange}
                  className={fieldErrors.ConfirmPassword ? "input-error" : ""}
                  required
                />
                {fieldErrors.ConfirmPassword && (
                  <span className="field-error-message">
                    <AlertCircle size={16} />
                    {fieldErrors.ConfirmPassword}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="PrivilegeType">Privilege Level *</label>
                <select
                  id="PrivilegeType"
                  name="PrivilegeType"
                  value={formData.PrivilegeType}
                  onChange={handleChange}
                  required
                >
                  <option value={4}>All Privileges (Level 4)</option>
                </select>
              </div>

              <div className="profile-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsCreatingAdmin(false)}
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn no-margin-top"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-card-body">
            {success && (
              <div className="toast-notification success">
                <CheckCircle size={20} />
                <span>{success}</span>
              </div>
            )}
            <p className="security-info">
              <UserPlus className="info-icon" />
              Add new administrators to the system.
            </p>
          </div>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-card-title">
            <Users className="card-icon" />
            <h2>Existing Admins</h2>
          </div>
          {!isViewingAdmins && (
            <button
              type="button"
              className="btn-edit"
              onClick={() => {
                setIsViewingAdmins(true);
                fetchAdmins();
              }}
            >
              <Plus size={16} /> View Admins
            </button>
          )}
        </div>

        {isViewingAdmins ? (
          <div className="profile-card-body">
            {adminsError && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{adminsError}</span>
              </div>
            )}

            {isLoadingAdmins ? (
              <div className="loading-container">
                <p>Loading administrators...</p>
              </div>
            ) : (
              <div className="admins-table-container">
                <table className="admins-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Privilege</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.length > 0 ? (
                      admins.map((admin) => (
                        <tr key={admin.userId}>
                          <td>{admin.userName}</td>
                          <td>{admin.email}</td>
                          <td>{admin.type === 0 ? "By system" : "By admin"}</td>
                          <td>
                            {admin.privilegeType === 4
                              ? "All Privileges"
                              : admin.privilegeType}
                          </td>
                          <td>
                            <button
                              className="btn-delete-icon"
                              onClick={() => handleDeleteClick(admin.userId)}
                              title="Delete Admin"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No administrators found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="profile-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setIsViewingAdmins(false)}
              >
                <X size={16} /> Close
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-card-body">
            <p className="security-info">
              <Users className="info-icon" />
              View and manage existing administrator accounts.
            </p>
          </div>
        )}
      </div>
      
      <ConfirmationModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteAdmin}
        title="Delete Administrator"
        message="Are you sure you want to delete this administrator? This action cannot be undone."
        isLoading={isDeleting}
        confirmText="Delete Admin"
      />
    </div>
  );
};

export default ManageAdmins;
