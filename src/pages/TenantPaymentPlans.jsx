import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaMoneyBillWave, FaHome, FaCreditCard, FaCalendarAlt, FaInfoCircle, FaExclamationTriangle, FaTimes, FaLock } from "react-icons/fa";
import { getTenantPaymentPlans, getUserCards, payRemainingAmount } from "../services/api";
import "../styles/TenantPaymentPlans.css";

const TenantPaymentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pay Remaining Modal States
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [cvv, setCvv] = useState("");
  const [loadingCards, setLoadingCards] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const navigate = useNavigate();
  const tenantId = localStorage.getItem("userId");

  useEffect(() => {
    if (tenantId) {
      fetchPlans();
    } else {
      setError("User session not found. Please login again.");
      setLoading(false);
    }
  }, [tenantId]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await getTenantPaymentPlans(tenantId);
      // Ensure we have an array and sort by planId (highest first) to show recent ones
      const data = Array.isArray(response.data) ? response.data : [];
      const sortedData = [...data].sort((a, b) => b.planId - a.planId);
      setPlans(sortedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching payment plans:", err);
      setError("Failed to load payment plans. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayModal = async (plan) => {
    setSelectedPlan(plan);
    setShowPayModal(true);
    setLoadingCards(true);
    setPaymentError(null);
    try {
      const response = await getUserCards(tenantId);
      setCards(response.data || []);
      if (response.data && response.data.length > 0) {
        const defaultCard = response.data.find(c => c.isDefault) || response.data[0];
        setSelectedCardId(defaultCard.paymentCardId);
      }
    } catch (err) {
      console.error("Error fetching cards:", err);
      setPaymentError("Failed to load payment cards.");
    } finally {
      setLoadingCards(false);
    }
  };

  const handleClosePayModal = () => {
    setShowPayModal(false);
    setSelectedPlan(null);
    setCvv("");
    setPaymentError(null);
  };

  const handlePayRemaining = async (e) => {
    e.preventDefault();
    if (!selectedCardId || !cvv) {
      setPaymentError("Please select a card and enter CVV.");
      return;
    }

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      const externalRef = `PAYPLAN-${tenantId}-${selectedPlan.planId}`;
      const payload = {
        paymentPlanId: selectedPlan.planId,
        paymentScheduleId: null, // as per "schedule will be null"
        paymentCardId: parseInt(selectedCardId),
        cvv: cvv,
        externalRef: externalRef
      };

      await payRemainingAmount(payload);
      handleClosePayModal();
      fetchPlans(); // Refresh the list
      toast.success("Remaining balance paid successfully!");
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: plans.length,
      active: plans.filter(p => p.status?.toLowerCase() === "active").length,
      completed: plans.filter(p => p.status?.toLowerCase() === "completed").length,
      cancelled: plans.filter(p => p.status?.toLowerCase() === "cancelled").length
    };
    return stats;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your payment plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FaExclamationTriangle size={48} color="#ef4444" />
        <p>{error}</p>
        <button className="btn-retry" onClick={fetchPlans}>Retry</button>
      </div>
    );
  }

  const stats = getStatusStats();

  return (
    <div className="payment-plans-container">
      <header className="payment-plans-header">
        <FaMoneyBillWave className="header-icon" />
        <h1>My Payment Plans</h1>
      </header>

      <div className="plans-summary">
        <div className="summary-item">
          <span>Total Plans:</span>
          <span className="summary-value">{stats.total}</span>
        </div>
        <div className="summary-item">
          <span>Active:</span>
          <span className="summary-value">{stats.active}</span>
        </div>
        <div className="summary-item">
          <span>Completed:</span>
          <span className="summary-value">{stats.completed}</span>
        </div>
        <div className="summary-item">
          <span>Cancelled:</span>
          <span className="summary-value">{stats.cancelled}</span>
        </div>
      </div>

      {plans.length > 0 ? (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div 
              key={plan.planId} 
              className={`plan-card ${plan.status?.toLowerCase() === 'active' ? 'active-plan' : ''}`}
            >
              <div className="card-header">
                <div className="property-info">
                  <FaHome className="property-icon" />
                  <span>{plan.propertyType || "Property"}</span>
                </div>
                <div className={`plan-badge ${plan.planType?.toLowerCase() || 'cash'}`}>
                  {plan.planType || "Cash"}
                </div>
              </div>

              <div className="card-body">
                <div className="total-amount">
                  {(plan.totalAmount ).toLocaleString()} EGP
                </div>
                {plan.planType?.toLowerCase() === "installment" && (
                  <div className="periodic-amount">
                    <span className="label">Periodic Amount: </span>
                    {(plan.periodicAmount ).toLocaleString()} EGP
                  </div>
                )}
              </div>

              <div className="card-footer">
                <div className="card-footer-info">
                  <div className={`status-label ${plan.status?.toLowerCase()}`}>
                    {plan.status}
                  </div>
                  <div className="created-date">
                    {formatDate(plan.createdAt)}
                  </div>
                </div>
                
                {plan.status?.toLowerCase() === 'active' && (
                  <div className="card-actions">
                    {plan.canPayRemaining && (
                      <button 
                        className="btn-pay" 
                        onClick={() => handleOpenPayModal(plan)}
                      >
                        Pay Remaining
                      </button>
                    )}
                    <button 
                      className="btn-details" 
                      onClick={() => navigate(`/tenant/payment-plan/${plan.planId}`)}
                    >
                      Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-container">
          <FaInfoCircle size={48} />
          <p>You don't have any payment plans yet.</p>
        </div>
      )}

      {/* Pay Remaining Modal */}
      {showPayModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content">
            <div className="modal-header">
              <h2>Pay Remaining Balance</h2>
              <button className="close-modal" onClick={handleClosePayModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="payment-summary">
                <div className="summary-row">
                  <span>Property:</span>
                  <strong>{selectedPlan?.propertyType}</strong>
                </div>
                <div className="summary-row highlight">
                  <span>Remaining Amount:</span>
                  <strong>{selectedPlan?.totalAmount?.toLocaleString()} EGP</strong>
                </div>
              </div>

              <form onSubmit={handlePayRemaining} className="payment-form">
                <div className="form-group">
                  <label>Select Payment Card</label>
                  {loadingCards ? (
                    <div className="small-spinner"></div>
                  ) : cards.length > 0 ? (
                    <div className="card-selector">
                      {cards.map(card => (
                        <div 
                          key={card.paymentCardId}
                          className={`card-option ${selectedCardId === card.paymentCardId ? 'selected' : ''}`}
                          onClick={() => setSelectedCardId(card.paymentCardId)}
                        >
                          <div className="card-radio">
                            <div className="radio-outer">
                              {selectedCardId === card.paymentCardId && <div className="radio-inner" />}
                            </div>
                          </div>
                          <FaCreditCard className="card-icon" />
                          <div className="card-info">
                            <div className="card-main">
                              <span className="card-number">•••• •••• •••• {card.maskedCardNumber?.slice(-4) || card.cardNumber?.slice(-4) || "****"}</span>
                            </div>
                            <span className="card-holder">{card.cardHolderName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-cards">No saved cards found. Please add a card in your profile.</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <div className="cvv-input-wrapper">
                    <FaLock className="input-icon" />
                    <input 
                      type="password" 
                      id="cvv"
                      maxLength="3"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                {paymentError && <div className="payment-error-msg">{paymentError}</div>}

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={handleClosePayModal}
                    disabled={processingPayment}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-confirm-pay"
                    disabled={processingPayment || !selectedCardId || cards.length === 0}
                  >
                    {processingPayment ? (
                      <><span className="spinner-small"></span> Processing...</>
                    ) : (
                      `Pay ${selectedPlan?.totalAmount?.toLocaleString()} EGP`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantPaymentPlans;
