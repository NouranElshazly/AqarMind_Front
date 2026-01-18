import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import withDarkMode from '../components/withDarkMode';

import {
  FaHeart, FaRegHeart,
  FaPaperPlane, FaComment, FaMapMarkerAlt, FaDollarSign,
  FaUser, FaClock, FaHome, FaTimes, FaSearch, FaFilter, FaEdit, FaTrash,
  FaReply, FaUserTie, FaImage, FaTimesCircle, FaChevronDown, FaShareAlt,
  FaThumbtack,
  FaBookmark, FaRegBookmark,
  FaCommentDots, FaEye, FaCheckCircle, FaHistory,
  FaExclamationTriangle
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

  // --- CommentItem Component (بدون تغيير) ---
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
      <div className={`rounded-2xl p-5 border ${comment.is_pinned ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-sm' : 'bg-white/80 backdrop-blur-sm border-gray-100 shadow-sm'} ${depth > 0 ? "ml-8 mt-3" : ""} transition-all duration-200 hover:shadow-md`}>
        <div className="flex items-center justify-between mb-3"> <div className="flex items-center gap-2 flex-wrap"> <span className="flex items-center gap-2 font-semibold text-gray-800"><div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold"><FaUser className="text-xs" /></div>{comment.user_name || "Anonymous"}</span> {isOwner && (<span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">You</span>)} {isPostOwnerComment && (<span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full flex items-center gap-1 font-medium"><FaUserTie className="text-xs" /> Owner</span>)} {comment.is_pinned && (<span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full flex items-center gap-1 font-medium"><FaThumbtack className="text-xs" /> Pinned</span>)} </div> <span className="text-xs text-gray-400 whitespace-nowrap">{formatLocalDate(comment.created_at)}{comment.is_edited && " (edited)"}</span> </div>
        {isEditing ? (<div className="mb-4"> <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200" rows="3" autoFocus /> <div className="mt-3 space-y-2">{editImagePreview && (<div className="relative inline-block"><img src={editImagePreview} alt="Edit preview" className="h-24 rounded-xl border-2 border-gray-200 cursor-pointer transition-all duration-200 hover:border-indigo-300" onClick={() => window.open(editImagePreview, "_blank")} /><button type="button" onClick={removeEditImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 shadow-lg" title="Remove image"><FaTimesCircle className="text-sm" /></button></div>)}<label className="flex items-center gap-2 text-sm text-indigo-600 cursor-pointer hover:text-indigo-700 transition-colors duration-200 w-fit px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-300"><FaImage />{originalImageUrl || editImagePreview ? 'Change Image' : 'Add Image'}<input type="file" ref={editFileInputRef} onChange={handleEditImageSelect} accept="image/*" className="hidden" /></label></div> <div className="flex gap-2 mt-4"><button onClick={handleSaveEdit} disabled={loadingAction === `editing-${comment._id}`} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-sm">{loadingAction === `editing-${comment._id}` ? "Saving..." : "Save"}</button><button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-500 text-white rounded-xl text-sm hover:bg-gray-600 transition-colors duration-200 font-medium">Cancel</button></div> </div>) : (<div className="mb-4">{comment.comment_description && <p className="text-gray-700 leading-relaxed">{toPlainText(comment.comment_description)}</p>}{originalImageUrl && (<div className="mt-3"><img src={originalImageUrl} alt="Comment attachment" className="max-w-full h-auto max-h-64 rounded-xl border-2 border-gray-200 cursor-pointer transition-all duration-200 hover:border-indigo-300" onClick={() => window.open(originalImageUrl, "_blank")} /></div>)}</div>)}
        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
          <button onClick={() => handleLikeComment(comment._id)} className={`flex items-center gap-1.5 transition-colors duration-200 px-2 py-1 rounded-lg ${hasUserLiked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'hover:text-red-500 hover:bg-gray-50'}`}>{hasUserLiked ? <FaHeart /> : <FaRegHeart />}<span className="font-medium">{comment.likes_count > 0 ? comment.likes_count : ''}</span></button>
          <button onClick={handleReplyClick} className="flex items-center gap-1 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors duration-200"><FaReply /> Reply</button>
          {comment.replies?.length > 0 && (<button onClick={() => toggleReplies(comment._id)} className="flex items-center gap-1 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors duration-200"><FaChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />{isOpen ? "Hide" : "Show"} replies<span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">{comment.replies.length}</span></button>)}
          {isOwner && !isEditing && (<><button onClick={handleEditClick} className="flex items-center gap-1 hover:text-yellow-600 hover:bg-yellow-50 px-2 py-1 rounded-lg transition-colors duration-200"><FaEdit /> Edit</button><button onClick={() => handleDeleteComment(comment._id)} disabled={isProcessing} className="flex items-center gap-1 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors duration-200 disabled:opacity-50">{loadingAction === `deleting-${comment._id}` ? <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <FaTrash />}Delete</button></>)}
          {isCurrentUserPostOwner && !isEditing && (
            <button onClick={() => handlePinComment(comment._id)} disabled={isProcessing} className={`flex items-center gap-1 transition-colors duration-200 px-2 py-1 rounded-lg disabled:opacity-50 ${comment.is_pinned ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'hover:text-indigo-600 hover:bg-indigo-50'}`}>
              {loadingAction === `pinning-${comment._id}` ? <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : <FaThumbtack />}
              {comment.is_pinned ? 'Unpin' : 'Pin'}
            </button>
          )}
        </div>
        {isReplying && (<InlineReplyBox
          postId={selectedPost.postId}
          parentId={comment._id}
          postTitle={selectedPost?.title}
          postPrice={selectedPost?.price}
          postLocation={selectedPost?.location}
          onSuccess={(newReply) => {
            addReplyToState(comment._id, newReply);
            updatePostCardCount(selectedPost.postId);
            setReplyingToId(null);
          }} onCancel={() => setReplyingToId(null)} />)}
        {isOpen && comment.replies && (<div className="mt-4 pt-4 border-t border-gray-100">{comment.replies.map((reply) => (<CommentItem key={reply._id} comment={reply} depth={depth + 1} />))}</div>)}
      </div>
    );
  }

  // --- JSX Rendering (Main Page) (بدون تغيير) ---
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading properties...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle className="text-2xl text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Properties</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium">
          Try Again
        </button>
      </div>
    </div>
  );

  if (message && filteredPosts.length === 0 && !loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Available Properties
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover your perfect home from our curated collection of properties
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-4">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search by title or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-base focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min="0"
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price</label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min="0"
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <button
                onClick={handleSearch}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3 shadow-lg"
              >
                <FaSearch className="text-lg" />
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-amber-500 text-xl" />
            <p className="text-amber-800 font-medium text-lg">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Available Properties
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover your perfect home from our curated collection of properties
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-12 border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-4">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search by title or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-base focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min="0"
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price</label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min="0"
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex gap-3">
                <button
                  onClick={handleSearch}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3 shadow-lg"
                >
                  <FaSearch className="text-lg" />
                  Search
                </button>
                <button
                  onClick={handleSearch}
                  className="px-6 py-4 bg-white text-indigo-600 font-semibold rounded-2xl border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center gap-2 shadow-sm"
                >
                  <FaFilter />
                </button>
              </div>
            </div>
          </div>
        </div>

        {message && filteredPosts.length === 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-2xl shadow-sm mb-8">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-amber-500 text-xl" />
              <p className="text-amber-800 font-medium text-lg">{message}</p>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => {
            const postUserIdStr = String(userId);
            const hasUserLikedPost = Array.isArray(post.likes) && post.likes.includes(postUserIdStr);
            const isPostSaved = savedPosts.includes(String(post.postId));

            return (
              <div
                key={post.postId}
                onClick={(e) => handleCardClick(post, e)}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-indigo-100"
              >
                <div className="relative h-64 overflow-hidden">
                  {post.fileBase64 ? (
                    <img
                      src={`data:image/png;base64,${post.fileBase64}`}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <FaHome className="text-6xl text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {userRole !== "Admin" && (
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={(e) => handleSavePost(post.postId, e)}
                        className={`p-3 rounded-2xl text-lg backdrop-blur-sm transition-all duration-300 ${isPostSaved
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/90 text-gray-600 hover:bg-white hover:text-blue-500 shadow-md'
                          }`}
                      >
                        {isPostSaved ? <FaBookmark /> : <FaRegBookmark />}
                      </button>
                    </div>
                  )}

                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 line-clamp-2 transition-colors duration-200 leading-tight">
                    {post.title}
                  </h3>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${post.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full font-medium">
                      <FaMapMarkerAlt className="text-indigo-500" />
                      {post.location}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500 flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full font-medium">
                      <FaClock className="text-indigo-500" />
                      {new Date(post.datePost).toLocaleDateString()}
                    </div>

                    {userRole !== "Admin" ? (
                      <div className="post-actions flex gap-2 items-center">

                        {/* Like Button */}
                        <button
                          onClick={(e) => handleLikePost(post.postId, e)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 font-medium ${hasUserLikedPost
                              ? 'text-red-500 bg-red-50 hover:bg-red-100 shadow-sm'
                              : 'text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-red-500'
                            }`}
                        >
                          {hasUserLikedPost ? <FaHeart /> : <FaRegHeart />}
                          <span className="font-semibold">
                            {post.likes_count > 0 ? post.likes_count : '0'}
                          </span>
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={(e) => handleSharePost(post, e)}
                          className="p-2 bg-gray-50 text-gray-600 rounded-xl text-sm hover:bg-gray-100 hover:text-indigo-600 transition-all duration-200 shadow-sm"
                        >
                          <FaShareAlt />
                        </button>

                        {/* Comment Button */}
                        <button
                          onClick={(e) => openCommentsModal(post, e)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-indigo-600 transition-all duration-200 font-medium shadow-sm"
                        >
                          <FaComment />
                          <span className="font-semibold">{post.commentCount > 0 ? post.commentCount : '0'}</span>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-3xl">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                    <FaComment className="text-lg" />
                  </div>
                  Comments ({commentCount})
                </h2>
                <button
                  onClick={closeCommentsModal}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all duration-200 flex items-center justify-center shadow-sm"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6 bg-gray-50/50">
                <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedPost.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1 font-medium">
                      <FaDollarSign className="text-green-500" />
                      ${selectedPost.price?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <FaMapMarkerAlt className="text-indigo-500" />
                      {selectedPost.location}
                    </span>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl text-sm text-blue-800 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      <FaUser className="text-xs" />
                    </div>
                    Commenting as: <span className="font-semibold">{userName}</span>
                    {selectedPost && String(selectedPost.userId) === String(userId) && (
                      <span className="ml-2 inline-flex items-center gap-1 text-amber-600 bg-amber-100 px-3 py-1 rounded-full text-xs font-semibold">
                        <FaUserTie className="text-xs" />Owner
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmitComment} className="mb-8">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a new comment..."
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl resize-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white shadow-sm"
                    rows="3"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      {!imagePreview ? (
                        <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl cursor-pointer hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 font-medium shadow-sm">
                          <FaImage className="text-indigo-500" />
                          <span>Add Image</span>
                          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                        </label>
                      ) : (
                        <div className="relative inline-block">
                          <img src={imagePreview} alt="Preview" className="h-24 rounded-xl shadow-sm border-2 border-gray-200" />
                          <button
                            type="button"
                            onClick={removeSelectedImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                          >
                            <FaTimesCircle className="text-sm" />
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={(!newComment.trim() && !selectedImage) || loadingAction === "submitting-comment" || isUploading}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </div>
                      ) : (
                        "Post Comment"
                      )}
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {loadingAction === "loading-comments" ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading comments...</p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-12 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200">
                      <FaCommentDots className="text-4xl text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 text-lg font-medium">No comments yet.</p>
                      <p className="text-gray-400 text-sm mt-1">Be the first to comment!</p>
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