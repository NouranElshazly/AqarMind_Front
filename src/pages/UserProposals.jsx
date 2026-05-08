import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaTrashAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHome,
  FaUser,
  FaPhone,
  FaSearch,
  FaChevronRight,
  FaDollarSign,
  FaCreditCard,
  FaQuestionCircle,
  FaTag,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/ApiConfig";
import {
  getOrCreateExternalRef,
  clearExternalRef,
} from "../utilities/externalRef";
import "../styles/UserProposals.css";

const getUserId = () => localStorage.getItem("userId");
const getToken = () => localStorage.getItem("token");

const UserProposals = () => {
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [paymentCards, setPaymentCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [loadingCards, setLoadingCards] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const navigate = useNavigate();
  const tenantId = getUserId();
  const token = getToken();

  // ─── Fetch Proposals (outside useEffect so it can be re-called) ───────────
  const fetchMyProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/Tenant/my-proposals`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (Array.isArray(response.data)) {
        const sortedProposals = [...response.data].sort(
          (a, b) => b.proposalId - a.proposalId
        );
        setMyProperties(sortedProposals);
      } else {
        setMyProperties([]);
      }
    } catch (err) {
      console.error("❌ Error fetching proposals:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load applications. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId && token) {
      fetchMyProperties();
    } else {
      setError("You need to login first");
      setLoading(false);
    }
  }, [tenantId, token]);

  // ─── Fetch Payment Cards ──────────────────────────────────────────────────
  const fetchPaymentCards = async () => {
    if (!tenantId || !token) return;

    setLoadingCards(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments/cards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentCards(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedCardId(response.data[0].paymentCardId);
      }
    } catch (err) {
      console.error("Error fetching payment cards:", err);
      toast.error("Failed to load payment cards.");
      setPaymentCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  // ─── Open Payment Modal ───────────────────────────────────────────────────
  const handleOpenPaymentModal = async (property) => {
    const type = Number(property.propertyType);
    const installment = Number(property.isInstallment);

    // ✅ Rent eligibility check — backend blocks if rentIsAble == Disable (0)
    if (type === 0 && Number(property.rentIsAble) === 0) {
      toast.error(
        "Eligibility check required before rent. Please submit the eligibility form first."
      );
      return;
    }

    // ✅ Installment eligibility check — backend blocks if isAble == Disable (0)
    if (type === 1 && installment === 1 && Number(property.isAble) === 0) {
      toast.error(
        "Eligibility check required before installment. Please submit the eligibility form first."
      );
      return;
    }

    setSelectedProperty(property);
    setShowPaymentModal(true);
    await fetchPaymentCards();
  };

  // ─── Initialize Payment ───────────────────────────────────────────────────
  const handleInitializePayment = async () => {
    if (!selectedCardId) {
      toast.error("Please select a payment card");
      return;
    }

    setProcessingPayment(true);

    try {
      const { proposalId, propertyType, isInstallment } = selectedProperty;

      // ✅ Cast to numbers — API may return strings
      const type = Number(propertyType);
      const installment = Number(isInstallment);

      let apiUrl = "";
      let op = "";

      const payload = {
        proposalId: Number(proposalId),
        paymentCardId: Number(selectedCardId),
      };

      // ✅ Determine route based on property type
      // propertyType: Rent = 0, Sale = 1
      // isInstallment: Cash = 0, Installment = 1
      if (type === 0) {
        apiUrl = `${API_BASE_URL}/api/payments/rent/start`;
        op = "PAYRENT";
      } else if (type === 1 && installment === 0) {
        apiUrl = `${API_BASE_URL}/api/payments/sale/cash`;
        op = "PAYSALECASH";
      } else if (type === 1 && installment === 1) {
        apiUrl = `${API_BASE_URL}/api/payments/sale/installment`;
        op = "PAYSALEINST";
        payload.installmentMonths = 360;
        payload.frequency = 12;
      } else {
        toast.error("Unknown property type. Cannot initiate payment.");
        setProcessingPayment(false);
        return;
      }

      // ✅ Generate or retrieve idempotency key
      const externalRef = getOrCreateExternalRef({
        op,
        a: tenantId,
        b: proposalId,
      });

      payload.externalRef = String(externalRef);

      console.log(`🚀 Firing Payment API: ${apiUrl}`);
      console.log(`📦 Payload [${op}]:`, payload);

      const response = await axios.post(apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ Check both HTTP status AND response body success flag
      if (
        (response.status === 200 || response.status === 201) &&
        response.data?.success
      ) {
        // ✅ Clear the externalRef so next payment attempt gets a fresh key
        clearExternalRef({ op, a: tenantId, b: proposalId });

        toast.success(
          "Payment initialized successfully! Please check your contracts."
        );
        setShowPaymentModal(false);

        // Redirect to contracts page
        setTimeout(() => {
          navigate("/tenant/contracts");
        }, 1500);
      } else {
        // ✅ Show the actual backend message instead of silent failure
        toast.error(
          response.data?.message || "Payment initialization failed."
        );
      }
    } catch (err) {
      console.error("❌ Error initializing payment:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to initialize payment. Please try again."
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  // ─── Delete Proposal ──────────────────────────────────────────────────────
  const deleteProperty = async (proposalId) => {
    if (window.confirm("Are you sure you want to delete this proposal?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/api/Tenant/cancel-proposal/${proposalId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMyProperties((prev) =>
          prev.filter((p) => p.proposalId !== proposalId)
        );
        toast.success("Proposal deleted successfully");
      } catch (err) {
        console.error("Error deleting property:", err);
        toast.error("Failed to delete proposal. Please try again later.");
      }
    }
  };

  // ─── Status Helpers ───────────────────────────────────────────────────────
  const getProposalStatusLabel = (status) => {
    const numericStatus = Number(status);
    if (!isNaN(numericStatus) && status !== null && status !== "") {
      if (numericStatus === -1) return "Rejected";
      if (numericStatus === 0) return "Waiting";
      if (numericStatus === 1) return "Approved";
      if (numericStatus === 2) return "Uncertain";
    }
    return status;
  };

  const renderStatusBadge = (status) => {
    const label = getProposalStatusLabel(status);
    const statusConfig = {
      Waiting: { className: "property-status-pending", icon: <FaClock /> },
      Approved: {
        className: "property-status-approved",
        icon: <FaCheckCircle />,
      },
      Rejected: {
        className: "property-status-rejected",
        icon: <FaTimesCircle />,
      },
      Uncertain: {
        className: "property-status-uncertain",
        icon: <FaQuestionCircle />,
      },
    };

    const config = statusConfig[label] || {
      className: "property-status-default",
      icon: null,
    };

    return (
      <div className={`property-status-badge ${config.className}`}>
        {config.icon}
        <span>{label}</span>
      </div>
    );
  };

  // ─── Loading & Error States ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="property-loading">
        <div className="property-spinner"></div>
        <p className="property-loading-text">Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="property-error">
        <div className="property-error-icon">
          <FaTimesCircle />
        </div>
        <h3 className="property-error-title">Oops! Something went wrong</h3>
        <p className="property-error-message">{error}</p>
        <button
          onClick={() => fetchMyProperties()}
          className="property-error-btn"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="user-properties-page">
      <header className="user-properties-header">
        <div className="user-properties-header-content">
          <h1 className="user-properties-title">My Proposals</h1>
          <p className="user-properties-subtitle">
            Track and manage your property applications
          </p>
        </div>
      </header>

      <main className="user-properties-container">
        {myProperties.length > 0 ? (
          <div className="user-properties-grid">
            {myProperties.map((property, index) => (
              <div
                key={property.proposalId}
                className="user-property-card"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Card Header */}
                <div className="user-property-header">
                  <div className="user-property-header-info">
                    <div className="user-property-icon">
                      <FaHome />
                    </div>
                    <div className="user-property-meta">
                      <h3 className="user-property-id">
                        Proposal #{property.proposalId}
                      </h3>
                      <p className="user-property-date">
                        {property.createdDate
                          ? new Date(property.createdDate).toLocaleDateString()
                          : "Recent Application"}
                      </p>
                    </div>
                  </div>
                  {renderStatusBadge(property.proposalStatus)}
                </div>

                {/* Card Details */}
                <div className="user-property-details">
                  <div className="user-property-detail-item">
                    <div className="user-property-detail-icon">
                      <FaPhone />
                    </div>
                    <div className="user-property-detail-content">
                      <span className="user-property-detail-label">
                        Contact
                      </span>
                      <span className="user-property-detail-value">
                        {property.phone || "N/A"}
                      </span>
                    </div>
                  </div>

                  {property.landlordName && (
                    <div className="user-property-detail-item">
                      <div className="user-property-detail-icon">
                        <FaUser />
                      </div>
                      <div className="user-property-detail-content">
                        <span className="user-property-detail-label">
                          Landlord
                        </span>
                        <span className="user-property-detail-value">
                          {property.landlordName}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="user-property-detail-item">
                    <div className="user-property-detail-icon">
                      <FaTag />
                    </div>
                    <div className="user-property-detail-content">
                      <span className="user-property-detail-label">
                        Property Type
                      </span>
                      <span className="user-property-detail-value">
                        {Number(property.propertyType) === 1 ? "Sale" : "Rent"}
                      </span>
                    </div>
                  </div>

                  <div className="user-property-detail-item">
                    <div className="user-property-detail-icon">
                      <FaCreditCard />
                    </div>
                    <div className="user-property-detail-content">
                      <span className="user-property-detail-label">
                        Payment Method
                      </span>
                      <span className="user-property-detail-value">
                        {Number(property.isInstallment) === 1
                          ? "Installment"
                          : "Cash"}
                      </span>
                    </div>
                  </div>

                  {(property.offeredPrice || property.Offeredprice) && (
                    <div className="user-property-detail-item">
                      <div className="user-property-detail-icon">
                        <FaDollarSign />
                      </div>
                      <div className="user-property-detail-content">
                        <span className="user-property-detail-label">
                          Offered Price
                        </span>
                        <span className="user-property-detail-value">
                          {(
                            property.offeredPrice || property.Offeredprice
                          ).toLocaleString()}{" "}
                          EGP
                        </span>
                      </div>
                    </div>
                  )}

                  {property.startRentalDate && property.endRentalDate && (
                    <div className="user-property-rental-period">
                      <div className="user-property-date-item">
                        <div className="user-property-date-icon start">
                          <FaCalendarAlt />
                        </div>
                        <div className="user-property-date-content">
                          <span className="user-property-date-label">
                            Start Date
                          </span>
                          <span className="user-property-date-value">
                            {new Date(
                              property.startRentalDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="user-property-date-arrow">
                        <FaChevronRight />
                      </div>
                      <div className="user-property-date-item">
                        <div className="user-property-date-icon end">
                          <FaCalendarAlt />
                        </div>
                        <div className="user-property-date-content">
                          <span className="user-property-date-label">
                            End Date
                          </span>
                          <span className="user-property-date-value">
                            {new Date(
                              property.endRentalDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="user-property-actions">
                  {Number(property.proposalStatus) === 1 && (
                    <button
                      onClick={() => handleOpenPaymentModal(property)}
                      className="user-property-btn user-property-btn-pay"
                      disabled={processingPayment}
                    >
                      <FaCreditCard />
                      {processingPayment ? "Processing..." : "Initialize Payment"}
                    </button>
                  )}
                  <button
                    onClick={() => deleteProperty(property.proposalId)}
                    className="user-property-btn user-property-btn-danger"
                  >
                    <FaTrashAlt /> Delete Proposal
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="user-properties-empty">
            <div className="user-properties-empty-content">
              <div className="user-properties-empty-icon">
                <FaHome />
              </div>
              <h3 className="user-properties-empty-title">
                No Applications Yet
              </h3>
              <p className="user-properties-empty-text">
                You haven't applied to any properties yet. Start exploring and
                find your perfect home!
              </p>
              <button
                onClick={() => navigate("/properties")}
                className="user-properties-empty-btn"
              >
                <FaSearch /> Browse Properties
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ─── Payment Card Selection Modal ─── */}
      {showPaymentModal && (
        <div className="card-modal-overlay">
          <div className="card-modal-content">
            <div className="card-modal-header">
              <h2>Select Payment Card</h2>
              <button
                className="close-modal-btn"
                onClick={() => !processingPayment && setShowPaymentModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {loadingCards ? (
                <div className="loading-cards">
                  <div className="loading-spinner"></div>
                  <p>Loading payment cards...</p>
                </div>
              ) : paymentCards.length === 0 ? (
                <div className="no-cards-message">
                  <FaCreditCard size={48} className="no-cards-icon" />
                  <p>You don't have any payment cards saved.</p>
                  <a href="/profile" className="add-card-link">
                    Go to Profile to add a card
                  </a>
                </div>
              ) : (
                <>
                  <div className="cards-list">
                    {paymentCards.map((card) => (
                      <div
                        key={card.paymentCardId}
                        className={`card-option ${
                          selectedCardId === card.paymentCardId ? "selected" : ""
                        }`}
                        onClick={() => setSelectedCardId(card.paymentCardId)}
                      >
                        <input
                          type="radio"
                          name="paymentCard"
                          checked={selectedCardId === card.paymentCardId}
                          onChange={() => setSelectedCardId(card.paymentCardId)}
                        />
                        <div className="card-info">
                          <span className="card-number">
                            •••• •••• ••••{" "}
                            {card.maskedCardNumber?.slice(-4) ||
                              card.cardNumber?.slice(-4) ||
                              "****"}
                          </span>
                          <span className="card-holder">
                            {card.cardHolderName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card-modal-actions">
                    <button
                      className="cancel-btn"
                      onClick={() => setShowPaymentModal(false)}
                      disabled={processingPayment}
                    >
                      Cancel
                    </button>
                    <button
                      className="confirm-subscribe-btn"
                      onClick={handleInitializePayment}
                      disabled={processingPayment || !selectedCardId}
                    >
                      {processingPayment ? "Processing..." : "Confirm Payment"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProposals;