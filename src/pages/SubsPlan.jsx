import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../services/ApiConfig";
import { Check, ChevronLeft, ChevronRight, CreditCard, X } from "lucide-react";
import {
  getOrCreateExternalRef,
  clearExternalRef,
} from "../utilities/externalRef";
import "../styles/SubsPlan.css";

const SubsPlan = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const plansPerPage = 3;

  const nextSlide = () => {
    if (currentIndex + plansPerPage < plans.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Card Selection Modal States
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [paymentCards, setPaymentCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [cvv, setCvv] = useState("");
  const [loadingCards, setLoadingCards] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/subscription-plans`,
      );
      setPlans(response.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentCards = async () => {
    if (!userId || !token) return;

    setLoadingCards(true);
    try {
      console.log(`Fetching cards for user ${userId}...`);
      const response = await axios.get(
        `${API_BASE_URL}/api/payments/cards/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("Cards API Response:", response.data);
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log("First card sample:", response.data[0]);
      }
      setPaymentCards(response.data || []);
    } catch (error) {
      console.error("Error fetching payment cards:", error);
      toast.error("Failed to load payment cards.");
      setPaymentCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleSubscribeClick = async (planId) => {
    if (!userId || !token) {
      toast.error("Please login to subscribe");
      return;
    }

    // Open modal and fetch cards
    setSelectedPlanId(planId);
    setShowCardModal(true);
    await fetchPaymentCards();
  };

  const handleConfirmSubscription = async () => {
    if (!selectedCardId) {
      toast.error("Please select a payment card");
      return;
    }

    if (!cvv || cvv.length < 3) {
      toast.error("Please enter a valid CVV");
      return;
    }

    setSubscribingId(selectedPlanId);

    try {
      // Generate or retrieve ExternalRef
      const externalRef = getOrCreateExternalRef({
        op: "SUBPRO",
        a: userId,
        b: selectedPlanId,
      });

      console.log("🔑 ExternalRef for subscription:", externalRef);

      const payload = {
        subscriptionPlanId: selectedPlanId,
        paymentCardId: selectedCardId,
        cvv: cvv,
        externalRef,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/landlord/subscribe-pro/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.success) {
        clearExternalRef({ op: "SUBPRO", a: userId, b: selectedPlanId });

        toast.success("Subscription successful! 🎉");

        // Close modal and reset
        setShowCardModal(false);
        setSelectedCardId(null);
        setCvv("");
        setSelectedPlanId(null);
      } else {
        toast.warning(
          response.data.message || "Subscription failed. Please try again.",
        );
      }
    } catch (error) {
      console.error("Subscription error:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Subscription failed";
        toast.error(errorMessage);

        if (
          error.response.status === 409 ||
          errorMessage.includes("already") ||
          errorMessage.includes("duplicate")
        ) {
          clearExternalRef({ op: "SUBPRO", a: userId, b: selectedPlanId });
        }
      } else if (error.request) {
        toast.error(
          "Network error. Please check your connection and try again.",
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setSubscribingId(null);
    }
  };

  const closeModal = () => {
    setShowCardModal(false);
    setSelectedCardId(null);
    setCvv("");
    setSelectedPlanId(null);
  };

  if (loading) {
    return (
      <div className="subs-plan-loading">
        <div className="loading-spinner"></div>
        <p>Loading subscription plans...</p>
      </div>
    );
  }

  return (
    <div className="subs-plan-page">
      <div className="subs-plan-header">
        <h1>Choose Your Plan</h1>
        <p>Unlock premium features and grow your real estate business</p>
      </div>

      <div className="subs-plan-carousel">
        {currentIndex > 0 && (
          <button
            className="scroll-arrow scroll-arrow-left"
            onClick={prevSlide}
            aria-label="Previous plans"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div className="subs-plan-grid">
          {plans.length > 0 ? (
            plans
              .slice(currentIndex, currentIndex + plansPerPage)
              .map((plan, index) => (
                <div
                  key={plan.id}
                  className={`plan-card ${index === 1 ? "featured-plan" : ""}`}
                >
                  <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="currency">$</span>
                    <span className="amount">{plan.price}</span>
                    <span className="period">
                      /{plan.durationInMonths}{" "}
                      {plan.durationInMonths === 1 ? "Month" : "Months"}
                    </span>
                  </div>
                   <span>Duration: {plan.durationInMonths} Months</span>
                </div>

                <div className="plan-body">
                  <p className="plan-description">{plan.description}</p>

                  <div className="plan-features">
                    <div className="feature-item">
                      <Check size={18} className="feature-icon" />
                     
                    </div>
                    <div className="feature-item">
                      
                      <span>Premium Support</span>
                    </div>
                    <div className="feature-item">
                      
                      <span>High Posts Priority</span>
                    </div>
                  </div>
                </div>

                <div className="plan-footer">
                  <button
                    className="subscribe-btn"
                    onClick={() => handleSubscribeClick(plan.id)}
                    disabled={subscribingId === plan.id}
                  >
                    {subscribingId === plan.id
                      ? "Processing..."
                      : "Subscribe Now"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-plans">
              <p>No subscription plans available at the moment.</p>
            </div>
          )}
        </div>

        {currentIndex + plansPerPage < plans.length && (
          <button
            className="scroll-arrow scroll-arrow-right"
            onClick={nextSlide}
            aria-label="Next plans"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Card Selection Modal */}
      {showCardModal && (
        <div className="card-modal-overlay" onClick={closeModal}>
          <div
            className="card-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-modal-header">
              <h2>Select Payment Method</h2>
              <button className="close-modal-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className="card-modal-body">
              {loadingCards ? (
                <div className="loading-cards">
                  <div className="loading-spinner"></div>
                  <p>Loading payment cards...</p>
                </div>
              ) : paymentCards.length === 0 ? (
                <div className="no-cards-message">
                  <CreditCard size={48} className="no-cards-icon" />
                  <p>You don't have any payment cards saved.</p>
                  <a href="/profile" className="add-card-link">
                    Go to Profile to add a card
                  </a>
                </div>
              ) : (
                <>
                  <div className="cards-list">
                    {paymentCards.map((card) => {
                      // Handle potential casing differences from API
                      const cardId = card.paymentCardId;
                      const cardNumber = card.maskedCardNumber;

                      return (
                        <label key={cardId} className="card-option">
                          <input
                            type="radio"
                            name="paymentCard"
                            value={cardId}
                            checked={selectedCardId === cardId}
                            onChange={() => setSelectedCardId(cardId)}
                          />
                          <div className="card-info">
                            <CreditCard size={24} />
                            <div>
                              <div className="card-number">
                                •••• •••• •••• {cardNumber.slice(-4) || "****"}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="cvv-input-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="password"
                      id="cvv"
                      maxLength="4"
                      placeholder="Enter CVV"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, ""))
                      }
                      className="cvv-input"
                    />
                  </div>

                  <div className="card-modal-actions">
                    <button className="cancel-btn" onClick={closeModal}>
                      Cancel
                    </button>
                    <button
                      className="confirm-subscribe-btn"
                      onClick={handleConfirmSubscription}
                      disabled={subscribingId}
                    >
                      {subscribingId ? "Processing..." : "Confirm Subscription"}
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

export default SubsPlan;
