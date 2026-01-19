import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import withDarkMode from '../components/withDarkMode';
import "./ShowAllPosts.css";

import {
  FaHeart, FaRegHeart,
  FaPaperPlane, FaComment, FaMapMarkerAlt, FaDollarSign,
  FaUser, FaClock, FaHome, FaTimes, FaSearch, FaFilter, FaEdit, FaTrash,
  FaReply, FaUserTie, FaImage, FaTimesCircle, FaChevronDown, FaShareAlt,
  FaThumbtack,
  FaBookmark, FaRegBookmark,
  FaCommentDots, FaEye, FaCheckCircle, FaHistory,
  FaExclamationTriangle, FaStar, FaChartLine
} from "react-icons/fa";

// --- دوال المساعدة (بدون تغيير) ---
const decodeJWT = (token) => { try { const base64Url = token.split(".")[1]; const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); const jsonPayload = decodeURIComponent(atob(base64).split("").map(function (c) { return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2); }).join("")); return JSON.parse(jsonPayload); } catch (error) { console.error("Error decoding JWT token:", error); return null; } };
const getUserInfoFromToken = () => { const token = localStorage.getItem("token"); const userId = localStorage.getItem("userId"); if (!token || !userId) return null; const decoded = decodeJWT(token); if (!decoded) return null; return { userId: userId, userName: decoded.name || decoded.sub || "User", role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || localStorage.getItem("role"), }; };
const getAuthHeaders = () => { const token = localStorage.getItem("token"); const userInfo = getUserInfoFromToken(); return { Authorization: `Bearer ${token}`, "User-Name": userInfo?.userName || "User", "User-Id": userInfo?.userId || "", "User-Role": userInfo?.role || "user", "Content-Type": "application/json", }; };
const convertImageToBase64 = (file) => { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result); reader.onerror = (error) => reject(error); }); };

// --- دالة تسجيل الهيستوري (بورت 5000) ---
const API_HISTORY_URL = 'http://localhost:5000/api/history';
const recordHistoryEvent = async (userId, activityType, details) => {
  if (!userId || !activityType || !details) { console.warn("History not recorded: Missing data"); return; }
  try {
    await axios.post(`${API_HISTORY_URL}/${userId}`, { activity_type: activityType, details: details }, { headers: getAuthHeaders() });
    console.log(`History recorded: ${activityType}`, details);
  } catch (error) {
    console.error(`Failed to record history event (${activityType}):`, error.response?.data || error.message);
  }
};

// --- مكون الردود (InlineReplyBox) (مع تعديل) ---
const InlineReplyBox = ({ postId, parentId, onSuccess, onCancel, postTitle, postPrice, postLocation }) => {
  const [replyText, setReplyText] = useState(""); const [selectedImage, setSelectedImage] = useState(null); const [imagePreview, setImagePreview] = useState(null); const [isSubmitting, setIsSubmitting] = useState(false); const fileInputRef = useRef(null); const userInfo = getUserInfoFromToken();
  const handleImageSelect = (event) => { const file = event.target.files[0]; if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { alert("Please select an image file smaller than 5MB."); return; } setSelectedImage(file); const reader = new FileReader(); reader.onload = (e) => setImagePreview(e.target.result); reader.readAsDataURL(file); };
  const removeSelectedImage = () => { setSelectedImage(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; };
  const handleSubmit = async (e) => {
    e.preventDefault(); if (!replyText.trim() && !selectedImage) return; if (!userInfo?.userId) { alert("You must be logged in to reply."); return; } setIsSubmitting(true); try {
      const commentData = { comment_description: replyText.trim(), parent_id: parentId, client_time: new Date().toISOString() }; if (selectedImage) { commentData.image_data = await convertImageToBase64(selectedImage); }
      const response = await axios.post(`http://localhost:5000/api/comments/${userInfo.userId}/add-comment/${postId}`, commentData, { headers: getAuthHeaders() });
      if (response.data?._id) {
        // ✅ --- (تعديل) إضافة بيانات العرض للهيستوري ---
        await recordHistoryEvent(userInfo.userId, 'comment', {
          post_id: postId, post_title: postTitle || 'N/A',
          post_price: postPrice || null, post_location: postLocation || null,
          comment_id: response.data._id,
          is_reply: true,
          comment_preview: replyText.trim(), // <-- إضافة
          has_image: !!selectedImage        // <-- إضافة
        });
      }
      onSuccess(response.data);
    } catch (error) { console.error("Failed to submit reply:", error); alert("Failed to post reply."); } finally { setIsSubmitting(false); }
  };
  return (<form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50/80 backdrop-blur-sm border border-indigo-100 rounded-xl shadow-sm"><textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply..." className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200" rows="3" autoFocus /> <div className="flex items-center justify-between mt-3"> <div> {!imagePreview ? (<label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors duration-200 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300"><FaImage className="text-indigo-500" /> Add Image<input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" /></label>) : (<div className="relative"><img src={imagePreview} alt="Preview" className="h-16 rounded-lg shadow-sm border" /><button type="button" onClick={removeSelectedImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 shadow-lg"><FaTimesCircle className="text-xs" /></button></div>)} </div> <div className="flex gap-2"><button type="button" onClick={onCancel} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium">Cancel</button><button type="submit" disabled={isSubmitting || (!replyText.trim() && !selectedImage)} className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 font-medium shadow-sm">{isSubmitting ? "Replying..." : "Reply"}</button></div> </div> </form>);
};

