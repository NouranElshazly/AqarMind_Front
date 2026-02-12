import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaTrashAlt,
  FaEnvelope,
  FaFilePdf,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExpand,
  FaDownload,
  FaEye,
  FaHome,
  FaUser,
  FaPhone,
  FaSearch,
  FaFilter,
  FaChevronRight,
  FaDollarSign,
  FaImage,
  FaQuestionCircle,
  FaTag,
  FaCreditCard,
} from "react-icons/fa";
import { RingLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { X, Check } from "lucide-react";
import {
  getOrCreateExternalRef,
  clearExternalRef,
} from "../utilities/externalRef";
import API_BASE_URL from "../services/ApiConfig";
import "../styles/UserProposals.css";

const getUserId = () => localStorage.getItem("userId");
const getToken = () => localStorage.getItem("token");



// File Viewer Modal Component
const FileViewerModal = ({
  isOpen,
  onClose,
  fileBase64,
  fileName,
  filePath,
  isPath,
  isPDF,
}) => {
  if (!isOpen) return null;

  // تحديد نوع الملف
  const getFileType = (fileName, fileBase64, isPDF) => {
    if (isPath) {
      return isPDF ? "pdf" : "image";
    }

    if (!fileBase64) return "unknown";

    // التحقق من البداية المميزة لكل نوع ملف في base64
    const base64Header = fileBase64.substring(0, 50);

    // PDF يبدأ بـ JVBERi (base64 for %PDF)
    if (
      base64Header.startsWith("JVBERi") ||
      fileName?.toLowerCase().endsWith(".pdf")
    ) {
      return "pdf";
    }

    // JPEG يبدأ بـ /9j/
    if (
      base64Header.startsWith("/9j/") ||
      fileName?.toLowerCase().match(/\.(jpg|jpeg)$/i)
    ) {
      return "image";
    }

    // PNG يبدأ بـ iVBORw
    if (
      base64Header.startsWith("iVBORw") ||
      fileName?.toLowerCase().endsWith(".png")
    ) {
      return "image";
    }

    // GIF يبدأ بـ R0lGOD
    if (
      base64Header.startsWith("R0lGOD") ||
      fileName?.toLowerCase().endsWith(".gif")
    ) {
      return "image";
    }

    // WebP يبدأ بـ UklGR
    if (
      base64Header.startsWith("UklGR") ||
      fileName?.toLowerCase().endsWith(".webp")
    ) {
      return "image";
    }

    // BMP يبدأ بـ Qk
    if (
      base64Header.startsWith("Qk") ||
      fileName?.toLowerCase().endsWith(".bmp")
    ) {
      return "image";
    }

    // إذا كان اسم الملف يحتوي على امتداد صورة
    if (fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) {
      return "image";
    }

    // افتراضي
    return fileName?.toLowerCase().endsWith(".pdf") ? "pdf" : "image";
  };

  const fileType = getFileType(fileName, fileBase64, isPDF);

  const handleDownload = () => {
    if (isPath && filePath) {
      // تحميل من مسار
      const link = document.createElement("a");
      link.href = filePath;
      link.download =
        fileName || `document.${fileType === "pdf" ? "pdf" : "jpg"}`;
      link.target = "_blank";
      link.click();
    } else if (fileBase64) {
      // تحميل من base64
      const link = document.createElement("a");
      const mimeType = fileType === "pdf" ? "application/pdf" : "image/*";

      link.href = `data:${mimeType};base64,${fileBase64}`;
      link.download =
        fileName || `document.${fileType === "pdf" ? "pdf" : "jpg"}`;
      link.click();
    }
  };

  const handleOpenInNewTab = () => {
    if (isPath && filePath) {
      // فتح من مسار
      window.open(filePath, "_blank");
    } else if (fileBase64) {
      // فتح من base64
      const pdfWindow = window.open();
      if (pdfWindow) {
        const mimeType = fileType === "pdf" ? "application/pdf" : "image/*";

        if (fileType === "pdf") {
          pdfWindow.document.write(`
            <html>
              <head><title>${fileName || "PDF Document"}</title></head>
              <body style="margin: 0;">
                <embed width="100%" height="100%" src="data:${mimeType};base64,${fileBase64}" type="${mimeType}" />
              </body>
            </html>
          `);
        } else {
          pdfWindow.document.write(`
            <html>
              <head><title>${fileName || "Image"}</title></head>
              <body style="margin: 0; display: flex; align-items: center; justify-content: center; background: #f0f0f0; min-height: 100vh;">
                <img src="data:${mimeType};base64,${fileBase64}" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="Document" />
              </body>
            </html>
          `);
        }
      }
    }
  };

  return (
    <div className="property-modal-overlay">
      <div className="property-modal">
        {/* Header */}
        <div className="property-modal-header">
          <div className="property-modal-title">
            {fileType === "pdf" ? <FaFilePdf /> : <FaEye />}
            {fileType === "pdf" ? "PDF Document" : "Image Document"}
          </div>
          <div className="property-modal-actions">
            <button
              onClick={handleDownload}
              className="property-modal-btn property-modal-btn-secondary"
            >
              <FaDownload />
              Download
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="property-modal-btn property-modal-btn-primary"
            >
              <FaExpand />
              Open Full
            </button>
            <button onClick={onClose} className="property-modal-close">
              <FaTimesCircle />
            </button>
          </div>
        </div>

        {/* File Content */}
        <div className="property-modal-body">
          {fileBase64 || filePath ? (
            <div className="property-file-viewer">
              {fileType === "pdf" ? (
                <embed
                  src={
                    isPath
                      ? filePath
                      : `data:application/pdf;base64,${fileBase64}`
                  }
                  type="application/pdf"
                  className="property-pdf-embed"
                  onLoad={() => {
                    console.log("✅ PDF loaded in modal");
                  }}
                  onError={() => {
                    console.error("❌ PDF load error in modal");
                  }}
                />
              ) : (
                <div className="property-image-viewer">
                  <img
                    src={
                      isPath ? filePath : `data:image/*;base64,${fileBase64}`
                    }
                    alt="Document"
                    className="property-image-embed"
                    onLoad={() => {
                      console.log("✅ Modal image loaded successfully");
                    }}
                    onError={(e) => {
                      console.error("❌ Modal image load error:", {
                        fileName: fileName,
                        isPath: isPath,
                        filePath: filePath,
                        fileBase64Length: fileBase64?.length,
                        fileType: fileType,
                      });

                      e.target.parentElement.innerHTML = `
                        <div class="property-file-error">
                          <div class="property-file-error-icon">⚠️</div>
                          <h3>Unable to display this file</h3>
                          <p>File type: ${fileType}</p>
                          <p>Source: ${isPath ? "File path" : "Base64 data"}</p>
                          <p>The file may be corrupted or in an unsupported format</p>
                        </div>
                      `;
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="property-pdf-empty">
              <div className="property-pdf-empty-icon">
                <FaFilePdf />
              </div>
              <h3 className="property-pdf-empty-title">
                No document available
              </h3>
              <p className="property-pdf-empty-text">
                The file could not be loaded
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserProposals = () => {
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentLoading, setPaymentLoading] = useState(false);
  // Card Selection Modal States
  const [showCardModal, setShowCardModal] = useState(false);
  const [paymentCards, setPaymentCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [cvv, setCvv] = useState("");
  const [loadingCards, setLoadingCards] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [installmentMonths, setInstallmentMonths] = useState(360);
  const [frequency, setFrequency] = useState(12);
  const navigate = useNavigate();
  const tenantId = getUserId();
  const token = getToken();

  useEffect(() => {
    const fetchMyProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Tenant/my-proposals/${tenantId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("✅ Proposals fetched successfully:", response.data);
        console.log("📊 Total proposals:", response.data?.length || 0);

        // طباعة البيانات الخام كما هي
        console.log(
          "🔍 Raw API Response:",
          JSON.stringify(response.data, null, 2),
        );

        // طباعة تفاصيل كل proposal لفهم البيانات المتاحة
        if (Array.isArray(response.data) && response.data.length > 0) {
          console.log("📋 First proposal details:", response.data[0]);
          console.log("📋 Available fields:", Object.keys(response.data[0]));

          // فحص الحقول المهمة
          response.data.forEach((proposal, index) => {
            console.log(`📄 Proposal ${index + 1} - All fields:`, proposal);
            console.log(`📄 Proposal ${index + 1} - Key analysis:`, {
              proposalId: proposal.proposalId,
              fileBase64: proposal.fileBase64
                ? `✅ Available (${proposal.fileBase64.length} chars)`
                : "❌ Missing",
              fileName: proposal.fileName || "❌ Missing",
              offeredPrice: proposal.offeredPrice || "❌ Missing",
              Offeredprice: proposal.Offeredprice || "❌ Missing", // تحقق من الاسم بحرف كبير
              phone: proposal.phone || "❌ Missing",
              rentalStatus: proposal.rentalStatus || "❌ Missing",
              proposalStatus: proposal.proposalStatus,
              startRentalDate: proposal.startRentalDate || "❌ Missing",
              endRentalDate: proposal.endRentalDate || "❌ Missing",
              landlordName: proposal.landlordName || "❌ Missing",
              landlordId: proposal.landlordId || "❌ Missing",
            });
          });
        }

        // تأكد من أن الـ response array
        if (Array.isArray(response.data)) {
          // Sort by proposalId descending (recent first)
          const sortedProposals = [...response.data].sort((a, b) => b.proposalId - a.proposalId);
          setMyProperties(sortedProposals);
        } else {
          console.error("❌ Unexpected response format:", response.data);
          setMyProperties([]);
        }
      } catch (err) {
        console.error("❌ Error fetching proposals:", err);
        console.error("Response:", err.response?.data);
        console.error("Status:", err.response?.status);
        setError(
          err.response?.data?.message ||
            "Failed to load applications. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (tenantId && token) {
      fetchMyProperties();
    } else {
      console.error("❌ Missing tenantId or token");
      setError("You need to login first");
      setLoading(false);
    }
  }, [tenantId, token]);
  const deleteProperty = async (proposalId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/api/Tenant/cancel-proposal/${proposalId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setMyProperties(
          myProperties.filter((property) => property.proposalId !== proposalId),
        );
      } catch (err) {
        console.error("Error deleting property:", err);
        alert("Failed to delete property. Please try again later.");
      }
    }
  };

  const fetchPaymentCards = async () => {
    if (!tenantId || !token) return;

    setLoadingCards(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/payments/cards/${tenantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPaymentCards(response.data || []);
    } catch (error) {
      console.error("Error fetching payment cards:", error);
      toast.error("Failed to load payment cards.");
      setPaymentCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  const closeCardModal = () => {
    setShowCardModal(false);
    setSelectedCardId(null);
    setCvv("");
    setSelectedProperty(null);
  };

  const handlePayment = async (property) => {
    // If Sale (Cash or Installment) or Rent, open card selection modal
    if (property.propertyType === 1 || property.propertyType === 0) {
      setSelectedProperty(property);
      setShowCardModal(true);
      await fetchPaymentCards();
      return;
    }

    setPaymentLoading(true);
    try {
      let endpoint = "";

      // Determine endpoint based on property type and payment method
      if (property.propertyType === 0) {
        // Rent payment
        endpoint = `${API_BASE_URL}/api/payments/rent/start/${tenantId}`;
      } else if (property.propertyType === 1) {
        // Sale payment
        if (property.isInstallment === 1) {
          // Installment sale
          endpoint = `${API_BASE_URL}/api/payments/sale/installment/${tenantId}`;
        }
      }

      if (!endpoint) {
        toast.error("Invalid payment configuration");
        return;
      }

      console.log("Initializing payment via:", endpoint);

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        toast.success("Payment initialized successfully");
        const idToUse = property.contractId || property.proposalId;
        navigate(`/contract-details/${idToUse}`);
      }
    } catch (err) {
      console.error("❌ Payment initialization error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to initialize payment. Please try again.";
      toast.error(errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedCardId) {
      toast.error("Please select a payment card");
      return;
    }

    if (!cvv || cvv.length !== 3) {
      toast.error("Please enter a valid 3-digit CVV");
      return;
    }

    setPaymentLoading(true);

    try {
      const property = selectedProperty;
      const isInstallment = property.isInstallment === 1;
      const isRent = property.propertyType === 0;

      // Generate ExternalRef exactly as in SubsPlan
      let opType = "";
      if (isRent) {
        opType = "RENT";
      } else {
        opType = isInstallment ? "SALEINST" : "SALECASH";
      }

      const externalRef = getOrCreateExternalRef({
        op: opType,
        a: tenantId,
        b: property.proposalId,
      });

      console.log(`🔑 ExternalRef for ${opType}:`, externalRef);

      const payload = {
        proposalId: property.proposalId,
        paymentCardId: selectedCardId,
        externalRef,
        cvv: cvv,
      };

      // Add postId for sale payments
      if (!isRent) {
        payload.postId = property.postId;
      }

      // Add installment fields if needed
      if (isInstallment) {
        payload.installmentMonths = installmentMonths;
        payload.frequency = frequency;
      }

      console.log(`🚀 Sending ${opType} payment request:`, payload);

      let endpoint = "";
      if (isRent) {
        endpoint = `${API_BASE_URL}/api/payments/rent/start/${tenantId}`;
      } else if (isInstallment) {
        endpoint = `${API_BASE_URL}/api/payments/sale/installment/${tenantId}`;
      } else {
        endpoint = `${API_BASE_URL}/api/payments/sale/cash/${tenantId}`;
      }

      const response = await axios.post(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.success) {
        clearExternalRef({
          op: opType,
          a: tenantId,
          b: property.proposalId,
        });

        toast.success("Payment successful! 🎉");
        closeCardModal();

        // Link to contract details page by the contractId or proposalId
        const idToUse =
          response.data.contractId || property.contractId || property.proposalId;
        navigate(`/contract-details/${idToUse}`);
      } else if (response.data && response.data.paymentUrl) {
        // If it returns a URL instead of success: true
        window.location.href = response.data.paymentUrl;
      } else {
        toast.warning(
          response.data.message || "Payment failed. Please try again.",
        );
      }
    } catch (err) {
      console.error("❌ Payment error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Payment failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Helper function to get status label from numeric or string status
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
    const normalizedStatus = label;

    const statusConfig = {
      Waiting: {
        className: "property-status-pending",
        icon: <FaClock />,
      },
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

    const config = statusConfig[normalizedStatus] || {
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

  const handleMessageClick = (userId, userName) => {
    if (!localStorage.getItem("token")) {
      alert("You need to login to send a message");
      navigate("/login");
      return;
    } else {
      navigate(`/messages/${userId}`, {
        state: {
          receiverId: userId,
          receiverName: userName,
        },
      });
    }
  };

  // Filter properties based on status
  const filteredProperties = myProperties.filter((property) => {
    const matchesStatus =
      statusFilter === "All" ||
      getProposalStatusLabel(property.proposalStatus) === statusFilter;
    return matchesStatus;
  });

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
        <h2 className="property-error-title">Error Loading Applications</h2>
        <p className="property-error-message">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="property-error-btn"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="user-properties-page">
      <FileViewerModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        fileBase64={selectedFile?.fileBase64}
        fileName={selectedFile?.fileName}
        filePath={selectedFile?.filePath}
        isPath={selectedFile?.isPath}
        isPDF={selectedFile?.isPDF}
      />

      {/* Page Header */}
      <div className="user-properties-header">
        <div className="user-properties-header-content">
          <h1 className="user-properties-title">My Applications</h1>
          <p className="user-properties-subtitle">
            Track and manage all your property applications in one place
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="user-properties-container">
        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="user-properties-grid">
            {filteredProperties.map((property, index) => (
              <div
                key={property.postId}
                className="user-property-card"
                style={{ animationDelay: `${index * 100}ms` }}
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
                    </div>
                  </div>
                  {renderStatusBadge(property.proposalStatus)}
                </div>

                {/* Property Details */}
                <div className="user-property-details">
                  {/* Contact Info */}
                  <div className="user-property-detail-item">
                    <div className="user-property-detail-icon">
                      <FaPhone />
                    </div>
                    <div className="user-property-detail-content">
                      <span className="user-property-detail-label">
                        Contact Number
                      </span>
                      <span className="user-property-detail-value">
                        {property.phone}
                      </span>
                    </div>
                  </div>

                  {/* Landlord Info */}
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

                  {property.landlordName && (
                    <div className="user-property-detail-item">
                      <div className="user-property-detail-icon">
                        <FaUser />
                      </div>
                      <div className="user-property-detail-content">
                        <span className="user-property-detail-label">
                          Property title
                        </span>
                        <span className="user-property-detail-value">
                          {property.title}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Property Type */}
                  <div className="user-property-detail-item">
                    <div className="user-property-detail-icon">
                      <FaTag />
                    </div>
                    <div className="user-property-detail-content">
                      <span className="user-property-detail-label">Type</span>
                      <span className="user-property-detail-value">
                        {property.propertyType === 1 ? "Sale" : "Rent"}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method (Installment/Cash) */}
                  <div className="user-property-detail-item">
                    <div className="user-property-detail-icon">
                      <FaCreditCard />
                    </div>
                    <div className="user-property-detail-content">
                      <span className="user-property-detail-label">
                        Payment Method
                      </span>
                      <span className="user-property-detail-value">
                        {property.isInstallment === 1 ? "Installment" : "Cash"}
                      </span>
                    </div>
                  </div>

                  {/* Offered Price */}
                  {(() => {
                    const offeredPrice =
                      property.offeredPrice ||
                      property.Offeredprice ;
              
                    console.log(
                      `💰 Price check for proposal ${property.proposalId}:`,
                      {
                        offeredPrice: property.offeredPrice,
                        finalPrice: offeredPrice,
                      },
                    );

                    if (offeredPrice) {
                      return (
                        <div className="user-property-detail-item">
                          <div className="user-property-detail-icon">
                            <FaDollarSign />
                          </div>
                          <div className="user-property-detail-content">
                            <span className="user-property-detail-label">
                              Offered Price
                            </span>
                            <span className="user-property-detail-value">
                              ${parseFloat(offeredPrice).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Rental Period */}
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
                              property.startRentalDate,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
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
                              property.endRentalDate,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="user-property-actions">
                  {property.proposalStatus === 1 && (
                    <button
                      onClick={() => handlePayment(property)}
                      className="user-property-btn user-property-btn-pay"
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <div className="btn-spinner"></div>
                      ) : (
                        <>
                          <FaCreditCard />
                          Initialize payment
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => deleteProperty(property.proposalId)}
                    className="user-property-btn user-property-btn-danger"
                  >
                    <FaTrashAlt />
                    Delete Proposal
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
                {myProperties.length === 0
                  ? "No Applications Yet"
                  : "No matching applications"}
              </h3>
              <p className="user-properties-empty-text">
                {myProperties.length === 0
                  ? "You haven't applied to any properties yet. Start exploring and apply to find your perfect home!"
                  : "Try adjusting your search or filter criteria to find what you're looking for."}
              </p>
              {myProperties.length === 0 && (
                <button
                  onClick={() => navigate("/properties")}
                  className="user-properties-empty-btn"
                >
                  <FaSearch />
                  Browse Properties
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Selection Modal for Sale (Cash) */}
      {showCardModal && (
        <div className="subs-modal-overlay" onClick={closeCardModal}>
          <div
            className="subs-card-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="subs-card-modal-header">
              <h3>Select Payment Card</h3>
              <button className="subs-modal-close" onClick={closeCardModal}>
                <X size={24} />
              </button>
            </div>

            <div className="subs-card-modal-body">
              <p className="subs-modal-subtitle">
                Choose a card to complete your payment for Proposal #
                {selectedProperty?.proposalId}
              </p>

              {loadingCards ? (
                <div className="subs-cards-loading">
                  <div className="subs-mini-spinner"></div>
                  <span>Loading your cards...</span>
                </div>
              ) : paymentCards.length > 0 ? (
                <div className="subs-cards-list">
                  {paymentCards.map((card) => {
                    const cardId = card.id || card.paymentCardId || card.PaymentCardId || card.cardId;
                    return (
                      <div
                        key={cardId}
                        className={`subs-card-item ${
                          selectedCardId === cardId ? "selected" : ""
                        }`}
                        onClick={() => setSelectedCardId(cardId)}
                      >
                        <div className="subs-card-radio">
                          <div className="radio-outer">
                            {selectedCardId === cardId && (
                              <div className="radio-inner"></div>
                            )}
                          </div>
                        </div>
                        <div className="subs-card-info">
                          <div className="subs-card-main">
                            <FaCreditCard className="card-icon" />
                            <span className="card-number">
                              **** **** {card.maskedCardNumber || `**** ${card.lastFourDigits}`}
                            </span>
                          </div>
                          <div className="subs-card-expiry">
                            Expires: {card.expiryMonth}/{card.expiryYear}
                          </div>
                        </div>
                        {selectedCardId === cardId && (
                          <Check className="subs-card-check" size={20} />
                        )}
                      </div>
                    );
                  })}

                  {selectedCardId && (
                    <div className="subs-cvv-section">
                      <label htmlFor="cvv">Security Code (CVV)</label>
                      <input
                        type="password"
                        id="cvv"
                        placeholder="***"
                        maxLength="3"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(e.target.value.replace(/\D/g, ""))
                        }
                        className="subs-cvv-input"
                      />
                      <p className="cvv-help">
                        The 3-digit code on the back of your card
                      </p>
                    </div>
                  )}

                  {/* New fields for Sale (Installment) */}
                  {selectedProperty?.propertyType === 1 &&
                    selectedProperty?.isInstallment === 1 && (
                      <div className="subs-installment-fields">
                        <div className="subs-cvv-section">
                          <label htmlFor="installmentMonths">
                            Installment Months
                          </label>
                          <input
                            type="number"
                            id="installmentMonths"
                            placeholder="360"
                            value={installmentMonths}
                            onChange={(e) =>
                              setInstallmentMonths(parseInt(e.target.value) || 0)
                            }
                            className="subs-cvv-input"
                          />
                        </div>
                        <div className="subs-cvv-section">
                          <label htmlFor="frequency">Payment Frequency (Months)</label>
                          <select
                            id="frequency"
                            value={frequency}
                            onChange={(e) =>
                              setFrequency(parseInt(e.target.value))
                            }
                            className="subs-cvv-input"
                          >
                            <option value={1}>Monthly (1)</option>
                            <option value={3}>Quarterly (3)</option>
                            <option value={6}>Semi-Annually (6)</option>
                            <option value={12}>Annually (12)</option>
                          </select>
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="subs-no-cards">
                  <p>No payment cards found.</p>
                  <button
                    onClick={() => navigate("/payment-methods")}
                    className="subs-add-card-btn"
                  >
                    Add a New Card
                  </button>
                </div>
              )}
            </div>

            <div className="subs-card-modal-footer">
              <button className="subs-btn-cancel" onClick={closeCardModal}>
                Cancel
              </button>
              <button
                className="subs-btn-confirm"
                disabled={!selectedCardId || cvv.length !== 3 || paymentLoading}
                onClick={handleConfirmPayment}
              >
                {paymentLoading ? (
                  <div className="subs-btn-spinner"></div>
                ) : (
                  "Confirm Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProposals;