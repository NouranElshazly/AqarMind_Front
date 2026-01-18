import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import {
  FaCheck,
  FaTimes,
  FaFileAlt,
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaInfoCircle,
  FaHome,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaEye,
  FaFilter,
  FaLock,
  FaExclamationTriangle
} from "react-icons/fa";
import { RingLoader } from "react-spinners";

const getLandlordId = () => {
  return localStorage.getItem("userId");
};

const PropertyProposals = () => {
  const [submittedData, setSubmittedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedProposalDetails, setSelectedProposalDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: "", // "approve" or "reject"
    proposal: null,
    message: "",
    daysRemaining: 0
  });
  
  const landlordId = getLandlordId();
  const token = localStorage.getItem("token");

  // ✨ (تعديل 1) : جعلنا هذه الدالة مسؤولة عن جلب التفاصيل فقط
  const fetchPropertyDetails = async (postId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/Landlord/get-post/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching property details for post ${postId}:`, error); // تحسين رسالة الخطأ
      return null;
    }
  };

  // ✨ (تعديل 2) : تعديل الدالة لجلب كل الصور مقدماً
  const fetchAllProposals = async () => {
    let response = null; // لتسهيل الوصول إليه في حالة الخطأ
    try {
      setLoading(true);
      response = await axios.get(
        `${API_BASE_URL}/api/Landlord/proposals/${landlordId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const proposals = response.data;

      // --- الجزء الجديد: جلب كل صور البوستات ---
      // 1. إنشاء مصفوفة من الـ promises لجلب تفاصيل كل بوست
      const detailRequests = proposals.map(proposal =>
        fetchPropertyDetails(proposal.postId)
      );

      // 2. انتظار كل الطلبات لتنتهي معاً
      const allPropertyDetails = await Promise.all(detailRequests);

      // 3. دمج بيانات البوست (التي تحتوي الصورة) مع الـ proposal
      const mergedData = proposals.map((proposal, index) => ({
        ...proposal,
        propertyDetails: allPropertyDetails[index] // إضافة التفاصيل هنا
      }));
      // --- نهاية الجزء الجديد ---

      setSubmittedData(mergedData); // استخدام البيانات المدمجة الجديدة
      setFilteredData(mergedData); // استخدام البيانات المدمجة الجديدة

    } catch (error) {
      console.error("Error fetching data:", error);
      // كود احتياطي: إذا فشل جلب الصور، اعرض البيانات الأساسية
      if (response && response.data) {
          setSubmittedData(response.data);
          setFilteredData(response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProposals();
  }, []);

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredData(submittedData);
    } else {
      const filtered = submittedData.filter(item => 
        getNormalizedStatus(item.rentalStatus) === activeFilter.toLowerCase()
      );
      setFilteredData(filtered);
    }
  }, [activeFilter, submittedData]);

  const getNormalizedStatus = (status) => {
    if (!status || status === "Pending" || status === "pending") return "pending";
    return status.toLowerCase();
  };

  const canModifyProposal = (proposalDate) => {
    if (!proposalDate) return { canModify: true, daysRemaining: 3 };
    const proposalDateTime = new Date(proposalDate);
    const currentTime = new Date();
    const timeDifference = currentTime - proposalDateTime;
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
    const daysRemaining = Math.max(0, 3 - Math.floor(daysDifference));
    return { 
      canModify: daysDifference <= 3, 
      daysRemaining 
    };
  };

  // دالة فتح نافذة التأكيد
  const openConfirmationModal = (type, proposal) => {
    const proposalDate = proposal.proposalDate || proposal.createdDate;
    const { canModify, daysRemaining } = canModifyProposal(proposalDate);
    
    // في حالة Pending، لا نتحقق من الـ 3 أيام
    const normalizedStatus = getNormalizedStatus(proposal.rentalStatus);
    if (normalizedStatus !== "pending" && !canModify) {
      alert("Cannot modify this request after 3 days have passed");
      return;
    }

    const messages = {
      approve: {
        title: "Confirm Approval",
        message: `Are you sure you want to approve the rental application from ${proposal.tenantName || "this tenant"}?`,
        warning: normalizedStatus === "pending" 
          ? "⚠️ Once approved, you can modify the status within 3 days only"
          : `⚠️ Reminder: You can modify the application status within ${daysRemaining} day(s) only from the submission date`
      },
      reject: {
        title: "Confirm Rejection", 
        message: `Are you sure you want to reject the rental application from ${proposal.tenantName || "this tenant"}?`,
        warning: normalizedStatus === "pending"
          ? "⚠️ Once rejected, you can modify the status within 3 days only"
          : `⚠️ Reminder: You can modify the application status within ${daysRemaining} day(s) only from the submission date`
      }
    };

    setConfirmationModal({
      isOpen: true,
      type,
      proposal,
      daysRemaining,
      ...messages[type]
    });
  };

  // دالة إغلاق نافذة التأكيد
  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      type: "",
      proposal: null,
      message: "",
      daysRemaining: 0
    });
  };

  // دالة تنفيذ الموافقة بعد التأكيد
  const confirmApprove = async () => {
    const { proposal } = confirmationModal;
    
    try {
      await axios.put(
        `${API_BASE_URL}/api/Landlord/accept-waiting-proposal/${proposal.proposalId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const updatedData = submittedData.map((item) =>
        item.proposalId === proposal.proposalId
          ? { ...item, rentalStatus: "Approved" }
          : item
      );
      setSubmittedData(updatedData);
      
      // إظهار رسالة نجاح
      alert("✅ Application approved successfully!");
      
    } catch (error) {
      console.error("Error approving proposal:", error);
      alert("❌ Failed to approve application. Please try again.");
    } finally {
      closeConfirmationModal();
    }
  };

  // دالة تنفيذ الرفض بعد التأكيد
  const confirmReject = async () => {
    const { proposal } = confirmationModal;
    
    try {
      await axios.put(
        `${API_BASE_URL}/api/Landlord/reject-waiting-proposal/${proposal.proposalId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const updatedData = submittedData.map((item) =>
        item.proposalId === proposal.proposalId
          ? { ...item, rentalStatus: "Rejected" }
          : item
      );
      setSubmittedData(updatedData);
      
      // إظهار رسالة نجاح
      alert("✅ Application rejected successfully!");
      
    } catch (error) {
      console.error("Error rejecting proposal:", error);
      alert("❌ Failed to reject application. Please try again.");
    } finally {
      closeConfirmationModal();
    }
  };

  const openDocumentModal = (proposal) => {
    setSelectedProposal(proposal);
  };

  // ✨ (تعديل 3) : تبسيط الدالة لتعرض البيانات المحملة مسبقاً
  const openDetailsModal = async (proposal) => {
    // التحقق من أن التفاصيل موجودة
    if (proposal.propertyDetails) {
      setSelectedProposalDetails(proposal);
    } else {
      // كود احتياطي: إذا فشل التحميل المسبق، اجلبها الآن
      setDetailsLoading(true);
      const details = await fetchPropertyDetails(proposal.postId);
      setDetailsLoading(false);
      setSelectedProposalDetails({
        ...proposal,
        propertyDetails: details
      });
    }
  };

  const closeModal = () => {
    setSelectedProposal(null);
    setSelectedProposalDetails(null);
  };

  const getStatusClass = (status) => {
    return getNormalizedStatus(status);
  };

  const getBorderColorClass = (status) => {
    const normalized = getStatusClass(status);
    if (normalized === "approved") return "border-l-green-500";
    if (normalized === "rejected") return "border-l-red-500";
    return "border-l-yellow-500";
  };

  const getStatusBadgeClass = (status) => {
    const normalized = getStatusClass(status);
    if (normalized === "approved") return "bg-green-100 text-green-800 border border-green-200";
    if (normalized === "rejected") return "bg-red-100 text-red-800 border border-red-200";
    return "bg-yellow-100 text-yellow-800 border border-yellow-200";
  };

  const getFilterButtonClass = (filterName) => {
    return `px-4 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
      activeFilter === filterName
        ? "bg-blue-600 text-white shadow-lg"
        : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-md"
    }`;
  };

  const getActionButtonClass = (isDisabled, type) => {
    const baseClass = "flex-1 px-6 py-4 border-none font-semibold transition-all duration-300 flex items-center justify-center gap-2";
    
    if (isDisabled) {
      return `${baseClass} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }
    
    if (type === "approve") {
      return `${baseClass} bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-inner`;
    } else {
      return `${baseClass} bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-inner`;
    }
  };

  const getVisibleButtons = (status, canModify) => {
    const normalizedStatus = getNormalizedStatus(status);
    
    // في حالة Pending، الأزرار دائماً متاحة
    if (normalizedStatus === "pending") {
      return { showApprove: true, showReject: true };
    }
    
    // في حالة Approved أو Rejected، نتحقق من الـ 3 أيام
    if (!canModify) {
      return { showApprove: false, showReject: false };
    }
    
    switch (normalizedStatus) {
      case "approved":
        return { showApprove: false, showReject: true };
      case "rejected":
        return { showApprove: true, showReject: false };
      default:
        return { showApprove: true, showReject: true };
    }
  };

  // دالة جديدة لتحديد ما إذا كان يجب إظهار رسالة الأيام المتبقية
  const shouldShowDaysRemaining = (status, canModify, daysRemaining) => {
    const normalizedStatus = getNormalizedStatus(status);
    // نعرض الرسالة فقط في حالة Approved أو Rejected وفي الأيام المتبقية
    return normalizedStatus !== "pending" && canModify && daysRemaining > 0;
  };

  // دالة جديدة لتحديد ما إذا كان يجب إظهار رسالة القفل
  const shouldShowLockMessage = (status, canModify) => {
    const normalizedStatus = getNormalizedStatus(status);
    // نعرض رسالة القفل فقط في حالة Approved أو Rejected بعد انتهاء الـ 3 أيام
    return normalizedStatus !== "pending" && !canModify;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-8 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-r from-blue-200/40 to-purple-200/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-r from-green-200/40 to-cyan-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/30 mb-6 transform hover:scale-105 transition-transform duration-500">
            <FaHome className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 animate-gradient-x">
            Rental Applications
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Manage and review tenant proposals for your properties
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveFilter("all")}
            className={getFilterButtonClass("all")}
          >
            <FaFilter className="w-4 h-4" />
            All Applications
          </button>
          <button
            onClick={() => setActiveFilter("pending")}
            className={getFilterButtonClass("pending")}
          >
            <FaClock className="w-4 h-4" />
            Pending Review
          </button>
          <button
            onClick={() => setActiveFilter("approved")}
            className={getFilterButtonClass("approved")}
          >
            <FaCheck className="w-4 h-4" />
            Approved
          </button>
          <button
            onClick={() => setActiveFilter("rejected")}
            className={getFilterButtonClass("rejected")}
          >
            <FaTimes className="w-4 h-4" />
            Rejected
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl">
            <RingLoader color="#4f46e5" size={80} />
            <p className="mt-6 text-gray-600 font-medium text-lg">
              Loading applications...
            </p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredData.map((data) => {
              const normalizedStatus = getNormalizedStatus(data.rentalStatus);
              const { canModify, daysRemaining } = canModifyProposal(data.proposalDate || data.createdDate);
              const proposalDate = data.proposalDate || data.createdDate;
              const { showApprove, showReject } = getVisibleButtons(data.rentalStatus, canModify);
              const showDaysRemaining = shouldShowDaysRemaining(data.rentalStatus, canModify, daysRemaining);
              const showLockMessage = shouldShowLockMessage(data.rentalStatus, canModify);
              
              return (
                <div
                  key={data.proposalId}
                  className={`bg-white/90 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 relative border border-white/20 ${getBorderColorClass(
                    data.rentalStatus
                  )} border-l-4`}
                >
                  {/* Status Ribbon */}
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold ${getStatusBadgeClass(data.rentalStatus)} backdrop-blur-sm z-10 flex items-center gap-2`}>
                    {showLockMessage && (
                      <FaLock className="w-3 h-3" />
                    )}
                    {data.rentalStatus || "Pending Review"}
                  </div>

                  {/* Property Image Section - Using Post Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <button
                      onClick={() => openDetailsModal(data)}
                      className="absolute top-3 left-3 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-all duration-300 z-10"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    
                    {/* ✨ (تعديل 4) : تغيير مصدر الصورة ليقرأ من البيانات المدمجة */}
                    {/* عرض صورة البوست نفسه */}
                    {data.propertyDetails && data.propertyDetails.fileBase64 ? (
                      <img
                        src={`data:image/png;base64,${data.propertyDetails.fileBase64}`}
                        alt="Property"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <FaHome className="w-16 h-16 text-gray-400" />
                        <span className="text-gray-500 ml-2">No Property Image</span>
                      </div>
                    )}
                 </div>

                  {/* Tenant Info */}
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold mr-4 shadow-lg">
                        {data.tenantName
                          ? data.tenantName.charAt(0).toUpperCase()
                          : "T"}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {data.tenantName || "Anonymous Tenant"}
                        </h3>
                        <p className="flex items-center text-gray-600 text-sm">
                          <FaPhone className="w-3 h-3 mr-2" />
                          {data.phone || "No phone provided"}
                        </p>
                      </div>
                    </div>

                    {/* Rental Period */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50/50 rounded-xl p-3 text-center">
                        <FaCalendarAlt className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 mb-1">Move-in</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(data.startRentalDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-purple-50/50 rounded-xl p-3 text-center">
                        <FaCalendarAlt className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 mb-1">Move-out</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(data.endRentalDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Days Remaining Message - فقط في Approved و Rejected */}
                    {showDaysRemaining && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 text-blue-700">
                          <FaClock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {daysRemaining} day(s) remaining to modify status
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Lock Message - فقط في Approved و Rejected بعد انتهاء الـ 3 أيام */}
                    {showLockMessage && (
                      <div className="mb-4 p-3 bg-gray-100 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <FaLock className="w-4 h-4" />
                          <span className="text-sm font-medium">Cannot modify after 3 days</span>
                        </div>
                      </div>
                    )}

                    {/* Document Button */}
                    {data.fileBase64 && (
                      <button
                        onClick={() => openDocumentModal(data)}
                        className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl font-semibold transition-all duration-300 hover:from-blue-100 hover:to-indigo-100 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center"
                      >
                        <FaFileAlt className="w-4 h-4 mr-2" />
                        View Application Document
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex border-t border-gray-100/50">
                    {showApprove && (
                      <button
                        onClick={() => openConfirmationModal("approve", data)}
                        className={getActionButtonClass(false, "approve")}
                      >
                        <FaCheck className="w-4 h-4" />
                        {normalizedStatus === "approved" ? "Approved" : "Approve"}
            _         </button>
                    )}
                    {showReject && (
                      <button
                        onClick={() => openConfirmationModal("reject", data)}
                        className={getActionButtonClass(false, "reject")}
                      >
                        <FaTimes className="w-4 h-4" />
                        {normalizedStatus === "rejected" ? "Rejected" : "Reject"}
                      </button>
                    )}
                    
                    {!showApprove && !showReject && (
                      <div className="flex-1 px-6 py-4 text-center text-gray-500 text-sm">
                        No actions available
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-16 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl max-w-2xl mx-auto transform hover:scale-105 transition-transform duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FaInfoCircle className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              No Applications Found
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              {activeFilter === "all" 
                ? "You haven't received any rental applications yet." 
                : `No ${activeFilter} applications found.`}
            </p>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300"
              >
                View All Applications
              </button>
            )}
          </div>
        )}

        {/* Document Modal */}
        {selectedProposal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  Tenant Application Document
                </h2>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all duration-300"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="h-[calc(90vh-80px)]">
                {selectedProposal.fileBase64 ? (
                  <embed
                    src={`data:application/pdf;base64,${selectedProposal.fileBase64}`}
                    type="application/pdf"
                    className="w-full h-full border-none"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FaFileAlt className="w-16 h-16 mb-4 text-gray-400" />
                    <p className="text-lg">No document available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Property Details Modal */}
        {selectedProposalDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  Property Details
                </h2>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all duration-300"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RingLoader color="#4f46e5" size={40} />
                    <span className="ml-3 text-gray-600">Loading property details...</span>
                  </div>
                ) : selectedProposalDetails.propertyDetails ? (
                  <div className="space-y-6">
                    {/* Property Image */}
                    {selectedProposalDetails.propertyDetails.fileBase64 ? (
                      <div className="rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src={`data:image/png;base64,${selectedProposalDetails.propertyDetails.fileBase64}`}
                          alt="Property"
                          className="w-full h-64 object-cover"
                        />
                    t</div>
                    ) : (
                      <div className="rounded-2xl overflow-hidden shadow-lg bg-gray-100 h-64 flex items-center justify-center">
                        <FaHome className="w-16 h-16 text-gray-400" />
                        <span className="text-gray-500 ml-2">No Property Image</span>
                      </div>
                    )}

                    {/* Property Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-blue-50/50 rounded-xl">
                          <FaHome className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Title</p>
                            <p className="font-semibold text-gray-900">
                              {selectedProposalDetails.propertyDetails.title}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-green-50/50 rounded-xl">
                          <FaDollarSign className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="font-semibold text-gray-900">
                              ${selectedProposalDetails.propertyDetails.price}/month
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-purple-50/50 rounded-xl">
                          <FaMapMarkerAlt className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                _             <p className="font-semibold text-gray-900">
                              {selectedProposalDetails.propertyDetails.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-amber-50/50 rounded-xl">
                          <FaClock className="w-5 h-5 text-amber-600" />
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-semibold text-gray-900">
                              {selectedProposalDetails.propertyDetails.rentalStatus}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="p-4 bg-gray-50/50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-2">Description</p>
                      <p className="text-gray-900 leading-relaxed">
                        {selectedProposalDetails.propertyDetails.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FaInfoCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Unable to load property details</p>
                  </div>
               )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmationModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-scale-in">
              <div className={`p-6 border-b ${
                confirmationModal.type === "approve" 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    confirmationModal.type === "approve" 
                      ? "bg-green-100 text-green-600" 
                      : "bg-red-100 text-red-600"
                  }`}>
                    <FaExclamationTriangle className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {confirmationModal.title}
                  </h2>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  {confirmationModal.message}
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      {confirmationModal.warning}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={closeConfirmationModal}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmationModal.type === "approve" ? confirmApprove : confirmReject}
                    className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-all duration-300 ${
                      confirmationModal.type === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {confirmationModal.type === "approve" ? "Yes, Approve" : "Yes, Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
*           100% { transform: scale(1); opacity: 1; }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PropertyProposals;