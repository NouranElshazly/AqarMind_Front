import { useEffect, useState } from "react";
import axios from "axios";
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
} from "react-icons/fa";
import { RingLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/ApiConfig";
import "../styles/UserProperties.css";

const getUserId = () => localStorage.getItem("userId");
const getToken = () => localStorage.getItem("token");

// دالة للتحقق من وجود الملف
const checkFileExists = async (filePath) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${filePath}`, {
      method: "HEAD", // استخدام HEAD للتحقق فقط دون تحميل الملف
    });
    return response.ok;
  } catch (error) {
    console.error("File check error:", error);
    return false;
  }
};

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

const MyProperties = () => {
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();
  const tenantId = getUserId();
  const token = getToken();

  useEffect(() => {
    const fetchMyProperties = async () => {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching proposals for tenant:", tenantId);

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
          setMyProperties(response.data);
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

  const openFileModal = (property) => {
    const fileBase64 = property.fileBase64 || property.file_base64;
    const fileName = property.fileName || property.file_name;
    const filePath = property.filePath;
    const imagePath = property.imagePath;

    if (fileBase64) {
      // استخدام base64
      setSelectedFile({
        fileBase64: fileBase64,
        fileName: fileName,
        isPath: false,
      });
      setIsFileModalOpen(true);
    } else if (filePath || imagePath) {
      // استخدام مسار الملف
      const path = filePath || imagePath;
      const name = fileName || path.split("/").pop();

      setSelectedFile({
        filePath: `${API_BASE_URL}/${path}`,
        fileName: name,
        isPath: true,
        isPDF: !!filePath,
      });
      setIsFileModalOpen(true);
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

  // Filter properties based on search and status
  const filteredProperties = myProperties.filter((property) => {
    const matchesSearch =
      property.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.landlordName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.offeredPrice || property.Offeredprice || property.offered_price)
        ?.toString()
        .includes(searchTerm) ||
      property.proposalId?.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === "All" ||
      getProposalStatusLabel(property.proposalStatus) === statusFilter;
    return matchesSearch && matchesStatus;
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
        {/* IF used search */}
        {/* Search and Filter Bar */}
        <div className="user-properties-controls">
          <div className="user-properties-search">
            <FaSearch className="user-properties-search-icon" />
            <input
              type="text"
              placeholder="Search by phone, landlord, price, or application ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="user-properties-search-input"
            />
          </div>
        </div>

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
                        Application #{property.proposalId}
                      </h3>
                    </div>
                  </div>
                  {renderStatusBadge(property.proposalStatus)}
                </div>

                {/* File Preview Section */}
                <div className="user-property-document">
                  {(() => {
                    // البحث عن مسارات الملفات
                    const filePath = property.filePath;
                    const imagePath = property.imagePath;
                    const fileBase64 =
                      property.fileBase64 ||
                      property.file_base64 ||
                      property.fileData;
                    const fileName =
                      property.fileName ||
                      property.file_name ||
                      property.filename;

                    console.log(
                      `🔍 File check for proposal ${property.proposalId}:`,
                      {
                        filePath: filePath,
                        imagePath: imagePath,
                        hasFileBase64: !!fileBase64,
                        fileName: fileName,
                        allKeys: Object.keys(property),
                        fullPdfUrl: filePath
                          ? `${API_BASE_URL}/${filePath}`
                          : null,
                        fullImageUrl: imagePath
                          ? `${API_BASE_URL}/${imagePath}`
                          : null,
                      },
                    );

                    // إذا كان هناك filePath (PDF) أو imagePath (صورة)
                    if (filePath || imagePath || fileBase64) {
                      const isImage = !!imagePath;
                      const isPDF = !!filePath;
                      const displayPath = filePath || imagePath;
                      const displayName =
                        fileName ||
                        (displayPath
                          ? displayPath.split("/").pop()
                          : "Unknown file");

                      return (
                        <div className="user-property-file-preview">
                          <div className="user-property-file-container">
                            {fileBase64 ? (
                              // عرض من base64 (الطريقة القديمة)
                              <>
                                {isPDF ||
                                displayName.toLowerCase().endsWith(".pdf") ? (
                                  <div className="user-property-pdf-wrapper">
                                    <embed
                                      src={`data:application/pdf;base64,${fileBase64}#toolbar=0&navpanes=0`}
                                      type="application/pdf"
                                      className="user-property-pdf-embed"
                                    />
                                    <div className="user-property-file-type-badge pdf">
                                      <FaFilePdf />
                                      PDF
                                    </div>
                                  </div>
                                ) : (
                                  <div className="user-property-image-wrapper">
                                    <img
                                      src={`data:image/*;base64,${fileBase64}`}
                                      alt="Application document"
                                      className="user-property-image-embed"
                                      onLoad={() => {
                                        console.log(
                                          `✅ Base64 image loaded for proposal ${property.proposalId}`,
                                        );
                                      }}
                                      onError={(e) => {
                                        console.error(
                                          `❌ Base64 image error for proposal ${property.proposalId}`,
                                        );
                                        e.target.style.display = "none";
                                      }}
                                    />
                                    <div className="user-property-file-type-badge image">
                                      <FaEye />
                                      IMAGE
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              // عرض من مسار الملف (الطريقة الجديدة)
                              <>
                                {isPDF ? (
                                  <div className="user-property-pdf-wrapper">
                                    <embed
                                      src={`${API_BASE_URL}/${filePath}`}
                                      type="application/pdf"
                                      className="user-property-pdf-embed"
                                      onLoad={() => {
                                        console.log(
                                          `✅ PDF loaded from path for proposal ${property.proposalId}`,
                                        );
                                      }}
                                      onError={() => {
                                        console.error(
                                          `❌ PDF load error for proposal ${property.proposalId}:`,
                                          {
                                            filePath: filePath,
                                            fullUrl: `${API_BASE_URL}/${filePath}`,
                                          },
                                        );
                                      }}
                                    />
                                    <div className="user-property-file-type-badge pdf">
                                      <FaFilePdf />
                                      PDF
                                    </div>
                                  </div>
                                ) : isImage ? (
                                  <div className="user-property-image-wrapper">
                                    <img
                                      src={`${API_BASE_URL}/${imagePath}`}
                                      alt="Application document"
                                      className="user-property-image-embed"
                                      onLoad={() => {
                                        console.log(
                                          `✅ Image loaded from path for proposal ${property.proposalId}`,
                                        );
                                      }}
                                      onError={(e) => {
                                        console.error(
                                          `❌ Image load error for proposal ${property.proposalId}:`,
                                          {
                                            src: e.target.src,
                                            imagePath: imagePath,
                                          },
                                        );

                                        const errorDiv =
                                          document.createElement("div");
                                        errorDiv.className =
                                          "user-property-file-error";
                                        errorDiv.innerHTML = `
                                          <div class="user-property-file-error-icon">⚠️</div>
                                          <p>Unable to load image</p>
                                          <small>Path: ${imagePath}</small>
                                        `;
                                        e.target.parentElement.appendChild(
                                          errorDiv,
                                        );
                                        e.target.style.display = "none";
                                      }}
                                    />
                                    <div className="user-property-file-type-badge image">
                                      <FaEye />
                                      IMAGE
                                    </div>
                                  </div>
                                ) : null}
                              </>
                            )}

                            <div className="user-property-file-overlay">
                              <button
                                onClick={() => {
                                  if (fileBase64) {
                                    // فتح من base64
                                    openFileModal({
                                      ...property,
                                      fileBase64: fileBase64,
                                      fileName: displayName,
                                    });
                                  } else {
                                    // فتح من مسار
                                    const fileUrl = `${API_BASE_URL}/${displayPath}`;
                                    window.open(fileUrl, "_blank");
                                  }
                                }}
                                className="user-property-file-view-btn"
                              >
                                <FaEye />
                                View {isPDF ? "PDF" : "Image"}
                              </button>
                            </div>
                          </div>
                          <div className="user-property-file-info">
                            {isPDF ? (
                              <FaFilePdf className="user-property-file-icon pdf" />
                            ) : (
                              <FaEye className="user-property-file-icon image" />
                            )}
                            <span className="user-property-file-name">
                              {displayName}
                            </span>
                            <span className="user-property-file-type">
                              {isPDF ? "PDF" : "IMAGE"}
                            </span>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="user-property-file-empty">
                          <div className="user-property-file-empty-icon">
                            <FaFilePdf />
                          </div>
                          <p className="user-property-file-empty-text">
                            No document available
                          </p>
                          <small className="user-property-file-debug">
                            Debug: filePath={filePath || "null"}, imagePath=
                            {imagePath || "null"}, fileBase64=
                            {fileBase64 ? "exists" : "null"}
                          </small>
                        </div>
                      );
                    }
                  })()}
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

                  {/* Offered Price */}
                  {(() => {
                    const offeredPrice =
                      property.offeredPrice ||
                      property.Offeredprice ||
                      property.offered_price ||
                      property.price;

                    console.log(
                      `💰 Price check for proposal ${property.proposalId}:`,
                      {
                        offeredPrice: property.offeredPrice,
                        Offeredprice: property.Offeredprice,
                        offered_price: property.offered_price,
                        price: property.price,
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
                  {property.rentalStatus === "Approved" && (
                    <button
                      onClick={() =>
                        handleMessageClick(
                          property.landlordId,
                          property.landlordName,
                        )
                      }
                      className="user-property-btn user-property-btn-primary"
                    >
                      <FaEnvelope />
                      Message Landlord
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
    </div>
  );
};

export default MyProperties;
