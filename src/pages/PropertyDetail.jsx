import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/ApiConfig";
// import { submitRentalProposal } from "../services/api";
import axios from "axios";
import {
  FaHeart,
  FaRegHeart,
  FaPaperPlane,
  FaComment,
  FaMapMarkerAlt,
  FaDollarSign,
  FaUser,
  FaGavel,
  FaHome,
  FaTimes,
  FaEdit,
  FaTrash,
  FaReply,
  FaUserTie,
  FaImage,
  FaTimesCircle,
  FaChevronDown,
  FaShareAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaPhone,
  FaFileUpload,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaThumbtack,
  FaBookmark,
  FaRegBookmark,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaStar,
  FaCar,
  FaCouch,
  FaBuilding,
  FaLayerGroup,
  FaClipboardCheck,
  FaTag,
  FaCreditCard,
} from "react-icons/fa";

import "../styles/PropertyDetail.css";

const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const getUserInfoFromToken = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  if (!token || !userId) return null;
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  return {
    userId: userId,
    userName: decoded.name || decoded.sub || "User",
    role:
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      localStorage.getItem("role"),
  };
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const userInfo = getUserInfoFromToken();
  return {
    Authorization: `Bearer ${token}`,
    "User-Name": userInfo?.userName || "User",
    "User-Id": userInfo?.userId || "",
    "User-Role": userInfo?.role || "user",
    "Content-Type": "application/json",
  };
};

const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// --- دالة تسجيل الهيستوري (بدون تغيير) ---
const API_HISTORY_URL = "http://localhost:5000/api/history";
const recordHistoryEvent = async (userId, activityType, details) => {
  if (!userId || !activityType || !details) {
    return;
  }
  try {
    await axios.post(
      `${API_HISTORY_URL}/${userId}`,
      { activity_type: activityType, details: details },
      { headers: getAuthHeaders() },
    );
  } catch (error) {
    console.error(
      `Failed to record history event (${activityType}):`,
      error.response?.data || error.message,
    );
  }
};