// --- مودال تأكيد الحذف (بدون تغيير) ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose} >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 border border-gray-100" onClick={(e) => e.stopPropagation()} >
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-lg leading-6 font-semibold text-gray-900" id="modal-title">
                {title || "Delete Confirmation"}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message || "Are you sure? This action cannot be undone."}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse rounded-b-2xl border-t border-gray-100">
          <button type="button" className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-base font-medium text-white hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
            onClick={() => { onConfirm(); onClose(); }}
          >
            Confirm Delete
          </button>
          <button type="button" className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// --- المكون الرئيسي ---
const ShowAllPosts = () => {
  // ... (State variables without change) ...
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [message, setMessage] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [openReplies, setOpenReplies] = useState({});
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const userInfo = getUserInfoFromToken();
  const { role: userRole, userId, userName } = userInfo || {}; // 'userId' is the current user
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: () => { } });


  // --- دوال مساعدة ---
  const calculateTotalComments = (commentList) => {
    let count = 0;
    if (commentList && commentList.length > 0) {
      commentList.forEach(comment => {
        count++;
        if (comment.replies && comment.replies.length > 0) {
          count += calculateTotalComments(comment.replies);
        }
      });
    }
    return count;
  };

  // ✅ --- (تعديل) دالة فرز الكومنتات (لإعطاء أولوية لكومنتات المستخدم الحالي) ---
  const sortComments = (commentsToSort, postOwnerId, currentUserId) => { // ✅ إضافة currentUserId
    if (!commentsToSort || commentsToSort.length === 0) { return []; }
    const postOwnerIdStr = String(postOwnerId);
    const currentUserIdStr = String(currentUserId); // ✅ ID المستخدم الحالي

    // 1. فرز الردود الداخلية (الأقدم أولاً)
    const sortedListWithReplies = commentsToSort.map(comment => {
      if (comment.replies && comment.replies.length > 0) {
        // نسخ الردود لضمان عدم تغيير الحالة الأصلية (Immutability)
        const sortedReplies = [...comment.replies].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return { ...comment, replies: sortedReplies };
      }
      return comment;
    });

    // 2. فرز الكومنتات الأساسية (المثبت > المالك > المستخدم الحالي > الأحدث)
    return sortedListWithReplies.sort((a, b) => {
      // 1. المثبت (Pinned)
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;

      // 2. المالك (Owner)
      const aIsOwner = String(a.user_id) === postOwnerIdStr;
      const bIsOwner = String(b.user_id) === postOwnerIdStr;
      if (aIsOwner !== bIsOwner) return aIsOwner ? -1 : 1;

      // 3. المستخدم الحالي (Current User) - (هذا هو التعديل المطلوب)
      const aIsCurrentUser = String(a.user_id) === currentUserIdStr;
      const bIsCurrentUser = String(b.user_id) === currentUserIdStr;
      if (aIsCurrentUser !== bIsCurrentUser) return aIsCurrentUser ? -1 : 1;

      // 4. الأحدث (Newest)
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  useEffect(() => {
    setCommentCount(calculateTotalComments(comments));
  }, [comments]);

  // ... (toggleReplies, updateCommentInState, addReplyToState - without change) ...
  const toggleReplies = (commentId) => { setOpenReplies(prev => ({ ...prev, [commentId]: !prev[commentId] })); };
  const updateCommentInState = (updatedComment) => { const updateRecursively = (list) => { return list.map(c => { if (c._id === updatedComment._id) { return { ...c, ...updatedComment, replies: c.replies }; } if (c.replies) { return { ...c, replies: updateRecursively(c.replies) }; } return c; }); }; setComments(prev => updateRecursively(prev)); };
  const addReplyToState = (parentId, newReply) => { const addReplyRecursively = (commentsList) => { return commentsList.map(comment => { if (comment._id === parentId) { const updatedReplies = [...(comment.replies || []), newReply]; return { ...comment, replies: updatedReplies }; } if (comment.replies) { return { ...comment, replies: addReplyRecursively(comment.replies) }; } return comment; }); }; setComments(prevComments => addReplyRecursively(prevComments)); setOpenReplies(prev => ({ ...prev, [parentId]: true })); };

  // ... (updatePostCardCount - without change) ...
  const updatePostCardCount = (postIdToUpdate) => {
    axios.get(`http://localhost:5000/api/comments/post/${postIdToUpdate}`, { headers: getAuthHeaders() })
      .then(res => {
        const newCount = calculateTotalComments(res.data || []);
        const updateList = (list) => list.map(p =>
          String(p.postId) === String(postIdToUpdate) ? { ...p, commentCount: newCount } : p
        );
        setPosts(prev => updateList(prev));
        setFilteredPosts(prev => updateList(prev));
      })
      .catch(err => {
        console.error("Failed to re-fetch count, count on card might be stale.", err);
      });
  };

  // --- Data Fetching Hooks (بدون تغيير) ---
  useEffect(() => {
    const fetchPostsAndInteractions = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/Tenant/all-posts`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, });
        let initialPosts = res.data.map((post) => ({ ...post, likes: post.likes || [], likes_count: post.likes_count || 0, images: post.images || [], fileBase64: post.fileBase64 || null, commentCount: 0 }));

        if (initialPosts.length > 0) {
          const interactionPromises = initialPosts.map(async (post) => {
            let likeData = { likes_count: post.likes_count, likes: post.likes };
            let fetchedCommentCount = 0;
            if (userId) {
              try {
                const likeRes = await axios.get(`http://localhost:5000/api/posts/${post.postId}/like-status`, { headers: getAuthHeaders() }); // بورت 5000
                likeData = { likes_count: likeRes.data.likes_count, likes: likeRes.data.liked_by_users || [] };
              } catch (err) { console.warn(`Failed to fetch like status for post ${post.postId}:`, err.message); }
            }
            try {
              const commentRes = await axios.get(`http://localhost:5000/api/comments/post/${post.postId}`, { headers: getAuthHeaders() }); // بورت 5000
              fetchedCommentCount = calculateTotalComments(commentRes.data || []);
            } catch (err) { console.warn(`Failed to fetch comments for post ${post.postId}:`, err.message); }

            return { ...post, likes_count: likeData.likes_count, likes: Array.isArray(likeData.likes) ? likeData.likes : [], commentCount: fetchedCommentCount };
          });
          initialPosts = await Promise.all(interactionPromises);
        }

        // Sync posts with Flask service (if needed)
        try {
          const postsToSync = initialPosts.map(p => ({ postId: p.postId, userId: p.userId }));
          if (postsToSync.length > 0) {
            await axios.post('http://localhost:5000/api/posts/sync', postsToSync, { headers: getAuthHeaders() }); // بورت 5000
            console.log("Successfully synced post owner data with comments service (Flask).");
          }
        } catch (syncErr) { console.error("Failed to sync posts with comments service (Flask):", syncErr); }

        setPosts(initialPosts);
        setFilteredPosts(initialPosts);
        setMessage("");
      } catch (err) { console.error("Failed to fetch posts:", err); setMessage("Failed to load posts or no posts available."); setPosts([]); setFilteredPosts([]); } finally { setLoading(false); }
    };
    fetchPostsAndInteractions();
  }, [userId]);

  // Fetch saved posts (بدون تغيير)
  useEffect(() => { const token = localStorage.getItem("token"); const tenantUserId = localStorage.getItem("userId"); if (!token || !tenantUserId) return; const fetchSavedPosts = async () => { try { const res = await axios.get(`${API_BASE_URL}/api/Tenant/My-saved-posts/${tenantUserId}`, { headers: { Authorization: `Bearer ${token}` } }); const savedIds = (res.data || []).map((p) => String(p.postId)); setSavedPosts(savedIds); } catch (err) { /* silent */ } }; fetchSavedPosts(); }, []);

  // --- Post Action Handlers (بدون تغيير) ---
  const handleSharePost = async (post, e) => { e.stopPropagation(); const postUrl = `${window.location.origin}/properties/${post.postId}`; const shareData = { title: post.title, text: `Check out this property: ${post.title}`, url: postUrl, }; if (navigator.share) { try { await navigator.share(shareData); } catch (err) { console.error("Share failed:", err); } } else { try { await navigator.clipboard.writeText(postUrl); alert("Link copied to clipboard!"); } catch (err) { console.error("Failed to copy link:", err); alert("Could not copy link."); } } };

  const handleCardClick = (post, e) => {
    if (!e.target.closest(".post-actions")) {
      navigate(`/properties/${post.postId}`);
    }
  };

  const handleSavePost = async (postId, e) => {
    e.stopPropagation();
    if (!localStorage.getItem("token")) { alert("You need to login to save posts"); navigate("/login"); return; }
    const tenantUserId = localStorage.getItem("userId");
    if (!tenantUserId) { setError("User not authenticated properly"); return; }
    const postIdStr = String(postId);
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
    const saveUrl = `${API_BASE_URL}/api/Tenant/${tenantUserId}/save-post/${postIdStr}`;
    const wasSaved = savedPosts.includes(postIdStr);
    const postToSave = posts.find(p => String(p.postId) === postIdStr);
    if (wasSaved) {
      alert("You've already saved this post.");
      setSavedPosts(prev => prev.filter(id => id !== postIdStr));
      try { await axios.delete(saveUrl, { headers: headers }); }
      catch (error) { console.error("Failed to unsave post:", error); setSavedPosts(prev => [...prev, postIdStr]); }
    } else {
      setSavedPosts(prev => [...prev, postIdStr]);
      try {
        await axios.post(saveUrl, {}, { headers: headers });
        if (postToSave) {
          const imageToSend = postToSave.fileBase64 || (postToSave.fileBase64s && postToSave.fileBase64s.length > 0 ? postToSave.fileBase64s[0] : null);
          await recordHistoryEvent(userId, 'save', {
            post_id: postIdStr, post_title: postToSave.title, post_image: imageToSend,
            post_price: postToSave.price, post_location: postToSave.location
          });
        }
      } catch (error) { console.error("Failed to save post:", error); setSavedPosts(prev => prev.filter(id => id !== postIdStr)); }
    }
  };

  const handleLikePost = async (postId, e) => {
    e.stopPropagation();
    if (!userId) { alert("You need to login to like posts"); navigate("/login"); return; }
    const postIdStr = String(postId);
    const currentPostIndex = posts.findIndex(p => String(p.postId) === postIdStr);
    const currentFilteredPostIndex = filteredPosts.findIndex(p => String(p.postId) === postIdStr);
    if (currentPostIndex === -1) return;
    const originalPost = posts[currentPostIndex];
    const wasLiked = Array.isArray(originalPost.likes) && originalPost.likes.includes(String(userId));
    const newLikesCountOptimistic = wasLiked ? (originalPost.likes_count || 1) - 1 : (originalPost.likes_count || 0) + 1;
    const newLikesArrayOptimistic = wasLiked ? (originalPost.likes || []).filter(id => id !== String(userId)) : [...(originalPost.likes || []), String(userId)];
    const updatedPostOptimistic = { ...originalPost, likes_count: newLikesCountOptimistic < 0 ? 0 : newLikesCountOptimistic, likes: newLikesArrayOptimistic };
    const updateOptimistic = (list, index) => { const newList = [...list]; if (index !== -1) newList[index] = updatedPostOptimistic; return newList; };
    setPosts(prev => updateOptimistic(prev, currentPostIndex));
    setFilteredPosts(prev => updateOptimistic(prev, currentFilteredPostIndex));
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postIdStr}/like`, {}, { headers: getAuthHeaders() });
      const { likes_count, liked_by_users } = response.data;
      const finalUpdatedPost = { ...updatedPostOptimistic, likes_count: likes_count, likes: liked_by_users || [] };
      const updateFinal = (list, index) => { const newList = [...list]; if (index !== -1) newList[index] = finalUpdatedPost; return newList; };
      setPosts(prev => updateFinal(prev, currentPostIndex));
      setFilteredPosts(prev => updateFinal(prev, currentFilteredPostIndex));
      if (!wasLiked) {
        const imageToSend = originalPost.fileBase64 || (originalPost.fileBase64s && originalPost.fileBase64s.length > 0 ? originalPost.fileBase64s[0] : null);
        await recordHistoryEvent(userId, 'like', {
          post_id: postIdStr, post_title: originalPost.title, post_image: imageToSend,
          post_price: originalPost.price, post_location: originalPost.location
        });
      }
    } catch (err) {
      console.error("Like failed:", err);
      alert(err.response?.data?.error || "Failed to update like");
      const rollbackUpdate = (list, index) => { const newList = [...list]; if (index !== -1) newList[index] = originalPost; return newList; };
      setPosts(prev => rollbackUpdate(prev, currentPostIndex));
      setFilteredPosts(prev => rollbackUpdate(prev, currentFilteredPostIndex));
    }
  };

  const handleSearch = async () => {
    const filtered = posts.filter((post) => { const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.location.toLowerCase().includes(searchQuery.toLowerCase()); const matchesPrice = (minPrice ? post.price >= Number(minPrice) : true) && (maxPrice ? post.price <= Number(maxPrice) : true); return matchesSearch && matchesPrice; });
    setFilteredPosts(filtered);
    setMessage(filtered.length === 0 ? "No posts found matching your criteria." : "");
    if (searchQuery.trim() && userId) {
      await recordHistoryEvent(userId, 'search', { query: searchQuery.trim() });
    }
  };


  // --- Comment Modal and Action Handlers ---

  // ✅ --- (تعديل) دالة جلب الكومنتات (تستخدم userId) ---
  const fetchPostComments = async (postId, postOwnerId) => {
    if (!postId || !postOwnerId) return;
    try {
      setLoadingAction("loading-comments");
      const res = await axios.get(`http://localhost:5000/api/comments/post/${postId}`, { headers: getAuthHeaders(), });
      const fetchedComments = res.data || [];
      // ✅ (تعديل) تمرير userId (المستخدم الحالي) للفرز
      const sorted = sortComments(fetchedComments, postOwnerId, userId);
      setComments(sorted);
    } catch (err) { console.error("Failed to load comments", err); setComments([]); } finally { setLoadingAction(null); }
  };

  // ... (openCommentsModal, closeCommentsModal, handleImageSelect, removeSelectedImage - without change) ...
  const openCommentsModal = async (post, e) => {
    e.stopPropagation();
    setSelectedPost(post);
    if (!userInfo?.userId) { alert("You need to login to view comments"); navigate("/login"); return; }
    setOpenReplies({});
    await fetchPostComments(post.postId, post.userId); // (ستستخدم الدالة المعدلة)
    setShowComments(true);
  };
  const closeCommentsModal = () => { setShowComments(false); setSelectedPost(null); setComments([]); setNewComment(""); setReplyingToId(null); setEditingComment(null); setSelectedImage(null); setImagePreview(null); };
  const handleImageSelect = (event) => { const file = event.target.files[0]; if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { alert("Please select an image file smaller than 5MB."); return; } setSelectedImage(file); const reader = new FileReader(); reader.onload = (e) => setImagePreview(e.target.result); reader.readAsDataURL(file); };
  const removeSelectedImage = () => { setSelectedImage(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  // ✅ --- (تعديل) handleSubmitComment - (تستخدم userId للفرز وإضافة بيانات الهيستوري) ---
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!userId || !selectedPost) { return; }
    if (!newComment.trim() && !selectedImage) { return; }
    try {
      setIsUploading(true);
      setLoadingAction("submitting-comment");
      const commentData = { comment_description: newComment.trim(), parent_id: replyingToId, client_time: new Date().toISOString() };
      if (selectedImage) { commentData.image_data = await convertImageToBase64(selectedImage); }
      const response = await axios.post(`http://localhost:5000/api/comments/${userId}/add-comment/${selectedPost.postId}`, commentData, { headers: getAuthHeaders() });

      // ✅ --- (تعديل) إضافة بيانات العرض للهيستوري ---
      await recordHistoryEvent(userId, 'comment', {
        post_id: selectedPost.postId,
        post_title: selectedPost.title,
        post_price: selectedPost.price,
        post_location: selectedPost.location,
        comment_id: response.data?._id,
        is_reply: !!replyingToId,
        comment_preview: newComment.trim(), // <-- إضافة
        has_image: !!selectedImage        // <-- إضافة
      });

      // ✅ 1. تحديث محلي فوري للمودال (بدون تحميل)
      if (replyingToId) {
        addReplyToState(replyingToId, response.data);
        setReplyingToId(null);
      } else {
        // ✅ (تعديل) تمرير userId للفرز الفوري
        setComments(prev => sortComments([response.data, ...prev], selectedPost.userId, userId));
      }

      // ✅ 2. تحديث العدد الخارجي للكارت (بدون تغيير)
      updatePostCardCount(selectedPost.postId);

      setNewComment(""); setSelectedImage(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) { setError(err.response?.data?.error || "Failed to post comment"); } finally { setIsUploading(false); setLoadingAction(null); }
  };

  // ... (handleEditComment, handleDeleteComment, handleLikeComment - without change) ...
  const handleEditComment = async (commentId, updatePayload) => {
    try {
      setLoadingAction(`editing-${commentId}`);
      const finalPayload = { ...updatePayload, client_time: new Date().toISOString() };
      const response = await axios.put(`http://localhost:5000/api/comments/${commentId}`, finalPayload, { headers: getAuthHeaders() });
      updateCommentInState(response.data);
      setEditingComment(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update comment");
    } finally {
      setLoadingAction(null);
    }
  };
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      setLoadingAction(`deleting-${commentId}`);
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, { headers: getAuthHeaders() });

      // 1. تحديث محلي فوري للمودال
      const deleteRecursively = (list, idToDelete) => { return list.filter(c => c._id !== idToDelete).map(c => { if (c.replies) { return { ...c, replies: deleteRecursively(c.replies, idToDelete) }; } return c; }); };
      const remainingComments = deleteRecursively(comments, commentId);
      setComments(remainingComments);

      // 2. تحديث العدد الخارجي للكارت
      updatePostCardCount(selectedPost.postId);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete comment");
    } finally {
      setLoadingAction(null);
    }
  };
  const handleLikeComment = async (commentId) => { try { const response = await axios.post(`http://localhost:5000/api/comments/${commentId}/like`, {}, { headers: getAuthHeaders() }); updateCommentInState(response.data.comment); } catch (err) { console.error("Failed to like comment:", err); alert("Failed to update like."); } };

  // ... (handlePinComment - now uses the modified fetchPostComments) ...
  const handlePinComment = async (commentId) => {
    if (!selectedPost) return;
    try {
      setLoadingAction(`pinning-${commentId}`);
      await axios.post(`http://localhost:5000/api/comments/${commentId}/pin`, {}, { headers: getAuthHeaders() });

      // (سيعيد الجلب باستخدام الفرز الجديد الذي يتضمن userId)
      await fetchPostComments(selectedPost.postId, selectedPost.userId);

    } catch (err) {
      console.error("Failed to pin comment:", err);
      alert(err.response?.data?.error || "Failed to update pin status.");
    } finally {
      setLoadingAction(null);
    }
  };

  // --- Search and Utility Functions (بدون تغيير) ---
  const formatLocalDate = (dateString) => { try { const date = new Date(dateString); return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString(); } catch (error) { return "Invalid date"; } };
  const toPlainText = (v) => (Array.isArray(v) ? v.join(" ") : v ?? "");

  // --- CommentItem Component ---
  function CommentItem({ comment, depth = 0 }) {
    const isOwner = String(comment.user_id) === String(userId);
    const isPostOwnerComment = selectedPost && String(selectedPost.userId) === String(comment.user_id);
    const isCurrentUserPostOwner = selectedPost && String(selectedPost.userId) === String(userId);
    const isEditing = editingComment?._id === comment._id;
    const isReplying = replyingToId === comment._id;
    const isProcessing = loadingAction === `editing-${comment._id}` || loadingAction === `deleting-${comment._id}` || loadingAction === `pinning-${comment._id}`;
    const isOpen = !!openReplies[comment._id];
    const [editText, setEditText] = useState(toPlainText(comment.comment_description));
    const originalImageUrl = comment.image_data;
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(originalImageUrl);
    const editFileInputRef = useRef(null);
    const hasUserLiked = comment.likes?.includes(userId);

    useEffect(() => { if (isEditing) { setEditText(toPlainText(comment.comment_description)); setEditImagePreview(originalImageUrl); setEditImageFile(null); } }, [isEditing, comment.comment_description, originalImageUrl]);
    const handleEditImageSelect = (event) => { const file = event.target.files[0]; if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { alert("Please select an image file smaller than 5MB."); return; } setEditImageFile(file); const reader = new FileReader(); reader.onload = (e) => setEditImagePreview(e.target.result); reader.readAsDataURL(file); };
    const removeEditImage = () => { setEditImageFile(null); setEditImagePreview(null); };
    const handleSaveEdit = async () => { if (!editText.trim() && !editImagePreview) { alert("Comment cannot be empty."); return; } const updatePayload = { comment_description: editText.trim(), }; if (editImageFile) { updatePayload.image_data = await convertImageToBase64(editImageFile); } else if (editImagePreview === null && originalImageUrl !== null) { updatePayload.image_data = null; } handleEditComment(comment._id, updatePayload); };
    const handleCancelEdit = () => { setEditingComment(null); }; const handleReplyClick = () => { setReplyingToId(currentId => currentId === comment._id ? null : comment._id); setEditingComment(null); }; const handleEditClick = () => { setEditingComment(comment); setReplyingToId(null); };

    return (
      <div className={`comment-item ${comment.is_pinned ? 'pinned' : ''}`} style={{ marginLeft: depth > 0 ? '2rem' : '0', marginTop: depth > 0 ? '1rem' : '0' }}>
        <div className="comment-header">
          <div className="comment-author">
            <div className="comment-avatar">
              <FaUser />
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {comment.user_name || "Anonymous"}
              </span>
              <div className="comment-badges">
                {isOwner && (
                  <span className="comment-badge you">You</span>
                )}
                {isPostOwnerComment && (
                  <span className="comment-badge owner">
                    <FaUserTie /> Owner
                  </span>
                )}
                {comment.is_pinned && (
                  <span className="comment-badge pinned">
                    <FaThumbtack /> Pinned
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className="comment-date">
            {formatLocalDate(comment.created_at)}
            {comment.is_edited && " (edited)"}
          </span>
        </div>

        {isEditing ? (
          <div style={{ marginBottom: '1rem' }}>
            <textarea 
              value={editText} 
              onChange={(e) => setEditText(e.target.value)} 
              className="comment-textarea"
              rows="3" 
              autoFocus 
            />
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {editImagePreview && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={editImagePreview} 
                    alt="Edit preview" 
                    className="comment-image"
                    style={{ height: '6rem', cursor: 'pointer' }}
                    onClick={() => window.open(editImagePreview, "_blank")} 
                  />
                  <button 
                    type="button" 
                    onClick={removeEditImage} 
                    style={{
                      position: 'absolute',
                      top: '-0.5rem',
                      right: '-0.5rem',
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '0.25rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <FaTimesCircle />
                  </button>
                </div>
              )}
              <label className="image-upload-btn">
                <FaImage />
                {originalImageUrl || editImagePreview ? 'Change Image' : 'Add Image'}
                <input type="file" ref={editFileInputRef} onChange={handleEditImageSelect} accept="image/*" style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button 
                onClick={handleSaveEdit} 
                disabled={loadingAction === `editing-${comment._id}`} 
                className="submit-comment-btn"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                {loadingAction === `editing-${comment._id}` ? "Saving..." : "Save"}
              </button>
              <button 
                onClick={handleCancelEdit} 
                className="submit-comment-btn"
                style={{ background: '#6b7280' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="comment-content">
            {comment.comment_description && <p>{toPlainText(comment.comment_description)}</p>}
            {originalImageUrl && (
              <img 
                src={originalImageUrl} 
                alt="Comment attachment" 
                className="comment-image"
                onClick={() => window.open(originalImageUrl, "_blank")} 
              />
            )}
          </div>
        )}

        <div className="comment-actions">
          <button 
            onClick={() => handleLikeComment(comment._id)} 
            className={`comment-action-btn ${hasUserLiked ? 'liked' : ''}`}
          >
            {hasUserLiked ? <FaHeart /> : <FaRegHeart />}
            <span>{comment.likes_count > 0 ? comment.likes_count : ''}</span>
          </button>
          
          <button onClick={handleReplyClick} className="comment-action-btn">
            <FaReply /> Reply
          </button>
          
          {comment.replies?.length > 0 && (
            <button onClick={() => toggleReplies(comment._id)} className="comment-action-btn">
              <FaChevronDown style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: 'transform 0.2s' }} />
              {isOpen ? "Hide" : "Show"} replies
              <span style={{ 
                background: 'rgba(30, 58, 138, 0.1)', 
                color: 'var(--brand-secondary)', 
                padding: '0.125rem 0.375rem', 
                borderRadius: '1rem', 
                fontSize: '0.75rem', 
                fontWeight: 600 
              }}>
                {comment.replies.length}
              </span>
            </button>
          )}
          
          {isOwner && !isEditing && (
            <>
              <button onClick={handleEditClick} className="comment-action-btn">
                <FaEdit /> Edit
              </button>
              <button 
                onClick={() => handleDeleteComment(comment._id)} 
                disabled={isProcessing} 
                className="comment-action-btn"
                style={{ color: '#ef4444' }}
              >
                {loadingAction === `deleting-${comment._id}` ? (
                  <div style={{ width: '0.75rem', height: '0.75rem', border: '2px solid #ef4444', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
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
              className="comment-action-btn"
              style={{ color: comment.is_pinned ? 'var(--brand-secondary)' : 'var(--text-secondary)' }}
            >
              {loadingAction === `pinning-${comment._id}` ? (
                <div style={{ width: '0.75rem', height: '0.75rem', border: '2px solid var(--brand-secondary)', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              ) : (
                <FaThumbtack />
              )}
              {comment.is_pinned ? 'Unpin' : 'Pin'}
            </button>
          )}
        </div>

        {isReplying && (
          <InlineReplyBox
            postId={selectedPost.postId}
            parentId={comment._id}
            postTitle={selectedPost?.title}
            postPrice={selectedPost?.price}
            postLocation={selectedPost?.location}
            onSuccess={(newReply) => {
              addReplyToState(comment._id, newReply);
              updatePostCardCount(selectedPost.postId);
              setReplyingToId(null);
            }} 
            onCancel={() => setReplyingToId(null)} 
          />
        )}
        
        {isOpen && comment.replies && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-primary)' }}>
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- JSX Rendering (Main Page) ---
  if (loading) return (
    <div className="show-all-posts">
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading properties...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="show-all-posts">
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">
            <FaExclamationTriangle />
          </div>
          <h2 className="error-title">Error Loading Properties</h2>
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="error-btn">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  if (message && filteredPosts.length === 0 && !loading) return (
    <div className="show-all-posts">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header with Search */}
        <div className="posts-hero">
          <div className="posts-hero-content">
            <h1 className="posts-hero-title">Available Properties</h1>
            <p className="posts-hero-subtitle">
              Discover your perfect home from our curated collection of properties
            </p>
            <div className="posts-hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-number">0</div>
                <div className="hero-stat-label">Properties Found</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">∞</div>
                <div className="hero-stat-label">Possibilities</div>
              </div>
            </div>

            {/* Hero Search Section */}
            <div className="hero-search-section">
              <div className="hero-search-container">
                <div className="hero-search-grid">
                  <div className="hero-search-input-group">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by title or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="hero-search-input"
                    />
                  </div>

                  <div className="hero-price-inputs">
                    <div className="hero-price-input-group">
                      <label className="hero-price-label">Min Price</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        min="0"
                        className="hero-price-input"
                      />
                    </div>
                    <div className="hero-price-input-group">
                      <label className="hero-price-label">Max Price</label>
                      <input
                        type="number"
                        placeholder="∞"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        min="0"
                        className="hero-price-input"
                      />
                    </div>
                  </div>

                  <div className="hero-search-actions">
                    <button onClick={handleSearch} className="hero-search-btn">
                      <FaSearch />
                      Search Properties
                    </button>
                    <button onClick={handleSearch} className="hero-filter-btn">
                      <FaFilter />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* No Results */}
        <div className="no-results">
          <FaExclamationTriangle className="no-results-icon" />
          <h3 className="no-results-title">No Properties Found</h3>
          <p className="no-results-message">{message}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="show-all-posts">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header with Search */}
        <div className="posts-hero">
          <div className="posts-hero-content">
            <h1 className="posts-hero-title">Available Properties</h1>
            <p className="posts-hero-subtitle">
              Discover your perfect home from our curated collection of properties
            </p>
            <div className="posts-hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-number">{filteredPosts.length}</div>
                <div className="hero-stat-label">Properties Available</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">{posts.length}</div>
                <div className="hero-stat-label">Total Listings</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">
                  {filteredPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0)}
                </div>
                <div className="hero-stat-label">Total Likes</div>
              </div>
            </div>

            {/* Hero Search Section */}
            <div className="hero-search-section">
              <div className="hero-search-container">
                <div className="hero-search-grid">
                  <div className="hero-search-input-group">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by title or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="hero-search-input"
                    />
                  </div>

                  <div className="hero-price-inputs">
                    <div className="hero-price-input-group">
                      <label className="hero-price-label">Min Price</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        min="0"
                        className="hero-price-input"
                      />
                    </div>
                    <div className="hero-price-input-group">
                      <label className="hero-price-label">Max Price</label>
                      <input
                        type="number"
                        placeholder="∞"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        min="0"
                        className="hero-price-input"
                      />
                    </div>
                  </div>

                  <div className="hero-search-actions">
                    <button onClick={handleSearch} className="hero-search-btn">
                      <FaSearch />
                      Search Properties
                    </button>
                    <button onClick={handleSearch} className="hero-filter-btn">
                      <FaFilter />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* No Results Message */}
        {message && filteredPosts.length === 0 && (
          <div className="no-results">
            <FaExclamationTriangle className="no-results-icon" />
            <h3 className="no-results-title">No Properties Found</h3>
            <p className="no-results-message">{message}</p>
          </div>
        )}

        {/* Properties Grid */}
        <div className="properties-grid">
          {filteredPosts.map((post) => {
            const postUserIdStr = String(userId);
            const hasUserLikedPost = Array.isArray(post.likes) && post.likes.includes(postUserIdStr);
            const isPostSaved = savedPosts.includes(String(post.postId));

            return (
              <div
                key={post.postId}
                onClick={(e) => handleCardClick(post, e)}
                className="property-card"
              >
                <div className="property-image">
                  {post.fileBase64 ? (
                    <img
                      src={`data:image/png;base64,${post.fileBase64}`}
                      alt={post.title}
                    />
                  ) : (
                    <div className="property-image-placeholder">
                      <FaHome />
                    </div>
                  )}
                  
                  <div className="property-overlay">
                    <button className="quick-view-btn">
                      <FaEye />
                      Quick View
                    </button>
                  </div>
                  
                  {userRole !== "Admin" && (
                    <button
                      onClick={(e) => handleSavePost(post.postId, e)}
                      className={`save-btn ${isPostSaved ? 'saved' : ''}`}
                    >
                      {isPostSaved ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  )}
                </div>

                <div className="property-content">
                  <h3 className="property-title">{post.title}</h3>

                  <div className="property-price-location">
                    <span className="property-price">
                      ${post.price.toLocaleString()}
                    </span>
                    <div className="property-location">
                      <FaMapMarkerAlt />
                      <span>{post.location}</span>
                    </div>
                  </div>

                  <p className="property-description">{post.description}</p>

                  <div className="property-footer">
                    <div className="property-date">
                      <FaClock />
                      {new Date(post.datePost).toLocaleDateString()}
                    </div>

                    {userRole !== "Admin" ? (
                      <div className="property-actions">
                        {/* Like Button */}
                        <button
                          onClick={(e) => handleLikePost(post.postId, e)}
                          className={`action-btn like-btn ${hasUserLikedPost ? 'liked' : ''}`}
                        >
                          {hasUserLikedPost ? <FaHeart /> : <FaRegHeart />}
                          <span>{post.likes_count > 0 ? post.likes_count : '0'}</span>
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={(e) => handleSharePost(post, e)}
                          className="action-btn share-btn"
                        >
                          <FaShareAlt />
                        </button>

                        {/* Comment Button */}
                        <button
                          onClick={(e) => openCommentsModal(post, e)}
                          className="action-btn comment-btn"
                        >
                          <FaComment />
                          <span>{post.commentCount > 0 ? post.commentCount : '0'}</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comments Modal */}
        {showComments && selectedPost && (
          <div className="comments-modal">
            <div className="comments-modal-content">
              <div className="comments-modal-header">
                <h2 className="comments-modal-title">
                  <div className="comments-modal-icon">
                    <FaComment />
                  </div>
                  Comments ({commentCount})
                </h2>
                <button onClick={closeCommentsModal} className="comments-modal-close">
                  <FaTimes />
                </button>
              </div>

              <div className="comments-modal-body">
                {/* Property Info */}
                <div className="comment-form">
                  <h3 className="property-title">{selectedPost.title}</h3>
                  <div className="property-price-location">
                    <span className="property-price">
                      ${selectedPost.price?.toLocaleString()}
                    </span>
                    <div className="property-location">
                      <FaMapMarkerAlt />
                      {selectedPost.location}
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="comment-form" style={{background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(30, 58, 138, 0.1))'}}>
                  <div className="comment-author">
                    <div className="comment-avatar">
                      <FaUser />
                    </div>
                    <div>
                      <span style={{fontWeight: 600, color: 'var(--text-primary)'}}>
                        Commenting as: {userName}
                      </span>
                      {selectedPost && String(selectedPost.userId) === String(userId) && (
                        <div className="comment-badges">
                          <span className="comment-badge owner">
                            <FaUserTie /> Owner
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comment Form */}
                <form onSubmit={handleSubmitComment} className="comment-form">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a new comment..."
                    className="comment-textarea"
                    rows="3"
                  />
                  <div className="comment-form-actions">
                    <div>
                      {!imagePreview ? (
                        <label className="image-upload-btn">
                          <FaImage />
                          <span>Add Image</span>
                          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" style={{display: 'none'}} />
                        </label>
                      ) : (
                        <div style={{position: 'relative', display: 'inline-block'}}>
                          <img src={imagePreview} alt="Preview" style={{height: '6rem', borderRadius: '1rem', border: '2px solid var(--border-primary)'}} />
                          <button
                            type="button"
                            onClick={removeSelectedImage}
                            style={{
                              position: 'absolute',
                              top: '-0.5rem',
                              right: '-0.5rem',
                              background: '#ef4444',
                              color: 'white',
                              borderRadius: '50%',
                              padding: '0.25rem',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <FaTimesCircle />
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={(!newComment.trim() && !selectedImage) || loadingAction === "submitting-comment" || isUploading}
                      className="submit-comment-btn"
                    >
                      {isUploading ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <div style={{width: '1rem', height: '1rem', border: '2px solid white', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                          Uploading...
                        </div>
                      ) : (
                        "Post Comment"
                      )}
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div style={{marginTop: '2rem'}}>
                  {loadingAction === "loading-comments" ? (
                    <div style={{textAlign: 'center', padding: '3rem 0'}}>
                      <div className="loading-spinner" style={{width: '3rem', height: '3rem', margin: '0 auto 1rem'}}></div>
                      <p style={{color: 'var(--text-secondary)', fontWeight: 600}}>Loading comments...</p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem',
                      background: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '1.5rem',
                      border: '2px dashed var(--border-primary)'
                    }}>
                      <FaCommentDots style={{fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '1rem'}} />
                      <p style={{color: 'var(--text-muted)', fontSize: '1.125rem', fontWeight: 600}}>No comments yet.</p>
                      <p style={{color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem'}}>Be the first to comment!</p>
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
      </div>
    </div>
  );
};

export default ShowAllPosts;