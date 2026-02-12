import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FaMoneyBillWave, FaHome, FaCalendarAlt, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaClock, FaHistory, FaInfoCircle, FaExclamationTriangle,
  FaTimes, FaCreditCard, FaLock
} from "react-icons/fa";
import { getTenantPaymentPlanDetails, getUserCards, payRemainingAmount } from "../services/api";
import "../styles/PaymentPlanDetails.css";

const PaymentPlanDetails = () => {
  const { planId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const tenantId = localStorage.getItem("userId");

  // Pay Remaining Modal States
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [cvv, setCvv] = useState("");
  const [loadingCards, setLoadingCards] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    if (tenantId && planId) {
      fetchDetails();
    } else {
      setError("Session or Plan ID missing.");
      setLoading(false);
    }
  }, [tenantId, planId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await getTenantPaymentPlanDetails(tenantId, planId);
      if (response.data) {
        setDetails(response.data);
        setError(null);
      } else {
        setError("Payment plan not found.");
      }
    } catch (err) {
      console.error("Error fetching plan details:", err);
      setError("Failed to load payment plan details.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Fetching plan details...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="error-container">
        <FaExclamationTriangle size={48} color="#ef4444" />
        <p>{error || "Plan not found"}</p>
        <Link to="/tenant/payment-plans" className="btn-retry">Back to Plans</Link>
      </div>
    );
  }

  const paidSchedules = details.schedules?.filter(s => s.isPaid).length || 0;
  const remainingSchedules = (details.schedules?.length || 0) - paidSchedules;
  const nextPayment = details.schedules?.find(s => !s.isPaid);

  // Pagination logic
  const totalItems = details.schedules?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSchedules = details.schedules?.slice(startIndex, startIndex + itemsPerPage) || [];

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenPayModal = async (schedule = null) => {
    setSelectedSchedule(schedule);
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
    setSelectedSchedule(null);
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
      // PAYINST/Userid/planid/scheduleid
      // If paying remaining, scheduleid is null
      const scheduleIdPart = selectedSchedule ? selectedSchedule.scheduleId : "null";
      const externalRef = `PAYINST-${tenantId}-${planId}-${scheduleIdPart}`;
      
      const payload = {
        paymentPlanId: parseInt(planId),
        paymentScheduleId: selectedSchedule ? selectedSchedule.scheduleId : null,
        paymentCardId: parseInt(selectedCardId),
        cvv: cvv,
        externalRef: externalRef
      };

      await payRemainingAmount(payload);
      handleClosePayModal();
      fetchDetails(); // Refresh details
      toast.success("Remaining balance paid successfully!");
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="payment-plan-details-container">
      <header className="details-header">
        <div className="header-title-section">
          <FaMoneyBillWave className="header-icon" />
          <h1>Payment Plan Details</h1>
        </div>
        <div className="header-actions">
          {details.canPayRemaining && (
            <button className="btn-pay-remaining" onClick={handleOpenPayModal}>
              Pay Remaining
            </button>
          )}
          <Link to="/tenant/payment-plans" className="btn-back">
            <FaChevronLeft /> Back to All Plans
          </Link>
        </div>
      </header>

      <div className="property-banner">
        <FaHome className="property-banner-icon" />
        <div className="property-banner-text">
          <span>{details.propertyType}</span>
          <span className="separator">•</span>
          <span>{details.planType} Plan</span>
        </div>
      </div>

      <div className="details-stats-grid">
        <div className="stat-card highlight">
          <span className="stat-label">Total Amount</span>
          <span className="stat-value">{(details.totalAmount ).toLocaleString()} EGP</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Periodic Payment</span>
          <span className="stat-value">{(details.periodicAmount ).toLocaleString()} EGP</span>
          <span className="stat-subtext">Start Date: {formatDate(details.startDate)}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Duration</span>
          <span className="stat-value">{details.durationMonths} Months</span>
          <span className="stat-subtext">Frequency: {details.intervalMonths === 3 ? "Quarterly" : `Every ${details.intervalMonths} Months`}</span>
        </div>
      </div>

      <div className="overview-bar">
        <div className="overview-item">
          <FaCheckCircle className="overview-icon" />
          Paid: <strong>{paidSchedules}</strong>
        </div>
        <div className="overview-item">
          <FaClock className="overview-icon" />
          Remaining: <strong>{remainingSchedules}</strong>
        </div>
        {nextPayment && (
          <div className="overview-item">
            <FaCalendarAlt className="overview-icon" />
            Next Payment: <strong>{formatDate(nextPayment.dueDate)}</strong>
          </div>
        )}
      </div>

      <section className="schedule-section">
        <h2>Payment Schedule</h2>
        <div className="schedule-table-container">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="idx-col">#</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentSchedules.map((item, index) => (
                <tr key={item.scheduleId}>
                  <td className="idx-col">{startIndex + index + 1}</td>
                  <td>{formatDate(item.dueDate)}</td>
                  <td className="amount-cell">{item.amount.toLocaleString()} EGP</td>
                  <td>
                    <span className={`status-pill ${item.isPaid ? 'paid' : (item.canPayNow ? 'due' : 'pending')}`}>
                      {item.isPaid ? 'Paid' : (item.canPayNow ? 'Due Soon' : 'Pending')}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-pay-now" 
                      disabled={item.isPaid || !item.canPayNow}
                      onClick={() => handleOpenPayModal(item)}
                    >
                      {item.isPaid ? 'Paid' : 'Pay Now'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-container">
            <button 
              className="pagination-btn" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft /> Previous
            </button>
            
            <div className="pagination-info">
              Page <span>{currentPage}</span> of {totalPages}
            </div>

            <button 
              className="pagination-btn" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}
      </section>

      {/* Pay Remaining Modal */}
      {showPayModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content">
            <div className="modal-header">
              <h2>{selectedSchedule ? "Pay Installment" : "Pay Remaining Balance"}</h2>
              <button className="close-modal" onClick={handleClosePayModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="payment-summary">
                <div className="summary-row">
                  <span>Property:</span>
                  <strong>{details.propertyType}</strong>
                </div>
                <div className="summary-row highlight">
                  <span>{selectedSchedule ? "Installment Amount:" : "Remaining Amount:"}</span>
                  <strong>
                    {selectedSchedule 
                      ? selectedSchedule.amount.toLocaleString() 
                      : details.totalAmount?.toLocaleString()} EGP
                  </strong>
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
                      `Pay ${selectedSchedule 
                        ? selectedSchedule.amount.toLocaleString() 
                        : details.totalAmount?.toLocaleString()} EGP`
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

export default PaymentPlanDetails;