// --- مكون الردود (تصميم جديد) ---
const InlineReplyBox = ({
  postId,
  parentId,
  onSuccess,
  onCancel,
  postTitle,
  postPrice,
  postLocation,
}) => {
  const [replyText, setReplyText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const userInfo = getUserInfoFromToken();

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (
      !file ||
      !file.type.startsWith("image/") ||
      file.size > 5 * 1024 * 1024
    ) {
      alert("Please select an image file smaller than 5MB.");
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && !selectedImage) return;
    if (!userInfo?.userId) {
      alert("You must be logged in to reply.");
      return;
    }
    setIsSubmitting(true);
    try {
      const commentData = {
        comment_description: replyText.trim(),
        parent_id: parentId,
        client_time: new Date().toISOString(),
      };
      if (selectedImage) {
        commentData.image_data = await convertImageToBase64(selectedImage);
      }
      const response = await axios.post(
        `http://localhost:5000/api/comments/${userInfo.userId}/add-comment/${postId}`,
        commentData,
        { headers: getAuthHeaders() },
      );
      if (response.data?._id) {
        await recordHistoryEvent(userInfo.userId, "comment", {
          post_id: postId,
          post_title: postTitle || "N/A",
          post_price: postPrice || null,
          post_location: postLocation || null,
          comment_id: response.data._id,
          is_reply: true,
          comment_preview: replyText.trim(),
          has_image: !!selectedImage,
        });
      }
      onSuccess(response.data);
    } catch (error) {
      alert("Failed to post reply.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm"
    >
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write your reply..."
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 bg-white"
        rows="3"
        autoFocus
      />
      <div className="flex items-center justify-between mt-4">
        <div>
          {!imagePreview ? (
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors duration-200 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300">
              <FaImage className="text-indigo-500" />
              Add Image
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 rounded-lg shadow-sm border border-gray-200"
              />
              <button
                type="button"
                onClick={removeSelectedImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg"
              >
                <FaTimesCircle className="text-xs" />
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!replyText.trim() && !selectedImage)}
            className="px-5 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 font-medium shadow-sm"
          >
            {isSubmitting ? "Replying..." : "Reply"}
          </button>
        </div>
      </div>
    </form>
  );
};

// --- المكون الرئيسي ---
const PropertyDetail = () => {
  // ... (جميع State variables بدون تغيير) ...
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    startRentalDate: "",
    endRentalDate: "",
    file: null,
    offeredPrice: "",
    isInstallment: 0,
  });
  const [showEligibility, setShowEligibility] = useState(false);
  const [eligibilityData, setEligibilityData] = useState({
    monthlyIncome: "",
    monthlyExpenses: "",
    existingMonthlyDebt: "",
    hasStableJob: false,
    dependents: 0,
  });
  const [error, setError] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [replyingToId, setReplyingToId] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [openReplies, setOpenReplies] = useState({});
  const fileInputRef = useRef(null);
  const [viewCount, setViewCount] = useState(0);
  const [likeStatus, setLikeStatus] = useState({
    likes_count: 0,
    user_has_liked: false,
  });
  const viewRecordedRef = useRef(false);

  const userInfo = getUserInfoFromToken();
  const { userId, userName } = userInfo || {};
  const tenantId = localStorage.getItem("userId");
  const tenantRole = localStorage.getItem("role");
  const isAdmin = tenantRole === "admin";
  const isLandlord = tenantRole === "landlord";
  const isTenant = tenantRole === "tenant";

  // --- (جميع الدوال والـ useEffects بدون تغيير) ---
  const calculateTotalComments = (commentList) => {
    let count = 0;
    if (commentList && commentList.length > 0) {
      commentList.forEach((comment) => {
        count++;
        if (comment.replies && comment.replies.length > 0) {
          count += calculateTotalComments(comment.replies);
        }
      });
    }
    return count;
  };

  const sortComments = (commentsToSort, postOwnerId, currentUserId) => {
    if (!commentsToSort || commentsToSort.length === 0) {
      return [];
    }
    const postOwnerIdStr = String(postOwnerId);
    const currentUserIdStr = String(currentUserId);

    const sortedListWithReplies = commentsToSort.map((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        const sortedReplies = [...comment.replies].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        );
        return { ...comment, replies: sortedReplies };
      }
      return comment;
    });

    return sortedListWithReplies.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      const aIsOwner = String(a.user_id) === postOwnerIdStr;
      const bIsOwner = String(b.user_id) === postOwnerIdStr;
      if (aIsOwner !== bIsOwner) return aIsOwner ? -1 : 1;
      const aIsCurrentUser = String(a.user_id) === currentUserIdStr;
      const bIsCurrentUser = String(b.user_id) === currentUserIdStr;
      if (aIsCurrentUser !== bIsCurrentUser) return aIsCurrentUser ? -1 : 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  const loadComments = useCallback(async () => {
    if (!post || !post.userId) return;
    try {
      setLoadingAction("loading-comments");
      const res = await axios.get(
        `http://localhost:5000/api/comments/post/${postId}`,
        { headers: getAuthHeaders() },
      );
      const fetchedComments = res.data || [];
      const sorted = sortComments(fetchedComments, post.userId, userId);
      setComments(sorted);
    } catch (err) {
      setComments([]);
    } finally {
      setLoadingAction(null);
    }
  }, [postId, post, userId]);

  useEffect(() => {
    let isMounted = true;
    const fetchPostData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/Landlord/get-post/${postId}`,
        );
        if (isMounted) {
          setPost(res.data);
          if (userId && !viewRecordedRef.current && res.data?.title) {
            recordHistoryEvent(userId, "view", {
              post_id: postId,
              post_title: res.data.title,
              post_image:
                res.data.fileBase64 ||
                (res.data.fileBase64s && res.data.fileBase64s.length > 0
                  ? res.data.fileBase64s[0]
                  : null),
              post_price: res.data.price,
              post_location: res.data.location,
            });
            viewRecordedRef.current = true;
          }
        }
      } catch (err) {
        if (isMounted) setPageError("Failed to load post details.");
      }
    };
    const fetchInteractions = async () => {
      try {
        const viewRes = await axios.get(
          `http://localhost:5000/api/posts/${postId}/views`,
        );
        if (isMounted) setViewCount(viewRes.data.unique_views);
      } catch (viewErr) {
        console.error("Failed to fetch view count:", viewErr);
      }
      try {
        const likeRes = await axios.get(
          `http://localhost:5000/api/posts/${postId}/like-status`,
          { headers: getAuthHeaders() },
        );
        if (isMounted) setLikeStatus(likeRes.data);
      } catch (likeErr) {
        console.error("Failed to fetch like status:", likeErr);
      }
    };

    if (postId) {
      fetchPostData();
      fetchInteractions();
    }
    return () => {
      isMounted = false;
    };
  }, [postId, userId]);

  useEffect(() => {
    if (post && postId) {
      loadComments();
    }
  }, [post, postId, loadComments]);

  useEffect(() => {
    setCommentCount(calculateTotalComments(comments));
  }, [comments]);

  useEffect(() => {
    if (!postId || !userId) return;
    const recordViewCount = async () => {
      try {
        const headers = getAuthHeaders();
        if (!headers["User-Id"]) {
          return;
        }
        await axios.post(
          `http://localhost:5000/api/posts/${postId}/view`,
          {},
          { headers: headers },
        );
      } catch (err) {
        console.error("Failed to record view count:", err);
      }
    };
    const timer = setTimeout(recordViewCount, 1500);
    return () => clearTimeout(timer);
  }, [postId, userId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentTenantId = localStorage.getItem("userId");
    if (!token || !currentTenantId || !postId) return;
    const checkSaved = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/Tenant/My-saved-posts/${currentTenantId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const savedIds = (res.data || []).map((p) => String(p.postId));
        setSaved(savedIds.includes(String(postId)));
      } catch (err) {
        /* ignore */
      }
    };
    checkSaved();
  }, [postId]);

  const fetchCommentsModal = () => {
    if (!comments || comments.length === 0) {
      loadComments();
    }
    setShowComments(true);
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (
      !file ||
      !file.type.startsWith("image/") ||
      file.size > 5 * 1024 * 1024
    ) {
      alert("Please select an image file smaller than 5MB.");
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
    setError(null);
  };
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!userId || !post) {
      return;
    }
    if (!newComment.trim() && !selectedImage) {
      alert("Please enter a comment or select an image");
      return;
    }
    try {
      setIsUploading(true);
      setLoadingAction("submitting-comment");
      const commentData = {
        comment_description: newComment.trim(),
        parent_id: replyingToId,
        client_time: new Date().toISOString(),
      };
      if (selectedImage) {
        commentData.image_data = await convertImageToBase64(selectedImage);
      }
      const response = await axios.post(
        `http://localhost:5000/api/comments/${userId}/add-comment/${postId}`,
        commentData,
        { headers: getAuthHeaders() },
      );

      await recordHistoryEvent(userId, "comment", {
        post_id: postId,
        post_title: post.title || "N/A",
        post_price: post.price,
        post_location: post.location,
        comment_id: response.data?._id,
        is_reply: !!replyingToId,
        comment_preview: newComment.trim(),
        has_image: !!selectedImage,
      });

      if (replyingToId) {
        addReplyToState(replyingToId, response.data);
      } else {
        setComments((prev) =>
          sortComments([response.data, ...prev], post.userId, userId),
        );
      }

      setNewComment("");
      setReplyingToId(null);
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError("Failed to post comment");
    } finally {
      setIsUploading(false);
      setLoadingAction(null);
    }
  };

  // --- (جميع الدوال الأخرى بدون تغيير) ---
  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "auto";
  };
  const goToPrevImage = (e) => {
    e.stopPropagation();
    const images =
      post.fileBase64s ||
      post.images ||
      (post.fileBase64 ? [post.fileBase64] : post.image ? [post.image] : []);
    if (images && images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1,
      );
    }
  };
  const goToNextImage = (e) => {
    e.stopPropagation();
    const images =
      post.fileBase64s ||
      post.images ||
      (post.fileBase64 ? [post.fileBase64] : post.image ? [post.image] : []);
    if (images && images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1,
      );
    }
  };
  const handleMessageClick = () => {
    if (!localStorage.getItem("token")) {
      alert("You need to login to send a message");
      navigate("/login");
      return;
    } else {
      navigate(`/messages/${post?.userId}`, {
        state: { receiverId: post?.userId, receiverName: post?.userName },
      });
    }
  };
  const handleApplyClick = () => {
    try {
      if (!tenantRole) {
        alert("You must be logged in");
        navigate("/login");
        return;
      }
      setShowForm(true);
      setError(null);
    } catch (err) {
      console.error("Error in handleApplyClick:", err);
    }
  };
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    setError(null);
  };
  const handleEligibilityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEligibilityData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "dependents"
            ? parseInt(value) || 0
            : value,
    }));
  };
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setError(null);

    if (!post) {
      setError("Post data not loaded yet.");
      return;
    }

    if (!tenantId) {
      setError("User ID not found.");
      return;
    }

    if (!formData.phone) {
      setError("Phone number is required.");
      return;
    }

    // Only validate rental dates if rentType is 0 (rent)
    if (post.rentType === 0) {
      if (!formData.startRentalDate) {
        setError("Start rental date is required.");
        return;
      }

      if (!formData.endRentalDate) {
        setError("End rental date is required.");
        return;
      }
    }

    if (!formData.file) {
      setError("Document upload is required.");
      return;
    }
    if (post.isAuction == 1) {
      if (!formData.offeredPrice || parseFloat(formData.offeredPrice) <= 0) {
        setError("Offered price must be greater than zero.");
        return;
      }
    }

    // Check if eligibility is required
    const isEligibilityRequired =
      post.rentType === 0 || // Rent
      (post.rentType === 1 && parseInt(formData.isInstallment) === 1); // Sale with installment

    if (isEligibilityRequired) {
      // Validate eligibility fields
      if (
        !eligibilityData.monthlyIncome ||
        parseFloat(eligibilityData.monthlyIncome) <= 0
      ) {
        setError("Monthly income is required and must be greater than 0.");
        return;
      }
      if (
        !eligibilityData.monthlyExpenses ||
        parseFloat(eligibilityData.monthlyExpenses) < 0
      ) {
        setError("Monthly expenses is required and must be 0 or greater.");
        return;
      }
      if (
        !eligibilityData.existingMonthlyDebt ||
        parseFloat(eligibilityData.existingMonthlyDebt) < 0
      ) {
        setError("Existing monthly debt is required and must be 0 or greater.");
        return;
      }
      if (eligibilityData.dependents < 0 || eligibilityData.dependents > 50) {
        setError("Number of dependents must be between 0 and 50.");
        return;
      }
    }

    try {
      // إنشاء FormData
      const data = new FormData();
      data.append("Phone", formData.phone);

      // Only add rental dates if rentType is 0 (rent)
      if (post.rentType === 0) {
        const startISO = new Date(formData.startRentalDate).toISOString();
        const endISO = new Date(formData.endRentalDate).toISOString();

        data.append("StartRentalDate", startISO);
        data.append("EndRentalDate", endISO);
      }
      data.append("File", formData.file);

      if (post.isAuction == 1) {
        data.append("Offeredprice", parseFloat(formData.offeredPrice));
      }
      data.append("IsInstallment", parseInt(formData.isInstallment));

      // Define isEligibilityRequired BEFORE the try block
      const isEligibilityRequired =
        post.rentType === 0 ||
        (post.rentType === 1 && parseInt(formData.isInstallment) === 1);

      if (isEligibilityRequired) {
        const eligibilityObject = {
          MonthlyIncome: parseFloat(eligibilityData.monthlyIncome) || 0,
          MonthlyExpenses: parseFloat(eligibilityData.monthlyExpenses) || 0,
          ExistingMonthlyDebt:
            parseFloat(eligibilityData.existingMonthlyDebt) || 0,
          HasStableJob: Boolean(eligibilityData.hasStableJob),
          Dependents: parseInt(eligibilityData.dependents) || 0,
          ExtraAnswers: null,
        };

        const eligibilityJson = JSON.stringify(eligibilityObject);

        data.append("EligibilityAnswersJson", eligibilityJson);

        console.log("✅ EligibilityAnswersJson appended to FormData");
      } else {
        console.log("⚠️ Eligibility NOT required - skipping");
      }

      // const apiUrl = `${API_BASE_URL}/api/Tenant/submit-proposal/${postId}`;
      const apiUrl = `${API_BASE_URL}/api/Tenant/submit-proposal/${postId}/${tenantId}`;
      const token = localStorage.getItem("token");

      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      };

      // استدعاء الـ API
      const response = await axios.post(apiUrl, data, { headers });

      alert("Application submitted successfully!");

      await recordHistoryEvent(userId, "apply", {
        post_id: postId,
        post_title: post.title || "N/A",
        post_price: post.price,
        post_location: post.location,
        post_image:
          post.fileBase64 ||
          (post.fileBase64s && post.fileBase64s.length > 0
            ? post.fileBase64s[0]
            : null),
      });

      setShowForm(false);
      setFormData({
        phone: "",
        startRentalDate: "",
        endRentalDate: "",
        file: null,
        offeredPrice: "",
      });

      setEligibilityData({
        monthlyIncome: "",
        monthlyExpenses: "",
        existingMonthlyDebt: "",
        hasStableJob: false,
        dependents: 0,
      });
    } catch (err) {
      if (err.response?.data?.errors) {
        console.error("Validation errors:", err.response.data.errors);
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .join("\n");

        setError(errorMessages || "Validation failed.");
      } else {
        const errorMsg =
          err.response?.data?.title ||
          err.response?.data?.message ||
          err.response?.data ||
          "Failed to submit.";

        setError(errorMsg);
      }
    }
  };
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const currentTenantId = localStorage.getItem("userId");
    if (!token || !currentTenantId || !post) {
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const saveUrl = `${API_BASE_URL}/api/Tenant/${currentTenantId}/save-post/${postId}`;
    const cancelSaveUrl = `${API_BASE_URL}/api/Tenant/${currentTenantId}/cancel-save/${postId}`;
    const wasSaved = saved;
    if (wasSaved) {
      setSaved(false);
      try {
        await axios.delete(cancelSaveUrl, { headers: headers });
      } catch (error) {
        setSaved(true);
      }
    } else {
      setSaved(true);
      try {
        await axios.post(saveUrl, {}, { headers: headers });
        const imageToSend =
          post.fileBase64 ||
          (post.fileBase64s && post.fileBase64s.length > 0
            ? post.fileBase64s[0]
            : null);
        await recordHistoryEvent(userId, "save", {
          post_id: postId,
          post_title: post.title || "N/A",
          post_image: imageToSend,
          post_price: post.price,
          post_location: post.location,
        });
      } catch (error) {
        setSaved(false);
      }
    }
  };
  const toggleReplies = (commentId) => {
    setOpenReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };
  const updateCommentInState = (updatedComment) => {
    const updateRecursively = (list) =>
      list.map((c) => {
        if (c._id === updatedComment._id)
          return { ...c, ...updatedComment, replies: c.replies };
        if (c.replies) return { ...c, replies: updateRecursively(c.replies) };
        return c;
      });
    setComments((prev) => updateRecursively(prev));
  };
  const addReplyToState = (parentId, newReply) => {
    const addReplyRecursively = (list) =>
      list.map((c) => {
        if (c._id === parentId) {
          const updatedReplies = [...(c.replies || []), newReply];
          return { ...c, replies: updatedReplies };
        }
        if (c.replies) return { ...c, replies: addReplyRecursively(c.replies) };
        return c;
      });
    setComments((prev) => addReplyRecursively(prev));
    setOpenReplies((prev) => ({ ...prev, [parentId]: true }));
  };
  const handleEditComment = async (commentId, updatePayload) => {
    try {
      setLoadingAction(`editing-${commentId}`);
      const finalPayload = {
        ...updatePayload,
        client_time: new Date().toISOString(),
      };
      const response = await axios.put(
        `http://localhost:5000/api/comments/${commentId}`,
        finalPayload,
        { headers: getAuthHeaders() },
      );
      updateCommentInState(response.data);
      setEditingComment(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update comment");
    } finally {
      setLoadingAction(null);
    }
  };
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    try {
      setLoadingAction(`deleting-${commentId}`);
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
        headers: getAuthHeaders(),
      });
      const deleteRecursively = (list, idToDelete) =>
        list
          .filter((c) => c._id !== idToDelete)
          .map((c) => {
            if (c.replies)
              return {
                ...c,
                replies: deleteRecursively(c.replies, idToDelete),
              };
            return c;
          });
      setComments((prev) => deleteRecursively(prev, commentId));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete comment");
    } finally {
      setLoadingAction(null);
    }
  };
  const handleLikeComment = async (commentId) => {
    if (!userId) {
      alert("You must be logged in to like a comment.");
      navigate("/login");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:5000/api/comments/${commentId}/like`,
        {},
        { headers: getAuthHeaders() },
      );
      updateCommentInState(response.data.comment);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update like.");
    }
  };
  const handlePinComment = async (commentId) => {
    if (!post || !post.userId) {
      alert("Post data not loaded.");
      return;
    }
    try {
      setLoadingAction(`pinning-${commentId}`);
      await axios.post(
        `http://localhost:5000/api/comments/${commentId}/pin`,
        {},
        { headers: getAuthHeaders() },
      );
      await loadComments();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update pin status.");
    } finally {
      setLoadingAction(null);
    }
  };
  const formatLocalDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };
  const toPlainText = (v) => (Array.isArray(v) ? v.join(" ") : (v ?? ""));
  const handleLikePost = async (e) => {
    e.stopPropagation();
    if (!userId || !post) {
      return;
    }
    const originalLikeStatus = { ...likeStatus };

    const wasLikedInitially = originalLikeStatus.user_has_liked;
    const newLikesCountOptimistic = wasLikedInitially
      ? (likeStatus.likes_count || 1) - 1
      : (likeStatus.likes_count || 0) + 1;
    setLikeStatus((prev) => ({
      ...prev,
      likes_count: newLikesCountOptimistic < 0 ? 0 : newLikesCountOptimistic,
      user_has_liked: !wasLikedInitially,
    }));

    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        { headers: getAuthHeaders() },
      );
      const newLikeStatus = response.data;

      setLikeStatus({
        likes_count: newLikeStatus.likes_count,
        user_has_liked: newLikeStatus.user_has_liked,
      });

      if (newLikeStatus.user_has_liked && !originalLikeStatus.user_has_liked) {
        await recordHistoryEvent(userId, "like", {
          post_id: postId,
          post_title: post.title || "N/A",
          post_image:
            post.fileBase64 ||
            (post.fileBase64s && post.fileBase64s.length > 0
              ? post.fileBase64s[0]
              : null),
          post_price: post.price,
          post_location: post.location,
        });
      }
    } catch (err) {
      alert("Failed to like post.");
      setLikeStatus(originalLikeStatus);
    }
  };
  const handleSharePost = async (e) => {
    e.stopPropagation();
    const postUrl = window.location.href;
    const shareData = {
      title: post?.title || "",
      text: `Check out this property: ${post?.title || ""}`,
      url: postUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        alert("Link copied to clipboard!");
      } catch (err) {
        alert("Could not copy link.");
      }
    }
  };

  // --- CommentItem Component (تصميم جديد) ---
  function CommentItem({ comment, depth = 0 }) {
    const isOwner = String(comment.user_id) === String(userId);
    const isPostOwnerComment =
      post && String(post.userId) === String(comment.user_id);
    const isCurrentUserPostOwner =
      post && String(post.userId) === String(userId);
    const isEditing = editingComment?._id === comment._id;
    const isReplying = replyingToId === comment._id;
    const isProcessing =
      loadingAction === `editing-${comment._id}` ||
      loadingAction === `deleting-${comment._id}` ||
      loadingAction === `pinning-${comment._id}`;
    const isOpen = !!openReplies[comment._id];
    const [editText, setEditText] = useState(
      toPlainText(comment.comment_description),
    );
    const originalImageUrl = comment.image_data;
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(originalImageUrl);
    const editFileInputRef = useRef(null);
    const hasUserLiked = comment.likes?.includes(userId);

    useEffect(() => {
      if (isEditing) {
        setEditText(toPlainText(comment.comment_description));
        setEditImagePreview(originalImageUrl);
        setEditImageFile(null);
      }
    }, [isEditing, comment.comment_description, originalImageUrl]);
    const handleEditImageSelect = (event) => {
      const file = event.target.files[0];
      if (
        !file ||
        !file.type.startsWith("image/") ||
        file.size > 5 * 1024 * 1024
      ) {
        alert("Please select an image file smaller than 5MB.");
        return;
      }
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setEditImagePreview(e.target.result);
      reader.readAsDataURL(file);
    };
    const removeEditImage = () => {
      setEditImageFile(null);
      setEditImagePreview(null);
    };
    const handleSaveEdit = async () => {
      if (!editText.trim() && !editImagePreview) {
        alert("Comment cannot be empty.");
        return;
      }
      const updatePayload = { comment_description: editText.trim() };
      if (editImageFile) {
        updatePayload.image_data = await convertImageToBase64(editImageFile);
      } else if (editImagePreview === null && originalImageUrl !== null) {
        updatePayload.image_data = null;
      }
      handleEditComment(comment._id, updatePayload);
    };
    const handleCancelEdit = () => {
      setEditingComment(null);
    };
    const handleReplyClick = () => {
      setReplyingToId((currentId) =>
        currentId === comment._id ? null : comment._id,
      );
      setEditingComment(null);
    };
    const handleEditClick = () => {
      setEditingComment(comment);
      setReplyingToId(null);
    };

    return (
      <div
        className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-md ${
          comment.is_pinned
            ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-sm"
            : "bg-white/80 backdrop-blur-sm border-gray-100"
        } ${depth > 0 ? "ml-8 mt-4" : ""}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              <FaUser className="text-xs" />
            </div>
            <div>
              <span className="flex items-center gap-2 font-semibold text-gray-800">
                {comment.user_name || "Anonymous"}
              </span>
              <div className="flex items-center gap-2 mt-1">
                {isOwner && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">
                    You
                  </span>
                )}
                {isPostOwnerComment && (
                  <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                    <FaUserTie className="text-xs" /> Owner
                  </span>
                )}
                {comment.is_pinned && (
                  <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                    <FaThumbtack className="text-xs" /> Pinned
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
            {formatLocalDate(comment.created_at)}
            {comment.is_edited && " (edited)"}
          </span>
        </div>

        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
              rows="3"
              autoFocus
            />
            <div className="mt-3 space-y-2">
              {editImagePreview && (
                <div className="relative inline-block">
                  <img
                    src={editImagePreview}
                    alt="Edit preview"
                    className="h-24 rounded-xl border-2 border-gray-200 cursor-pointer transition-all duration-200 hover:border-indigo-300"
                    onClick={() => window.open(editImagePreview, "_blank")}
                  />
                  <button
                    type="button"
                    onClick={removeEditImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                    title="Remove image"
                  >
                    <FaTimesCircle className="text-sm" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-indigo-600 cursor-pointer hover:text-indigo-700 transition-colors duration-200 w-fit px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-300">
                <FaImage />
                {originalImageUrl || editImagePreview
                  ? "Change Image"
                  : "Add Image"}
                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={handleEditImageSelect}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveEdit}
                disabled={loadingAction === `editing-${comment._id}`}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-sm"
              >
                {loadingAction === `editing-${comment._id}`
                  ? "Saving..."
                  : "Save"}
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl text-sm hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            {comment.comment_description && (
              <p className="text-gray-700 leading-relaxed">
                {toPlainText(comment.comment_description)}
              </p>
            )}
            {originalImageUrl && (
              <div className="mt-3">
                <img
                  src={originalImageUrl}
                  alt="Comment attachment"
                  className="max-w-full h-auto max-h-64 rounded-xl border-2 border-gray-200 cursor-pointer transition-all duration-200 hover:border-indigo-300"
                  onClick={() => window.open(originalImageUrl, "_blank")}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
          <button
            onClick={() => handleLikeComment(comment._id)}
            className={`flex items-center gap-1.5 transition-colors duration-200 px-3 py-2 rounded-lg ${
              hasUserLiked
                ? "text-red-500 bg-red-50 hover:bg-red-100"
                : "hover:text-red-500 hover:bg-gray-50"
            }`}
          >
            {hasUserLiked ? <FaHeart /> : <FaRegHeart />}
            <span className="font-medium">
              {comment.likes_count > 0 ? comment.likes_count : ""}
            </span>
          </button>
          <button
            onClick={handleReplyClick}
            className="flex items-center gap-1 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors duration-200"
          >
            <FaReply /> Reply
          </button>
          {comment.replies?.length > 0 && (
            <button
              onClick={() => toggleReplies(comment._id)}
              className="flex items-center gap-1 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors duration-200"
            >
              <FaChevronDown
                className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
              {isOpen ? "Hide" : "Show"} replies
              <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">
                {comment.replies.length}
              </span>
            </button>
          )}
          {isOwner && !isEditing && (
            <>
              <button
                onClick={handleEditClick}
                className="flex items-center gap-1 hover:text-yellow-600 hover:bg-yellow-50 px-3 py-2 rounded-lg transition-colors duration-200"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => handleDeleteComment(comment._id)}
                disabled={isProcessing}
                className="flex items-center gap-1 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {loadingAction === `deleting-${comment._id}` ? (
                  <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaTrash />
                )}
                Delete
              </button>
            </>
          )}
          {isCurrentUserPostOwner && !isEditing && (
            <button
              onClick={() => handlePinComment(comment._id)}
              disabled={isProcessing}
              className={`flex items-center gap-1 transition-colors duration-200 px-3 py-2 rounded-lg disabled:opacity-50 ${
                comment.is_pinned
                  ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                  : "hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              {loadingAction === `pinning-${comment._id}` ? (
                <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaThumbtack />
              )}
              {comment.is_pinned ? "Unpin" : "Pin"}
            </button>
          )}
        </div>

        {isReplying && (
          <InlineReplyBox
            postId={postId}
            parentId={comment._id}
            postTitle={post?.title}
            postPrice={post?.price}
            postLocation={post?.location}
            onSuccess={(newReply) => {
              addReplyToState(comment._id, newReply);
              setReplyingToId(null);
            }}
            onCancel={() => setReplyingToId(null)}
          />
        )}

        {isOpen && comment.replies && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- JSX Rendering (تصميم جديد كلياً) ---
  if (pageError)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center border border-gray-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTimes className="text-3xl text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error Loading Property
          </h2>
          <p className="text-gray-600 mb-6">{pageError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  if (!post)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-medium">
            Loading property details...
          </p>
        </div>
      </div>
    );

  const hasUserLikedPost = likeStatus.user_has_liked;

  return (
    <div className="property-detail-page">
      {/* Page Title */}
      <div className="property-page-header">
        <div className="property-page-header-content">
          <h1 className="property-page-title">Property Details</h1>
          <p className="property-page-subtitle">
            Discover your perfect home with detailed information and stunning
            visuals
          </p>
        </div>
      </div>

      {/* Main Property Card */}
      <div className="property-main-container">
        <div className="property-main-card">
          {/* Left Side - Image Gallery */}
          <div className="property-image-section">
            {/* Status Badge for Mobile */}
            <div className="property-status-wrapper">
              {(() => {
                let statusClass = "status-available";
                let statusText = "Available";

                if (post.rentalStatus === -1) {
                  statusClass = "status-rented";
                  statusText = post.rentType === 1 ? "Sold" : "Rented";
                } else if (post.rentalStatus === 0) {
                  statusClass = "status-available";
                  statusText =
                    post.rentType === 1
                      ? "Available for Sale"
                      : "Available for Rent";
                } else if (post.rentalStatus === 1) {
                  statusClass = "status-negotiation";
                  statusText = "Under Negotiation";
                }

                return (
                  <div className={`property-status-badge ${statusClass}`}>
                    <div className="property-status-indicator"></div>
                    {statusText}
                  </div>
                );
              })()}
            </div>

            <div
              className="property-main-image"
              onClick={() => openLightbox(currentImageIndex)}
            >
              {(() => {
                // Handle images exactly like in Home.jsx
                const images =
                  post.fileBase64s ||
                  post.images ||
                  (post.fileBase64
                    ? [post.fileBase64]
                    : post.image
                      ? [post.image]
                      : []);
                const hasImages = images && images.length > 0;

                if (hasImages) {
                  const currentImage = images[currentImageIndex];
                  let imageSrc;

                  // Handle different image formats like in Home.jsx
                  if (currentImage.startsWith("http")) {
                    imageSrc = currentImage;
                  } else if (currentImage.startsWith("data:")) {
                    imageSrc = currentImage;
                  } else {
                    // If it's a path or base64 without data prefix
                    imageSrc = currentImage.includes("/")
                      ? `${API_BASE_URL}/${currentImage}`
                      : `data:image/png;base64,${currentImage}`;
                  }

                  return (
                    <>
                      <img
                        src={imageSrc}
                        alt={`${post.title} - Image ${currentImageIndex + 1}`}
                        onError={(e) => {
                          // Try different fallback approaches
                          if (!e.target.dataset.retried) {
                            e.target.dataset.retried = "true";
                            if (currentImage.includes("/")) {
                              // Try as direct API path
                              e.target.src = `${API_BASE_URL}/${currentImage}`;
                            } else {
                              // Try as base64 with different prefix
                              e.target.src = `data:image/jpeg;base64,${currentImage}`;
                            }
                          } else {
                            // Final fallback
                            e.target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                          }
                        }}
                      />
                      <div className="property-image-overlay"></div>
                      <div className="property-image-counter">
                        <FaImage className="mr-2" />
                        {currentImageIndex + 1} / {images.length}
                      </div>

                      {/* Navigation arrows for multiple images */}
                      {images.length > 1 && (
                        <>
                          <button
                            className="property-image-nav property-image-nav-prev"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex((prev) =>
                                prev === 0 ? images.length - 1 : prev - 1,
                              );
                            }}
                          >
                            <FaChevronLeft />
                          </button>
                          <button
                            className="property-image-nav property-image-nav-next"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex((prev) =>
                                prev === images.length - 1 ? 0 : prev + 1,
                              );
                            }}
                          >
                            <FaChevronRight />
                          </button>
                        </>
                      )}
                    </>
                  );
                } else {
                  return (
                    <div className="property-image-empty">
                      <FaHome className="property-image-empty-icon" />
                      <p className="property-image-empty-text">
                        No images available
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Debug: Check console for available image fields
                      </p>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Thumbnails */}
            {(() => {
              const images =
                post.fileBase64s ||
                post.images ||
                (post.fileBase64
                  ? [post.fileBase64]
                  : post.image
                    ? [post.image]
                    : []);
              return (
                images &&
                images.length > 1 && (
                  <div className="property-thumbnails">
                    {images.map((img, index) => {
                      let imageSrc;

                      // Handle different image formats like in Home.jsx
                      if (img.startsWith("http")) {
                        imageSrc = img;
                      } else if (img.startsWith("data:")) {
                        imageSrc = img;
                      } else {
                        // If it's a path or base64 without data prefix
                        imageSrc = img.includes("/")
                          ? `${API_BASE_URL}/${img}`
                          : `data:image/png;base64,${img}`;
                      }

                      return (
                        <div
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`property-thumbnail ${index === currentImageIndex ? "active" : ""}`}
                        >
                          <img
                            src={imageSrc}
                            alt={`${post.title} - Thumbnail ${index + 1}`}
                            onError={(e) => {
                              e.target.src = "/placeholder.jpg";
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )
              );
            })()}
          </div>

          {/* Right Side - Property Information */}
          <div className="property-info-section">
            {/* Property Header */}
            <div className="property-header">
              <h1 className="property-title">{post.title}</h1>
              <div className="property-location">
                <FaMapMarkerAlt className="property-location-icon" />
                <span>{post.location}</span>
                {post.locationPath && (
                  <a
                    href={post.locationPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-indigo-600 hover:text-indigo-800 underline text-sm font-medium"
                  >
                    View on Map
                  </a>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="property-price-section">
              <div
                className="property-price-label"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#555",
                  marginBottom: "0.5rem",
                }}
              >
                {post.isAuction == 1 ? "Start with: " : "Final Price: "}
              </div>
              <div className="property-price">
                ${post.price?.toLocaleString()}
                <span className="property-price-period">/month</span>
              </div>
            </div>

            {/* Property Features */}
            <div
              className="property-features"
              style={{ flexWrap: "wrap", gap: "1rem" }}
            >
              <div className="property-feature">
                <div className="property-feature-icon">
                  <FaBed />
                </div>
                <div className="property-feature-content">
                  <span className="property-feature-value">
                    {post.numOfRooms || 0}
                  </span>
                  <span className="property-feature-label">Bedrooms</span>
                </div>
              </div>
              <div className="property-feature">
                <div className="property-feature-icon">
                  <FaBath />
                </div>
                <div className="property-feature-content">
                  <span className="property-feature-value">
                    {post.numOfBathrooms || 0}
                  </span>
                  <span className="property-feature-label">Bathrooms</span>
                </div>
              </div>
              <div className="property-feature">
                <div className="property-feature-icon">
                  <FaRulerCombined />
                </div>
                <div className="property-feature-content">
                  <span className="property-feature-value">
                    {post.area || 0}
                  </span>
                  <span className="property-feature-label">sq ft</span>
                </div>
              </div>
              <div className="property-feature">
                <div className="property-feature-icon">
                  <FaLayerGroup />
                </div>
                <div className="property-feature-content">
                  <span className="property-feature-value">
                    {post.floorNumber || 0}
                  </span>
                  <span className="property-feature-label">Floor</span>
                </div>
              </div>
              <div className="property-feature">
                <div className="property-feature-icon">
                  <FaBuilding />
                </div>
                <div className="property-feature-content">
                  <span className="property-feature-value">
                    {post.totalUnitsInBuilding || 0}
                  </span>
                  <span className="property-feature-label">
                    Units in the Building
                  </span>
                </div>
              </div>
            </div>

            {/* Property Description */}
            <div className="property-description">
              <h3 className="property-description-title">
                <FaHome className="mr-2" />
                Description
              </h3>
              <div className="property-description-content">
                {post.description ? (
                  post.description
                    .split("\n")
                    .map((paragraph, index) => <p key={index}>{paragraph}</p>)
                ) : (
                  <p className="property-description-empty">
                    No description available for this property.
                  </p>
                )}
              </div>
            </div>

            {/* Owner Information */}
            <div className="property-owner">
              <div className="property-owner-avatar">
                <FaUser />
              </div>
              <div className="property-owner-info">
                <div className="property-owner-name">{post.userName}</div>
                <div className="property-owner-label">Property Owner</div>
                <div className="property-owner-date">
                  <FaCalendarAlt className="mr-2" />
                  Posted on{" "}
                  {new Date(post.datePost).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="property-actions-main">
              {!isAdmin &&
                !isLandlord &&
                post.rentalStatus !== -1 &&
                post.rentalStatus !== 1 && (
                  <button
                    onClick={handleApplyClick}
                    className="property-btn property-btn-primary"
                  >
                    <FaPaperPlane className="mr-2" />
                    Apply Now
                  </button>
                )}
              <button
                onClick={handleMessageClick}
                className="property-btn property-btn-secondary"
              >
                <FaEnvelope className="mr-2" />
                Message Owner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Content Sections */}
      <div className="property-content">
        <div className="property-grid">
          {/* Statistics and Analytics Section */}
          <div className="property-stats-section">
            <h2 className="property-section-title">
              <FaEye className="mr-3" />
              Property Statistics
            </h2>
            <div className="property-stats-grid">
              <div className="property-stat-card">
                <div className="property-stat-icon">
                  <FaEye />
                </div>
                <div className="property-stat-content">
                  <div className="property-stat-value">{viewCount}</div>
                  <div className="property-stat-label">Views</div>
                </div>
              </div>
              <div className="property-stat-card">
                <div className="property-stat-icon">
                  <FaHeart />
                </div>
                <div className="property-stat-content">
                  <div className="property-stat-value">
                    {likeStatus.likes_count || 0}
                  </div>
                  <div className="property-stat-label">Likes</div>
                </div>
              </div>
              <div className="property-stat-card">
                <div className="property-stat-icon">
                  <FaComment />
                </div>
                <div className="property-stat-content">
                  <div className="property-stat-value">{commentCount}</div>
                  <div className="property-stat-label">Comments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features Section */}
          <div className="property-amenities-section">
            <h2 className="property-section-title">
              <FaStar className="mr-3" />
              Property Details & Amenities
            </h2>
            <div className="property-amenities-grid">
              {post.isFurnished !== undefined && (
                <div className="property-amenity-item">
                  <FaCouch className="property-amenity-icon" />
                  <span className="property-amenity-text">
                    {post.isFurnished == 1 ? "Furnished" : "Not Furnished"}
                  </span>
                </div>
              )}
              {post.hasGarage !== undefined && (
                <div className="property-amenity-item">
                  <FaCar className="property-amenity-icon" />
                  <span className="property-amenity-text">
                    {post.hasGarage == 1 ? "Garage Available" : "No Garage"}
                  </span>
                </div>
              )}
              {post.rentType !== undefined && (
                <div className="property-amenity-item">
                  <FaTag className="property-amenity-icon" />
                  <span className="property-amenity-text">
                    Type: {post.rentType === 1 ? "Sale" : "Rent"}
                  </span>
                </div>
              )}
              {post.isAuction !== undefined && (
                <div className="property-amenity-item">
                  <FaGavel className="property-amenity-icon" />
                  <span className="property-amenity-text">
                    {post.isAuction == 1 ? "Auction" : "Not Auction"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="property-actions">
        {!isAdmin && (
          <>
            <button
              onClick={handleLikePost}
              className={`property-action-btn ${hasUserLikedPost ? "btn-liked" : ""}`}
            >
              {hasUserLikedPost ? (
                <FaHeart className="mr-2" />
              ) : (
                <FaRegHeart className="mr-2" />
              )}
              <span>Like ({likeStatus.likes_count})</span>
            </button>

            <button onClick={handleSharePost} className="property-action-btn">
              <FaShareAlt className="mr-2" />
              <span>Share</span>
            </button>

            <button
              onClick={handleSave}
              className={`property-action-btn ${saved ? "btn-saved" : ""}`}
            >
              {saved ? (
                <FaBookmark className="mr-2" />
              ) : (
                <FaRegBookmark className="mr-2" />
              )}
              <span>{saved ? "Saved" : "Save"}</span>
            </button>

            <button
              onClick={fetchCommentsModal}
              className="property-action-btn btn-primary"
            >
              <FaComment className="mr-2" />
              <span>Comments ({commentCount > 0 ? commentCount : "0"})</span>
            </button>
          </>
        )}
      </div>

      {/* Proposal Form Modal - Modern Design */}
      {showForm && (
        <div
          className="application-modal-overlay"
          onClick={(e) => {
            if (e.target.className === "application-modal-overlay") {
              setShowForm(false);
              setError(null);
            }
          }}
        >
          <div className="application-modal">
            <div className="application-modal-header">
              <div className="application-modal-header-icon">
                <FaPaperPlane />
              </div>
              <h2 className="application-modal-title">Proposal Form</h2>
            </div>

            <form
              onSubmit={handleSubmitApplication}
              className="application-modal-body"
            >
              <div className="application-form-group">
                <label className="application-form-label">
                  <FaPhone />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="application-form-input"
                />
              </div>

              {/* Show rental dates only if rentType is 0 (rent) */}
              {post.rentType === 0 && (
                <>
                  <div className="application-form-group">
                    <label className="application-form-label">
                      <FaCalendarAlt />
                      Start Rental Date
                    </label>
                    <input
                      type="datetime-local"
                      name="startRentalDate"
                      required
                      value={formData.startRentalDate}
                      onChange={handleInputChange}
                      className="application-form-input"
                    />
                  </div>

                  <div className="application-form-group">
                    <label className="application-form-label">
                      <FaCalendarAlt />
                      End Rental Date
                    </label>
                    <input
                      type="datetime-local"
                      name="endRentalDate"
                      required
                      value={formData.endRentalDate}
                      onChange={handleInputChange}
                      className="application-form-input"
                    />
                  </div>
                </>
              )}

              <div className="application-form-group">
                <label className="application-form-label">
                  <FaFileUpload />
                  Upload Documents (PDF/Image)
                </label>
                <input
                  type="file"
                  name="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={handleInputChange}
                  className="application-form-input"
                />
              </div>

              {/* Show installment option only if rentType is 1 (sale) */}
              {post.rentType === 1 && (
                <div className="application-form-group">
                  <label className="application-form-label">
                    <FaCreditCard />
                    Payment Method
                  </label>
                  <select
                    name="isInstallment"
                    value={formData.isInstallment}
                    onChange={handleInputChange}
                    className="application-form-input"
                  >
                    <option value={0}>Cash</option>
                    <option value={1}>Installment</option>
                  </select>
                </div>
              )}

              {post.isAuction == 1 && (
                <div className="application-form-group">
                  <label className="application-form-label">
                    <FaDollarSign />
                    Offered Price
                  </label>
                  <input
                    type="number"
                    name="offeredPrice"
                    placeholder={`Suggested: $${post?.price?.toLocaleString() || "0"}`}
                    required
                    min="1"
                    step="0.01"
                    value={formData.offeredPrice || ""}
                    onChange={handleInputChange}
                    className="application-form-input"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Property price: ${post?.price?.toLocaleString() || "0"}
                  </p>
                </div>
              )}
              {/* Eligibility Section - Collapsible */}
              {(post.rentType === 0 ||
                (post.rentType === 1 &&
                  parseInt(formData.isInstallment) === 1)) && (
                <div className="application-form-group">
                  <div
                    className="eligibility-section-header"
                    onClick={() => setShowEligibility(!showEligibility)}
                    style={{
                      cursor: "pointer",
                      padding: "16px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "12px",
                      marginBottom: showEligibility ? "16px" : "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "2px solid #e9ecef",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <FaClipboardCheck
                        style={{ color: "#6366f1", fontSize: "20px" }}
                      />
                      <span
                        style={{
                          fontWeight: "600",
                          fontSize: "16px",
                          color: "#1f2937",
                        }}
                      >
                        📊 Financial Eligibility Assessment
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#ef4444",
                          backgroundColor: "#fee2e2",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontWeight: "500",
                        }}
                      >
                        Required
                      </span>
                    </div>
                    <FaChevronDown
                      style={{
                        transition: "transform 0.3s ease",
                        transform: showEligibility
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        color: "#6b7280",
                      }}
                    />
                  </div>

                  {showEligibility && (
                    <div
                      className="eligibility-form-content"
                      style={{
                        padding: "20px",
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "2px solid #e9ecef",
                        marginTop: "8px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          marginBottom: "20px",
                          lineHeight: "1.5",
                        }}
                      >
                        Please provide your financial information to assess your
                        eligibility for this property.
                      </p>

                      {/* Monthly Income */}
                      <div
                        className="application-form-group"
                        style={{ marginBottom: "16px" }}
                      >
                        <label
                          className="application-form-label"
                          style={{ fontSize: "14px", fontWeight: "500" }}
                        >
                          <FaDollarSign style={{ color: "#10b981" }} />
                          Monthly Income *
                        </label>
                        <input
                          type="number"
                          name="monthlyIncome"
                          placeholder="Enter your monthly income"
                          required
                          min="0"
                          step="0.01"
                          value={eligibilityData.monthlyIncome}
                          onChange={handleEligibilityChange}
                          className="application-form-input"
                          style={{ fontSize: "14px" }}
                        />
                      </div>

                      {/* Monthly Expenses */}
                      <div
                        className="application-form-group"
                        style={{ marginBottom: "16px" }}
                      >
                        <label
                          className="application-form-label"
                          style={{ fontSize: "14px", fontWeight: "500" }}
                        >
                          <FaDollarSign style={{ color: "#f59e0b" }} />
                          Monthly Expenses *
                        </label>
                        <input
                          type="number"
                          name="monthlyExpenses"
                          placeholder="Enter your total monthly expenses"
                          required
                          min="0"
                          step="0.01"
                          value={eligibilityData.monthlyExpenses}
                          onChange={handleEligibilityChange}
                          className="application-form-input"
                          style={{ fontSize: "14px" }}
                        />
                      </div>

                      {/* Existing Monthly Debt */}
                      <div
                        className="application-form-group"
                        style={{ marginBottom: "16px" }}
                      >
                        <label
                          className="application-form-label"
                          style={{ fontSize: "14px", fontWeight: "500" }}
                        >
                          <FaCreditCard style={{ color: "#ef4444" }} />
                          Existing Monthly Debt *
                        </label>
                        <input
                          type="number"
                          name="existingMonthlyDebt"
                          placeholder="Enter your monthly debt payments (0 if none)"
                          required
                          min="0"
                          step="0.01"
                          value={eligibilityData.existingMonthlyDebt}
                          onChange={handleEligibilityChange}
                          className="application-form-input"
                          style={{ fontSize: "14px" }}
                        />
                      </div>

                      {/* Has Stable Job */}
                      <div
                        className="application-form-group"
                        style={{ marginBottom: "16px" }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            cursor: "pointer",
                            padding: "12px",
                            backgroundColor: "#f9fafb",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <input
                            type="checkbox"
                            name="hasStableJob"
                            checked={eligibilityData.hasStableJob}
                            onChange={handleEligibilityChange}
                            style={{
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                              accentColor: "#6366f1",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#1f2937",
                            }}
                          >
                            <FaUserTie
                              style={{ color: "#6366f1", marginRight: "8px" }}
                            />
                            I have a stable job *
                          </span>
                        </label>
                      </div>

                      {/* Number of Dependents */}
                      <div className="application-form-group">
                        <label
                          className="application-form-label"
                          style={{ fontSize: "14px", fontWeight: "500" }}
                        >
                          <FaUser style={{ color: "#8b5cf6" }} />
                          Number of Dependents *
                        </label>
                        <input
                          type="number"
                          name="dependents"
                          placeholder="Number of people dependent on your income"
                          required
                          min="0"
                          max="50"
                          value={eligibilityData.dependents}
                          onChange={handleEligibilityChange}
                          className="application-form-input"
                          style={{ fontSize: "14px" }}
                        />
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "4px",
                          }}
                        >
                          Enter 0 if you have no dependents
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="application-form-error">
                  {typeof error === "object" ? JSON.stringify(error) : error}
                </div>
              )}

              <div className="application-modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError(null);
                    setEligibilityData({
                      monthlyIncome: "",
                      monthlyExpenses: "",
                      existingMonthlyDebt: "",
                      hasStableJob: false,
                      dependents: 0,
                    });
                  }}
                  className="application-modal-btn application-modal-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="application-modal-btn application-modal-btn-submit"
                  disabled={
                    !formData.phone ||
                    (post.rentType === 0 &&
                      (!formData.startRentalDate || !formData.endRentalDate)) ||
                    !formData.file ||
                    (post.isAuction == 1 && !formData.offeredPrice) ||
                    // Disable if eligibility is required but not filled
                    ((post.rentType === 0 ||
                      (post.rentType === 1 &&
                        parseInt(formData.isInstallment) === 1)) &&
                      (!eligibilityData.monthlyIncome ||
                        !eligibilityData.monthlyExpenses ||
                        eligibilityData.existingMonthlyDebt === "" ||
                        eligibilityData.dependents === ""))
                  }
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-3xl">
              <h2 className="text-3xl font-bold text-white flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaComment className="text-xl" />
                </div>
                Comments ({commentCount})
              </h2>
              <button
                onClick={() => setShowComments(false)}
                className="text-white hover:text-gray-200 transition-colors duration-200 p-3 hover:bg-white/10 rounded-xl"
              >
                <FaTimes className="text-3xl" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-8 bg-gray-50/50">
              {userInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-blue-200">
                  <p className="text-lg text-blue-800 font-medium">
                    Commenting as: <span className="font-bold">{userName}</span>
                    {post && String(post.userId) === String(userId) && (
                      <span className="ml-3 inline-flex items-center gap-2 text-amber-600 bg-amber-100 px-3 py-1 rounded-full text-sm font-semibold">
                        <FaUserTie className="text-sm" />
                        Owner
                      </span>
                    )}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitComment} className="mb-8">
                {replyingToId && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-2xl border border-blue-200 flex justify-between items-center">
                    <p className="text-lg text-blue-800">
                      Replying to{" "}
                      <strong>
                        {
                          comments
                            .flatMap((c) => [c, ...(c.replies || [])])
                            .find((c) => c._id === replyingToId)?.user_name
                        }
                      </strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setReplyingToId(null)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    >
                      <FaTimes className="text-lg" />
                    </button>
                  </div>
                )}

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    replyingToId
                      ? "Write your reply..."
                      : "Write a new comment..."
                  }
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl resize-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all duration-300 min-h-[120px] text-lg bg-white"
                />

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    {!imagePreview ? (
                      <label className="flex items-center gap-3 px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl cursor-pointer hover:border-purple-300 hover:text-purple-600 transition-all duration-200 font-medium shadow-sm">
                        <FaImage className="text-purple-500 text-lg" />
                        <span className="text-lg">Add Image</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-32 rounded-2xl border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={removeSelectedImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                        >
                          <FaTimesCircle className="text-sm" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={
                      (!newComment.trim() && !selectedImage) ||
                      loadingAction === "submitting-comment" ||
                      isUploading
                    }
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {loadingAction === "submitting-comment" || isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {selectedImage ? "Uploading..." : "Posting..."}
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="text-lg" />
                        {replyingToId ? "Post Reply" : "Post Comment"}
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="space-y-6">
                {loadingAction === "loading-comments" ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-gray-600 text-lg font-medium">
                      Loading comments...
                    </p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
                    <FaComment className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 text-2xl font-medium mb-2">
                      No comments yet
                    </p>
                    <p className="text-gray-400 text-lg">
                      Be the first to comment!
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <CommentItem key={comment._id} comment={comment} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center z-[100] p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-8 right-8 text-white hover:text-gray-300 transition-transform duration-200 hover:scale-125 z-10 p-4 hover:bg-white/10 rounded-2xl"
          >
            <FaTimes className="text-4xl" />
          </button>

          <div
            className="relative flex items-center max-w-7xl"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const images =
                post.fileBase64s ||
                post.images ||
                (post.fileBase64
                  ? [post.fileBase64]
                  : post.image
                    ? [post.image]
                    : []);

              if (images.length > 1) {
                return (
                  <>
                    <button
                      onClick={goToPrevImage}
                      className="absolute left-8 p-5 bg-black/50 text-white rounded-2xl hover:bg-black/70 transition-all duration-200 hover:scale-110 z-10"
                    >
                      <FaChevronLeft className="text-3xl" />
                    </button>
                    <button
                      onClick={goToNextImage}
                      className="absolute right-8 p-5 bg-black/50 text-white rounded-2xl hover:bg-black/70 transition-all duration-200 hover:scale-110 z-10"
                    >
                      <FaChevronRight className="text-3xl" />
                    </button>
                  </>
                );
              }
              return null;
            })()}

            {(() => {
              const images =
                post.fileBase64s ||
                post.images ||
                (post.fileBase64
                  ? [post.fileBase64]
                  : post.image
                    ? [post.image]
                    : []);
              if (images.length > 0) {
                const currentImage = images[currentImageIndex];
                let imageSrc;

                // Handle different image formats like in Home.jsx
                if (currentImage.startsWith("http")) {
                  imageSrc = currentImage;
                } else if (currentImage.startsWith("data:")) {
                  imageSrc = currentImage;
                } else {
                  // If it's a path or base64 without data prefix
                  imageSrc = currentImage.includes("/")
                    ? `${API_BASE_URL}/${currentImage}`
                    : `data:image/png;base64,${currentImage}`;
                }

                return (
                  <img
                    src={imageSrc}
                    alt={`${post.title} - Enlarged view`}
                    className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl"
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                );
              }
              return null;
            })()}
          </div>

          {(() => {
            const images =
              post.fileBase64s ||
              post.images ||
              (post.fileBase64
                ? [post.fileBase64]
                : post.image
                  ? [post.image]
                  : []);
            return (
              images.length > 1 && (
                <div className="flex gap-4 mt-8 overflow-x-auto max-w-full p-4">
                  {images.map((img, index) => {
                    let imageSrc;

                    // Handle different image formats like in Home.jsx
                    if (img.startsWith("http")) {
                      imageSrc = img;
                    } else if (img.startsWith("data:")) {
                      imageSrc = img;
                    } else {
                      // If it's a path or base64 without data prefix
                      imageSrc = img.includes("/")
                        ? `${API_BASE_URL}/${img}`
                        : `data:image/png;base64,${img}`;
                    }

                    return (
                      <img
                        key={index}
                        src={imageSrc}
                        alt={`${post.title} - Thumbnail ${index + 1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-28 h-24 object-cover rounded-2xl cursor-pointer transition-all duration-300 shadow-lg ${index === currentImageIndex ? "opacity-100 ring-4 ring-white scale-110" : "opacity-60 hover:opacity-100 hover:scale-105"}`}
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                    );
                  })}
                </div>
              )
            );
          })()}
        </div>
      )}
    </div>
  );
};
export default PropertyDetail;
