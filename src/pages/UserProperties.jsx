import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCalendarAlt, FaTrashAlt, FaEnvelope, FaFilePdf, FaClock, FaCheckCircle, FaTimesCircle, FaExpand, FaDownload, FaEye } from "react-icons/fa";
import { RingLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/ApiConfig";
import '../styles/UserProperties.css';

const getUserId = () => localStorage.getItem("userId");
const getToken = () => localStorage.getItem("token");

// مودال عرض الملف
const FileViewerModal = ({ isOpen, onClose, fileBase64, fileName, fileType }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (fileBase64) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${fileBase64}`;
      link.download = fileName || 'document.pdf';
      link.click();
    }
  };

  const handleOpenInNewTab = () => {
    if (fileBase64) {
      const pdfWindow = window.open();
      pdfWindow.document.write(`
        <html>
          <head><title>${fileName || 'Document'}</title></head>
          <body style="margin: 0;">
            <embed width="100%" height="100%" src="data:application/pdf;base64,${fileBase64}" type="application/pdf" />
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-4 h-[90vh] flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaFilePdf className="text-2xl text-red-500" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {fileName || 'Document Viewer'}
              </h3>
              <p className="text-sm text-gray-500">PDF Document</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              <FaDownload />
              Download
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200"
            >
              <FaExpand />
              Open Full
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FaTimesCircle className="text-2xl" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 p-4 bg-gray-100 overflow-auto">
          {fileBase64 ? (
            <div className="w-full h-full bg-white rounded-2xl shadow-inner overflow-hidden">
              <embed
                src={`data:application/pdf;base64,${fileBase64}`}
                type="application/pdf"
                className="w-full h-full min-h-[500px]"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FaFilePdf className="text-8xl mb-4" />
              <p className="text-2xl font-medium">No document available</p>
              <p className="text-lg mt-2">The PDF file could not be loaded</p>
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
  const navigate = useNavigate();
  const tenantId = getUserId();
  const token = getToken();

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Tenant/my-proposals/${tenantId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMyProperties(response.data);
      } catch (err) {
        console.error("Error fetching user properties:", err);
        setError("Failed to load properties. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
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
          }
        );
        setMyProperties(
          myProperties.filter((property) => property.proposalId !== proposalId)
        );
      } catch (err) {
        console.error("Error deleting property:", err);
        alert("Failed to delete property. Please try again later.");
      }
    }
  };

  const openFileModal = (property) => {
    setSelectedFile({
      fileBase64: property.fileBase64,
      fileName: property.fileName,
      fileType: property.fileName?.endsWith(".pdf") ? "pdf" : "unknown"
    });
    setIsFileModalOpen(true);
  };

  const renderStatusBadge = (status) => {
    const statusConfig = {
      Pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-300",
        icon: <FaClock className="text-lg" />,
      },
      Approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-300",
        icon: <FaCheckCircle className="text-lg" />,
      },
      Rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-300",
        icon: <FaTimesCircle className="text-lg" />,
      },
    };

    const config = statusConfig[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-300",
      icon: null,
    };

    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider border-2 ${config.bg} ${config.text} ${config.border}`}
      >
        {config.icon}
        {status}
      </div>
    );
  };

  const handleMessageClick = (userId, userName) => { // 1. أضفنا userName هنا
    if (!localStorage.getItem("token")) {
      alert("You need to login to send a message");
      navigate("/login");
      return;
    } else {
      // 2. قمنا بتعديل دالة navigate لتمرير الـ state
      navigate(`/messages/${userId}`, {
        state: {
          receiverId: userId,
          receiverName: userName
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-content">
          <div className="loading-spinner">
            <RingLoader color="#dc2626" size={80} />
          </div>
          <p className="loading-text">
            Loading your applications...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-card">
          <div className="error-icon">
            <FaTimesCircle className="text-3xl text-red-600" />
          </div>
          <h2 className="error-title">Error Loading Applications</h2>
          <p className="error-description">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-properties-container">
      <FileViewerModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        fileBase64={selectedFile?.fileBase64}
        fileName={selectedFile?.fileName}
        fileType={selectedFile?.fileType}
      />

      <div className="properties-wrapper">
        {/* Header */}
        <div className="properties-header">
          <h1 className="properties-title">
            My Applications
          </h1>
          <p className="properties-subtitle">
            Track and manage all your property applications in one place
          </p>
        </div>

        {myProperties.length > 0 ? (
          <div className="properties-grid">
            {myProperties.map((property, index) => (
              <div
                key={property.postId}
                className="property-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* PDF Preview Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 min-h-[280px] border-b border-gray-200 flex flex-col items-center justify-center relative group">
                  {property.fileBase64 && property.fileName?.endsWith(".pdf") ? (
                    <>
                      <div className="w-full h-48 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-4">
                        <embed
                          src={`data:application/pdf;base64,${property.fileBase64}#toolbar=0&navpanes=0`}
                          type="application/pdf"
                          className="w-full h-full pointer-events-none"
                        />
                      </div>
                      
                      {/* Overlay with View Button */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-t-3xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => openFileModal(property)}
                          className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-800 rounded-xl font-semibold hover:bg-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-2xl"
                        >
                          <FaEye className="text-lg" />
                          View Full Document
                        </button>
                      </div>

                      {/* File Info */}
                      <div className="text-center">
                        <p className="text-sm text-gray-600 font-medium">
                          {property.fileName || 'document.pdf'}
                        </p>
                        <button
                          onClick={() => openFileModal(property)}
                          className="mt-2 text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 mx-auto"
                        >
                          <FaExpand className="text-xs" />
                          Click to open
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
                        <FaFilePdf className="text-4xl" />
                      </div>
                      <p className="text-lg font-medium">No PDF File</p>
                      <p className="text-sm text-gray-500 mt-1">Document not available</p>
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <div className="p-6 space-y-6">
                  {/* Contact Info */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaEnvelope className="text-xl text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">
                        Contact Number
                      </p>
                      <h3 className="text-lg font-bold text-gray-800">
                        {property.phone}
                      </h3>
                    </div>
                  </div>

                  {/* Rental Period */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border border-green-200">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FaCalendarAlt className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">
                          Start Date
                        </p>
                        <p className="font-semibold text-gray-800">
                          {new Date(property.startRentalDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-red-50 rounded-xl border border-red-200">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FaCalendarAlt className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-red-600 font-semibold uppercase tracking-wide">
                          End Date
                        </p>
                        <p className="font-semibold text-gray-800">
                          {new Date(property.endRentalDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-3">
                      Application Status
                    </p>
                    <div className="flex justify-center">
                      {renderStatusBadge(property.rentalStatus)}
                    </div>
                  </div>

                  {/* Message Button for Approved */}
                {property.rentalStatus === "Approved" && (
                    <button
                        // 1. قمنا بتمرير الاسم هنا (تأكد من اسم الحقل)
                      onClick={() => handleMessageClick(property.landlordId, property.landlordName)}
                      className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <FaEnvelope className="text-xl" />
                      Message Landlord
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => deleteProperty(property.proposalId)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaTrashAlt className="text-lg" />
                    Delete Application
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center max-w-md border border-white/20">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <FaFilePdf className="text-5xl text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                No Applications Yet
              </h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                You haven't applied to any properties yet. Start exploring and apply to find your perfect home!
              </p>
              <button
                onClick={() => navigate("/properties")}
                className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <FaEnvelope className="text-xl" />
                Browse Properties
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MyProperties;