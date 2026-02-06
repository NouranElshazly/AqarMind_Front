import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/ApiConfig";
import { ArrowLeft, Save, CreditCard, Clock, Tag, Edit, X } from "lucide-react";
import "../styles/AdminManageSubs.css";

const AdminManageSubs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 1,
    price: 0,
  });

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/subscription-plans`);
      setPlans(response.data);
    } catch (error) {
      toast.error("Failed to load subscription plans.");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (plan) => {
    setEditId(plan.id);
    setFormData({
      name: plan.name,
      description: plan.description,
      duration: plan.durationInMonths,
      price: plan.price,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({
      name: "",
      description: "",
      duration: 1,
      price: 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (editId) {
        // Update existing plan
        const payload = {
          name: formData.name,
          description: formData.description,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
        };

        await axios.put(`${API_BASE_URL}/api/subscription-plans/${editId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("Subscription plan updated successfully!");
      } else {
        // Create new plan
        const data = new FormData();
        data.append("Name", formData.name);
        data.append("Description", formData.description);
        data.append("Duration", formData.duration);
        data.append("Price", formData.price);

        await axios.post(`${API_BASE_URL}/api/subscription-plans`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Subscription plan created successfully!");
      }

      handleCancelEdit(); // Reset form and state
      fetchPlans(); // Refresh the list
    } catch (error) {
      console.error("Error saving subscription plan:", error);
      toast.error(editId ? "Failed to update subscription plan." : "Failed to create subscription plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-manage-subs">
      <div className="subs-container">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="back-btn"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="subs-card">
          <div className="card-header">
            <h2>{editId ? "Edit Subscription Plan" : "Create Subscription Plan"}</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="subs-form">
            <div className="form-group">
              <label>Plan Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Premium Plan"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Plan details..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration (Months)</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                <Save size={20} />
                {loading ? (editId ? "Updating..." : "Creating...") : (editId ? "Update Plan" : "Create Plan")}
              </button>
              
              {editId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="cancel-btn"
                  disabled={loading}
                >
                  <X size={20} />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="plans-list-section">
          <h3 className="section-title">Existing Plans</h3>
          <div className="plans-table-container">
            <table className="plans-table">
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length > 0 ? (
                  plans.map((plan) => (
                    <tr key={plan.id}>
                      <td>{plan.name}</td>
                      <td className="price-cell">${plan.price}</td>
                      <td>{plan.durationInMonths} Months</td>
                      <td className="desc-cell">{plan.description}</td>
                      <td>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(plan)}
                          title="Edit Plan"
                        >
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No subscription plans found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManageSubs;
