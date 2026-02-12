import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaArrowLeft, 
  FaFileContract, 
  FaCalendarAlt, 
  FaUser, 
  FaMoneyBillWave, 
  FaMapMarkerAlt,
  FaPrint,
  FaCreditCard,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarker,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaLayerGroup,
  FaChair,
  FaCar,
  FaFileSignature
} from "react-icons/fa";
import { RingLoader } from "react-spinners";
import API_BASE_URL from "../services/ApiConfig";
import "../styles/ContractDetails.css";

const ContractDetails = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [signLoading, setSignLoading] = useState(false);
  const [signMessage, setSignMessage] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [finalizeLoading, setFinalizeLoading] = useState(false);
  const [finalizeMessage, setFinalizeMessage] = useState(null);
  const [verifyInfo, setVerifyInfo] = useState(null);

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/contracts/${contractId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err) {
        console.error("Error fetching contract details:", err);
        setError("Failed to load contract details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContractDetails();
    }
  }, [contractId]);

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/payments/tx/by-contract/${contractId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaymentInfo(res.data);
      } catch (err) {}
    };
    if (contractId) {
      fetchPaymentInfo();
    }
  }, [contractId]);

  useEffect(() => {
    const fetchVerifyInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/contracts/${contractId}/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVerifyInfo(res.data);
      } catch (err) {}
    };
    if (contractId) {
      fetchVerifyInfo();
    }
  }, [contractId]);

  const getStatusColor = (status) => {
    if (!status) return "draft";
    const lowerStatus = status.toString().toLowerCase();
    if (lowerStatus === "signed" || lowerStatus === "accepted") return "accepted";
    if (lowerStatus === "cancelled" || lowerStatus === "rejected") return "rejected";
    if (lowerStatus === "draft" || lowerStatus === "pending") return "pending";
    return "draft";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getSignedAtFor = (roleKey) => {
    const list = verifyInfo?.signatures || [];
    const entry = list.find(s => s.role && s.role.toLowerCase() === roleKey);
    return entry?.signedAt;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) return (
    <div className="contract-details-page">
      <div className="state-container">
        <RingLoader color="#f59e0b" size={60} />
        <p style={{ marginTop: "1.5rem", fontWeight: "600", color: "#64748b" }}>Loading professional contract...</p>
      </div>
    </div>
  );

  if (error || !data || !data.contract) return (
    <div className="contract-details-page">
      <div className="state-container">
        <div className="contract-error">{error || "No contract data found."}</div>
        <button className="back-btn-error" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Go Back
        </button>
      </div>
    </div>
  );

  const { contract, parties, property, signatures, ui, paymentPlan } = data;
  const isSale = contract.type?.startsWith("Sale") || property.type === "Sale";
  const isSaleInstallment = contract.type === "SaleInstallment";
  const myRole = ui?.myRole;
  const roleNumber =
    myRole?.toLowerCase() === "buyer" || myRole?.toLowerCase() === "tenant"
      ? 1
      : myRole?.toLowerCase() === "seller" || myRole?.toLowerCase() === "landlord"
      ? 2
      : null;
  const alreadySigned =
    roleNumber === 1
      ? Boolean(signatures.buyer?.signed)
      : roleNumber === 2
      ? Boolean(signatures.seller?.signed)
      : false;
  const nextActionText = ui?.nextAction?.trim();
  const isFullySigned = signatures.buyer?.signed && signatures.seller?.signed;

  const handleSign = async () => {
    if (!contractId || !roleNumber || alreadySigned) return;
    try {
      setSignLoading(true);
      setSignMessage(null);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/contracts/${contractId}/sign?role=${roleNumber}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const refresh = await axios.get(`${API_BASE_URL}/api/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(refresh.data);
      setSignMessage("Signed successfully");
    } catch (e) {
      setSignMessage("Failed to sign. Please try again.");
    } finally {
      setSignLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!paymentInfo?.externalRef) return;
    const entered = window.prompt("Enter CVV");
    if (!entered) return;
    try {
      setFinalizeLoading(true);
      setFinalizeMessage(null);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/payments/finalize`,
        { externalRef: paymentInfo.externalRef, cvv: entered },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFinalizeMessage("Payment finalized");
    } catch (e) {
      setFinalizeMessage("Failed to finalize payment");
    } finally {
      setFinalizeLoading(false);
    }
  };

  return (
    <div className="contract-details-page">
      <div className="contract-details-container">
        {/* Header Banner */}
        <div className="contract-header-banner">
          <button className="back-btn-top" onClick={() => navigate(-1)} title="Go Back">
            <FaChevronLeft />
          </button>
          <div className="header-content-wrapper">
            <div className={`header-icon-box ${isSale ? "sale" : "rent"}`}>
              {isSale ? <FaHome /> : <FaFileContract />}
            </div>
            <div>
              <div className="header-top-row">
                <h1>{isSale ? "Sale" : "Rent"} Agreement</h1>
                <span className={`status-badge ${getStatusColor(contract.status)}`}>
                  {contract.status}
                </span>
              </div>
              <p className="header-subtitle">Official Property Contract </p>
            </div>
          </div>
        </div>

        <div className="contract-body">
          {/* Property Section */}
          <div className="contract-details-section">
            <h2 className="section-title"><FaMapMarkerAlt /> Property Details</h2>
            <div className="property-showcase-card">
              <div className="property-main-info">
                <h3>{property.title}</h3>
                <p className="property-description">{property.description}</p>
                <div className="property-location-badge">
                  <FaMapMarkerAlt /> {property.location}
                </div>
              </div>
              <div className="property-specs-grid">
                <div className="spec-item"><FaBed /> <span>{property.numberOfRooms} Rooms</span></div>
                <div className="spec-item"><FaBath /> <span>{property.numberOfBathrooms} Baths</span></div>
                <div className="spec-item"><FaRulerCombined /> <span>{property.area} m²</span></div>
                <div className="spec-item"><FaLayerGroup /> <span>Floor {property.floorNumber}</span></div>
                <div className="spec-item"><FaChair /> <span>{property.isFurnished ? "Furnished" : "Unfurnished"}</span></div>
                <div className="spec-item"><FaCar /> <span>{property.hasGarage ? "Garage Included" : "No Garage"}</span></div>
              </div>
            </div>
          </div>

          {/* Parties Section */}
          <div className="contract-details-section">
            <h2 className="section-title"><FaUser /> Contracting Parties</h2>
            <div className="parties-grid">
              <div className="party-card landlord">
                <div className="party-role">Landlord / Seller</div>
                <div className="party-name">{parties.landlord?.name}</div>
                <div className="party-info-list">
                  <div className="party-info-item"><FaEnvelope /> {parties.landlord?.email}</div>
                  <div className="party-info-item"><FaPhoneAlt /> {parties.landlord?.phone || "N/A"}</div>
                  <div className="party-info-item"><FaMapMarker /> {parties.landlord?.address || "N/A"}</div>
                </div>
                <div className={`signature-status-pill ${signatures.seller?.signed ? "signed" : "unsigned"}`}>
                  {signatures.seller?.signed ? (
                    <>
                      Signed
                      {getSignedAtFor("seller") && (
                        <span className="signature-date-inline" style={{ marginLeft: "0.5rem", fontSize: "0.8rem", fontWeight: 600 }}>
                          {formatDateTime(getSignedAtFor("seller"))}
                        </span>
                      )}
                    </>
                  ) : "Waiting for signature"}
                </div>
              </div>

              <div className="party-card tenant">
                <div className="party-role">Tenant / Buyer</div>
                <div className="party-name">{parties.tenant?.name}</div>
                <div className="party-info-list">
                  <div className="party-info-item"><FaEnvelope /> {parties.tenant?.email}</div>
                  <div className="party-info-item"><FaPhoneAlt /> {parties.tenant?.phone || "N/A"}</div>
                  <div className="party-info-item"><FaMapMarker /> {parties.tenant?.address || "N/A"}</div>
                </div>
                <div className={`signature-status-pill ${signatures.buyer?.signed ? "signed" : "unsigned"}`}>
                  {signatures.buyer?.signed ? (
                    <>
                      Signed
                      {getSignedAtFor("buyer") && (
                        <span className="signature-date-inline" style={{ marginLeft: "0.5rem", fontSize: "0.8rem", fontWeight: 600 }}>
                          {formatDateTime(getSignedAtFor("buyer"))}
                        </span>
                      )}
                    </>
                  ) : "Waiting for signature"}
                </div>
              </div>
            </div>
          </div>

          {/* Financials & Terms */}
          <div className="contract-details-section">
            <h2 className="section-title"><FaMoneyBillWave /> Financial Agreement</h2>
            <div className="details-grid">
              <div className="detail-card highlight">
                <span className="detail-label">{isSale ? "Sale Price" : "Monthly Rent"}</span>
                <span className="price-value">{(property.price || 0).toLocaleString()} EGP</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Contract Type</span>
                <span className="detail-value contract-type">
                  {contract.type }
                </span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Agreement Date</span>
                <span className="detail-value">{formatDate(contract.createdAt)}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Contract Version</span>
                <span className="detail-value">v{contract.version}</span>
              </div>

              {paymentPlan && (
                <>
                
                  <div className="detail-card">
                    <span className="detail-label">Periodic Amount</span>
                    <span className="detail-value">{(paymentPlan.periodicAmount || 0).toLocaleString()} EGP</span>
                  </div>
                  <div className="detail-card">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{paymentPlan.durationMonths} Months</span>
                  </div>
                  <div className="detail-card">
                    <span className="detail-label">Frequency</span>
                    <span className="detail-value">{paymentPlan.frequencyLabel}</span>
                  </div>
                  <div className="detail-card">
                    <span className="detail-label">Payments Count</span>
                    <span className="detail-value">{paymentPlan.paymentsCount} Payments</span>
                  </div>
                  <div className="detail-card">
                    <span className="detail-label">Platform Fee</span>
                    <span className="detail-value">{paymentPlan.platformFeePercent}%</span>
                  </div>
                  
                  {paymentPlan.startDate && (
                    <div className="detail-card">
                      <span className="detail-label">Plan Start Date</span>
                      <span className="detail-value">{formatDate(paymentPlan.startDate)}</span>
                    </div>
                  )}
                  {paymentPlan.endDate && (
                    <div className="detail-card">
                      <span className="detail-label">Plan End Date</span>
                      <span className="detail-value">{formatDate(paymentPlan.endDate)}</span>
                    </div>
                  )}
                  {paymentPlan.totalAmount > 0 && (
                    <div className="detail-card">
                      <span className="detail-label">Total Plan Amount</span>
                      <span className="detail-value">{(paymentPlan.totalAmount).toLocaleString()} EGP</span>
                    </div>
                  )}
                </>
              )}
            </div>
            {nextActionText && nextActionText.toLowerCase() !== "none" && nextActionText.toLowerCase() !== "finalize" && (
                  <span className="status-badge pending">
                    Next Step: {nextActionText}
                  </span>
                )}
          </div>

          {/* Actions */}
          <div className="contract-footer-actions">
            <button className="action-btn print" onClick={() => window.print()}>
              <FaPrint /> Print Contract
            </button>
            
            {!isFullySigned && (
              <>
                {!alreadySigned && roleNumber && (
                  <button
                    className="action-btn-primary"
                    onClick={handleSign}
                    disabled={signLoading}
                    title={myRole ? `Sign as ${myRole}` : "Sign Contract"}
                  >
                    <FaFileSignature /> {signLoading ? "Signing..." : myRole ? `Sign as ${myRole}` : "Sign Contract"}
                  </button>
                )}
                
                {signMessage && (
                  <span className="status-badge pending">{signMessage}</span>
                )}
                {paymentInfo?.finalizeAllowed && (
                  <button
                    className="action-btn pay"
                    onClick={handleFinalize}
                    disabled={finalizeLoading}
                  >
                    <FaCreditCard /> {finalizeLoading ? "Finalizing..." : "Finalize Payment"}
                  </button>
                )}
                {finalizeMessage && (
                  <span className="status-badge pending">{finalizeMessage}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;
